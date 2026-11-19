// Shared layout: theme, header, footer, helpers. Put <div id="hdr"></div> and <div id="ftr"></div> in every page
// and <script src="layout.js"></script> (plus cart.js) at the end of <body>.
(function(){
  var KEY="sol-theme";
  function apply(t){document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t}
  function get(){try{return localStorage.getItem(KEY)||"dark"}catch(e){return"dark"}}
  apply(get());
  var CONTACT={email:"solariasupport@gmail.com",social:"solaria"};
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]})}
  function peso(n){return "\u20B1"+Number(n||0).toLocaleString("en-PH",{maximumFractionDigits:0})}
  // Minimal line-art bottle in the logo's style, used until a real photo is uploaded. Shape varies per product.
  function bottle(seed){
    var h=0,s=String(seed||"x");for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;
    var v=h%3,g="var(--gold)";
    var body=v===0?'<rect x="30" y="70" width="60" height="90" rx="4"/><path d="M30 100h60"/>'
      :v===1?'<path d="M36 70h48l8 90H28z"/><path d="M60 82v66"/>'
      :'<path d="M60 70c28 0 34 26 34 50s-8 40-34 40-34-16-34-40 6-50 34-50z"/>';
    return '<svg viewBox="0 0 120 180" fill="none" stroke="'+g+'" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="50" y="22" width="20" height="14"/><rect x="44" y="36" width="32" height="14"/><path d="M54 50v20M66 50v20"/>'+body+'<path d="M80 12l14-4M82 20l16-2M80 28l14 2" opacity=".6"/></svg>';
  }
  function link(p){return "product.html?id="+encodeURIComponent(p.id)}
  var tt;
  function toast(m){var t=document.getElementById("toast");if(!t){t=document.createElement("div");t.id="toast";document.body.appendChild(t)}t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("show")},2200)}
  window.SOL={esc:esc,peso:peso,bottle:bottle,link:link,toast:toast,contact:CONTACT,
    media:function(p,cls){return p.image_url?'<img src="'+esc(p.image_url)+'" alt="'+esc(p.name)+'" loading="lazy">':bottle(p.name)},
    theme:{get:get,set:function(t){try{localStorage.setItem(KEY,t)}catch(e){}apply(t)}}};

  document.addEventListener("DOMContentLoaded",function(){
    var on=document.body.getAttribute("data-nav")||"";
    function a(h,t,k){return '<a href="'+h+'"'+(on===k?' class="on"':'')+'>'+t+'</a>'}
    var h=document.getElementById("hdr");
    if(h)h.innerHTML='<div class="promo">Complimentary shipping on orders over \u20B12,500</div>'+
      '<header class="top"><div class="in"><a class="brand" href="index.html" aria-label="Solaria home"><img src="logo-emblem.png" alt=""><span>SOLARIA</span></a>'+
      '<nav class="main" id="nav">'+a("shop.html","Shop","shop")+a("about.html","Our story","about")+a("contact.html","Contact","contact")+'</nav>'+
      '<div class="tools"><button id="menu" aria-label="Menu">Menu</button><a href="login.html" id="acct"><span class="lbl">Account</span></a>'+
      '<a class="cartlnk" href="cart.html" aria-label="Cart"><span class="lbl">Cart</span><span class="cn hide">0</span></a>'+
      '<button id="tg" aria-label="Toggle light or dark"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="8" r="6.5"/><path d="M8 1.5v13A6.5 6.5 0 0 1 8 1.5z" fill="currentColor"/></svg></button></div></div></header>';
    var f=document.getElementById("ftr");
    if(f)f.innerHTML='<footer class="foot"><div class="wrap"><div class="cols"><div><img class="logo-img" src="logo-full.png" alt="Solaria Parfums"><p class="muted" style="max-width:280px;font-size:13px;margin:0">Luxury-inspired fragrances, made accessible. Crafted to feel unmistakably yours.</p></div>'+
      '<div><h4>Shop</h4><a href="shop.html">All fragrances</a><a href="shop.html?for=Men">For him</a><a href="shop.html?for=Women">For her</a><a href="shop.html?for=Unisex">Unisex</a></div>'+
      '<div><h4>Help</h4><a href="shipping-returns.html">Shipping &amp; returns</a><a href="orders.html">My orders</a><a href="contact.html">Contact us</a></div>'+
      '<div><h4>Connect</h4><a href="mailto:'+CONTACT.email+'">'+CONTACT.email+'</a><a href="#" onclick="return false">@'+CONTACT.social+'</a></div></div>'+
      '<div class="fine"><span>&copy; '+new Date().getFullYear()+' Solaria Parfums. All rights reserved.</span><span><a style="display:inline;margin-right:16px" href="privacy.html">Privacy</a><a style="display:inline" href="terms.html">Terms</a></span></div></div></footer>';
    var m=document.getElementById("menu");if(m)m.onclick=function(){document.getElementById("nav").classList.toggle("open")};
    var tg=document.getElementById("tg");if(tg)tg.onclick=function(){SOL.theme.set(get()==="dark"?"light":"dark")};
    // show "Account" label as the logged-in link target
    if(window.SOLDB&&SOLDB.ok)SOLDB.session().then(function(s){if(s){var el=document.getElementById("acct");if(el)el.setAttribute("href","account.html")}}).catch(function(){});
    if(window.SOLCart)SOLCart.paint();
  });
})();
// Product card used on the home and shop pages.
window.SOLCard=function(p,ratings){
  var vs=p.variants||[],min=vs.length?Math.min.apply(null,vs.map(function(v){return +v.price})):0;
  var total=vs.reduce(function(s,v){return s+v.stock},0),sold=!vs.length||total<=0;
  var badge=sold?"Sold out":(p.is_new?"New":"");
  var r=ratings&&ratings[String(p.id)];
  return '<a class="pc" href="'+SOL.link(p)+'"><div class="ph">'+SOL.media(p)+(badge?'<span class="badge">'+badge+'</span>':'')+'</div>'+
    '<h3>'+SOL.esc(p.name)+'</h3>'+(p.inspired_by?'<div class="ins">Inspired by '+SOL.esc(p.inspired_by)+'</div>':'')+
    '<div class="pr">'+(vs.length?'From '+SOL.peso(min):'')+(r?' &nbsp;<span class="muted">&#9733; '+r.avg+'</span>':'')+'</div></a>';
};
