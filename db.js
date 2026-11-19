// Shared Supabase helper. Include AFTER the supabase-js script:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script><script src="db.js"></script>
// >>> PASTE YOUR NEW SOLARIA PROJECT VALUES BELOW (Supabase > Project Settings > API Keys / Data API) <<<
// The publishable key is safe in browser code: Row Level Security (solaria-setup.sql) decides who can do what.
(function(){
  
  var URL="https://dqvhponeipaithkxrzsq.supabase.co",KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdmhwb25laXBhaXRoa3hyenNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwNTUyOTEsImV4cCI6MjExMDYzMTI5MX0.WJlV-As1Pd6-DT26r6DLZO0EVTZSu3aF67jSI7flqJU";
  var client=null,configured=URL.indexOf("http")===0;
  try{if(configured)client=window.supabase.createClient(URL,KEY)}catch(e){console.warn("Supabase not available",e)}
  function here(){return (location.pathname.split("/").pop()||"index.html")+location.search}
  async function uid(){var r=await client.auth.getUser();return r.data&&r.data.user?r.data.user.id:null}
  function ck(r){if(r.error)throw r.error;return r.data}
  var back=function(){return location.origin+location.pathname.replace(/[^\/]*$/,"login.html")};

  window.SOLDB={client:client,ok:!!client,configured:configured,

    // ---- catalog (each product comes with its sizes in .product_variants) ----
    fetchProducts:async function(){
      var r=await client.from("products").select("*, product_variants(*)").order("id",{ascending:true});
      return (ck(r)||[]).map(function(p){p.variants=(p.product_variants||[]).sort(function(a,b){return a.ml-b.ml});return p});
    },
    fetchProduct:async function(id){
      var r=await client.from("products").select("*, product_variants(*)").eq("id",id).maybeSingle();
      var p=ck(r);if(p)p.variants=(p.product_variants||[]).sort(function(a,b){return a.ml-b.ml});return p;
    },
    fetchRatings:async function(){
      var r=await client.from("product_ratings").select("*"),m={};
      if(r.error)return m;(r.data||[]).forEach(function(x){m[String(x.product_id)]={avg:Number(x.avg_rating),n:x.review_count}});return m;
    },

    // ---- auth ----
    session:async function(){var r=await client.auth.getSession();return r.data?r.data.session:null},
    requireLogin:async function(next){
      if(!client)return null;var s=await this.session();if(s)return s.user;
      location.replace("login.html?next="+encodeURIComponent(next||here()));return null;
    },
    isAdmin:async function(){
      if(!client)return false;var s=await this.session();if(!s)return false;
      var r=await client.rpc("is_admin");return r.data===true;
    },
    signUp:async function(email,pw,meta){return ck(await client.auth.signUp({email:email,password:pw,options:{data:meta||{},emailRedirectTo:back()}}))},
    signIn:async function(email,pw){return ck(await client.auth.signInWithPassword({email:email,password:pw}))},
    signOut:async function(){try{await client.auth.signOut()}catch(e){}},
    resetPassword:async function(email){return ck(await client.auth.resetPasswordForEmail(email,{redirectTo:back()}))},
    setPassword:async function(pw){return ck(await client.auth.updateUser({password:pw}))},
    updateProfile:async function(meta){return ck(await client.auth.updateUser({data:meta}))},

    // ---- orders ----
    place:async function(items,method,customer){
      return ck(await client.rpc("place_order",{p_items:items.map(function(x){return{variant_id:x.vid,n:x.n,qty:x.qty||1}}),p_payment:method,p_customer:customer||{}}));
    },
    cancel:async function(id){ck(await client.rpc("cancel_order",{p_id:id}))},
    myOrders:async function(){return ck(await client.from("orders").select("*, order_items(*)").order("created_at",{ascending:false}))||[]},
    welcomeEligible:async function(){
      var s=await this.session();if(!s)return false;
      var r=await client.from("orders").select("id",{count:"exact",head:true}).neq("status","cancelled");
      return !r.error&&(r.count||0)===0;
    },

    // ---- saved addresses ----
    listAddresses:async function(){return ck(await client.from("addresses").select("*").order("is_default",{ascending:false}).order("created_at",{ascending:true}))||[]},
    saveAddress:async function(a){
      var row={label:a.label||null,full_name:a.full_name,phone:a.phone,address_line:a.address_line,city:a.city,province:a.province,postal_code:a.postal_code||null};
      if(a.id){ck(await client.from("addresses").update(row).eq("id",a.id));return a.id}
      row.user_id=await uid();var cur=await this.listAddresses();row.is_default=cur.length===0;
      return ck(await client.from("addresses").insert(row).select().single()).id;
    },
    deleteAddress:async function(id){ck(await client.from("addresses").delete().eq("id",id))},
    makeDefault:async function(id){
      var u=await uid();
      ck(await client.from("addresses").update({is_default:false}).eq("user_id",u));
      ck(await client.from("addresses").update({is_default:true}).eq("id",id));
    },

    // ---- reviews / alerts / contact ----
    reviews:async function(pid){return ck(await client.from("reviews").select("*").eq("product_id",String(pid)).order("created_at",{ascending:false}))||[]},
    canReview:async function(pid){
      var r=await client.from("order_items").select("order_id, orders!inner(status)").eq("product_id",String(pid)).eq("orders.status","delivered").limit(1);
      return !r.error&&(r.data||[]).length>0;
    },
    submitReview:async function(pid,rating,comment,name){ck(await client.rpc("submit_review",{p_product_id:String(pid),p_rating:rating,p_comment:comment,p_public_name:name||null}))},
    notify:async function(pid){
      var s=await this.session(),r=await client.from("stock_alerts").insert({product_id:String(pid),user_id:s.user.id,email:s.user.email});
      if(r.error&&r.error.code!=="23505")throw r.error;
    },
    sendMessage:async function(m){ck(await client.from("contact_messages").insert(m))},
    watch:function(fn,tables){
      if(!client)return;var t;function d(){clearTimeout(t);t=setTimeout(fn,300)}
      try{var ch=client.channel("sol-live-"+Math.random().toString(36).slice(2));
        (tables||["products"]).forEach(function(tb){ch=ch.on("postgres_changes",{event:"*",schema:"public",table:tb},d)});ch.subscribe()}catch(e){}
      document.addEventListener("visibilitychange",function(){if(!document.hidden)fn()});
    }
  };
})();
