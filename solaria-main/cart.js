// Cart (localStorage) + pricing rules shown to the customer.
// The SERVER (place_order in solaria-setup.sql) is the source of truth: keep both in sync.
(function(){
  var KEY="sol-cart-v1",MAX=10;
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){return[]}}
  function write(a){try{localStorage.setItem(KEY,JSON.stringify(a))}catch(e){}paint()}
  function count(){return read().reduce(function(s,i){return s+i.qty},0)}
  function paint(){var n=count();document.querySelectorAll(".cartlnk .cn").forEach(function(b){b.textContent=n;b.classList.toggle("hide",!n)})}
  window.SOLCart={get:read,count:count,paint:paint,replace:write,
    // item: {vid, pid, n, ml, price, img, qty}
    add:function(it){var a=read(),f=a.filter(function(x){return String(x.vid)===String(it.vid)})[0];
      if(f)f.qty=Math.min(MAX,f.qty+(it.qty||1));else{it.qty=Math.min(MAX,it.qty||1);a.push(it)}write(a)},
    setQty:function(i,q){var a=read();if(!a[i])return;if(q<=0)a.splice(i,1);else a[i].qty=Math.min(MAX,q);write(a)},
    remove:function(i){var a=read();a.splice(i,1);write(a)},clear:function(){write([])}};
  window.SOLRules={FREE_OVER:2500,FEE:150,WELCOME:100,
    shipping:function(sub){return sub>=2500?0:150},
    welcome:function(sub,eligible){return eligible?Math.min(100,sub):0}};
  window.addEventListener("storage",paint);
})();
