/**
 * @license Hyphenopoly_Loader 5.2.0 - client side hyphenation
 * ©2023  Mathias Nater, Güttingen (mathiasnater at gmail dot com)
 * https://github.com/mnater/Hyphenopoly
 *
 * Released under the MIT license
 * http://mnater.github.io/Hyphenopoly/LICENSE
 */
window.Hyphenopoly={},((e,t,s,n)=>{"use strict";const o=e=>new Map(e),l="Hyphenopoly_Loader.js",r=t.currentScript.src,a=sessionStorage;let c=!1;s.config=i=>{const h=(e,t)=>e?(n.entries(t).forEach((([t,s])=>{e[t]=e[t]||s})),e):t;s.cft=!!i.cacheFeatureTests,s.cft&&a.getItem(l)?(s.cf=JSON.parse(a.getItem(l)),s.cf.langs=o(s.cf.langs)):s.cf={langs:o(),pf:!1};const d=r.slice(0,r.lastIndexOf("/")+1),p=d+"patterns/";s.paths=h(i.paths,{maindir:d,patterndir:p}),s.s=h(i.setup,{CORScredentials:"include",hide:"all",selectors:{".hyphenate":{}},timeout:1e3}),s.s.hide=["all","element","text"].indexOf(s.s.hide),i.handleEvent&&(s.hev=i.handleEvent);const f=o(n.entries(i.fallbacks||{}));s.lrq=o(),n.entries(i.require).forEach((([e,t])=>{s.lrq.set(e.toLowerCase(),{fn:f.get(e)||e,wo:t})})),(()=>{const r="appendChild",i="createElement",h="createTextNode",d=()=>{let e=null,t=null;const s=new Promise(((s,n)=>{e=s,t=n}));return s.resolve=e,s.reject=t,s};s.ac=new AbortController;const p={credentials:s.s.CORScredentials,signal:s.ac.signal};let f=null;s.hide=(e,o)=>{if(e){let e="{visibility:hidden!important}";f=t[i]("style");let l="";0===o?l="html"+e:-1!==o&&(2===o&&(e="{color:transparent!important}"),n.keys(s.s.selectors).forEach((t=>{l+=t+e}))),f[r](t[h](l)),t.head[r](f)}else f&&f.remove()};const y=(()=>{let e=null;return{ap:()=>e?(t.documentElement[r](e),e):null,cl:()=>{e&&e.remove()},cr:n=>{if(s.cf.langs.has(n))return;e=e||t[i]("body");const o=t[i]("div"),l="hyphens:auto";o.lang=n,o.style.cssText=`visibility:hidden;-webkit-${l};-ms-${l};${l};width:48px;font-size:12px;line-height:12px;border:none;padding:0;word-wrap:normal`,o[r](t[h](s.lrq.get(n).wo.toLowerCase())),e[r](o)}}})();s.res={he:o()};const g=t=>{const n=s.lrq.get(t).fn;s.cf.pf=!0,s.cf.langs.set(t,"H9Y"),s.res.he.has(n)?s.res.he.get(n).l.push(t):s.res.he.set(n,{l:[t],w:e.fetch(s.paths.patterndir+n+".wasm",p)})};s.lrq.forEach(((e,t)=>{"FORCEHYPHENOPOLY"===e.wo||"H9Y"===s.cf.langs.get(t)?g(t):y.cr(t)}));const m=y.ap();m&&(m.querySelectorAll("div").forEach((e=>{var t;"auto"===((t=e.style).hyphens||t.webkitHyphens||t.msHyphens)&&e.offsetHeight>12?s.cf.langs.set(e.lang,"CSS"):g(e.lang)})),y.cl());const u=s.hev;s.cf.pf?(s.res.DOM=new Promise((e=>{"loading"===t.readyState?t.addEventListener("DOMContentLoaded",e,{once:!0,passive:!0}):e()})),s.hide(1,s.s.hide),s.timeOutHandler=e.setTimeout((()=>{s.hide(0,null),1&s.s.timeout&&s.ac.abort(),console.info(l+" timed out.")}),s.s.timeout),c?s.main():fetch(s.paths.maindir+"Hyphenopoly.js",p).then((e=>{e.ok&&e.blob().then((e=>{const s=t[i]("script");s.src=URL.createObjectURL(e),t.head[r](s),c=!0,URL.revokeObjectURL(s.src)}))})),s.hy6ors=o(),s.cf.langs.forEach(((e,t)=>{"H9Y"===e&&s.hy6ors.set(t,d())})),s.hy6ors.set("HTML",d()),s.hyphenators=new Proxy(s.hy6ors,{get:(e,t)=>e.get(t),set:()=>!0}),u&&u.polyfill&&u.polyfill()):(u&&u.tearDown&&u.tearDown(),e.Hyphenopoly=null),s.cft&&a.setItem(l,JSON.stringify({langs:[...s.cf.langs.entries()],pf:s.cf.pf}))})()}})(window,document,Hyphenopoly,Object);