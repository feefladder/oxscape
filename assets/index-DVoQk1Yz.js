(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();function Sl(n){const e=Object.create(null);for(const t of n.split(","))e[t]=1;return t=>t in e}const dt={},is=[],yn=()=>{},ju=()=>!1,ro=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&(n.charCodeAt(2)>122||n.charCodeAt(2)<97),Ml=n=>n.startsWith("onUpdate:"),Ut=Object.assign,El=(n,e)=>{const t=n.indexOf(e);t>-1&&n.splice(t,1)},jh=Object.prototype.hasOwnProperty,nt=(n,e)=>jh.call(n,e),qe=Array.isArray,ss=n=>oo(n)==="[object Map]",Ku=n=>oo(n)==="[object Set]",Xe=n=>typeof n=="function",Et=n=>typeof n=="string",_i=n=>typeof n=="symbol",mt=n=>n!==null&&typeof n=="object",$u=n=>(mt(n)||Xe(n))&&Xe(n.then)&&Xe(n.catch),Zu=Object.prototype.toString,oo=n=>Zu.call(n),Kh=n=>oo(n).slice(8,-1),Ju=n=>oo(n)==="[object Object]",bl=n=>Et(n)&&n!=="NaN"&&n[0]!=="-"&&""+parseInt(n,10)===n,Vs=Sl(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),ao=n=>{const e=Object.create(null);return(t=>e[t]||(e[t]=n(t)))},$h=/-\w/g,di=ao(n=>n.replace($h,e=>e.slice(1).toUpperCase())),Zh=/\B([A-Z])/g,Fi=ao(n=>n.replace(Zh,"-$1").toLowerCase()),Qu=ao(n=>n.charAt(0).toUpperCase()+n.slice(1)),Mo=ao(n=>n?`on${Qu(n)}`:""),hi=(n,e)=>!Object.is(n,e),Eo=(n,...e)=>{for(let t=0;t<n.length;t++)n[t](...e)},ef=(n,e,t,i=!1)=>{Object.defineProperty(n,e,{configurable:!0,enumerable:!1,writable:i,value:t})},Jh=n=>{const e=parseFloat(n);return isNaN(e)?n:e};let pc;const lo=()=>pc||(pc=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function yl(n){if(qe(n)){const e={};for(let t=0;t<n.length;t++){const i=n[t],s=Et(i)?nd(i):yl(i);if(s)for(const r in s)e[r]=s[r]}return e}else if(Et(n)||mt(n))return n}const Qh=/;(?![^(]*\))/g,ed=/:([^]+)/,td=/\/\*[^]*?\*\//g;function nd(n){const e={};return n.replace(td,"").split(Qh).forEach(t=>{if(t){const i=t.split(ed);i.length>1&&(e[i[0].trim()]=i[1].trim())}}),e}function Tl(n){let e="";if(Et(n))e=n;else if(qe(n))for(let t=0;t<n.length;t++){const i=Tl(n[t]);i&&(e+=i+" ")}else if(mt(n))for(const t in n)n[t]&&(e+=t+" ");return e.trim()}const id="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",sd=Sl(id);function tf(n){return!!n||n===""}const nf=n=>!!(n&&n.__v_isRef===!0),pa=n=>Et(n)?n:n==null?"":qe(n)||mt(n)&&(n.toString===Zu||!Xe(n.toString))?nf(n)?pa(n.value):JSON.stringify(n,sf,2):String(n),sf=(n,e)=>nf(e)?sf(n,e.value):ss(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((t,[i,s],r)=>(t[bo(i,r)+" =>"]=s,t),{})}:Ku(e)?{[`Set(${e.size})`]:[...e.values()].map(t=>bo(t))}:_i(e)?bo(e):mt(e)&&!qe(e)&&!Ju(e)?String(e):e,bo=(n,e="")=>{var t;return _i(n)?`Symbol(${(t=n.description)!=null?t:e})`:n};let Xt;class rd{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=Xt,!e&&Xt&&(this.index=(Xt.scopes||(Xt.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].pause();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].resume();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].resume()}}run(e){if(this._active){const t=Xt;try{return Xt=this,e()}finally{Xt=t}}}on(){++this._on===1&&(this.prevScope=Xt,Xt=this)}off(){this._on>0&&--this._on===0&&(Xt=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let t,i;for(t=0,i=this.effects.length;t<i;t++)this.effects[t].stop();for(this.effects.length=0,t=0,i=this.cleanups.length;t<i;t++)this.cleanups[t]();if(this.cleanups.length=0,this.scopes){for(t=0,i=this.scopes.length;t<i;t++)this.scopes[t].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function od(){return Xt}let ht;const yo=new WeakSet;class rf{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,Xt&&Xt.active&&Xt.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,yo.has(this)&&(yo.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||af(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,mc(this),lf(this);const e=ht,t=un;ht=this,un=!0;try{return this.fn()}finally{cf(this),ht=e,un=t,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)Rl(e);this.deps=this.depsTail=void 0,mc(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?yo.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){ma(this)&&this.run()}get dirty(){return ma(this)}}let of=0,Hs,Gs;function af(n,e=!1){if(n.flags|=8,e){n.next=Gs,Gs=n;return}n.next=Hs,Hs=n}function Al(){of++}function wl(){if(--of>0)return;if(Gs){let e=Gs;for(Gs=void 0;e;){const t=e.next;e.next=void 0,e.flags&=-9,e=t}}let n;for(;Hs;){let e=Hs;for(Hs=void 0;e;){const t=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(i){n||(n=i)}e=t}}if(n)throw n}function lf(n){for(let e=n.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function cf(n){let e,t=n.depsTail,i=t;for(;i;){const s=i.prevDep;i.version===-1?(i===t&&(t=s),Rl(i),ad(i)):e=i,i.dep.activeLink=i.prevActiveLink,i.prevActiveLink=void 0,i=s}n.deps=e,n.depsTail=t}function ma(n){for(let e=n.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(uf(e.dep.computed)||e.dep.version!==e.version))return!0;return!!n._dirty}function uf(n){if(n.flags&4&&!(n.flags&16)||(n.flags&=-17,n.globalVersion===js)||(n.globalVersion=js,!n.isSSR&&n.flags&128&&(!n.deps&&!n._dirty||!ma(n))))return;n.flags|=2;const e=n.dep,t=ht,i=un;ht=n,un=!0;try{lf(n);const s=n.fn(n._value);(e.version===0||hi(s,n._value))&&(n.flags|=128,n._value=s,e.version++)}catch(s){throw e.version++,s}finally{ht=t,un=i,cf(n),n.flags&=-3}}function Rl(n,e=!1){const{dep:t,prevSub:i,nextSub:s}=n;if(i&&(i.nextSub=s,n.prevSub=void 0),s&&(s.prevSub=i,n.nextSub=void 0),t.subs===n&&(t.subs=i,!i&&t.computed)){t.computed.flags&=-5;for(let r=t.computed.deps;r;r=r.nextDep)Rl(r,!0)}!e&&!--t.sc&&t.map&&t.map.delete(t.key)}function ad(n){const{prevDep:e,nextDep:t}=n;e&&(e.nextDep=t,n.prevDep=void 0),t&&(t.prevDep=e,n.nextDep=void 0)}let un=!0;const ff=[];function qn(){ff.push(un),un=!1}function Yn(){const n=ff.pop();un=n===void 0?!0:n}function mc(n){const{cleanup:e}=n;if(n.cleanup=void 0,e){const t=ht;ht=void 0;try{e()}finally{ht=t}}}let js=0;class ld{constructor(e,t){this.sub=e,this.dep=t,this.version=t.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class Cl{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!ht||!un||ht===this.computed)return;let t=this.activeLink;if(t===void 0||t.sub!==ht)t=this.activeLink=new ld(ht,this),ht.deps?(t.prevDep=ht.depsTail,ht.depsTail.nextDep=t,ht.depsTail=t):ht.deps=ht.depsTail=t,hf(t);else if(t.version===-1&&(t.version=this.version,t.nextDep)){const i=t.nextDep;i.prevDep=t.prevDep,t.prevDep&&(t.prevDep.nextDep=i),t.prevDep=ht.depsTail,t.nextDep=void 0,ht.depsTail.nextDep=t,ht.depsTail=t,ht.deps===t&&(ht.deps=i)}return t}trigger(e){this.version++,js++,this.notify(e)}notify(e){Al();try{for(let t=this.subs;t;t=t.prevSub)t.sub.notify()&&t.sub.dep.notify()}finally{wl()}}}function hf(n){if(n.dep.sc++,n.sub.flags&4){const e=n.dep.computed;if(e&&!n.dep.subs){e.flags|=20;for(let i=e.deps;i;i=i.nextDep)hf(i)}const t=n.dep.subs;t!==n&&(n.prevSub=t,t&&(t.nextSub=n)),n.dep.subs=n}}const _a=new WeakMap,Li=Symbol(""),ga=Symbol(""),Ks=Symbol("");function Pt(n,e,t){if(un&&ht){let i=_a.get(n);i||_a.set(n,i=new Map);let s=i.get(t);s||(i.set(t,s=new Cl),s.map=i,s.key=t),s.track()}}function Vn(n,e,t,i,s,r){const o=_a.get(n);if(!o){js++;return}const a=l=>{l&&l.trigger()};if(Al(),e==="clear")o.forEach(a);else{const l=qe(n),c=l&&bl(t);if(l&&t==="length"){const u=Number(i);o.forEach((f,h)=>{(h==="length"||h===Ks||!_i(h)&&h>=u)&&a(f)})}else switch((t!==void 0||o.has(void 0))&&a(o.get(t)),c&&a(o.get(Ks)),e){case"add":l?c&&a(o.get("length")):(a(o.get(Li)),ss(n)&&a(o.get(ga)));break;case"delete":l||(a(o.get(Li)),ss(n)&&a(o.get(ga)));break;case"set":ss(n)&&a(o.get(Li));break}}wl()}function zi(n){const e=tt(n);return e===n?e:(Pt(e,"iterate",Ks),fn(n)?e:e.map(jn))}function Pl(n){return Pt(n=tt(n),"iterate",Ks),n}function ri(n,e){return pi(n)?rs(n)?$s(jn(e)):$s(e):jn(e)}const cd={__proto__:null,[Symbol.iterator](){return To(this,Symbol.iterator,n=>ri(this,n))},concat(...n){return zi(this).concat(...n.map(e=>qe(e)?zi(e):e))},entries(){return To(this,"entries",n=>(n[1]=ri(this,n[1]),n))},every(n,e){return In(this,"every",n,e,void 0,arguments)},filter(n,e){return In(this,"filter",n,e,t=>t.map(i=>ri(this,i)),arguments)},find(n,e){return In(this,"find",n,e,t=>ri(this,t),arguments)},findIndex(n,e){return In(this,"findIndex",n,e,void 0,arguments)},findLast(n,e){return In(this,"findLast",n,e,t=>ri(this,t),arguments)},findLastIndex(n,e){return In(this,"findLastIndex",n,e,void 0,arguments)},forEach(n,e){return In(this,"forEach",n,e,void 0,arguments)},includes(...n){return Ao(this,"includes",n)},indexOf(...n){return Ao(this,"indexOf",n)},join(n){return zi(this).join(n)},lastIndexOf(...n){return Ao(this,"lastIndexOf",n)},map(n,e){return In(this,"map",n,e,void 0,arguments)},pop(){return bs(this,"pop")},push(...n){return bs(this,"push",n)},reduce(n,...e){return _c(this,"reduce",n,e)},reduceRight(n,...e){return _c(this,"reduceRight",n,e)},shift(){return bs(this,"shift")},some(n,e){return In(this,"some",n,e,void 0,arguments)},splice(...n){return bs(this,"splice",n)},toReversed(){return zi(this).toReversed()},toSorted(n){return zi(this).toSorted(n)},toSpliced(...n){return zi(this).toSpliced(...n)},unshift(...n){return bs(this,"unshift",n)},values(){return To(this,"values",n=>ri(this,n))}};function To(n,e,t){const i=Pl(n),s=i[e]();return i!==n&&!fn(n)&&(s._next=s.next,s.next=()=>{const r=s._next();return r.done||(r.value=t(r.value)),r}),s}const ud=Array.prototype;function In(n,e,t,i,s,r){const o=Pl(n),a=o!==n&&!fn(n),l=o[e];if(l!==ud[e]){const f=l.apply(n,r);return a?jn(f):f}let c=t;o!==n&&(a?c=function(f,h){return t.call(this,ri(n,f),h,n)}:t.length>2&&(c=function(f,h){return t.call(this,f,h,n)}));const u=l.call(o,c,i);return a&&s?s(u):u}function _c(n,e,t,i){const s=Pl(n);let r=t;return s!==n&&(fn(n)?t.length>3&&(r=function(o,a,l){return t.call(this,o,a,l,n)}):r=function(o,a,l){return t.call(this,o,ri(n,a),l,n)}),s[e](r,...i)}function Ao(n,e,t){const i=tt(n);Pt(i,"iterate",Ks);const s=i[e](...t);return(s===-1||s===!1)&&Ul(t[0])?(t[0]=tt(t[0]),i[e](...t)):s}function bs(n,e,t=[]){qn(),Al();const i=tt(n)[e].apply(n,t);return wl(),Yn(),i}const fd=Sl("__proto__,__v_isRef,__isVue"),df=new Set(Object.getOwnPropertyNames(Symbol).filter(n=>n!=="arguments"&&n!=="caller").map(n=>Symbol[n]).filter(_i));function hd(n){_i(n)||(n=String(n));const e=tt(this);return Pt(e,"has",n),e.hasOwnProperty(n)}class pf{constructor(e=!1,t=!1){this._isReadonly=e,this._isShallow=t}get(e,t,i){if(t==="__v_skip")return e.__v_skip;const s=this._isReadonly,r=this._isShallow;if(t==="__v_isReactive")return!s;if(t==="__v_isReadonly")return s;if(t==="__v_isShallow")return r;if(t==="__v_raw")return i===(s?r?Ed:xf:r?gf:_f).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(i)?e:void 0;const o=qe(e);if(!s){let l;if(o&&(l=cd[t]))return l;if(t==="hasOwnProperty")return hd}const a=Reflect.get(e,t,Lt(e)?e:i);if((_i(t)?df.has(t):fd(t))||(s||Pt(e,"get",t),r))return a;if(Lt(a)){const l=o&&bl(t)?a:a.value;return s&&mt(l)?va(l):l}return mt(a)?s?va(a):Ll(a):a}}class mf extends pf{constructor(e=!1){super(!1,e)}set(e,t,i,s){let r=e[t];const o=qe(e)&&bl(t);if(!this._isShallow){const c=pi(r);if(!fn(i)&&!pi(i)&&(r=tt(r),i=tt(i)),!o&&Lt(r)&&!Lt(i))return c||(r.value=i),!0}const a=o?Number(t)<e.length:nt(e,t),l=Reflect.set(e,t,i,Lt(e)?e:s);return e===tt(s)&&(a?hi(i,r)&&Vn(e,"set",t,i):Vn(e,"add",t,i)),l}deleteProperty(e,t){const i=nt(e,t);e[t];const s=Reflect.deleteProperty(e,t);return s&&i&&Vn(e,"delete",t,void 0),s}has(e,t){const i=Reflect.has(e,t);return(!_i(t)||!df.has(t))&&Pt(e,"has",t),i}ownKeys(e){return Pt(e,"iterate",qe(e)?"length":Li),Reflect.ownKeys(e)}}class dd extends pf{constructor(e=!1){super(!0,e)}set(e,t){return!0}deleteProperty(e,t){return!0}}const pd=new mf,md=new dd,_d=new mf(!0);const xa=n=>n,dr=n=>Reflect.getPrototypeOf(n);function gd(n,e,t){return function(...i){const s=this.__v_raw,r=tt(s),o=ss(r),a=n==="entries"||n===Symbol.iterator&&o,l=n==="keys"&&o,c=s[n](...i),u=t?xa:e?$s:jn;return!e&&Pt(r,"iterate",l?ga:Li),{next(){const{value:f,done:h}=c.next();return h?{value:f,done:h}:{value:a?[u(f[0]),u(f[1])]:u(f),done:h}},[Symbol.iterator](){return this}}}}function pr(n){return function(...e){return n==="delete"?!1:n==="clear"?void 0:this}}function xd(n,e){const t={get(s){const r=this.__v_raw,o=tt(r),a=tt(s);n||(hi(s,a)&&Pt(o,"get",s),Pt(o,"get",a));const{has:l}=dr(o),c=e?xa:n?$s:jn;if(l.call(o,s))return c(r.get(s));if(l.call(o,a))return c(r.get(a));r!==o&&r.get(s)},get size(){const s=this.__v_raw;return!n&&Pt(tt(s),"iterate",Li),s.size},has(s){const r=this.__v_raw,o=tt(r),a=tt(s);return n||(hi(s,a)&&Pt(o,"has",s),Pt(o,"has",a)),s===a?r.has(s):r.has(s)||r.has(a)},forEach(s,r){const o=this,a=o.__v_raw,l=tt(a),c=e?xa:n?$s:jn;return!n&&Pt(l,"iterate",Li),a.forEach((u,f)=>s.call(r,c(u),c(f),o))}};return Ut(t,n?{add:pr("add"),set:pr("set"),delete:pr("delete"),clear:pr("clear")}:{add(s){!e&&!fn(s)&&!pi(s)&&(s=tt(s));const r=tt(this);return dr(r).has.call(r,s)||(r.add(s),Vn(r,"add",s,s)),this},set(s,r){!e&&!fn(r)&&!pi(r)&&(r=tt(r));const o=tt(this),{has:a,get:l}=dr(o);let c=a.call(o,s);c||(s=tt(s),c=a.call(o,s));const u=l.call(o,s);return o.set(s,r),c?hi(r,u)&&Vn(o,"set",s,r):Vn(o,"add",s,r),this},delete(s){const r=tt(this),{has:o,get:a}=dr(r);let l=o.call(r,s);l||(s=tt(s),l=o.call(r,s)),a&&a.call(r,s);const c=r.delete(s);return l&&Vn(r,"delete",s,void 0),c},clear(){const s=tt(this),r=s.size!==0,o=s.clear();return r&&Vn(s,"clear",void 0,void 0),o}}),["keys","values","entries",Symbol.iterator].forEach(s=>{t[s]=gd(s,n,e)}),t}function Dl(n,e){const t=xd(n,e);return(i,s,r)=>s==="__v_isReactive"?!n:s==="__v_isReadonly"?n:s==="__v_raw"?i:Reflect.get(nt(t,s)&&s in i?t:i,s,r)}const vd={get:Dl(!1,!1)},Sd={get:Dl(!1,!0)},Md={get:Dl(!0,!1)};const _f=new WeakMap,gf=new WeakMap,xf=new WeakMap,Ed=new WeakMap;function bd(n){switch(n){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function yd(n){return n.__v_skip||!Object.isExtensible(n)?0:bd(Kh(n))}function Ll(n){return pi(n)?n:Il(n,!1,pd,vd,_f)}function Td(n){return Il(n,!1,_d,Sd,gf)}function va(n){return Il(n,!0,md,Md,xf)}function Il(n,e,t,i,s){if(!mt(n)||n.__v_raw&&!(e&&n.__v_isReactive))return n;const r=yd(n);if(r===0)return n;const o=s.get(n);if(o)return o;const a=new Proxy(n,r===2?i:t);return s.set(n,a),a}function rs(n){return pi(n)?rs(n.__v_raw):!!(n&&n.__v_isReactive)}function pi(n){return!!(n&&n.__v_isReadonly)}function fn(n){return!!(n&&n.__v_isShallow)}function Ul(n){return n?!!n.__v_raw:!1}function tt(n){const e=n&&n.__v_raw;return e?tt(e):n}function Ad(n){return!nt(n,"__v_skip")&&Object.isExtensible(n)&&ef(n,"__v_skip",!0),n}const jn=n=>mt(n)?Ll(n):n,$s=n=>mt(n)?va(n):n;function Lt(n){return n?n.__v_isRef===!0:!1}function Ss(n){return wd(n,!1)}function wd(n,e){return Lt(n)?n:new Rd(n,e)}class Rd{constructor(e,t){this.dep=new Cl,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=t?e:tt(e),this._value=t?e:jn(e),this.__v_isShallow=t}get value(){return this.dep.track(),this._value}set value(e){const t=this._rawValue,i=this.__v_isShallow||fn(e)||pi(e);e=i?e:tt(e),hi(e,t)&&(this._rawValue=e,this._value=i?e:jn(e),this.dep.trigger())}}function Ct(n){return Lt(n)?n.value:n}const Cd={get:(n,e,t)=>e==="__v_raw"?n:Ct(Reflect.get(n,e,t)),set:(n,e,t,i)=>{const s=n[e];return Lt(s)&&!Lt(t)?(s.value=t,!0):Reflect.set(n,e,t,i)}};function vf(n){return rs(n)?n:new Proxy(n,Cd)}class Pd{constructor(e,t,i){this.fn=e,this.setter=t,this._value=void 0,this.dep=new Cl(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=js-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!t,this.isSSR=i}notify(){if(this.flags|=16,!(this.flags&8)&&ht!==this)return af(this,!0),!0}get value(){const e=this.dep.track();return uf(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function Dd(n,e,t=!1){let i,s;return Xe(n)?i=n:(i=n.get,s=n.set),new Pd(i,s,t)}const mr={},Kr=new WeakMap;let wi;function Ld(n,e=!1,t=wi){if(t){let i=Kr.get(t);i||Kr.set(t,i=[]),i.push(n)}}function Id(n,e,t=dt){const{immediate:i,deep:s,once:r,scheduler:o,augmentJob:a,call:l}=t,c=b=>s?b:fn(b)||s===!1||s===0?ci(b,1):ci(b);let u,f,h,m,g=!1,M=!1;if(Lt(n)?(f=()=>n.value,g=fn(n)):rs(n)?(f=()=>c(n),g=!0):qe(n)?(M=!0,g=n.some(b=>rs(b)||fn(b)),f=()=>n.map(b=>{if(Lt(b))return b.value;if(rs(b))return c(b);if(Xe(b))return l?l(b,2):b()})):Xe(n)?e?f=l?()=>l(n,2):n:f=()=>{if(h){qn();try{h()}finally{Yn()}}const b=wi;wi=u;try{return l?l(n,3,[m]):n(m)}finally{wi=b}}:f=yn,e&&s){const b=f,R=s===!0?1/0:s;f=()=>ci(b(),R)}const _=od(),d=()=>{u.stop(),_&&_.active&&El(_.effects,u)};if(r&&e){const b=e;e=(...R)=>{b(...R),d()}}let T=M?new Array(n.length).fill(mr):mr;const A=b=>{if(!(!(u.flags&1)||!u.dirty&&!b))if(e){const R=u.run();if(s||g||(M?R.some((C,L)=>hi(C,T[L])):hi(R,T))){h&&h();const C=wi;wi=u;try{const L=[R,T===mr?void 0:M&&T[0]===mr?[]:T,m];T=R,l?l(e,3,L):e(...L)}finally{wi=C}}}else u.run()};return a&&a(A),u=new rf(f),u.scheduler=o?()=>o(A,!1):A,m=b=>Ld(b,!1,u),h=u.onStop=()=>{const b=Kr.get(u);if(b){if(l)l(b,4);else for(const R of b)R();Kr.delete(u)}},e?i?A(!0):T=u.run():o?o(A.bind(null,!0),!0):u.run(),d.pause=u.pause.bind(u),d.resume=u.resume.bind(u),d.stop=d,d}function ci(n,e=1/0,t){if(e<=0||!mt(n)||n.__v_skip||(t=t||new Map,(t.get(n)||0)>=e))return n;if(t.set(n,e),e--,Lt(n))ci(n.value,e,t);else if(qe(n))for(let i=0;i<n.length;i++)ci(n[i],e,t);else if(Ku(n)||ss(n))n.forEach(i=>{ci(i,e,t)});else if(Ju(n)){for(const i in n)ci(n[i],e,t);for(const i of Object.getOwnPropertySymbols(n))Object.prototype.propertyIsEnumerable.call(n,i)&&ci(n[i],e,t)}return n}function sr(n,e,t,i){try{return i?n(...i):n()}catch(s){co(s,e,t)}}function wn(n,e,t,i){if(Xe(n)){const s=sr(n,e,t,i);return s&&$u(s)&&s.catch(r=>{co(r,e,t)}),s}if(qe(n)){const s=[];for(let r=0;r<n.length;r++)s.push(wn(n[r],e,t,i));return s}}function co(n,e,t,i=!0){const s=e?e.vnode:null,{errorHandler:r,throwUnhandledErrorInProduction:o}=e&&e.appContext.config||dt;if(e){let a=e.parent;const l=e.proxy,c=`https://vuejs.org/error-reference/#runtime-${t}`;for(;a;){const u=a.ec;if(u){for(let f=0;f<u.length;f++)if(u[f](n,l,c)===!1)return}a=a.parent}if(r){qn(),sr(r,null,10,[n,l,c]),Yn();return}}Ud(n,t,s,i,o)}function Ud(n,e,t,i=!0,s=!1){if(s)throw n;console.error(n)}const Bt=[];let _n=-1;const os=[];let oi=null,es=0;const Sf=Promise.resolve();let $r=null;function Nd(n){const e=$r||Sf;return n?e.then(this?n.bind(this):n):e}function Fd(n){let e=_n+1,t=Bt.length;for(;e<t;){const i=e+t>>>1,s=Bt[i],r=Zs(s);r<n||r===n&&s.flags&2?e=i+1:t=i}return e}function Nl(n){if(!(n.flags&1)){const e=Zs(n),t=Bt[Bt.length-1];!t||!(n.flags&2)&&e>=Zs(t)?Bt.push(n):Bt.splice(Fd(e),0,n),n.flags|=1,Mf()}}function Mf(){$r||($r=Sf.then(bf))}function Od(n){qe(n)?os.push(...n):oi&&n.id===-1?oi.splice(es+1,0,n):n.flags&1||(os.push(n),n.flags|=1),Mf()}function gc(n,e,t=_n+1){for(;t<Bt.length;t++){const i=Bt[t];if(i&&i.flags&2){if(n&&i.id!==n.uid)continue;Bt.splice(t,1),t--,i.flags&4&&(i.flags&=-2),i(),i.flags&4||(i.flags&=-2)}}}function Ef(n){if(os.length){const e=[...new Set(os)].sort((t,i)=>Zs(t)-Zs(i));if(os.length=0,oi){oi.push(...e);return}for(oi=e,es=0;es<oi.length;es++){const t=oi[es];t.flags&4&&(t.flags&=-2),t.flags&8||t(),t.flags&=-2}oi=null,es=0}}const Zs=n=>n.id==null?n.flags&2?-1:1/0:n.id;function bf(n){try{for(_n=0;_n<Bt.length;_n++){const e=Bt[_n];e&&!(e.flags&8)&&(e.flags&4&&(e.flags&=-2),sr(e,e.i,e.i?15:14),e.flags&4||(e.flags&=-2))}}finally{for(;_n<Bt.length;_n++){const e=Bt[_n];e&&(e.flags&=-2)}_n=-1,Bt.length=0,Ef(),$r=null,(Bt.length||os.length)&&bf()}}let Mn=null,yf=null;function Zr(n){const e=Mn;return Mn=n,yf=n&&n.type.__scopeId||null,e}function Bd(n,e=Mn,t){if(!e||n._n)return n;const i=(...s)=>{i._d&&wc(-1);const r=Zr(e);let o;try{o=n(...s)}finally{Zr(r),i._d&&wc(1)}return o};return i._n=!0,i._c=!0,i._d=!0,i}function vi(n,e,t,i){const s=n.dirs,r=e&&e.dirs;for(let o=0;o<s.length;o++){const a=s[o];r&&(a.oldValue=r[o].value);let l=a.dir[i];l&&(qn(),wn(l,t,8,[n.el,a,n,e]),Yn())}}function zd(n,e){if(zt){let t=zt.provides;const i=zt.parent&&zt.parent.provides;i===t&&(t=zt.provides=Object.create(i)),t[n]=e}}function zr(n,e,t=!1){const i=zp();if(i||ls){let s=ls?ls._context.provides:i?i.parent==null||i.ce?i.vnode.appContext&&i.vnode.appContext.provides:i.parent.provides:void 0;if(s&&n in s)return s[n];if(arguments.length>1)return t&&Xe(e)?e.call(i&&i.proxy):e}}const Vd=Symbol.for("v-scx"),Hd=()=>zr(Vd);function as(n,e,t){return Tf(n,e,t)}function Tf(n,e,t=dt){const{immediate:i,deep:s,flush:r,once:o}=t,a=Ut({},t),l=e&&i||!e&&r!=="post";let c;if(Qs){if(r==="sync"){const m=Hd();c=m.__watcherHandles||(m.__watcherHandles=[])}else if(!l){const m=()=>{};return m.stop=yn,m.resume=yn,m.pause=yn,m}}const u=zt;a.call=(m,g,M)=>wn(m,u,g,M);let f=!1;r==="post"?a.scheduler=m=>{Zt(m,u&&u.suspense)}:r!=="sync"&&(f=!0,a.scheduler=(m,g)=>{g?m():Nl(m)}),a.augmentJob=m=>{e&&(m.flags|=4),f&&(m.flags|=2,u&&(m.id=u.uid,m.i=u))};const h=Id(n,e,a);return Qs&&(c?c.push(h):l&&h()),h}function Gd(n,e,t){const i=this.proxy,s=Et(n)?n.includes(".")?Af(i,n):()=>i[n]:n.bind(i,i);let r;Xe(e)?r=e:(r=e.handler,t=e);const o=rr(this),a=Tf(s,r.bind(i),t);return o(),a}function Af(n,e){const t=e.split(".");return()=>{let i=n;for(let s=0;s<t.length&&i;s++)i=i[t[s]];return i}}const kd=Symbol("_vte"),Wd=n=>n.__isTeleport,Xd=Symbol("_leaveCb");function Fl(n,e){n.shapeFlag&6&&n.component?(n.transition=e,Fl(n.component.subTree,e)):n.shapeFlag&128?(n.ssContent.transition=e.clone(n.ssContent),n.ssFallback.transition=e.clone(n.ssFallback)):n.transition=e}function Ol(n,e){return Xe(n)?Ut({name:n.name},e,{setup:n}):n}function wf(n){n.ids=[n.ids[0]+n.ids[2]+++"-",0,0]}const Jr=new WeakMap;function ks(n,e,t,i,s=!1){if(qe(n)){n.forEach((g,M)=>ks(g,e&&(qe(e)?e[M]:e),t,i,s));return}if(Ws(i)&&!s){i.shapeFlag&512&&i.type.__asyncResolved&&i.component.subTree.component&&ks(n,e,t,i.component.subTree);return}const r=i.shapeFlag&4?Wl(i.component):i.el,o=s?null:r,{i:a,r:l}=n,c=e&&e.r,u=a.refs===dt?a.refs={}:a.refs,f=a.setupState,h=tt(f),m=f===dt?ju:g=>nt(h,g);if(c!=null&&c!==l){if(xc(e),Et(c))u[c]=null,m(c)&&(f[c]=null);else if(Lt(c)){c.value=null;const g=e;g.k&&(u[g.k]=null)}}if(Xe(l))sr(l,a,12,[o,u]);else{const g=Et(l),M=Lt(l);if(g||M){const _=()=>{if(n.f){const d=g?m(l)?f[l]:u[l]:l.value;if(s)qe(d)&&El(d,r);else if(qe(d))d.includes(r)||d.push(r);else if(g)u[l]=[r],m(l)&&(f[l]=u[l]);else{const T=[r];l.value=T,n.k&&(u[n.k]=T)}}else g?(u[l]=o,m(l)&&(f[l]=o)):M&&(l.value=o,n.k&&(u[n.k]=o))};if(o){const d=()=>{_(),Jr.delete(n)};d.id=-1,Jr.set(n,d),Zt(d,t)}else xc(n),_()}}}function xc(n){const e=Jr.get(n);e&&(e.flags|=8,Jr.delete(n))}lo().requestIdleCallback;lo().cancelIdleCallback;const Ws=n=>!!n.type.__asyncLoader,Rf=n=>n.type.__isKeepAlive;function qd(n,e){Cf(n,"a",e)}function Yd(n,e){Cf(n,"da",e)}function Cf(n,e,t=zt){const i=n.__wdc||(n.__wdc=()=>{let s=t;for(;s;){if(s.isDeactivated)return;s=s.parent}return n()});if(uo(e,i,t),t){let s=t.parent;for(;s&&s.parent;)Rf(s.parent.vnode)&&jd(i,e,t,s),s=s.parent}}function jd(n,e,t,i){const s=uo(e,n,i,!0);Bl(()=>{El(i[e],s)},t)}function uo(n,e,t=zt,i=!1){if(t){const s=t[n]||(t[n]=[]),r=e.__weh||(e.__weh=(...o)=>{qn();const a=rr(t),l=wn(e,t,n,o);return a(),Yn(),l});return i?s.unshift(r):s.push(r),r}}const Zn=n=>(e,t=zt)=>{(!Qs||n==="sp")&&uo(n,(...i)=>e(...i),t)},Kd=Zn("bm"),Pf=Zn("m"),$d=Zn("bu"),Zd=Zn("u"),Jd=Zn("bum"),Bl=Zn("um"),Qd=Zn("sp"),ep=Zn("rtg"),tp=Zn("rtc");function np(n,e=zt){uo("ec",n,e)}const ip=Symbol.for("v-ndc"),Sa=n=>n?Kf(n)?Wl(n):Sa(n.parent):null,Xs=Ut(Object.create(null),{$:n=>n,$el:n=>n.vnode.el,$data:n=>n.data,$props:n=>n.props,$attrs:n=>n.attrs,$slots:n=>n.slots,$refs:n=>n.refs,$parent:n=>Sa(n.parent),$root:n=>Sa(n.root),$host:n=>n.ce,$emit:n=>n.emit,$options:n=>Lf(n),$forceUpdate:n=>n.f||(n.f=()=>{Nl(n.update)}),$nextTick:n=>n.n||(n.n=Nd.bind(n.proxy)),$watch:n=>Gd.bind(n)}),wo=(n,e)=>n!==dt&&!n.__isScriptSetup&&nt(n,e),sp={get({_:n},e){if(e==="__v_skip")return!0;const{ctx:t,setupState:i,data:s,props:r,accessCache:o,type:a,appContext:l}=n;if(e[0]!=="$"){const h=o[e];if(h!==void 0)switch(h){case 1:return i[e];case 2:return s[e];case 4:return t[e];case 3:return r[e]}else{if(wo(i,e))return o[e]=1,i[e];if(s!==dt&&nt(s,e))return o[e]=2,s[e];if(nt(r,e))return o[e]=3,r[e];if(t!==dt&&nt(t,e))return o[e]=4,t[e];Ma&&(o[e]=0)}}const c=Xs[e];let u,f;if(c)return e==="$attrs"&&Pt(n.attrs,"get",""),c(n);if((u=a.__cssModules)&&(u=u[e]))return u;if(t!==dt&&nt(t,e))return o[e]=4,t[e];if(f=l.config.globalProperties,nt(f,e))return f[e]},set({_:n},e,t){const{data:i,setupState:s,ctx:r}=n;return wo(s,e)?(s[e]=t,!0):i!==dt&&nt(i,e)?(i[e]=t,!0):nt(n.props,e)||e[0]==="$"&&e.slice(1)in n?!1:(r[e]=t,!0)},has({_:{data:n,setupState:e,accessCache:t,ctx:i,appContext:s,props:r,type:o}},a){let l;return!!(t[a]||n!==dt&&a[0]!=="$"&&nt(n,a)||wo(e,a)||nt(r,a)||nt(i,a)||nt(Xs,a)||nt(s.config.globalProperties,a)||(l=o.__cssModules)&&l[a])},defineProperty(n,e,t){return t.get!=null?n._.accessCache[e]=0:nt(t,"value")&&this.set(n,e,t.value,null),Reflect.defineProperty(n,e,t)}};function vc(n){return qe(n)?n.reduce((e,t)=>(e[t]=null,e),{}):n}let Ma=!0;function rp(n){const e=Lf(n),t=n.proxy,i=n.ctx;Ma=!1,e.beforeCreate&&Sc(e.beforeCreate,n,"bc");const{data:s,computed:r,methods:o,watch:a,provide:l,inject:c,created:u,beforeMount:f,mounted:h,beforeUpdate:m,updated:g,activated:M,deactivated:_,beforeDestroy:d,beforeUnmount:T,destroyed:A,unmounted:b,render:R,renderTracked:C,renderTriggered:L,errorCaptured:F,serverPrefetch:x,expose:E,inheritAttrs:I,components:j,directives:B,filters:Z}=e;if(c&&op(c,i,null),o)for(const k in o){const $=o[k];Xe($)&&(i[k]=$.bind(t))}if(s){const k=s.call(t,t);mt(k)&&(n.data=Ll(k))}if(Ma=!0,r)for(const k in r){const $=r[k],_e=Xe($)?$.bind(t,t):Xe($.get)?$.get.bind(t,t):yn,de=!Xe($)&&Xe($.set)?$.set.bind(t):yn,ge=Xp({get:_e,set:de});Object.defineProperty(i,k,{enumerable:!0,configurable:!0,get:()=>ge.value,set:Fe=>ge.value=Fe})}if(a)for(const k in a)Df(a[k],i,t,k);if(l){const k=Xe(l)?l.call(t):l;Reflect.ownKeys(k).forEach($=>{zd($,k[$])})}u&&Sc(u,n,"c");function X(k,$){qe($)?$.forEach(_e=>k(_e.bind(t))):$&&k($.bind(t))}if(X(Kd,f),X(Pf,h),X($d,m),X(Zd,g),X(qd,M),X(Yd,_),X(np,F),X(tp,C),X(ep,L),X(Jd,T),X(Bl,b),X(Qd,x),qe(E))if(E.length){const k=n.exposed||(n.exposed={});E.forEach($=>{Object.defineProperty(k,$,{get:()=>t[$],set:_e=>t[$]=_e,enumerable:!0})})}else n.exposed||(n.exposed={});R&&n.render===yn&&(n.render=R),I!=null&&(n.inheritAttrs=I),j&&(n.components=j),B&&(n.directives=B),x&&wf(n)}function op(n,e,t=yn){qe(n)&&(n=Ea(n));for(const i in n){const s=n[i];let r;mt(s)?"default"in s?r=zr(s.from||i,s.default,!0):r=zr(s.from||i):r=zr(s),Lt(r)?Object.defineProperty(e,i,{enumerable:!0,configurable:!0,get:()=>r.value,set:o=>r.value=o}):e[i]=r}}function Sc(n,e,t){wn(qe(n)?n.map(i=>i.bind(e.proxy)):n.bind(e.proxy),e,t)}function Df(n,e,t,i){let s=i.includes(".")?Af(t,i):()=>t[i];if(Et(n)){const r=e[n];Xe(r)&&as(s,r)}else if(Xe(n))as(s,n.bind(t));else if(mt(n))if(qe(n))n.forEach(r=>Df(r,e,t,i));else{const r=Xe(n.handler)?n.handler.bind(t):e[n.handler];Xe(r)&&as(s,r,n)}}function Lf(n){const e=n.type,{mixins:t,extends:i}=e,{mixins:s,optionsCache:r,config:{optionMergeStrategies:o}}=n.appContext,a=r.get(e);let l;return a?l=a:!s.length&&!t&&!i?l=e:(l={},s.length&&s.forEach(c=>Qr(l,c,o,!0)),Qr(l,e,o)),mt(e)&&r.set(e,l),l}function Qr(n,e,t,i=!1){const{mixins:s,extends:r}=e;r&&Qr(n,r,t,!0),s&&s.forEach(o=>Qr(n,o,t,!0));for(const o in e)if(!(i&&o==="expose")){const a=ap[o]||t&&t[o];n[o]=a?a(n[o],e[o]):e[o]}return n}const ap={data:Mc,props:Ec,emits:Ec,methods:Is,computed:Is,beforeCreate:Ft,created:Ft,beforeMount:Ft,mounted:Ft,beforeUpdate:Ft,updated:Ft,beforeDestroy:Ft,beforeUnmount:Ft,destroyed:Ft,unmounted:Ft,activated:Ft,deactivated:Ft,errorCaptured:Ft,serverPrefetch:Ft,components:Is,directives:Is,watch:cp,provide:Mc,inject:lp};function Mc(n,e){return e?n?function(){return Ut(Xe(n)?n.call(this,this):n,Xe(e)?e.call(this,this):e)}:e:n}function lp(n,e){return Is(Ea(n),Ea(e))}function Ea(n){if(qe(n)){const e={};for(let t=0;t<n.length;t++)e[n[t]]=n[t];return e}return n}function Ft(n,e){return n?[...new Set([].concat(n,e))]:e}function Is(n,e){return n?Ut(Object.create(null),n,e):e}function Ec(n,e){return n?qe(n)&&qe(e)?[...new Set([...n,...e])]:Ut(Object.create(null),vc(n),vc(e??{})):e}function cp(n,e){if(!n)return e;if(!e)return n;const t=Ut(Object.create(null),n);for(const i in e)t[i]=Ft(n[i],e[i]);return t}function If(){return{app:null,config:{isNativeTag:ju,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let up=0;function fp(n,e){return function(i,s=null){Xe(i)||(i=Ut({},i)),s!=null&&!mt(s)&&(s=null);const r=If(),o=new WeakSet,a=[];let l=!1;const c=r.app={_uid:up++,_component:i,_props:s,_container:null,_context:r,_instance:null,version:qp,get config(){return r.config},set config(u){},use(u,...f){return o.has(u)||(u&&Xe(u.install)?(o.add(u),u.install(c,...f)):Xe(u)&&(o.add(u),u(c,...f))),c},mixin(u){return r.mixins.includes(u)||r.mixins.push(u),c},component(u,f){return f?(r.components[u]=f,c):r.components[u]},directive(u,f){return f?(r.directives[u]=f,c):r.directives[u]},mount(u,f,h){if(!l){const m=c._ceVNode||Gn(i,s);return m.appContext=r,h===!0?h="svg":h===!1&&(h=void 0),n(m,u,h),l=!0,c._container=u,u.__vue_app__=c,Wl(m.component)}},onUnmount(u){a.push(u)},unmount(){l&&(wn(a,c._instance,16),n(null,c._container),delete c._container.__vue_app__)},provide(u,f){return r.provides[u]=f,c},runWithContext(u){const f=ls;ls=c;try{return u()}finally{ls=f}}};return c}}let ls=null;const hp=(n,e)=>e==="modelValue"||e==="model-value"?n.modelModifiers:n[`${e}Modifiers`]||n[`${di(e)}Modifiers`]||n[`${Fi(e)}Modifiers`];function dp(n,e,...t){if(n.isUnmounted)return;const i=n.vnode.props||dt;let s=t;const r=e.startsWith("update:"),o=r&&hp(i,e.slice(7));o&&(o.trim&&(s=t.map(u=>Et(u)?u.trim():u)),o.number&&(s=t.map(Jh)));let a,l=i[a=Mo(e)]||i[a=Mo(di(e))];!l&&r&&(l=i[a=Mo(Fi(e))]),l&&wn(l,n,6,s);const c=i[a+"Once"];if(c){if(!n.emitted)n.emitted={};else if(n.emitted[a])return;n.emitted[a]=!0,wn(c,n,6,s)}}const pp=new WeakMap;function Uf(n,e,t=!1){const i=t?pp:e.emitsCache,s=i.get(n);if(s!==void 0)return s;const r=n.emits;let o={},a=!1;if(!Xe(n)){const l=c=>{const u=Uf(c,e,!0);u&&(a=!0,Ut(o,u))};!t&&e.mixins.length&&e.mixins.forEach(l),n.extends&&l(n.extends),n.mixins&&n.mixins.forEach(l)}return!r&&!a?(mt(n)&&i.set(n,null),null):(qe(r)?r.forEach(l=>o[l]=null):Ut(o,r),mt(n)&&i.set(n,o),o)}function fo(n,e){return!n||!ro(e)?!1:(e=e.slice(2).replace(/Once$/,""),nt(n,e[0].toLowerCase()+e.slice(1))||nt(n,Fi(e))||nt(n,e))}function bc(n){const{type:e,vnode:t,proxy:i,withProxy:s,propsOptions:[r],slots:o,attrs:a,emit:l,render:c,renderCache:u,props:f,data:h,setupState:m,ctx:g,inheritAttrs:M}=n,_=Zr(n);let d,T;try{if(t.shapeFlag&4){const b=s||i,R=b;d=xn(c.call(R,b,u,f,m,h,g)),T=a}else{const b=e;d=xn(b.length>1?b(f,{attrs:a,slots:o,emit:l}):b(f,null)),T=e.props?a:mp(a)}}catch(b){qs.length=0,co(b,n,1),d=Gn(hs)}let A=d;if(T&&M!==!1){const b=Object.keys(T),{shapeFlag:R}=A;b.length&&R&7&&(r&&b.some(Ml)&&(T=_p(T,r)),A=ds(A,T,!1,!0))}return t.dirs&&(A=ds(A,null,!1,!0),A.dirs=A.dirs?A.dirs.concat(t.dirs):t.dirs),t.transition&&Fl(A,t.transition),d=A,Zr(_),d}const mp=n=>{let e;for(const t in n)(t==="class"||t==="style"||ro(t))&&((e||(e={}))[t]=n[t]);return e},_p=(n,e)=>{const t={};for(const i in n)(!Ml(i)||!(i.slice(9)in e))&&(t[i]=n[i]);return t};function gp(n,e,t){const{props:i,children:s,component:r}=n,{props:o,children:a,patchFlag:l}=e,c=r.emitsOptions;if(e.dirs||e.transition)return!0;if(t&&l>=0){if(l&1024)return!0;if(l&16)return i?yc(i,o,c):!!o;if(l&8){const u=e.dynamicProps;for(let f=0;f<u.length;f++){const h=u[f];if(o[h]!==i[h]&&!fo(c,h))return!0}}}else return(s||a)&&(!a||!a.$stable)?!0:i===o?!1:i?o?yc(i,o,c):!0:!!o;return!1}function yc(n,e,t){const i=Object.keys(e);if(i.length!==Object.keys(n).length)return!0;for(let s=0;s<i.length;s++){const r=i[s];if(e[r]!==n[r]&&!fo(t,r))return!0}return!1}function xp({vnode:n,parent:e},t){for(;e;){const i=e.subTree;if(i.suspense&&i.suspense.activeBranch===n&&(i.el=n.el),i===n)(n=e.vnode).el=t,e=e.parent;else break}}const Nf={},Ff=()=>Object.create(Nf),Of=n=>Object.getPrototypeOf(n)===Nf;function vp(n,e,t,i=!1){const s={},r=Ff();n.propsDefaults=Object.create(null),Bf(n,e,s,r);for(const o in n.propsOptions[0])o in s||(s[o]=void 0);t?n.props=i?s:Td(s):n.type.props?n.props=s:n.props=r,n.attrs=r}function Sp(n,e,t,i){const{props:s,attrs:r,vnode:{patchFlag:o}}=n,a=tt(s),[l]=n.propsOptions;let c=!1;if((i||o>0)&&!(o&16)){if(o&8){const u=n.vnode.dynamicProps;for(let f=0;f<u.length;f++){let h=u[f];if(fo(n.emitsOptions,h))continue;const m=e[h];if(l)if(nt(r,h))m!==r[h]&&(r[h]=m,c=!0);else{const g=di(h);s[g]=ba(l,a,g,m,n,!1)}else m!==r[h]&&(r[h]=m,c=!0)}}}else{Bf(n,e,s,r)&&(c=!0);let u;for(const f in a)(!e||!nt(e,f)&&((u=Fi(f))===f||!nt(e,u)))&&(l?t&&(t[f]!==void 0||t[u]!==void 0)&&(s[f]=ba(l,a,f,void 0,n,!0)):delete s[f]);if(r!==a)for(const f in r)(!e||!nt(e,f))&&(delete r[f],c=!0)}c&&Vn(n.attrs,"set","")}function Bf(n,e,t,i){const[s,r]=n.propsOptions;let o=!1,a;if(e)for(let l in e){if(Vs(l))continue;const c=e[l];let u;s&&nt(s,u=di(l))?!r||!r.includes(u)?t[u]=c:(a||(a={}))[u]=c:fo(n.emitsOptions,l)||(!(l in i)||c!==i[l])&&(i[l]=c,o=!0)}if(r){const l=tt(t),c=a||dt;for(let u=0;u<r.length;u++){const f=r[u];t[f]=ba(s,l,f,c[f],n,!nt(c,f))}}return o}function ba(n,e,t,i,s,r){const o=n[t];if(o!=null){const a=nt(o,"default");if(a&&i===void 0){const l=o.default;if(o.type!==Function&&!o.skipFactory&&Xe(l)){const{propsDefaults:c}=s;if(t in c)i=c[t];else{const u=rr(s);i=c[t]=l.call(null,e),u()}}else i=l;s.ce&&s.ce._setProp(t,i)}o[0]&&(r&&!a?i=!1:o[1]&&(i===""||i===Fi(t))&&(i=!0))}return i}const Mp=new WeakMap;function zf(n,e,t=!1){const i=t?Mp:e.propsCache,s=i.get(n);if(s)return s;const r=n.props,o={},a=[];let l=!1;if(!Xe(n)){const u=f=>{l=!0;const[h,m]=zf(f,e,!0);Ut(o,h),m&&a.push(...m)};!t&&e.mixins.length&&e.mixins.forEach(u),n.extends&&u(n.extends),n.mixins&&n.mixins.forEach(u)}if(!r&&!l)return mt(n)&&i.set(n,is),is;if(qe(r))for(let u=0;u<r.length;u++){const f=di(r[u]);Tc(f)&&(o[f]=dt)}else if(r)for(const u in r){const f=di(u);if(Tc(f)){const h=r[u],m=o[f]=qe(h)||Xe(h)?{type:h}:Ut({},h),g=m.type;let M=!1,_=!0;if(qe(g))for(let d=0;d<g.length;++d){const T=g[d],A=Xe(T)&&T.name;if(A==="Boolean"){M=!0;break}else A==="String"&&(_=!1)}else M=Xe(g)&&g.name==="Boolean";m[0]=M,m[1]=_,(M||nt(m,"default"))&&a.push(f)}}const c=[o,a];return mt(n)&&i.set(n,c),c}function Tc(n){return n[0]!=="$"&&!Vs(n)}const zl=n=>n==="_"||n==="_ctx"||n==="$stable",Vl=n=>qe(n)?n.map(xn):[xn(n)],Ep=(n,e,t)=>{if(e._n)return e;const i=Bd((...s)=>Vl(e(...s)),t);return i._c=!1,i},Vf=(n,e,t)=>{const i=n._ctx;for(const s in n){if(zl(s))continue;const r=n[s];if(Xe(r))e[s]=Ep(s,r,i);else if(r!=null){const o=Vl(r);e[s]=()=>o}}},Hf=(n,e)=>{const t=Vl(e);n.slots.default=()=>t},Gf=(n,e,t)=>{for(const i in e)(t||!zl(i))&&(n[i]=e[i])},bp=(n,e,t)=>{const i=n.slots=Ff();if(n.vnode.shapeFlag&32){const s=e._;s?(Gf(i,e,t),t&&ef(i,"_",s,!0)):Vf(e,i)}else e&&Hf(n,e)},yp=(n,e,t)=>{const{vnode:i,slots:s}=n;let r=!0,o=dt;if(i.shapeFlag&32){const a=e._;a?t&&a===1?r=!1:Gf(s,e,t):(r=!e.$stable,Vf(e,s)),o=e}else e&&(Hf(n,e),o={default:1});if(r)for(const a in s)!zl(a)&&o[a]==null&&delete s[a]},Zt=Cp;function Tp(n){return Ap(n)}function Ap(n,e){const t=lo();t.__VUE__=!0;const{insert:i,remove:s,patchProp:r,createElement:o,createText:a,createComment:l,setText:c,setElementText:u,parentNode:f,nextSibling:h,setScopeId:m=yn,insertStaticContent:g}=n,M=(w,D,V,Q=null,Y=null,te=null,y=void 0,ae=null,ie=!!D.dynamicChildren)=>{if(w===D)return;w&&!ys(w,D)&&(Q=oe(w),Fe(w,Y,te,!0),w=null),D.patchFlag===-2&&(ie=!1,D.dynamicChildren=null);const{type:J,ref:se,shapeFlag:v}=D;switch(J){case ho:_(w,D,V,Q);break;case hs:d(w,D,V,Q);break;case Co:w==null&&T(D,V,Q,y);break;case gn:j(w,D,V,Q,Y,te,y,ae,ie);break;default:v&1?R(w,D,V,Q,Y,te,y,ae,ie):v&6?B(w,D,V,Q,Y,te,y,ae,ie):(v&64||v&128)&&J.process(w,D,V,Q,Y,te,y,ae,ie,Re)}se!=null&&Y?ks(se,w&&w.ref,te,D||w,!D):se==null&&w&&w.ref!=null&&ks(w.ref,null,te,w,!0)},_=(w,D,V,Q)=>{if(w==null)i(D.el=a(D.children),V,Q);else{const Y=D.el=w.el;D.children!==w.children&&c(Y,D.children)}},d=(w,D,V,Q)=>{w==null?i(D.el=l(D.children||""),V,Q):D.el=w.el},T=(w,D,V,Q)=>{[w.el,w.anchor]=g(w.children,D,V,Q,w.el,w.anchor)},A=({el:w,anchor:D},V,Q)=>{let Y;for(;w&&w!==D;)Y=h(w),i(w,V,Q),w=Y;i(D,V,Q)},b=({el:w,anchor:D})=>{let V;for(;w&&w!==D;)V=h(w),s(w),w=V;s(D)},R=(w,D,V,Q,Y,te,y,ae,ie)=>{if(D.type==="svg"?y="svg":D.type==="math"&&(y="mathml"),w==null)C(D,V,Q,Y,te,y,ae,ie);else{const J=w.el&&w.el._isVueCE?w.el:null;try{J&&J._beginPatch(),x(w,D,Y,te,y,ae,ie)}finally{J&&J._endPatch()}}},C=(w,D,V,Q,Y,te,y,ae)=>{let ie,J;const{props:se,shapeFlag:v,transition:p,dirs:P}=w;if(ie=w.el=o(w.type,te,se&&se.is,se),v&8?u(ie,w.children):v&16&&F(w.children,ie,null,Q,Y,Ro(w,te),y,ae),P&&vi(w,null,Q,"created"),L(ie,w,w.scopeId,y,Q),se){for(const K in se)K!=="value"&&!Vs(K)&&r(ie,K,null,se[K],te,Q);"value"in se&&r(ie,"value",null,se.value,te),(J=se.onVnodeBeforeMount)&&pn(J,Q,w)}P&&vi(w,null,Q,"beforeMount");const G=wp(Y,p);G&&p.beforeEnter(ie),i(ie,D,V),((J=se&&se.onVnodeMounted)||G||P)&&Zt(()=>{J&&pn(J,Q,w),G&&p.enter(ie),P&&vi(w,null,Q,"mounted")},Y)},L=(w,D,V,Q,Y)=>{if(V&&m(w,V),Q)for(let te=0;te<Q.length;te++)m(w,Q[te]);if(Y){let te=Y.subTree;if(D===te||qf(te.type)&&(te.ssContent===D||te.ssFallback===D)){const y=Y.vnode;L(w,y,y.scopeId,y.slotScopeIds,Y.parent)}}},F=(w,D,V,Q,Y,te,y,ae,ie=0)=>{for(let J=ie;J<w.length;J++){const se=w[J]=ae?ai(w[J]):xn(w[J]);M(null,se,D,V,Q,Y,te,y,ae)}},x=(w,D,V,Q,Y,te,y)=>{const ae=D.el=w.el;let{patchFlag:ie,dynamicChildren:J,dirs:se}=D;ie|=w.patchFlag&16;const v=w.props||dt,p=D.props||dt;let P;if(V&&Si(V,!1),(P=p.onVnodeBeforeUpdate)&&pn(P,V,D,w),se&&vi(D,w,V,"beforeUpdate"),V&&Si(V,!0),(v.innerHTML&&p.innerHTML==null||v.textContent&&p.textContent==null)&&u(ae,""),J?E(w.dynamicChildren,J,ae,V,Q,Ro(D,Y),te):y||$(w,D,ae,null,V,Q,Ro(D,Y),te,!1),ie>0){if(ie&16)I(ae,v,p,V,Y);else if(ie&2&&v.class!==p.class&&r(ae,"class",null,p.class,Y),ie&4&&r(ae,"style",v.style,p.style,Y),ie&8){const G=D.dynamicProps;for(let K=0;K<G.length;K++){const z=G[K],Me=v[z],ce=p[z];(ce!==Me||z==="value")&&r(ae,z,Me,ce,Y,V)}}ie&1&&w.children!==D.children&&u(ae,D.children)}else!y&&J==null&&I(ae,v,p,V,Y);((P=p.onVnodeUpdated)||se)&&Zt(()=>{P&&pn(P,V,D,w),se&&vi(D,w,V,"updated")},Q)},E=(w,D,V,Q,Y,te,y)=>{for(let ae=0;ae<D.length;ae++){const ie=w[ae],J=D[ae],se=ie.el&&(ie.type===gn||!ys(ie,J)||ie.shapeFlag&198)?f(ie.el):V;M(ie,J,se,null,Q,Y,te,y,!0)}},I=(w,D,V,Q,Y)=>{if(D!==V){if(D!==dt)for(const te in D)!Vs(te)&&!(te in V)&&r(w,te,D[te],null,Y,Q);for(const te in V){if(Vs(te))continue;const y=V[te],ae=D[te];y!==ae&&te!=="value"&&r(w,te,ae,y,Y,Q)}"value"in V&&r(w,"value",D.value,V.value,Y)}},j=(w,D,V,Q,Y,te,y,ae,ie)=>{const J=D.el=w?w.el:a(""),se=D.anchor=w?w.anchor:a("");let{patchFlag:v,dynamicChildren:p,slotScopeIds:P}=D;P&&(ae=ae?ae.concat(P):P),w==null?(i(J,V,Q),i(se,V,Q),F(D.children||[],V,se,Y,te,y,ae,ie)):v>0&&v&64&&p&&w.dynamicChildren&&w.dynamicChildren.length===p.length?(E(w.dynamicChildren,p,V,Y,te,y,ae),(D.key!=null||Y&&D===Y.subTree)&&kf(w,D,!0)):$(w,D,V,se,Y,te,y,ae,ie)},B=(w,D,V,Q,Y,te,y,ae,ie)=>{D.slotScopeIds=ae,w==null?D.shapeFlag&512?Y.ctx.activate(D,V,Q,y,ie):Z(D,V,Q,Y,te,y,ie):ne(w,D,ie)},Z=(w,D,V,Q,Y,te,y)=>{const ae=w.component=Bp(w,Q,Y);if(Rf(w)&&(ae.ctx.renderer=Re),Vp(ae,!1,y),ae.asyncDep){if(Y&&Y.registerDep(ae,X,y),!w.el){const ie=ae.subTree=Gn(hs);d(null,ie,D,V),w.placeholder=ie.el}}else X(ae,w,D,V,Y,te,y)},ne=(w,D,V)=>{const Q=D.component=w.component;if(gp(w,D,V))if(Q.asyncDep&&!Q.asyncResolved){k(Q,D,V);return}else Q.next=D,Q.update();else D.el=w.el,Q.vnode=D},X=(w,D,V,Q,Y,te,y)=>{const ae=()=>{if(w.isMounted){let{next:v,bu:p,u:P,parent:G,vnode:K}=w;{const De=Wf(w);if(De){v&&(v.el=K.el,k(w,v,y)),De.asyncDep.then(()=>{w.isUnmounted||ae()});return}}let z=v,Me;Si(w,!1),v?(v.el=K.el,k(w,v,y)):v=K,p&&Eo(p),(Me=v.props&&v.props.onVnodeBeforeUpdate)&&pn(Me,G,v,K),Si(w,!0);const ce=bc(w),ye=w.subTree;w.subTree=ce,M(ye,ce,f(ye.el),oe(ye),w,Y,te),v.el=ce.el,z===null&&xp(w,ce.el),P&&Zt(P,Y),(Me=v.props&&v.props.onVnodeUpdated)&&Zt(()=>pn(Me,G,v,K),Y)}else{let v;const{el:p,props:P}=D,{bm:G,m:K,parent:z,root:Me,type:ce}=w,ye=Ws(D);Si(w,!1),G&&Eo(G),!ye&&(v=P&&P.onVnodeBeforeMount)&&pn(v,z,D),Si(w,!0);{Me.ce&&Me.ce._def.shadowRoot!==!1&&Me.ce._injectChildStyle(ce);const De=w.subTree=bc(w);M(null,De,V,Q,w,Y,te),D.el=De.el}if(K&&Zt(K,Y),!ye&&(v=P&&P.onVnodeMounted)){const De=D;Zt(()=>pn(v,z,De),Y)}(D.shapeFlag&256||z&&Ws(z.vnode)&&z.vnode.shapeFlag&256)&&w.a&&Zt(w.a,Y),w.isMounted=!0,D=V=Q=null}};w.scope.on();const ie=w.effect=new rf(ae);w.scope.off();const J=w.update=ie.run.bind(ie),se=w.job=ie.runIfDirty.bind(ie);se.i=w,se.id=w.uid,ie.scheduler=()=>Nl(se),Si(w,!0),J()},k=(w,D,V)=>{D.component=w;const Q=w.vnode.props;w.vnode=D,w.next=null,Sp(w,D.props,Q,V),yp(w,D.children,V),qn(),gc(w),Yn()},$=(w,D,V,Q,Y,te,y,ae,ie=!1)=>{const J=w&&w.children,se=w?w.shapeFlag:0,v=D.children,{patchFlag:p,shapeFlag:P}=D;if(p>0){if(p&128){de(J,v,V,Q,Y,te,y,ae,ie);return}else if(p&256){_e(J,v,V,Q,Y,te,y,ae,ie);return}}P&8?(se&16&&ee(J,Y,te),v!==J&&u(V,v)):se&16?P&16?de(J,v,V,Q,Y,te,y,ae,ie):ee(J,Y,te,!0):(se&8&&u(V,""),P&16&&F(v,V,Q,Y,te,y,ae,ie))},_e=(w,D,V,Q,Y,te,y,ae,ie)=>{w=w||is,D=D||is;const J=w.length,se=D.length,v=Math.min(J,se);let p;for(p=0;p<v;p++){const P=D[p]=ie?ai(D[p]):xn(D[p]);M(w[p],P,V,null,Y,te,y,ae,ie)}J>se?ee(w,Y,te,!0,!1,v):F(D,V,Q,Y,te,y,ae,ie,v)},de=(w,D,V,Q,Y,te,y,ae,ie)=>{let J=0;const se=D.length;let v=w.length-1,p=se-1;for(;J<=v&&J<=p;){const P=w[J],G=D[J]=ie?ai(D[J]):xn(D[J]);if(ys(P,G))M(P,G,V,null,Y,te,y,ae,ie);else break;J++}for(;J<=v&&J<=p;){const P=w[v],G=D[p]=ie?ai(D[p]):xn(D[p]);if(ys(P,G))M(P,G,V,null,Y,te,y,ae,ie);else break;v--,p--}if(J>v){if(J<=p){const P=p+1,G=P<se?D[P].el:Q;for(;J<=p;)M(null,D[J]=ie?ai(D[J]):xn(D[J]),V,G,Y,te,y,ae,ie),J++}}else if(J>p)for(;J<=v;)Fe(w[J],Y,te,!0),J++;else{const P=J,G=J,K=new Map;for(J=G;J<=p;J++){const xe=D[J]=ie?ai(D[J]):xn(D[J]);xe.key!=null&&K.set(xe.key,J)}let z,Me=0;const ce=p-G+1;let ye=!1,De=0;const le=new Array(ce);for(J=0;J<ce;J++)le[J]=0;for(J=P;J<=v;J++){const xe=w[J];if(Me>=ce){Fe(xe,Y,te,!0);continue}let Te;if(xe.key!=null)Te=K.get(xe.key);else for(z=G;z<=p;z++)if(le[z-G]===0&&ys(xe,D[z])){Te=z;break}Te===void 0?Fe(xe,Y,te,!0):(le[Te-G]=J+1,Te>=De?De=Te:ye=!0,M(xe,D[Te],V,null,Y,te,y,ae,ie),Me++)}const pe=ye?Rp(le):is;for(z=pe.length-1,J=ce-1;J>=0;J--){const xe=G+J,Te=D[xe],he=D[xe+1],Ge=xe+1<se?he.el||Xf(he):Q;le[J]===0?M(null,Te,V,Ge,Y,te,y,ae,ie):ye&&(z<0||J!==pe[z]?ge(Te,V,Ge,2):z--)}}},ge=(w,D,V,Q,Y=null)=>{const{el:te,type:y,transition:ae,children:ie,shapeFlag:J}=w;if(J&6){ge(w.component.subTree,D,V,Q);return}if(J&128){w.suspense.move(D,V,Q);return}if(J&64){y.move(w,D,V,Re);return}if(y===gn){i(te,D,V);for(let v=0;v<ie.length;v++)ge(ie[v],D,V,Q);i(w.anchor,D,V);return}if(y===Co){A(w,D,V);return}if(Q!==2&&J&1&&ae)if(Q===0)ae.beforeEnter(te),i(te,D,V),Zt(()=>ae.enter(te),Y);else{const{leave:v,delayLeave:p,afterLeave:P}=ae,G=()=>{w.ctx.isUnmounted?s(te):i(te,D,V)},K=()=>{te._isLeaving&&te[Xd](!0),v(te,()=>{G(),P&&P()})};p?p(te,G,K):K()}else i(te,D,V)},Fe=(w,D,V,Q=!1,Y=!1)=>{const{type:te,props:y,ref:ae,children:ie,dynamicChildren:J,shapeFlag:se,patchFlag:v,dirs:p,cacheIndex:P}=w;if(v===-2&&(Y=!1),ae!=null&&(qn(),ks(ae,null,V,w,!0),Yn()),P!=null&&(D.renderCache[P]=void 0),se&256){D.ctx.deactivate(w);return}const G=se&1&&p,K=!Ws(w);let z;if(K&&(z=y&&y.onVnodeBeforeUnmount)&&pn(z,D,w),se&6)lt(w.component,V,Q);else{if(se&128){w.suspense.unmount(V,Q);return}G&&vi(w,null,D,"beforeUnmount"),se&64?w.type.remove(w,D,V,Re,Q):J&&!J.hasOnce&&(te!==gn||v>0&&v&64)?ee(J,D,V,!1,!0):(te===gn&&v&384||!Y&&se&16)&&ee(ie,D,V),Q&&He(w)}(K&&(z=y&&y.onVnodeUnmounted)||G)&&Zt(()=>{z&&pn(z,D,w),G&&vi(w,null,D,"unmounted")},V)},He=w=>{const{type:D,el:V,anchor:Q,transition:Y}=w;if(D===gn){pt(V,Q);return}if(D===Co){b(w);return}const te=()=>{s(V),Y&&!Y.persisted&&Y.afterLeave&&Y.afterLeave()};if(w.shapeFlag&1&&Y&&!Y.persisted){const{leave:y,delayLeave:ae}=Y,ie=()=>y(V,te);ae?ae(w.el,te,ie):ie()}else te()},pt=(w,D)=>{let V;for(;w!==D;)V=h(w),s(w),w=V;s(D)},lt=(w,D,V)=>{const{bum:Q,scope:Y,job:te,subTree:y,um:ae,m:ie,a:J}=w;Ac(ie),Ac(J),Q&&Eo(Q),Y.stop(),te&&(te.flags|=8,Fe(y,w,D,V)),ae&&Zt(ae,D),Zt(()=>{w.isUnmounted=!0},D)},ee=(w,D,V,Q=!1,Y=!1,te=0)=>{for(let y=te;y<w.length;y++)Fe(w[y],D,V,Q,Y)},oe=w=>{if(w.shapeFlag&6)return oe(w.component.subTree);if(w.shapeFlag&128)return w.suspense.next();const D=h(w.anchor||w.el),V=D&&D[kd];return V?h(V):D};let we=!1;const ze=(w,D,V)=>{let Q;w==null?D._vnode&&(Fe(D._vnode,null,null,!0),Q=D._vnode.component):M(D._vnode||null,w,D,null,null,null,V),D._vnode=w,we||(we=!0,gc(Q),Ef(),we=!1)},Re={p:M,um:Fe,m:ge,r:He,mt:Z,mc:F,pc:$,pbc:E,n:oe,o:n};return{render:ze,hydrate:void 0,createApp:fp(ze)}}function Ro({type:n,props:e},t){return t==="svg"&&n==="foreignObject"||t==="mathml"&&n==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:t}function Si({effect:n,job:e},t){t?(n.flags|=32,e.flags|=4):(n.flags&=-33,e.flags&=-5)}function wp(n,e){return(!n||n&&!n.pendingBranch)&&e&&!e.persisted}function kf(n,e,t=!1){const i=n.children,s=e.children;if(qe(i)&&qe(s))for(let r=0;r<i.length;r++){const o=i[r];let a=s[r];a.shapeFlag&1&&!a.dynamicChildren&&((a.patchFlag<=0||a.patchFlag===32)&&(a=s[r]=ai(s[r]),a.el=o.el),!t&&a.patchFlag!==-2&&kf(o,a)),a.type===ho&&(a.patchFlag!==-1?a.el=o.el:a.__elIndex=r+(n.type===gn?1:0)),a.type===hs&&!a.el&&(a.el=o.el)}}function Rp(n){const e=n.slice(),t=[0];let i,s,r,o,a;const l=n.length;for(i=0;i<l;i++){const c=n[i];if(c!==0){if(s=t[t.length-1],n[s]<c){e[i]=s,t.push(i);continue}for(r=0,o=t.length-1;r<o;)a=r+o>>1,n[t[a]]<c?r=a+1:o=a;c<n[t[r]]&&(r>0&&(e[i]=t[r-1]),t[r]=i)}}for(r=t.length,o=t[r-1];r-- >0;)t[r]=o,o=e[o];return t}function Wf(n){const e=n.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:Wf(e)}function Ac(n){if(n)for(let e=0;e<n.length;e++)n[e].flags|=8}function Xf(n){if(n.placeholder)return n.placeholder;const e=n.component;return e?Xf(e.subTree):null}const qf=n=>n.__isSuspense;function Cp(n,e){e&&e.pendingBranch?qe(n)?e.effects.push(...n):e.effects.push(n):Od(n)}const gn=Symbol.for("v-fgt"),ho=Symbol.for("v-txt"),hs=Symbol.for("v-cmt"),Co=Symbol.for("v-stc"),qs=[];let Qt=null;function Hl(n=!1){qs.push(Qt=n?null:[])}function Pp(){qs.pop(),Qt=qs[qs.length-1]||null}let Js=1;function wc(n,e=!1){Js+=n,n<0&&Qt&&e&&(Qt.hasOnce=!0)}function Dp(n){return n.dynamicChildren=Js>0?Qt||is:null,Pp(),Js>0&&Qt&&Qt.push(n),n}function Gl(n,e,t,i,s,r){return Dp(ts(n,e,t,i,s,r,!0))}function Yf(n){return n?n.__v_isVNode===!0:!1}function ys(n,e){return n.type===e.type&&n.key===e.key}const jf=({key:n})=>n??null,Vr=({ref:n,ref_key:e,ref_for:t})=>(typeof n=="number"&&(n=""+n),n!=null?Et(n)||Lt(n)||Xe(n)?{i:Mn,r:n,k:e,f:!!t}:n:null);function ts(n,e=null,t=null,i=0,s=null,r=n===gn?0:1,o=!1,a=!1){const l={__v_isVNode:!0,__v_skip:!0,type:n,props:e,key:e&&jf(e),ref:e&&Vr(e),scopeId:yf,slotScopeIds:null,children:t,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:r,patchFlag:i,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:Mn};return a?(kl(l,t),r&128&&n.normalize(l)):t&&(l.shapeFlag|=Et(t)?8:16),Js>0&&!o&&Qt&&(l.patchFlag>0||r&6)&&l.patchFlag!==32&&Qt.push(l),l}const Gn=Lp;function Lp(n,e=null,t=null,i=0,s=null,r=!1){if((!n||n===ip)&&(n=hs),Yf(n)){const a=ds(n,e,!0);return t&&kl(a,t),Js>0&&!r&&Qt&&(a.shapeFlag&6?Qt[Qt.indexOf(n)]=a:Qt.push(a)),a.patchFlag=-2,a}if(Wp(n)&&(n=n.__vccOpts),e){e=Ip(e);let{class:a,style:l}=e;a&&!Et(a)&&(e.class=Tl(a)),mt(l)&&(Ul(l)&&!qe(l)&&(l=Ut({},l)),e.style=yl(l))}const o=Et(n)?1:qf(n)?128:Wd(n)?64:mt(n)?4:Xe(n)?2:0;return ts(n,e,t,i,s,o,r,!0)}function Ip(n){return n?Ul(n)||Of(n)?Ut({},n):n:null}function ds(n,e,t=!1,i=!1){const{props:s,ref:r,patchFlag:o,children:a,transition:l}=n,c=e?Np(s||{},e):s,u={__v_isVNode:!0,__v_skip:!0,type:n.type,props:c,key:c&&jf(c),ref:e&&e.ref?t&&r?qe(r)?r.concat(Vr(e)):[r,Vr(e)]:Vr(e):r,scopeId:n.scopeId,slotScopeIds:n.slotScopeIds,children:a,target:n.target,targetStart:n.targetStart,targetAnchor:n.targetAnchor,staticCount:n.staticCount,shapeFlag:n.shapeFlag,patchFlag:e&&n.type!==gn?o===-1?16:o|16:o,dynamicProps:n.dynamicProps,dynamicChildren:n.dynamicChildren,appContext:n.appContext,dirs:n.dirs,transition:l,component:n.component,suspense:n.suspense,ssContent:n.ssContent&&ds(n.ssContent),ssFallback:n.ssFallback&&ds(n.ssFallback),placeholder:n.placeholder,el:n.el,anchor:n.anchor,ctx:n.ctx,ce:n.ce};return l&&i&&Fl(u,l.clone(u)),u}function Up(n=" ",e=0){return Gn(ho,null,n,e)}function xn(n){return n==null||typeof n=="boolean"?Gn(hs):qe(n)?Gn(gn,null,n.slice()):Yf(n)?ai(n):Gn(ho,null,String(n))}function ai(n){return n.el===null&&n.patchFlag!==-1||n.memo?n:ds(n)}function kl(n,e){let t=0;const{shapeFlag:i}=n;if(e==null)e=null;else if(qe(e))t=16;else if(typeof e=="object")if(i&65){const s=e.default;s&&(s._c&&(s._d=!1),kl(n,s()),s._c&&(s._d=!0));return}else{t=32;const s=e._;!s&&!Of(e)?e._ctx=Mn:s===3&&Mn&&(Mn.slots._===1?e._=1:(e._=2,n.patchFlag|=1024))}else Xe(e)?(e={default:e,_ctx:Mn},t=32):(e=String(e),i&64?(t=16,e=[Up(e)]):t=8);n.children=e,n.shapeFlag|=t}function Np(...n){const e={};for(let t=0;t<n.length;t++){const i=n[t];for(const s in i)if(s==="class")e.class!==i.class&&(e.class=Tl([e.class,i.class]));else if(s==="style")e.style=yl([e.style,i.style]);else if(ro(s)){const r=e[s],o=i[s];o&&r!==o&&!(qe(r)&&r.includes(o))&&(e[s]=r?[].concat(r,o):o)}else s!==""&&(e[s]=i[s])}return e}function pn(n,e,t,i=null){wn(n,e,7,[t,i])}const Fp=If();let Op=0;function Bp(n,e,t){const i=n.type,s=(e?e.appContext:n.appContext)||Fp,r={uid:Op++,vnode:n,type:i,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new rd(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:zf(i,s),emitsOptions:Uf(i,s),emit:null,emitted:null,propsDefaults:dt,inheritAttrs:i.inheritAttrs,ctx:dt,data:dt,props:dt,attrs:dt,slots:dt,refs:dt,setupState:dt,setupContext:null,suspense:t,suspenseId:t?t.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return r.ctx={_:r},r.root=e?e.root:r,r.emit=dp.bind(null,r),n.ce&&n.ce(r),r}let zt=null;const zp=()=>zt||Mn;let eo,ya;{const n=lo(),e=(t,i)=>{let s;return(s=n[t])||(s=n[t]=[]),s.push(i),r=>{s.length>1?s.forEach(o=>o(r)):s[0](r)}};eo=e("__VUE_INSTANCE_SETTERS__",t=>zt=t),ya=e("__VUE_SSR_SETTERS__",t=>Qs=t)}const rr=n=>{const e=zt;return eo(n),n.scope.on(),()=>{n.scope.off(),eo(e)}},Rc=()=>{zt&&zt.scope.off(),eo(null)};function Kf(n){return n.vnode.shapeFlag&4}let Qs=!1;function Vp(n,e=!1,t=!1){e&&ya(e);const{props:i,children:s}=n.vnode,r=Kf(n);vp(n,i,r,e),bp(n,s,t||e);const o=r?Hp(n,e):void 0;return e&&ya(!1),o}function Hp(n,e){const t=n.type;n.accessCache=Object.create(null),n.proxy=new Proxy(n.ctx,sp);const{setup:i}=t;if(i){qn();const s=n.setupContext=i.length>1?kp(n):null,r=rr(n),o=sr(i,n,0,[n.props,s]),a=$u(o);if(Yn(),r(),(a||n.sp)&&!Ws(n)&&wf(n),a){if(o.then(Rc,Rc),e)return o.then(l=>{Cc(n,l)}).catch(l=>{co(l,n,0)});n.asyncDep=o}else Cc(n,o)}else $f(n)}function Cc(n,e,t){Xe(e)?n.type.__ssrInlineRender?n.ssrRender=e:n.render=e:mt(e)&&(n.setupState=vf(e)),$f(n)}function $f(n,e,t){const i=n.type;n.render||(n.render=i.render||yn);{const s=rr(n);qn();try{rp(n)}finally{Yn(),s()}}}const Gp={get(n,e){return Pt(n,"get",""),n[e]}};function kp(n){const e=t=>{n.exposed=t||{}};return{attrs:new Proxy(n.attrs,Gp),slots:n.slots,emit:n.emit,expose:e}}function Wl(n){return n.exposed?n.exposeProxy||(n.exposeProxy=new Proxy(vf(Ad(n.exposed)),{get(e,t){if(t in e)return e[t];if(t in Xs)return Xs[t](n)},has(e,t){return t in e||t in Xs}})):n.proxy}function Wp(n){return Xe(n)&&"__vccOpts"in n}const Xp=(n,e)=>Dd(n,e,Qs),qp="3.5.26";let Ta;const Pc=typeof window<"u"&&window.trustedTypes;if(Pc)try{Ta=Pc.createPolicy("vue",{createHTML:n=>n})}catch{}const Zf=Ta?n=>Ta.createHTML(n):n=>n,Yp="http://www.w3.org/2000/svg",jp="http://www.w3.org/1998/Math/MathML",zn=typeof document<"u"?document:null,Dc=zn&&zn.createElement("template"),Kp={insert:(n,e,t)=>{e.insertBefore(n,t||null)},remove:n=>{const e=n.parentNode;e&&e.removeChild(n)},createElement:(n,e,t,i)=>{const s=e==="svg"?zn.createElementNS(Yp,n):e==="mathml"?zn.createElementNS(jp,n):t?zn.createElement(n,{is:t}):zn.createElement(n);return n==="select"&&i&&i.multiple!=null&&s.setAttribute("multiple",i.multiple),s},createText:n=>zn.createTextNode(n),createComment:n=>zn.createComment(n),setText:(n,e)=>{n.nodeValue=e},setElementText:(n,e)=>{n.textContent=e},parentNode:n=>n.parentNode,nextSibling:n=>n.nextSibling,querySelector:n=>zn.querySelector(n),setScopeId(n,e){n.setAttribute(e,"")},insertStaticContent(n,e,t,i,s,r){const o=t?t.previousSibling:e.lastChild;if(s&&(s===r||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),t),!(s===r||!(s=s.nextSibling)););else{Dc.innerHTML=Zf(i==="svg"?`<svg>${n}</svg>`:i==="mathml"?`<math>${n}</math>`:n);const a=Dc.content;if(i==="svg"||i==="mathml"){const l=a.firstChild;for(;l.firstChild;)a.appendChild(l.firstChild);a.removeChild(l)}e.insertBefore(a,t)}return[o?o.nextSibling:e.firstChild,t?t.previousSibling:e.lastChild]}},$p=Symbol("_vtc");function Zp(n,e,t){const i=n[$p];i&&(e=(e?[e,...i]:[...i]).join(" ")),e==null?n.removeAttribute("class"):t?n.setAttribute("class",e):n.className=e}const Lc=Symbol("_vod"),Jp=Symbol("_vsh"),Qp=Symbol(""),em=/(?:^|;)\s*display\s*:/;function tm(n,e,t){const i=n.style,s=Et(t);let r=!1;if(t&&!s){if(e)if(Et(e))for(const o of e.split(";")){const a=o.slice(0,o.indexOf(":")).trim();t[a]==null&&Hr(i,a,"")}else for(const o in e)t[o]==null&&Hr(i,o,"");for(const o in t)o==="display"&&(r=!0),Hr(i,o,t[o])}else if(s){if(e!==t){const o=i[Qp];o&&(t+=";"+o),i.cssText=t,r=em.test(t)}}else e&&n.removeAttribute("style");Lc in n&&(n[Lc]=r?i.display:"",n[Jp]&&(i.display="none"))}const Ic=/\s*!important$/;function Hr(n,e,t){if(qe(t))t.forEach(i=>Hr(n,e,i));else if(t==null&&(t=""),e.startsWith("--"))n.setProperty(e,t);else{const i=nm(n,e);Ic.test(t)?n.setProperty(Fi(i),t.replace(Ic,""),"important"):n[i]=t}}const Uc=["Webkit","Moz","ms"],Po={};function nm(n,e){const t=Po[e];if(t)return t;let i=di(e);if(i!=="filter"&&i in n)return Po[e]=i;i=Qu(i);for(let s=0;s<Uc.length;s++){const r=Uc[s]+i;if(r in n)return Po[e]=r}return e}const Nc="http://www.w3.org/1999/xlink";function Fc(n,e,t,i,s,r=sd(e)){i&&e.startsWith("xlink:")?t==null?n.removeAttributeNS(Nc,e.slice(6,e.length)):n.setAttributeNS(Nc,e,t):t==null||r&&!tf(t)?n.removeAttribute(e):n.setAttribute(e,r?"":_i(t)?String(t):t)}function Oc(n,e,t,i,s){if(e==="innerHTML"||e==="textContent"){t!=null&&(n[e]=e==="innerHTML"?Zf(t):t);return}const r=n.tagName;if(e==="value"&&r!=="PROGRESS"&&!r.includes("-")){const a=r==="OPTION"?n.getAttribute("value")||"":n.value,l=t==null?n.type==="checkbox"?"on":"":String(t);(a!==l||!("_value"in n))&&(n.value=l),t==null&&n.removeAttribute(e),n._value=t;return}let o=!1;if(t===""||t==null){const a=typeof n[e];a==="boolean"?t=tf(t):t==null&&a==="string"?(t="",o=!0):a==="number"&&(t=0,o=!0)}try{n[e]=t}catch{}o&&n.removeAttribute(s||e)}function im(n,e,t,i){n.addEventListener(e,t,i)}function sm(n,e,t,i){n.removeEventListener(e,t,i)}const Bc=Symbol("_vei");function rm(n,e,t,i,s=null){const r=n[Bc]||(n[Bc]={}),o=r[e];if(i&&o)o.value=i;else{const[a,l]=om(e);if(i){const c=r[e]=cm(i,s);im(n,a,c,l)}else o&&(sm(n,a,o,l),r[e]=void 0)}}const zc=/(?:Once|Passive|Capture)$/;function om(n){let e;if(zc.test(n)){e={};let i;for(;i=n.match(zc);)n=n.slice(0,n.length-i[0].length),e[i[0].toLowerCase()]=!0}return[n[2]===":"?n.slice(3):Fi(n.slice(2)),e]}let Do=0;const am=Promise.resolve(),lm=()=>Do||(am.then(()=>Do=0),Do=Date.now());function cm(n,e){const t=i=>{if(!i._vts)i._vts=Date.now();else if(i._vts<=t.attached)return;wn(um(i,t.value),e,5,[i])};return t.value=n,t.attached=lm(),t}function um(n,e){if(qe(e)){const t=n.stopImmediatePropagation;return n.stopImmediatePropagation=()=>{t.call(n),n._stopped=!0},e.map(i=>s=>!s._stopped&&i&&i(s))}else return e}const Vc=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&n.charCodeAt(2)>96&&n.charCodeAt(2)<123,fm=(n,e,t,i,s,r)=>{const o=s==="svg";e==="class"?Zp(n,i,o):e==="style"?tm(n,t,i):ro(e)?Ml(e)||rm(n,e,t,i,r):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):hm(n,e,i,o))?(Oc(n,e,i),!n.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&Fc(n,e,i,o,r,e!=="value")):n._isVueCE&&(/[A-Z]/.test(e)||!Et(i))?Oc(n,di(e),i,r,e):(e==="true-value"?n._trueValue=i:e==="false-value"&&(n._falseValue=i),Fc(n,e,i,o))};function hm(n,e,t,i){if(i)return!!(e==="innerHTML"||e==="textContent"||e in n&&Vc(e)&&Xe(t));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="sandbox"&&n.tagName==="IFRAME"||e==="form"||e==="list"&&n.tagName==="INPUT"||e==="type"&&n.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=n.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return Vc(e)&&Et(t)?!1:e in n}const dm=Ut({patchProp:fm},Kp);let Hc;function pm(){return Hc||(Hc=Tp(dm))}const mm=((...n)=>{const e=pm().createApp(...n),{mount:t}=e;return e.mount=i=>{const s=gm(i);if(!s)return;const r=e._component;!Xe(r)&&!r.render&&!r.template&&(r.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const o=t(s,!1,_m(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),o},e});function _m(n){if(n instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&n instanceof MathMLElement)return"mathml"}function gm(n){return Et(n)?document.querySelector(n):n}const Xl="182",cs={ROTATE:0,DOLLY:1,PAN:2},ns={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},xm=0,Gc=1,vm=2,Gr=1,Sm=2,Us=3,mi=0,qt=1,Sn=2,kn=0,us=1,kc=2,Wc=3,Xc=4,Mm=5,Ri=100,Em=101,bm=102,ym=103,Tm=104,Am=200,wm=201,Rm=202,Cm=203,Aa=204,wa=205,Pm=206,Dm=207,Lm=208,Im=209,Um=210,Nm=211,Fm=212,Om=213,Bm=214,Ra=0,Ca=1,Pa=2,ps=3,Da=4,La=5,Ia=6,Ua=7,Jf=0,zm=1,Vm=2,Tn=0,Qf=1,eh=2,th=3,nh=4,ih=5,sh=6,rh=7,oh=300,Ii=301,ms=302,Na=303,Fa=304,po=306,Oa=1e3,Hn=1001,Ba=1002,At=1003,Hm=1004,_r=1005,Dt=1006,Lo=1007,Pi=1008,Jt=1009,ah=1010,lh=1011,er=1012,ql=1013,Rn=1014,En=1015,Kn=1016,Yl=1017,jl=1018,tr=1020,ch=35902,uh=35899,fh=1021,hh=1022,cn=1023,$n=1026,Di=1027,dh=1028,Kl=1029,_s=1030,$l=1031,Zl=1033,kr=33776,Wr=33777,Xr=33778,qr=33779,za=35840,Va=35841,Ha=35842,Ga=35843,ka=36196,Wa=37492,Xa=37496,qa=37488,Ya=37489,ja=37490,Ka=37491,$a=37808,Za=37809,Ja=37810,Qa=37811,el=37812,tl=37813,nl=37814,il=37815,sl=37816,rl=37817,ol=37818,al=37819,ll=37820,cl=37821,ul=36492,fl=36494,hl=36495,dl=36283,pl=36284,ml=36285,_l=36286,Gm=3200,ph=0,km=1,ui="",nn="srgb",gs="srgb-linear",to="linear",rt="srgb",Vi=7680,qc=519,Wm=512,Xm=513,qm=514,Jl=515,Ym=516,jm=517,Ql=518,Km=519,Yc=35044,jc="300 es",bn=2e3,no=2001;function mh(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function io(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function $m(){const n=io("canvas");return n.style.display="block",n}const Kc={};function $c(...n){const e="THREE."+n.shift();console.log(e,...n)}function Be(...n){const e="THREE."+n.shift();console.warn(e,...n)}function Qe(...n){const e="THREE."+n.shift();console.error(e,...n)}function nr(...n){const e=n.join(" ");e in Kc||(Kc[e]=!0,Be(...n))}function Zm(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}class Oi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const s=i[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const wt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Yr=Math.PI/180,gl=180/Math.PI;function or(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(wt[n&255]+wt[n>>8&255]+wt[n>>16&255]+wt[n>>24&255]+"-"+wt[e&255]+wt[e>>8&255]+"-"+wt[e>>16&15|64]+wt[e>>24&255]+"-"+wt[t&63|128]+wt[t>>8&255]+"-"+wt[t>>16&255]+wt[t>>24&255]+wt[i&255]+wt[i>>8&255]+wt[i>>16&255]+wt[i>>24&255]).toLowerCase()}function Ke(n,e,t){return Math.max(e,Math.min(t,n))}function Jm(n,e){return(n%e+e)%e}function Io(n,e,t){return(1-t)*n+t*e}function Ts(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function kt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}const Qm={DEG2RAD:Yr};class ke{constructor(e=0,t=0){ke.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ke(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Ke(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ui{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let l=i[s+0],c=i[s+1],u=i[s+2],f=i[s+3],h=r[o+0],m=r[o+1],g=r[o+2],M=r[o+3];if(a<=0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=f;return}if(a>=1){e[t+0]=h,e[t+1]=m,e[t+2]=g,e[t+3]=M;return}if(f!==M||l!==h||c!==m||u!==g){let _=l*h+c*m+u*g+f*M;_<0&&(h=-h,m=-m,g=-g,M=-M,_=-_);let d=1-a;if(_<.9995){const T=Math.acos(_),A=Math.sin(T);d=Math.sin(d*T)/A,a=Math.sin(a*T)/A,l=l*d+h*a,c=c*d+m*a,u=u*d+g*a,f=f*d+M*a}else{l=l*d+h*a,c=c*d+m*a,u=u*d+g*a,f=f*d+M*a;const T=1/Math.sqrt(l*l+c*c+u*u+f*f);l*=T,c*=T,u*=T,f*=T}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=f}static multiplyQuaternionsFlat(e,t,i,s,r,o){const a=i[s],l=i[s+1],c=i[s+2],u=i[s+3],f=r[o],h=r[o+1],m=r[o+2],g=r[o+3];return e[t]=a*g+u*f+l*m-c*h,e[t+1]=l*g+u*h+c*f-a*m,e[t+2]=c*g+u*m+a*h-l*f,e[t+3]=u*g-a*f-l*h-c*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),u=a(s/2),f=a(r/2),h=l(i/2),m=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=h*u*f+c*m*g,this._y=c*m*f-h*u*g,this._z=c*u*g+h*m*f,this._w=c*u*f-h*m*g;break;case"YXZ":this._x=h*u*f+c*m*g,this._y=c*m*f-h*u*g,this._z=c*u*g-h*m*f,this._w=c*u*f+h*m*g;break;case"ZXY":this._x=h*u*f-c*m*g,this._y=c*m*f+h*u*g,this._z=c*u*g+h*m*f,this._w=c*u*f-h*m*g;break;case"ZYX":this._x=h*u*f-c*m*g,this._y=c*m*f+h*u*g,this._z=c*u*g-h*m*f,this._w=c*u*f+h*m*g;break;case"YZX":this._x=h*u*f+c*m*g,this._y=c*m*f+h*u*g,this._z=c*u*g-h*m*f,this._w=c*u*f-h*m*g;break;case"XZY":this._x=h*u*f-c*m*g,this._y=c*m*f-h*u*g,this._z=c*u*g+h*m*f,this._w=c*u*f+h*m*g;break;default:Be("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],f=t[10],h=i+a+f;if(h>0){const m=.5/Math.sqrt(h+1);this._w=.25/m,this._x=(u-l)*m,this._y=(r-c)*m,this._z=(o-s)*m}else if(i>a&&i>f){const m=2*Math.sqrt(1+i-a-f);this._w=(u-l)/m,this._x=.25*m,this._y=(s+o)/m,this._z=(r+c)/m}else if(a>f){const m=2*Math.sqrt(1+a-i-f);this._w=(r-c)/m,this._x=(s+o)/m,this._y=.25*m,this._z=(l+u)/m}else{const m=2*Math.sqrt(1+f-i-a);this._w=(o-s)/m,this._x=(r+c)/m,this._y=(l+u)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ke(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=i*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-i*c,this._z=r*u+o*c+i*l-s*a,this._w=o*u-i*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let i=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(i=-i,s=-s,r=-r,o=-o,a=-a);let l=1-t;if(a<.9995){const c=Math.acos(a),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class H{constructor(e=0,t=0,i=0){H.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Zc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Zc.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*i),u=2*(a*t-r*s),f=2*(r*i-o*t);return this.x=t+l*c+o*f-a*u,this.y=i+l*u+a*c-r*f,this.z=s+l*f+r*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this.z=Ke(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this.z=Ke(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ke(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-i*l,this.z=i*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Uo.copy(this).projectOnVector(e),this.sub(Uo)}reflect(e){return this.sub(Uo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Ke(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Uo=new H,Zc=new Ui;class We{constructor(e,t,i,s,r,o,a,l,c){We.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c)}set(e,t,i,s,r,o,a,l,c){const u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=l,u[6]=i,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],u=i[4],f=i[7],h=i[2],m=i[5],g=i[8],M=s[0],_=s[3],d=s[6],T=s[1],A=s[4],b=s[7],R=s[2],C=s[5],L=s[8];return r[0]=o*M+a*T+l*R,r[3]=o*_+a*A+l*C,r[6]=o*d+a*b+l*L,r[1]=c*M+u*T+f*R,r[4]=c*_+u*A+f*C,r[7]=c*d+u*b+f*L,r[2]=h*M+m*T+g*R,r[5]=h*_+m*A+g*C,r[8]=h*d+m*b+g*L,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-i*r*u+i*a*l+s*r*c-s*o*l}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],f=u*o-a*c,h=a*l-u*r,m=c*r-o*l,g=t*f+i*h+s*m;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const M=1/g;return e[0]=f*M,e[1]=(s*c-u*i)*M,e[2]=(a*i-s*o)*M,e[3]=h*M,e[4]=(u*t-s*l)*M,e[5]=(s*r-a*t)*M,e[6]=m*M,e[7]=(i*l-c*t)*M,e[8]=(o*t-i*r)*M,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(No.makeScale(e,t)),this}rotate(e){return this.premultiply(No.makeRotation(-e)),this}translate(e,t){return this.premultiply(No.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const No=new We,Jc=new We().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Qc=new We().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function e_(){const n={enabled:!0,workingColorSpace:gs,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===rt&&(s.r=Wn(s.r),s.g=Wn(s.g),s.b=Wn(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===rt&&(s.r=fs(s.r),s.g=fs(s.g),s.b=fs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===ui?to:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return nr("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return nr("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[gs]:{primaries:e,whitePoint:i,transfer:to,toXYZ:Jc,fromXYZ:Qc,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:nn},outputColorSpaceConfig:{drawingBufferColorSpace:nn}},[nn]:{primaries:e,whitePoint:i,transfer:rt,toXYZ:Jc,fromXYZ:Qc,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:nn}}}),n}const Ze=e_();function Wn(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function fs(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let Hi;class t_{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Hi===void 0&&(Hi=io("canvas")),Hi.width=e.width,Hi.height=e.height;const s=Hi.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=Hi}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=io("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Wn(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Wn(t[i]/255)*255):t[i]=Wn(t[i]);return{data:t,width:e.width,height:e.height}}else return Be("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let n_=0;class ec{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:n_++}),this.uuid=or(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Fo(s[o].image)):r.push(Fo(s[o]))}else r=Fo(s);i.url=r}return t||(e.images[this.uuid]=i),i}}function Fo(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?t_.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Be("Texture: Unable to serialize Texture."),{})}let i_=0;const Oo=new H;class Vt extends Oi{constructor(e=Vt.DEFAULT_IMAGE,t=Vt.DEFAULT_MAPPING,i=Hn,s=Hn,r=Dt,o=Pi,a=cn,l=Jt,c=Vt.DEFAULT_ANISOTROPY,u=ui){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:i_++}),this.uuid=or(),this.name="",this.source=new ec(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new ke(0,0),this.repeat=new ke(1,1),this.center=new ke(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new We,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Oo).x}get height(){return this.source.getSize(Oo).y}get depth(){return this.source.getSize(Oo).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){Be(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Be(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==oh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Oa:e.x=e.x-Math.floor(e.x);break;case Hn:e.x=e.x<0?0:1;break;case Ba:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Oa:e.y=e.y-Math.floor(e.y);break;case Hn:e.y=e.y<0?0:1;break;case Ba:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Vt.DEFAULT_IMAGE=null;Vt.DEFAULT_MAPPING=oh;Vt.DEFAULT_ANISOTROPY=1;class xt{constructor(e=0,t=0,i=0,s=1){xt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r;const l=e.elements,c=l[0],u=l[4],f=l[8],h=l[1],m=l[5],g=l[9],M=l[2],_=l[6],d=l[10];if(Math.abs(u-h)<.01&&Math.abs(f-M)<.01&&Math.abs(g-_)<.01){if(Math.abs(u+h)<.1&&Math.abs(f+M)<.1&&Math.abs(g+_)<.1&&Math.abs(c+m+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const A=(c+1)/2,b=(m+1)/2,R=(d+1)/2,C=(u+h)/4,L=(f+M)/4,F=(g+_)/4;return A>b&&A>R?A<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(A),s=C/i,r=L/i):b>R?b<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(b),i=C/s,r=F/s):R<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(R),i=L/r,s=F/r),this.set(i,s,r,t),this}let T=Math.sqrt((_-g)*(_-g)+(f-M)*(f-M)+(h-u)*(h-u));return Math.abs(T)<.001&&(T=1),this.x=(_-g)/T,this.y=(f-M)/T,this.z=(h-u)/T,this.w=Math.acos((c+m+d-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this.z=Ke(this.z,e.z,t.z),this.w=Ke(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this.z=Ke(this.z,e,t),this.w=Ke(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ke(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class s_ extends Oi{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Dt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new xt(0,0,e,t),this.scissorTest=!1,this.viewport=new xt(0,0,e,t);const s={width:e,height:t,depth:i.depth},r=new Vt(s);this.textures=[];const o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){const t={minFilter:Dt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new ec(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class An extends s_{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class _h extends Vt{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=At,this.minFilter=At,this.wrapR=Hn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class r_ extends Vt{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=At,this.minFilter=At,this.wrapR=Hn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class ar{constructor(e=new H(1/0,1/0,1/0),t=new H(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(rn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(rn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=rn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,rn):rn.fromBufferAttribute(r,o),rn.applyMatrix4(e.matrixWorld),this.expandByPoint(rn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),gr.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),gr.copy(i.boundingBox)),gr.applyMatrix4(e.matrixWorld),this.union(gr)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,rn),rn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(As),xr.subVectors(this.max,As),Gi.subVectors(e.a,As),ki.subVectors(e.b,As),Wi.subVectors(e.c,As),Qn.subVectors(ki,Gi),ei.subVectors(Wi,ki),Mi.subVectors(Gi,Wi);let t=[0,-Qn.z,Qn.y,0,-ei.z,ei.y,0,-Mi.z,Mi.y,Qn.z,0,-Qn.x,ei.z,0,-ei.x,Mi.z,0,-Mi.x,-Qn.y,Qn.x,0,-ei.y,ei.x,0,-Mi.y,Mi.x,0];return!Bo(t,Gi,ki,Wi,xr)||(t=[1,0,0,0,1,0,0,0,1],!Bo(t,Gi,ki,Wi,xr))?!1:(vr.crossVectors(Qn,ei),t=[vr.x,vr.y,vr.z],Bo(t,Gi,ki,Wi,xr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,rn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(rn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Un[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Un[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Un[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Un[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Un[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Un[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Un[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Un[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Un),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Un=[new H,new H,new H,new H,new H,new H,new H,new H],rn=new H,gr=new ar,Gi=new H,ki=new H,Wi=new H,Qn=new H,ei=new H,Mi=new H,As=new H,xr=new H,vr=new H,Ei=new H;function Bo(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){Ei.fromArray(n,r);const a=s.x*Math.abs(Ei.x)+s.y*Math.abs(Ei.y)+s.z*Math.abs(Ei.z),l=e.dot(Ei),c=t.dot(Ei),u=i.dot(Ei);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}const o_=new ar,ws=new H,zo=new H;class tc{constructor(e=new H,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):o_.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ws.subVectors(e,this.center);const t=ws.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(ws,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(zo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ws.copy(e.center).add(zo)),this.expandByPoint(ws.copy(e.center).sub(zo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const Nn=new H,Vo=new H,Sr=new H,ti=new H,Ho=new H,Mr=new H,Go=new H;class gh{constructor(e=new H,t=new H(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Nn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Nn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Nn.copy(this.origin).addScaledVector(this.direction,t),Nn.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Vo.copy(e).add(t).multiplyScalar(.5),Sr.copy(t).sub(e).normalize(),ti.copy(this.origin).sub(Vo);const r=e.distanceTo(t)*.5,o=-this.direction.dot(Sr),a=ti.dot(this.direction),l=-ti.dot(Sr),c=ti.lengthSq(),u=Math.abs(1-o*o);let f,h,m,g;if(u>0)if(f=o*l-a,h=o*a-l,g=r*u,f>=0)if(h>=-g)if(h<=g){const M=1/u;f*=M,h*=M,m=f*(f+o*h+2*a)+h*(o*f+h+2*l)+c}else h=r,f=Math.max(0,-(o*h+a)),m=-f*f+h*(h+2*l)+c;else h=-r,f=Math.max(0,-(o*h+a)),m=-f*f+h*(h+2*l)+c;else h<=-g?(f=Math.max(0,-(-o*r+a)),h=f>0?-r:Math.min(Math.max(-r,-l),r),m=-f*f+h*(h+2*l)+c):h<=g?(f=0,h=Math.min(Math.max(-r,-l),r),m=h*(h+2*l)+c):(f=Math.max(0,-(o*r+a)),h=f>0?r:Math.min(Math.max(-r,-l),r),m=-f*f+h*(h+2*l)+c);else h=o>0?-r:r,f=Math.max(0,-(o*h+a)),m=-f*f+h*(h+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(Vo).addScaledVector(Sr,h),m}intersectSphere(e,t){Nn.subVectors(e.center,this.origin);const i=Nn.dot(this.direction),s=Nn.dot(Nn)-i*i,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,l;const c=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,h=this.origin;return c>=0?(i=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(i=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),u>=0?(r=(e.min.y-h.y)*u,o=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,o=(e.min.y-h.y)*u),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),f>=0?(a=(e.min.z-h.z)*f,l=(e.max.z-h.z)*f):(a=(e.max.z-h.z)*f,l=(e.min.z-h.z)*f),i>l||a>s)||((a>i||i!==i)&&(i=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,Nn)!==null}intersectTriangle(e,t,i,s,r){Ho.subVectors(t,e),Mr.subVectors(i,e),Go.crossVectors(Ho,Mr);let o=this.direction.dot(Go),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;ti.subVectors(this.origin,e);const l=a*this.direction.dot(Mr.crossVectors(ti,Mr));if(l<0)return null;const c=a*this.direction.dot(Ho.cross(ti));if(c<0||l+c>o)return null;const u=-a*ti.dot(Go);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class vt{constructor(e,t,i,s,r,o,a,l,c,u,f,h,m,g,M,_){vt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c,u,f,h,m,g,M,_)}set(e,t,i,s,r,o,a,l,c,u,f,h,m,g,M,_){const d=this.elements;return d[0]=e,d[4]=t,d[8]=i,d[12]=s,d[1]=r,d[5]=o,d[9]=a,d[13]=l,d[2]=c,d[6]=u,d[10]=f,d[14]=h,d[3]=m,d[7]=g,d[11]=M,d[15]=_,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new vt().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinant()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();const t=this.elements,i=e.elements,s=1/Xi.setFromMatrixColumn(e,0).length(),r=1/Xi.setFromMatrixColumn(e,1).length(),o=1/Xi.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),f=Math.sin(r);if(e.order==="XYZ"){const h=o*u,m=o*f,g=a*u,M=a*f;t[0]=l*u,t[4]=-l*f,t[8]=c,t[1]=m+g*c,t[5]=h-M*c,t[9]=-a*l,t[2]=M-h*c,t[6]=g+m*c,t[10]=o*l}else if(e.order==="YXZ"){const h=l*u,m=l*f,g=c*u,M=c*f;t[0]=h+M*a,t[4]=g*a-m,t[8]=o*c,t[1]=o*f,t[5]=o*u,t[9]=-a,t[2]=m*a-g,t[6]=M+h*a,t[10]=o*l}else if(e.order==="ZXY"){const h=l*u,m=l*f,g=c*u,M=c*f;t[0]=h-M*a,t[4]=-o*f,t[8]=g+m*a,t[1]=m+g*a,t[5]=o*u,t[9]=M-h*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const h=o*u,m=o*f,g=a*u,M=a*f;t[0]=l*u,t[4]=g*c-m,t[8]=h*c+M,t[1]=l*f,t[5]=M*c+h,t[9]=m*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const h=o*l,m=o*c,g=a*l,M=a*c;t[0]=l*u,t[4]=M-h*f,t[8]=g*f+m,t[1]=f,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=m*f+g,t[10]=h-M*f}else if(e.order==="XZY"){const h=o*l,m=o*c,g=a*l,M=a*c;t[0]=l*u,t[4]=-f,t[8]=c*u,t[1]=h*f+M,t[5]=o*u,t[9]=m*f-g,t[2]=g*f-m,t[6]=a*u,t[10]=M*f+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(a_,e,l_)}lookAt(e,t,i){const s=this.elements;return Kt.subVectors(e,t),Kt.lengthSq()===0&&(Kt.z=1),Kt.normalize(),ni.crossVectors(i,Kt),ni.lengthSq()===0&&(Math.abs(i.z)===1?Kt.x+=1e-4:Kt.z+=1e-4,Kt.normalize(),ni.crossVectors(i,Kt)),ni.normalize(),Er.crossVectors(Kt,ni),s[0]=ni.x,s[4]=Er.x,s[8]=Kt.x,s[1]=ni.y,s[5]=Er.y,s[9]=Kt.y,s[2]=ni.z,s[6]=Er.z,s[10]=Kt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],u=i[1],f=i[5],h=i[9],m=i[13],g=i[2],M=i[6],_=i[10],d=i[14],T=i[3],A=i[7],b=i[11],R=i[15],C=s[0],L=s[4],F=s[8],x=s[12],E=s[1],I=s[5],j=s[9],B=s[13],Z=s[2],ne=s[6],X=s[10],k=s[14],$=s[3],_e=s[7],de=s[11],ge=s[15];return r[0]=o*C+a*E+l*Z+c*$,r[4]=o*L+a*I+l*ne+c*_e,r[8]=o*F+a*j+l*X+c*de,r[12]=o*x+a*B+l*k+c*ge,r[1]=u*C+f*E+h*Z+m*$,r[5]=u*L+f*I+h*ne+m*_e,r[9]=u*F+f*j+h*X+m*de,r[13]=u*x+f*B+h*k+m*ge,r[2]=g*C+M*E+_*Z+d*$,r[6]=g*L+M*I+_*ne+d*_e,r[10]=g*F+M*j+_*X+d*de,r[14]=g*x+M*B+_*k+d*ge,r[3]=T*C+A*E+b*Z+R*$,r[7]=T*L+A*I+b*ne+R*_e,r[11]=T*F+A*j+b*X+R*de,r[15]=T*x+A*B+b*k+R*ge,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],f=e[6],h=e[10],m=e[14],g=e[3],M=e[7],_=e[11],d=e[15],T=l*m-c*h,A=a*m-c*f,b=a*h-l*f,R=o*m-c*u,C=o*h-l*u,L=o*f-a*u;return t*(M*T-_*A+d*b)-i*(g*T-_*R+d*C)+s*(g*A-M*R+d*L)-r*(g*b-M*C+_*L)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],f=e[9],h=e[10],m=e[11],g=e[12],M=e[13],_=e[14],d=e[15],T=f*_*c-M*h*c+M*l*m-a*_*m-f*l*d+a*h*d,A=g*h*c-u*_*c-g*l*m+o*_*m+u*l*d-o*h*d,b=u*M*c-g*f*c+g*a*m-o*M*m-u*a*d+o*f*d,R=g*f*l-u*M*l-g*a*h+o*M*h+u*a*_-o*f*_,C=t*T+i*A+s*b+r*R;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const L=1/C;return e[0]=T*L,e[1]=(M*h*r-f*_*r-M*s*m+i*_*m+f*s*d-i*h*d)*L,e[2]=(a*_*r-M*l*r+M*s*c-i*_*c-a*s*d+i*l*d)*L,e[3]=(f*l*r-a*h*r-f*s*c+i*h*c+a*s*m-i*l*m)*L,e[4]=A*L,e[5]=(u*_*r-g*h*r+g*s*m-t*_*m-u*s*d+t*h*d)*L,e[6]=(g*l*r-o*_*r-g*s*c+t*_*c+o*s*d-t*l*d)*L,e[7]=(o*h*r-u*l*r+u*s*c-t*h*c-o*s*m+t*l*m)*L,e[8]=b*L,e[9]=(g*f*r-u*M*r-g*i*m+t*M*m+u*i*d-t*f*d)*L,e[10]=(o*M*r-g*a*r+g*i*c-t*M*c-o*i*d+t*a*d)*L,e[11]=(u*a*r-o*f*r-u*i*c+t*f*c+o*i*m-t*a*m)*L,e[12]=R*L,e[13]=(u*M*s-g*f*s+g*i*h-t*M*h-u*i*_+t*f*_)*L,e[14]=(g*a*s-o*M*s-g*i*l+t*M*l+o*i*_-t*a*_)*L,e[15]=(o*f*s-u*a*s+u*i*l-t*f*l-o*i*h+t*a*h)*L,this}scale(e){const t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,l=e.z,c=r*o,u=r*a;return this.set(c*o+i,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+i,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){const s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,u=o+o,f=a+a,h=r*c,m=r*u,g=r*f,M=o*u,_=o*f,d=a*f,T=l*c,A=l*u,b=l*f,R=i.x,C=i.y,L=i.z;return s[0]=(1-(M+d))*R,s[1]=(m+b)*R,s[2]=(g-A)*R,s[3]=0,s[4]=(m-b)*C,s[5]=(1-(h+d))*C,s[6]=(_+T)*C,s[7]=0,s[8]=(g+A)*L,s[9]=(_-T)*L,s[10]=(1-(h+M))*L,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){const s=this.elements;if(e.x=s[12],e.y=s[13],e.z=s[14],this.determinant()===0)return i.set(1,1,1),t.identity(),this;let r=Xi.set(s[0],s[1],s[2]).length();const o=Xi.set(s[4],s[5],s[6]).length(),a=Xi.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),on.copy(this);const c=1/r,u=1/o,f=1/a;return on.elements[0]*=c,on.elements[1]*=c,on.elements[2]*=c,on.elements[4]*=u,on.elements[5]*=u,on.elements[6]*=u,on.elements[8]*=f,on.elements[9]*=f,on.elements[10]*=f,t.setFromRotationMatrix(on),i.x=r,i.y=o,i.z=a,this}makePerspective(e,t,i,s,r,o,a=bn,l=!1){const c=this.elements,u=2*r/(t-e),f=2*r/(i-s),h=(t+e)/(t-e),m=(i+s)/(i-s);let g,M;if(l)g=r/(o-r),M=o*r/(o-r);else if(a===bn)g=-(o+r)/(o-r),M=-2*o*r/(o-r);else if(a===no)g=-o/(o-r),M=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=f,c[9]=m,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=M,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,s,r,o,a=bn,l=!1){const c=this.elements,u=2/(t-e),f=2/(i-s),h=-(t+e)/(t-e),m=-(i+s)/(i-s);let g,M;if(l)g=1/(o-r),M=o/(o-r);else if(a===bn)g=-2/(o-r),M=-(o+r)/(o-r);else if(a===no)g=-1/(o-r),M=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=f,c[9]=0,c[13]=m,c[2]=0,c[6]=0,c[10]=g,c[14]=M,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const Xi=new H,on=new vt,a_=new H(0,0,0),l_=new H(1,1,1),ni=new H,Er=new H,Kt=new H,eu=new vt,tu=new Ui;class Cn{constructor(e=0,t=0,i=0,s=Cn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],f=s[2],h=s[6],m=s[10];switch(t){case"XYZ":this._y=Math.asin(Ke(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,m),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ke(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,m),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ke(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,m),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ke(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,m),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Ke(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(a,m));break;case"XZY":this._z=Math.asin(-Ke(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,m),this._y=0);break;default:Be("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return eu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(eu,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return tu.setFromEuler(this),this.setFromQuaternion(tu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Cn.DEFAULT_ORDER="XYZ";class xh{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let c_=0;const nu=new H,qi=new Ui,Fn=new vt,br=new H,Rs=new H,u_=new H,f_=new Ui,iu=new H(1,0,0),su=new H(0,1,0),ru=new H(0,0,1),ou={type:"added"},h_={type:"removed"},Yi={type:"childadded",child:null},ko={type:"childremoved",child:null};class It extends Oi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:c_++}),this.uuid=or(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=It.DEFAULT_UP.clone();const e=new H,t=new Cn,i=new Ui,s=new H(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new vt},normalMatrix:{value:new We}}),this.matrix=new vt,this.matrixWorld=new vt,this.matrixAutoUpdate=It.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=It.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new xh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return qi.setFromAxisAngle(e,t),this.quaternion.multiply(qi),this}rotateOnWorldAxis(e,t){return qi.setFromAxisAngle(e,t),this.quaternion.premultiply(qi),this}rotateX(e){return this.rotateOnAxis(iu,e)}rotateY(e){return this.rotateOnAxis(su,e)}rotateZ(e){return this.rotateOnAxis(ru,e)}translateOnAxis(e,t){return nu.copy(e).applyQuaternion(this.quaternion),this.position.add(nu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(iu,e)}translateY(e){return this.translateOnAxis(su,e)}translateZ(e){return this.translateOnAxis(ru,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Fn.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?br.copy(e):br.set(e,t,i);const s=this.parent;this.updateWorldMatrix(!0,!1),Rs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Fn.lookAt(Rs,br,this.up):Fn.lookAt(br,Rs,this.up),this.quaternion.setFromRotationMatrix(Fn),s&&(Fn.extractRotation(s.matrixWorld),qi.setFromRotationMatrix(Fn),this.quaternion.premultiply(qi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Qe("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(ou),Yi.child=e,this.dispatchEvent(Yi),Yi.child=null):Qe("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(h_),ko.child=e,this.dispatchEvent(ko),ko.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Fn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Fn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Fn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(ou),Yi.child=e,this.dispatchEvent(Yi),Yi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Rs,e,u_),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Rs,f_,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const f=l[c];r(e.shapes,f)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),f=o(e.shapes),h=o(e.skeletons),m=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),f.length>0&&(i.shapes=f),h.length>0&&(i.skeletons=h),m.length>0&&(i.animations=m),g.length>0&&(i.nodes=g)}return i.object=s,i;function o(a){const l=[];for(const c in a){const u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}}It.DEFAULT_UP=new H(0,1,0);It.DEFAULT_MATRIX_AUTO_UPDATE=!0;It.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const an=new H,On=new H,Wo=new H,Bn=new H,ji=new H,Ki=new H,au=new H,Xo=new H,qo=new H,Yo=new H,jo=new xt,Ko=new xt,$o=new xt;class ln{constructor(e=new H,t=new H,i=new H){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),an.subVectors(e,t),s.cross(an);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){an.subVectors(s,t),On.subVectors(i,t),Wo.subVectors(e,t);const o=an.dot(an),a=an.dot(On),l=an.dot(Wo),c=On.dot(On),u=On.dot(Wo),f=o*c-a*a;if(f===0)return r.set(0,0,0),null;const h=1/f,m=(c*l-a*u)*h,g=(o*u-a*l)*h;return r.set(1-m-g,g,m)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,Bn)===null?!1:Bn.x>=0&&Bn.y>=0&&Bn.x+Bn.y<=1}static getInterpolation(e,t,i,s,r,o,a,l){return this.getBarycoord(e,t,i,s,Bn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Bn.x),l.addScaledVector(o,Bn.y),l.addScaledVector(a,Bn.z),l)}static getInterpolatedAttribute(e,t,i,s,r,o){return jo.setScalar(0),Ko.setScalar(0),$o.setScalar(0),jo.fromBufferAttribute(e,t),Ko.fromBufferAttribute(e,i),$o.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(jo,r.x),o.addScaledVector(Ko,r.y),o.addScaledVector($o,r.z),o}static isFrontFacing(e,t,i,s){return an.subVectors(i,t),On.subVectors(e,t),an.cross(On).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return an.subVectors(this.c,this.b),On.subVectors(this.a,this.b),an.cross(On).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return ln.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return ln.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return ln.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return ln.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return ln.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,s=this.b,r=this.c;let o,a;ji.subVectors(s,i),Ki.subVectors(r,i),Xo.subVectors(e,i);const l=ji.dot(Xo),c=Ki.dot(Xo);if(l<=0&&c<=0)return t.copy(i);qo.subVectors(e,s);const u=ji.dot(qo),f=Ki.dot(qo);if(u>=0&&f<=u)return t.copy(s);const h=l*f-u*c;if(h<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(i).addScaledVector(ji,o);Yo.subVectors(e,r);const m=ji.dot(Yo),g=Ki.dot(Yo);if(g>=0&&m<=g)return t.copy(r);const M=m*c-l*g;if(M<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(i).addScaledVector(Ki,a);const _=u*g-m*f;if(_<=0&&f-u>=0&&m-g>=0)return au.subVectors(r,s),a=(f-u)/(f-u+(m-g)),t.copy(s).addScaledVector(au,a);const d=1/(_+M+h);return o=M*d,a=h*d,t.copy(i).addScaledVector(ji,o).addScaledVector(Ki,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const vh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ii={h:0,s:0,l:0},yr={h:0,s:0,l:0};function Zo(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class et{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=nn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ze.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=Ze.workingColorSpace){return this.r=e,this.g=t,this.b=i,Ze.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=Ze.workingColorSpace){if(e=Jm(e,1),t=Ke(t,0,1),i=Ke(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=Zo(o,r,e+1/3),this.g=Zo(o,r,e),this.b=Zo(o,r,e-1/3)}return Ze.colorSpaceToWorking(this,s),this}setStyle(e,t=nn){function i(r){r!==void 0&&parseFloat(r)<1&&Be("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Be("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);Be("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=nn){const i=vh[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Be("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Wn(e.r),this.g=Wn(e.g),this.b=Wn(e.b),this}copyLinearToSRGB(e){return this.r=fs(e.r),this.g=fs(e.g),this.b=fs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=nn){return Ze.workingToColorSpace(Rt.copy(this),e),Math.round(Ke(Rt.r*255,0,255))*65536+Math.round(Ke(Rt.g*255,0,255))*256+Math.round(Ke(Rt.b*255,0,255))}getHexString(e=nn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ze.workingColorSpace){Ze.workingToColorSpace(Rt.copy(this),t);const i=Rt.r,s=Rt.g,r=Rt.b,o=Math.max(i,s,r),a=Math.min(i,s,r);let l,c;const u=(a+o)/2;if(a===o)l=0,c=0;else{const f=o-a;switch(c=u<=.5?f/(o+a):f/(2-o-a),o){case i:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-i)/f+2;break;case r:l=(i-s)/f+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Ze.workingColorSpace){return Ze.workingToColorSpace(Rt.copy(this),t),e.r=Rt.r,e.g=Rt.g,e.b=Rt.b,e}getStyle(e=nn){Ze.workingToColorSpace(Rt.copy(this),e);const t=Rt.r,i=Rt.g,s=Rt.b;return e!==nn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(ii),this.setHSL(ii.h+e,ii.s+t,ii.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(ii),e.getHSL(yr);const i=Io(ii.h,yr.h,t),s=Io(ii.s,yr.s,t),r=Io(ii.l,yr.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Rt=new et;et.NAMES=vh;let d_=0;class lr extends Oi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:d_++}),this.uuid=or(),this.name="",this.type="Material",this.blending=us,this.side=mi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Aa,this.blendDst=wa,this.blendEquation=Ri,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new et(0,0,0),this.blendAlpha=0,this.depthFunc=ps,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=qc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Vi,this.stencilZFail=Vi,this.stencilZPass=Vi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){Be(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Be(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==us&&(i.blending=this.blending),this.side!==mi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Aa&&(i.blendSrc=this.blendSrc),this.blendDst!==wa&&(i.blendDst=this.blendDst),this.blendEquation!==Ri&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==ps&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==qc&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Vi&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Vi&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Vi&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Sh extends lr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new et(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Cn,this.combine=Jf,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const St=new H,Tr=new ke;let p_=0;class hn{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:p_++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Yc,this.updateRanges=[],this.gpuType=En,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Tr.fromBufferAttribute(this,t),Tr.applyMatrix3(e),this.setXY(t,Tr.x,Tr.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)St.fromBufferAttribute(this,t),St.applyMatrix3(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)St.fromBufferAttribute(this,t),St.applyMatrix4(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)St.fromBufferAttribute(this,t),St.applyNormalMatrix(e),this.setXYZ(t,St.x,St.y,St.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)St.fromBufferAttribute(this,t),St.transformDirection(e),this.setXYZ(t,St.x,St.y,St.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Ts(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=kt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ts(t,this.array)),t}setX(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ts(t,this.array)),t}setY(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ts(t,this.array)),t}setZ(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ts(t,this.array)),t}setW(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=kt(t,this.array),i=kt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=kt(t,this.array),i=kt(i,this.array),s=kt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=kt(t,this.array),i=kt(i,this.array),s=kt(s,this.array),r=kt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Yc&&(e.usage=this.usage),e}}class Mh extends hn{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class Eh extends hn{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class Xn extends hn{constructor(e,t,i){super(new Float32Array(e),t,i)}}let m_=0;const tn=new vt,Jo=new It,$i=new H,$t=new ar,Cs=new ar,Tt=new H;class Jn extends Oi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:m_++}),this.uuid=or(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(mh(e)?Eh:Mh)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new We().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return tn.makeRotationFromQuaternion(e),this.applyMatrix4(tn),this}rotateX(e){return tn.makeRotationX(e),this.applyMatrix4(tn),this}rotateY(e){return tn.makeRotationY(e),this.applyMatrix4(tn),this}rotateZ(e){return tn.makeRotationZ(e),this.applyMatrix4(tn),this}translate(e,t,i){return tn.makeTranslation(e,t,i),this.applyMatrix4(tn),this}scale(e,t,i){return tn.makeScale(e,t,i),this.applyMatrix4(tn),this}lookAt(e){return Jo.lookAt(e),Jo.updateMatrix(),this.applyMatrix4(Jo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter($i).negate(),this.translate($i.x,$i.y,$i.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Xn(i,3))}else{const i=Math.min(e.length,t.count);for(let s=0;s<i;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Be("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ar);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Qe("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new H(-1/0,-1/0,-1/0),new H(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){const r=t[i];$t.setFromBufferAttribute(r),this.morphTargetsRelative?(Tt.addVectors(this.boundingBox.min,$t.min),this.boundingBox.expandByPoint(Tt),Tt.addVectors(this.boundingBox.max,$t.max),this.boundingBox.expandByPoint(Tt)):(this.boundingBox.expandByPoint($t.min),this.boundingBox.expandByPoint($t.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Qe('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new tc);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Qe("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new H,1/0);return}if(e){const i=this.boundingSphere.center;if($t.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];Cs.setFromBufferAttribute(a),this.morphTargetsRelative?(Tt.addVectors($t.min,Cs.min),$t.expandByPoint(Tt),Tt.addVectors($t.max,Cs.max),$t.expandByPoint(Tt)):($t.expandByPoint(Cs.min),$t.expandByPoint(Cs.max))}$t.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)Tt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Tt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)Tt.fromBufferAttribute(a,c),l&&($i.fromBufferAttribute(e,c),Tt.add($i)),s=Math.max(s,i.distanceToSquared(Tt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Qe('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Qe("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new hn(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let F=0;F<i.count;F++)a[F]=new H,l[F]=new H;const c=new H,u=new H,f=new H,h=new ke,m=new ke,g=new ke,M=new H,_=new H;function d(F,x,E){c.fromBufferAttribute(i,F),u.fromBufferAttribute(i,x),f.fromBufferAttribute(i,E),h.fromBufferAttribute(r,F),m.fromBufferAttribute(r,x),g.fromBufferAttribute(r,E),u.sub(c),f.sub(c),m.sub(h),g.sub(h);const I=1/(m.x*g.y-g.x*m.y);isFinite(I)&&(M.copy(u).multiplyScalar(g.y).addScaledVector(f,-m.y).multiplyScalar(I),_.copy(f).multiplyScalar(m.x).addScaledVector(u,-g.x).multiplyScalar(I),a[F].add(M),a[x].add(M),a[E].add(M),l[F].add(_),l[x].add(_),l[E].add(_))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let F=0,x=T.length;F<x;++F){const E=T[F],I=E.start,j=E.count;for(let B=I,Z=I+j;B<Z;B+=3)d(e.getX(B+0),e.getX(B+1),e.getX(B+2))}const A=new H,b=new H,R=new H,C=new H;function L(F){R.fromBufferAttribute(s,F),C.copy(R);const x=a[F];A.copy(x),A.sub(R.multiplyScalar(R.dot(x))).normalize(),b.crossVectors(C,x);const I=b.dot(l[F])<0?-1:1;o.setXYZW(F,A.x,A.y,A.z,I)}for(let F=0,x=T.length;F<x;++F){const E=T[F],I=E.start,j=E.count;for(let B=I,Z=I+j;B<Z;B+=3)L(e.getX(B+0)),L(e.getX(B+1)),L(e.getX(B+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new hn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let h=0,m=i.count;h<m;h++)i.setXYZ(h,0,0,0);const s=new H,r=new H,o=new H,a=new H,l=new H,c=new H,u=new H,f=new H;if(e)for(let h=0,m=e.count;h<m;h+=3){const g=e.getX(h+0),M=e.getX(h+1),_=e.getX(h+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,M),o.fromBufferAttribute(t,_),u.subVectors(o,r),f.subVectors(s,r),u.cross(f),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,M),c.fromBufferAttribute(i,_),a.add(u),l.add(u),c.add(u),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(M,l.x,l.y,l.z),i.setXYZ(_,c.x,c.y,c.z)}else for(let h=0,m=t.count;h<m;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),u.subVectors(o,r),f.subVectors(s,r),u.cross(f),i.setXYZ(h+0,u.x,u.y,u.z),i.setXYZ(h+1,u.x,u.y,u.z),i.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Tt.fromBufferAttribute(e,t),Tt.normalize(),e.setXYZ(t,Tt.x,Tt.y,Tt.z)}toNonIndexed(){function e(a,l){const c=a.array,u=a.itemSize,f=a.normalized,h=new c.constructor(l.length*u);let m=0,g=0;for(let M=0,_=l.length;M<_;M++){a.isInterleavedBufferAttribute?m=l[M]*a.data.stride+a.offset:m=l[M]*u;for(let d=0;d<u;d++)h[g++]=c[m++]}return new hn(h,u,f)}if(this.index===null)return Be("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Jn,i=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=e(l,i);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let u=0,f=c.length;u<f;u++){const h=c[u],m=e(h,i);l.push(m)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let f=0,h=c.length;f<h;f++){const m=c[f];u.push(m.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const s=e.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(t))}const r=e.morphAttributes;for(const c in r){const u=[],f=r[c];for(let h=0,m=f.length;h<m;h++)u.push(f[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,u=o.length;c<u;c++){const f=o[c];this.addGroup(f.start,f.count,f.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const lu=new vt,bi=new gh,Ar=new tc,cu=new H,wr=new H,Rr=new H,Cr=new H,Qo=new H,Pr=new H,uu=new H,Dr=new H;class Pn extends It{constructor(e=new Jn,t=new Sh){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){Pr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=a[l],f=r[l];u!==0&&(Qo.fromBufferAttribute(f,e),o?Pr.addScaledVector(Qo,u):Pr.addScaledVector(Qo.sub(t),u))}t.add(Pr)}return t}raycast(e,t){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Ar.copy(i.boundingSphere),Ar.applyMatrix4(r),bi.copy(e.ray).recast(e.near),!(Ar.containsPoint(bi.origin)===!1&&(bi.intersectSphere(Ar,cu)===null||bi.origin.distanceToSquared(cu)>(e.far-e.near)**2))&&(lu.copy(r).invert(),bi.copy(e.ray).applyMatrix4(lu),!(i.boundingBox!==null&&bi.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,bi)))}_computeIntersections(e,t,i){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,f=r.attributes.normal,h=r.groups,m=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,M=h.length;g<M;g++){const _=h[g],d=o[_.materialIndex],T=Math.max(_.start,m.start),A=Math.min(a.count,Math.min(_.start+_.count,m.start+m.count));for(let b=T,R=A;b<R;b+=3){const C=a.getX(b),L=a.getX(b+1),F=a.getX(b+2);s=Lr(this,d,e,i,c,u,f,C,L,F),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=_.materialIndex,t.push(s))}}else{const g=Math.max(0,m.start),M=Math.min(a.count,m.start+m.count);for(let _=g,d=M;_<d;_+=3){const T=a.getX(_),A=a.getX(_+1),b=a.getX(_+2);s=Lr(this,o,e,i,c,u,f,T,A,b),s&&(s.faceIndex=Math.floor(_/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,M=h.length;g<M;g++){const _=h[g],d=o[_.materialIndex],T=Math.max(_.start,m.start),A=Math.min(l.count,Math.min(_.start+_.count,m.start+m.count));for(let b=T,R=A;b<R;b+=3){const C=b,L=b+1,F=b+2;s=Lr(this,d,e,i,c,u,f,C,L,F),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=_.materialIndex,t.push(s))}}else{const g=Math.max(0,m.start),M=Math.min(l.count,m.start+m.count);for(let _=g,d=M;_<d;_+=3){const T=_,A=_+1,b=_+2;s=Lr(this,o,e,i,c,u,f,T,A,b),s&&(s.faceIndex=Math.floor(_/3),t.push(s))}}}}function __(n,e,t,i,s,r,o,a){let l;if(e.side===qt?l=i.intersectTriangle(o,r,s,!0,a):l=i.intersectTriangle(s,r,o,e.side===mi,a),l===null)return null;Dr.copy(a),Dr.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo(Dr);return c<t.near||c>t.far?null:{distance:c,point:Dr.clone(),object:n}}function Lr(n,e,t,i,s,r,o,a,l,c){n.getVertexPosition(a,wr),n.getVertexPosition(l,Rr),n.getVertexPosition(c,Cr);const u=__(n,e,t,i,wr,Rr,Cr,uu);if(u){const f=new H;ln.getBarycoord(uu,wr,Rr,Cr,f),s&&(u.uv=ln.getInterpolatedAttribute(s,a,l,c,f,new ke)),r&&(u.uv1=ln.getInterpolatedAttribute(r,a,l,c,f,new ke)),o&&(u.normal=ln.getInterpolatedAttribute(o,a,l,c,f,new H),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));const h={a,b:l,c,normal:new H,materialIndex:0};ln.getNormal(wr,Rr,Cr,h.normal),u.face=h,u.barycoord=f}return u}class cr extends Jn{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],u=[],f=[];let h=0,m=0;g("z","y","x",-1,-1,i,t,e,o,r,0),g("z","y","x",1,-1,i,t,-e,o,r,1),g("x","z","y",1,1,e,i,t,s,o,2),g("x","z","y",1,-1,e,i,-t,s,o,3),g("x","y","z",1,-1,e,t,i,s,r,4),g("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new Xn(c,3)),this.setAttribute("normal",new Xn(u,3)),this.setAttribute("uv",new Xn(f,2));function g(M,_,d,T,A,b,R,C,L,F,x){const E=b/L,I=R/F,j=b/2,B=R/2,Z=C/2,ne=L+1,X=F+1;let k=0,$=0;const _e=new H;for(let de=0;de<X;de++){const ge=de*I-B;for(let Fe=0;Fe<ne;Fe++){const He=Fe*E-j;_e[M]=He*T,_e[_]=ge*A,_e[d]=Z,c.push(_e.x,_e.y,_e.z),_e[M]=0,_e[_]=0,_e[d]=C>0?1:-1,u.push(_e.x,_e.y,_e.z),f.push(Fe/L),f.push(1-de/F),k+=1}}for(let de=0;de<F;de++)for(let ge=0;ge<L;ge++){const Fe=h+ge+ne*de,He=h+ge+ne*(de+1),pt=h+(ge+1)+ne*(de+1),lt=h+(ge+1)+ne*de;l.push(Fe,He,lt),l.push(He,pt,lt),$+=6}a.addGroup(m,$,x),m+=$,h+=k}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new cr(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function xs(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(Be("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function Ot(n){const e={};for(let t=0;t<n.length;t++){const i=xs(n[t]);for(const s in i)e[s]=i[s]}return e}function g_(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function bh(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ze.workingColorSpace}const x_={clone:xs,merge:Ot};var v_=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,S_=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Dn extends lr{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=v_,this.fragmentShader=S_,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=xs(e.uniforms),this.uniformsGroups=g_(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class yh extends It{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new vt,this.projectionMatrix=new vt,this.projectionMatrixInverse=new vt,this.coordinateSystem=bn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const si=new H,fu=new ke,hu=new ke;class sn extends yh{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=gl*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Yr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return gl*2*Math.atan(Math.tan(Yr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){si.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(si.x,si.y).multiplyScalar(-e/si.z),si.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(si.x,si.y).multiplyScalar(-e/si.z)}getViewSize(e,t){return this.getViewBounds(e,fu,hu),t.subVectors(hu,fu)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Yr*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*i/c,s*=o.width/l,i*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Zi=-90,Ji=1;class M_ extends It{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new sn(Zi,Ji,e,t);s.layers=this.layers,this.add(s);const r=new sn(Zi,Ji,e,t);r.layers=this.layers,this.add(r);const o=new sn(Zi,Ji,e,t);o.layers=this.layers,this.add(o);const a=new sn(Zi,Ji,e,t);a.layers=this.layers,this.add(a);const l=new sn(Zi,Ji,e,t);l.layers=this.layers,this.add(l);const c=new sn(Zi,Ji,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===bn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===no)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,u]=this.children,f=e.getRenderTarget(),h=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const M=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,r),e.setRenderTarget(i,1,s),e.render(t,o),e.setRenderTarget(i,2,s),e.render(t,a),e.setRenderTarget(i,3,s),e.render(t,l),e.setRenderTarget(i,4,s),e.render(t,c),i.texture.generateMipmaps=M,e.setRenderTarget(i,5,s),e.render(t,u),e.setRenderTarget(f,h,m),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class Th extends Vt{constructor(e=[],t=Ii,i,s,r,o,a,l,c,u){super(e,t,i,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Ah extends An{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new Th(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new cr(5,5,5),r=new Dn({name:"CubemapFromEquirect",uniforms:xs(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:qt,blending:kn});r.uniforms.tEquirect.value=t;const o=new Pn(s,r),a=t.minFilter;return t.minFilter===Pi&&(t.minFilter=Dt),new M_(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}}class Ir extends It{constructor(){super(),this.isGroup=!0,this.type="Group"}}const E_={type:"move"};class ea{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ir,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ir,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new H,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new H),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ir,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new H,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new H),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const M of e.hand.values()){const _=t.getJointPose(M,i),d=this._getHandJoint(c,M);_!==null&&(d.matrix.fromArray(_.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=_.radius),d.visible=_!==null}const u=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],h=u.position.distanceTo(f.position),m=.02,g=.005;c.inputState.pinching&&h>m+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=m-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(E_)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Ir;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}class b_ extends It{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Cn,this.environmentIntensity=1,this.environmentRotation=new Cn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class y_ extends Vt{constructor(e=null,t=1,i=1,s,r,o,a,l,c=At,u=At,f,h){super(null,o,a,l,c,u,s,r,f,h),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const ta=new H,T_=new H,A_=new We;class li{constructor(e=new H(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const s=ta.subVectors(i,t).cross(T_.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(ta),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||A_.getNormalMatrix(e),s=this.coplanarPoint(ta).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const yi=new tc,w_=new ke(.5,.5),Ur=new H;class nc{constructor(e=new li,t=new li,i=new li,s=new li,r=new li,o=new li){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=bn,i=!1){const s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],u=r[4],f=r[5],h=r[6],m=r[7],g=r[8],M=r[9],_=r[10],d=r[11],T=r[12],A=r[13],b=r[14],R=r[15];if(s[0].setComponents(c-o,m-u,d-g,R-T).normalize(),s[1].setComponents(c+o,m+u,d+g,R+T).normalize(),s[2].setComponents(c+a,m+f,d+M,R+A).normalize(),s[3].setComponents(c-a,m-f,d-M,R-A).normalize(),i)s[4].setComponents(l,h,_,b).normalize(),s[5].setComponents(c-l,m-h,d-_,R-b).normalize();else if(s[4].setComponents(c-l,m-h,d-_,R-b).normalize(),t===bn)s[5].setComponents(c+l,m+h,d+_,R+b).normalize();else if(t===no)s[5].setComponents(l,h,_,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),yi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),yi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(yi)}intersectsSprite(e){yi.center.set(0,0,0);const t=w_.distanceTo(e.center);return yi.radius=.7071067811865476+t,yi.applyMatrix4(e.matrixWorld),this.intersectsSphere(yi)}intersectsSphere(e){const t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const s=t[i];if(Ur.x=s.normal.x>0?e.max.x:e.min.x,Ur.y=s.normal.y>0?e.max.y:e.min.y,Ur.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ur)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class ir extends Vt{constructor(e,t,i=Rn,s,r,o,a=At,l=At,c,u=$n,f=1){if(u!==$n&&u!==Di)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:e,height:t,depth:f};super(h,s,r,o,a,l,u,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ec(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class R_ extends ir{constructor(e,t=Rn,i=Ii,s,r,o=At,a=At,l,c=$n){const u={width:e,height:e,depth:1},f=[u,u,u,u,u,u];super(e,e,t,i,s,r,o,a,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class wh extends Vt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class ur extends Jn{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(i),l=Math.floor(s),c=a+1,u=l+1,f=e/a,h=t/l,m=[],g=[],M=[],_=[];for(let d=0;d<u;d++){const T=d*h-o;for(let A=0;A<c;A++){const b=A*f-r;g.push(b,-T,0),M.push(0,0,1),_.push(A/a),_.push(1-d/l)}}for(let d=0;d<l;d++)for(let T=0;T<a;T++){const A=T+c*d,b=T+c*(d+1),R=T+1+c*(d+1),C=T+1+c*d;m.push(A,b,C),m.push(b,R,C)}this.setIndex(m),this.setAttribute("position",new Xn(g,3)),this.setAttribute("normal",new Xn(M,3)),this.setAttribute("uv",new Xn(_,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ur(e.width,e.height,e.widthSegments,e.heightSegments)}}class C_ extends Dn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class P_ extends lr{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new et(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new et(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ph,this.normalScale=new ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Cn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class D_ extends lr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Gm,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class L_ extends lr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Rh extends It{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new et(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}const na=new vt,du=new H,pu=new H;class I_{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ke(512,512),this.mapType=Jt,this.map=null,this.mapPass=null,this.matrix=new vt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new nc,this._frameExtents=new ke(1,1),this._viewportCount=1,this._viewports=[new xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;du.setFromMatrixPosition(e.matrixWorld),t.position.copy(du),pu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(pu),t.updateMatrixWorld(),na.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(na,t.coordinateSystem,t.reversedDepth),t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(na)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class ic extends yh{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-e,o=i+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class U_ extends I_{constructor(){super(new ic(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class N_ extends Rh{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(It.DEFAULT_UP),this.updateMatrix(),this.target=new It,this.shadow=new U_}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class F_ extends Rh{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class O_ extends sn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class mu{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Ke(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(Ke(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}let B_=class extends Oi{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){Be("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function _u(n,e,t,i){const s=z_(i);switch(t){case fh:return n*e;case dh:return n*e/s.components*s.byteLength;case Kl:return n*e/s.components*s.byteLength;case _s:return n*e*2/s.components*s.byteLength;case $l:return n*e*2/s.components*s.byteLength;case hh:return n*e*3/s.components*s.byteLength;case cn:return n*e*4/s.components*s.byteLength;case Zl:return n*e*4/s.components*s.byteLength;case kr:case Wr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Xr:case qr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Va:case Ga:return Math.max(n,16)*Math.max(e,8)/4;case za:case Ha:return Math.max(n,8)*Math.max(e,8)/2;case ka:case Wa:case qa:case Ya:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Xa:case ja:case Ka:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case $a:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Za:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Ja:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Qa:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case el:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case tl:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case nl:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case il:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case sl:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case rl:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case ol:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case al:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case ll:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case cl:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case ul:case fl:case hl:return Math.ceil(n/4)*Math.ceil(e/4)*16;case dl:case pl:return Math.ceil(n/4)*Math.ceil(e/4)*8;case ml:case _l:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function z_(n){switch(n){case Jt:case ah:return{byteLength:1,components:1};case er:case lh:case Kn:return{byteLength:2,components:1};case Yl:case jl:return{byteLength:2,components:4};case Rn:case ql:case En:return{byteLength:4,components:1};case ch:case uh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Xl}}));typeof window<"u"&&(window.__THREE__?Be("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Xl);function Ch(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function V_(n){const e=new WeakMap;function t(a,l){const c=a.array,u=a.usage,f=c.byteLength,h=n.createBuffer();n.bindBuffer(l,h),n.bufferData(l,c,u),a.onUploadCallback();let m;if(c instanceof Float32Array)m=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)m=n.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?m=n.HALF_FLOAT:m=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)m=n.SHORT;else if(c instanceof Uint32Array)m=n.UNSIGNED_INT;else if(c instanceof Int32Array)m=n.INT;else if(c instanceof Int8Array)m=n.BYTE;else if(c instanceof Uint8Array)m=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)m=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:m,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:f}}function i(a,l,c){const u=l.array,f=l.updateRanges;if(n.bindBuffer(c,a),f.length===0)n.bufferSubData(c,0,u);else{f.sort((m,g)=>m.start-g.start);let h=0;for(let m=1;m<f.length;m++){const g=f[h],M=f[m];M.start<=g.start+g.count+1?g.count=Math.max(g.count,M.start+M.count-g.start):(++h,f[h]=M)}f.length=h+1;for(let m=0,g=f.length;m<g;m++){const M=f[m];n.bufferSubData(c,M.start*u.BYTES_PER_ELEMENT,u,M.start,M.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var H_=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,G_=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,k_=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,W_=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,X_=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,q_=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Y_=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,j_=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,K_=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,$_=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Z_=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,J_=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Q_=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,eg=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,tg=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,ng=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,ig=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,sg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,rg=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,og=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,ag=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,lg=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,cg=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,ug=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,fg=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,hg=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,dg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,pg=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,mg=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,_g=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,gg="gl_FragColor = linearToOutputTexel( gl_FragColor );",xg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,vg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Sg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Mg=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Eg=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,bg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,yg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Tg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Ag=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,wg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Rg=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Cg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Pg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Dg=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Lg=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Ig=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Ug=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Ng=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Fg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Og=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Bg=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,zg=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return v;
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( vec3( 1.0 ) - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Vg=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Hg=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Gg=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,kg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Wg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Xg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,qg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Yg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,jg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Kg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,$g=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Zg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Jg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Qg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,e0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,t0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,n0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,i0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,s0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,r0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,o0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,a0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,l0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,c0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,u0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,f0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,h0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,d0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,p0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,m0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,_0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,g0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,x0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,v0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,S0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,M0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,E0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 0, 5, phi ).x + bitangent * vogelDiskSample( 0, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 1, 5, phi ).x + bitangent * vogelDiskSample( 1, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 2, 5, phi ).x + bitangent * vogelDiskSample( 2, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 3, 5, phi ).x + bitangent * vogelDiskSample( 3, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 4, 5, phi ).x + bitangent * vogelDiskSample( 4, 5, phi ).y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadow = step( depth, dp );
			#else
				shadow = step( dp, depth );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,b0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,y0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,T0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,A0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,w0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,R0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,C0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,P0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,D0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,L0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,I0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,U0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,N0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,F0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,O0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,B0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,z0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const V0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,H0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,G0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,k0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,W0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,X0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,q0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Y0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,j0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,K0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,$0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Z0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,J0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Q0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ex=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,tx=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,nx=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ix=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,sx=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,rx=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ox=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,ax=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,lx=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,cx=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ux=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,fx=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hx=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,dx=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,px=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,mx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,_x=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,gx=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,xx=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,vx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ye={alphahash_fragment:H_,alphahash_pars_fragment:G_,alphamap_fragment:k_,alphamap_pars_fragment:W_,alphatest_fragment:X_,alphatest_pars_fragment:q_,aomap_fragment:Y_,aomap_pars_fragment:j_,batching_pars_vertex:K_,batching_vertex:$_,begin_vertex:Z_,beginnormal_vertex:J_,bsdfs:Q_,iridescence_fragment:eg,bumpmap_pars_fragment:tg,clipping_planes_fragment:ng,clipping_planes_pars_fragment:ig,clipping_planes_pars_vertex:sg,clipping_planes_vertex:rg,color_fragment:og,color_pars_fragment:ag,color_pars_vertex:lg,color_vertex:cg,common:ug,cube_uv_reflection_fragment:fg,defaultnormal_vertex:hg,displacementmap_pars_vertex:dg,displacementmap_vertex:pg,emissivemap_fragment:mg,emissivemap_pars_fragment:_g,colorspace_fragment:gg,colorspace_pars_fragment:xg,envmap_fragment:vg,envmap_common_pars_fragment:Sg,envmap_pars_fragment:Mg,envmap_pars_vertex:Eg,envmap_physical_pars_fragment:Ig,envmap_vertex:bg,fog_vertex:yg,fog_pars_vertex:Tg,fog_fragment:Ag,fog_pars_fragment:wg,gradientmap_pars_fragment:Rg,lightmap_pars_fragment:Cg,lights_lambert_fragment:Pg,lights_lambert_pars_fragment:Dg,lights_pars_begin:Lg,lights_toon_fragment:Ug,lights_toon_pars_fragment:Ng,lights_phong_fragment:Fg,lights_phong_pars_fragment:Og,lights_physical_fragment:Bg,lights_physical_pars_fragment:zg,lights_fragment_begin:Vg,lights_fragment_maps:Hg,lights_fragment_end:Gg,logdepthbuf_fragment:kg,logdepthbuf_pars_fragment:Wg,logdepthbuf_pars_vertex:Xg,logdepthbuf_vertex:qg,map_fragment:Yg,map_pars_fragment:jg,map_particle_fragment:Kg,map_particle_pars_fragment:$g,metalnessmap_fragment:Zg,metalnessmap_pars_fragment:Jg,morphinstance_vertex:Qg,morphcolor_vertex:e0,morphnormal_vertex:t0,morphtarget_pars_vertex:n0,morphtarget_vertex:i0,normal_fragment_begin:s0,normal_fragment_maps:r0,normal_pars_fragment:o0,normal_pars_vertex:a0,normal_vertex:l0,normalmap_pars_fragment:c0,clearcoat_normal_fragment_begin:u0,clearcoat_normal_fragment_maps:f0,clearcoat_pars_fragment:h0,iridescence_pars_fragment:d0,opaque_fragment:p0,packing:m0,premultiplied_alpha_fragment:_0,project_vertex:g0,dithering_fragment:x0,dithering_pars_fragment:v0,roughnessmap_fragment:S0,roughnessmap_pars_fragment:M0,shadowmap_pars_fragment:E0,shadowmap_pars_vertex:b0,shadowmap_vertex:y0,shadowmask_pars_fragment:T0,skinbase_vertex:A0,skinning_pars_vertex:w0,skinning_vertex:R0,skinnormal_vertex:C0,specularmap_fragment:P0,specularmap_pars_fragment:D0,tonemapping_fragment:L0,tonemapping_pars_fragment:I0,transmission_fragment:U0,transmission_pars_fragment:N0,uv_pars_fragment:F0,uv_pars_vertex:O0,uv_vertex:B0,worldpos_vertex:z0,background_vert:V0,background_frag:H0,backgroundCube_vert:G0,backgroundCube_frag:k0,cube_vert:W0,cube_frag:X0,depth_vert:q0,depth_frag:Y0,distance_vert:j0,distance_frag:K0,equirect_vert:$0,equirect_frag:Z0,linedashed_vert:J0,linedashed_frag:Q0,meshbasic_vert:ex,meshbasic_frag:tx,meshlambert_vert:nx,meshlambert_frag:ix,meshmatcap_vert:sx,meshmatcap_frag:rx,meshnormal_vert:ox,meshnormal_frag:ax,meshphong_vert:lx,meshphong_frag:cx,meshphysical_vert:ux,meshphysical_frag:fx,meshtoon_vert:hx,meshtoon_frag:dx,points_vert:px,points_frag:mx,shadow_vert:_x,shadow_frag:gx,sprite_vert:xx,sprite_frag:vx},Se={common:{diffuse:{value:new et(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new We},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new We}},envmap:{envMap:{value:null},envMapRotation:{value:new We},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new We}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new We}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new We},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new We},normalScale:{value:new ke(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new We},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new We}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new We}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new We}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new et(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new et(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0},uvTransform:{value:new We}},sprite:{diffuse:{value:new et(16777215)},opacity:{value:1},center:{value:new ke(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new We},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0}}},vn={basic:{uniforms:Ot([Se.common,Se.specularmap,Se.envmap,Se.aomap,Se.lightmap,Se.fog]),vertexShader:Ye.meshbasic_vert,fragmentShader:Ye.meshbasic_frag},lambert:{uniforms:Ot([Se.common,Se.specularmap,Se.envmap,Se.aomap,Se.lightmap,Se.emissivemap,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.fog,Se.lights,{emissive:{value:new et(0)}}]),vertexShader:Ye.meshlambert_vert,fragmentShader:Ye.meshlambert_frag},phong:{uniforms:Ot([Se.common,Se.specularmap,Se.envmap,Se.aomap,Se.lightmap,Se.emissivemap,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.fog,Se.lights,{emissive:{value:new et(0)},specular:{value:new et(1118481)},shininess:{value:30}}]),vertexShader:Ye.meshphong_vert,fragmentShader:Ye.meshphong_frag},standard:{uniforms:Ot([Se.common,Se.envmap,Se.aomap,Se.lightmap,Se.emissivemap,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.roughnessmap,Se.metalnessmap,Se.fog,Se.lights,{emissive:{value:new et(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ye.meshphysical_vert,fragmentShader:Ye.meshphysical_frag},toon:{uniforms:Ot([Se.common,Se.aomap,Se.lightmap,Se.emissivemap,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.gradientmap,Se.fog,Se.lights,{emissive:{value:new et(0)}}]),vertexShader:Ye.meshtoon_vert,fragmentShader:Ye.meshtoon_frag},matcap:{uniforms:Ot([Se.common,Se.bumpmap,Se.normalmap,Se.displacementmap,Se.fog,{matcap:{value:null}}]),vertexShader:Ye.meshmatcap_vert,fragmentShader:Ye.meshmatcap_frag},points:{uniforms:Ot([Se.points,Se.fog]),vertexShader:Ye.points_vert,fragmentShader:Ye.points_frag},dashed:{uniforms:Ot([Se.common,Se.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ye.linedashed_vert,fragmentShader:Ye.linedashed_frag},depth:{uniforms:Ot([Se.common,Se.displacementmap]),vertexShader:Ye.depth_vert,fragmentShader:Ye.depth_frag},normal:{uniforms:Ot([Se.common,Se.bumpmap,Se.normalmap,Se.displacementmap,{opacity:{value:1}}]),vertexShader:Ye.meshnormal_vert,fragmentShader:Ye.meshnormal_frag},sprite:{uniforms:Ot([Se.sprite,Se.fog]),vertexShader:Ye.sprite_vert,fragmentShader:Ye.sprite_frag},background:{uniforms:{uvTransform:{value:new We},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ye.background_vert,fragmentShader:Ye.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new We}},vertexShader:Ye.backgroundCube_vert,fragmentShader:Ye.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ye.cube_vert,fragmentShader:Ye.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ye.equirect_vert,fragmentShader:Ye.equirect_frag},distance:{uniforms:Ot([Se.common,Se.displacementmap,{referencePosition:{value:new H},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ye.distance_vert,fragmentShader:Ye.distance_frag},shadow:{uniforms:Ot([Se.lights,Se.fog,{color:{value:new et(0)},opacity:{value:1}}]),vertexShader:Ye.shadow_vert,fragmentShader:Ye.shadow_frag}};vn.physical={uniforms:Ot([vn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new We},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new We},clearcoatNormalScale:{value:new ke(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new We},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new We},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new We},sheen:{value:0},sheenColor:{value:new et(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new We},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new We},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new We},transmissionSamplerSize:{value:new ke},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new We},attenuationDistance:{value:0},attenuationColor:{value:new et(0)},specularColor:{value:new et(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new We},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new We},anisotropyVector:{value:new ke},anisotropyMap:{value:null},anisotropyMapTransform:{value:new We}}]),vertexShader:Ye.meshphysical_vert,fragmentShader:Ye.meshphysical_frag};const Nr={r:0,b:0,g:0},Ti=new Cn,Sx=new vt;function Mx(n,e,t,i,s,r,o){const a=new et(0);let l=r===!0?0:1,c,u,f=null,h=0,m=null;function g(A){let b=A.isScene===!0?A.background:null;return b&&b.isTexture&&(b=(A.backgroundBlurriness>0?t:e).get(b)),b}function M(A){let b=!1;const R=g(A);R===null?d(a,l):R&&R.isColor&&(d(R,1),b=!0);const C=n.xr.getEnvironmentBlendMode();C==="additive"?i.buffers.color.setClear(0,0,0,1,o):C==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||b)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function _(A,b){const R=g(b);R&&(R.isCubeTexture||R.mapping===po)?(u===void 0&&(u=new Pn(new cr(1,1,1),new Dn({name:"BackgroundCubeMaterial",uniforms:xs(vn.backgroundCube.uniforms),vertexShader:vn.backgroundCube.vertexShader,fragmentShader:vn.backgroundCube.fragmentShader,side:qt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(C,L,F){this.matrixWorld.copyPosition(F.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),Ti.copy(b.backgroundRotation),Ti.x*=-1,Ti.y*=-1,Ti.z*=-1,R.isCubeTexture&&R.isRenderTargetTexture===!1&&(Ti.y*=-1,Ti.z*=-1),u.material.uniforms.envMap.value=R,u.material.uniforms.flipEnvMap.value=R.isCubeTexture&&R.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Sx.makeRotationFromEuler(Ti)),u.material.toneMapped=Ze.getTransfer(R.colorSpace)!==rt,(f!==R||h!==R.version||m!==n.toneMapping)&&(u.material.needsUpdate=!0,f=R,h=R.version,m=n.toneMapping),u.layers.enableAll(),A.unshift(u,u.geometry,u.material,0,0,null)):R&&R.isTexture&&(c===void 0&&(c=new Pn(new ur(2,2),new Dn({name:"BackgroundMaterial",uniforms:xs(vn.background.uniforms),vertexShader:vn.background.vertexShader,fragmentShader:vn.background.fragmentShader,side:mi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=R,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.toneMapped=Ze.getTransfer(R.colorSpace)!==rt,R.matrixAutoUpdate===!0&&R.updateMatrix(),c.material.uniforms.uvTransform.value.copy(R.matrix),(f!==R||h!==R.version||m!==n.toneMapping)&&(c.material.needsUpdate=!0,f=R,h=R.version,m=n.toneMapping),c.layers.enableAll(),A.unshift(c,c.geometry,c.material,0,0,null))}function d(A,b){A.getRGB(Nr,bh(n)),i.buffers.color.setClear(Nr.r,Nr.g,Nr.b,b,o)}function T(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(A,b=1){a.set(A),l=b,d(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(A){l=A,d(a,l)},render:M,addToRenderList:_,dispose:T}}function Ex(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=h(null);let r=s,o=!1;function a(E,I,j,B,Z){let ne=!1;const X=f(B,j,I);r!==X&&(r=X,c(r.object)),ne=m(E,B,j,Z),ne&&g(E,B,j,Z),Z!==null&&e.update(Z,n.ELEMENT_ARRAY_BUFFER),(ne||o)&&(o=!1,b(E,I,j,B),Z!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(Z).buffer))}function l(){return n.createVertexArray()}function c(E){return n.bindVertexArray(E)}function u(E){return n.deleteVertexArray(E)}function f(E,I,j){const B=j.wireframe===!0;let Z=i[E.id];Z===void 0&&(Z={},i[E.id]=Z);let ne=Z[I.id];ne===void 0&&(ne={},Z[I.id]=ne);let X=ne[B];return X===void 0&&(X=h(l()),ne[B]=X),X}function h(E){const I=[],j=[],B=[];for(let Z=0;Z<t;Z++)I[Z]=0,j[Z]=0,B[Z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:j,attributeDivisors:B,object:E,attributes:{},index:null}}function m(E,I,j,B){const Z=r.attributes,ne=I.attributes;let X=0;const k=j.getAttributes();for(const $ in k)if(k[$].location>=0){const de=Z[$];let ge=ne[$];if(ge===void 0&&($==="instanceMatrix"&&E.instanceMatrix&&(ge=E.instanceMatrix),$==="instanceColor"&&E.instanceColor&&(ge=E.instanceColor)),de===void 0||de.attribute!==ge||ge&&de.data!==ge.data)return!0;X++}return r.attributesNum!==X||r.index!==B}function g(E,I,j,B){const Z={},ne=I.attributes;let X=0;const k=j.getAttributes();for(const $ in k)if(k[$].location>=0){let de=ne[$];de===void 0&&($==="instanceMatrix"&&E.instanceMatrix&&(de=E.instanceMatrix),$==="instanceColor"&&E.instanceColor&&(de=E.instanceColor));const ge={};ge.attribute=de,de&&de.data&&(ge.data=de.data),Z[$]=ge,X++}r.attributes=Z,r.attributesNum=X,r.index=B}function M(){const E=r.newAttributes;for(let I=0,j=E.length;I<j;I++)E[I]=0}function _(E){d(E,0)}function d(E,I){const j=r.newAttributes,B=r.enabledAttributes,Z=r.attributeDivisors;j[E]=1,B[E]===0&&(n.enableVertexAttribArray(E),B[E]=1),Z[E]!==I&&(n.vertexAttribDivisor(E,I),Z[E]=I)}function T(){const E=r.newAttributes,I=r.enabledAttributes;for(let j=0,B=I.length;j<B;j++)I[j]!==E[j]&&(n.disableVertexAttribArray(j),I[j]=0)}function A(E,I,j,B,Z,ne,X){X===!0?n.vertexAttribIPointer(E,I,j,Z,ne):n.vertexAttribPointer(E,I,j,B,Z,ne)}function b(E,I,j,B){M();const Z=B.attributes,ne=j.getAttributes(),X=I.defaultAttributeValues;for(const k in ne){const $=ne[k];if($.location>=0){let _e=Z[k];if(_e===void 0&&(k==="instanceMatrix"&&E.instanceMatrix&&(_e=E.instanceMatrix),k==="instanceColor"&&E.instanceColor&&(_e=E.instanceColor)),_e!==void 0){const de=_e.normalized,ge=_e.itemSize,Fe=e.get(_e);if(Fe===void 0)continue;const He=Fe.buffer,pt=Fe.type,lt=Fe.bytesPerElement,ee=pt===n.INT||pt===n.UNSIGNED_INT||_e.gpuType===ql;if(_e.isInterleavedBufferAttribute){const oe=_e.data,we=oe.stride,ze=_e.offset;if(oe.isInstancedInterleavedBuffer){for(let Re=0;Re<$.locationSize;Re++)d($.location+Re,oe.meshPerAttribute);E.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let Re=0;Re<$.locationSize;Re++)_($.location+Re);n.bindBuffer(n.ARRAY_BUFFER,He);for(let Re=0;Re<$.locationSize;Re++)A($.location+Re,ge/$.locationSize,pt,de,we*lt,(ze+ge/$.locationSize*Re)*lt,ee)}else{if(_e.isInstancedBufferAttribute){for(let oe=0;oe<$.locationSize;oe++)d($.location+oe,_e.meshPerAttribute);E.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=_e.meshPerAttribute*_e.count)}else for(let oe=0;oe<$.locationSize;oe++)_($.location+oe);n.bindBuffer(n.ARRAY_BUFFER,He);for(let oe=0;oe<$.locationSize;oe++)A($.location+oe,ge/$.locationSize,pt,de,ge*lt,ge/$.locationSize*oe*lt,ee)}}else if(X!==void 0){const de=X[k];if(de!==void 0)switch(de.length){case 2:n.vertexAttrib2fv($.location,de);break;case 3:n.vertexAttrib3fv($.location,de);break;case 4:n.vertexAttrib4fv($.location,de);break;default:n.vertexAttrib1fv($.location,de)}}}}T()}function R(){F();for(const E in i){const I=i[E];for(const j in I){const B=I[j];for(const Z in B)u(B[Z].object),delete B[Z];delete I[j]}delete i[E]}}function C(E){if(i[E.id]===void 0)return;const I=i[E.id];for(const j in I){const B=I[j];for(const Z in B)u(B[Z].object),delete B[Z];delete I[j]}delete i[E.id]}function L(E){for(const I in i){const j=i[I];if(j[E.id]===void 0)continue;const B=j[E.id];for(const Z in B)u(B[Z].object),delete B[Z];delete j[E.id]}}function F(){x(),o=!0,r!==s&&(r=s,c(r.object))}function x(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:F,resetDefaultState:x,dispose:R,releaseStatesOfGeometry:C,releaseStatesOfProgram:L,initAttributes:M,enableAttribute:_,disableUnusedAttributes:T}}function bx(n,e,t){let i;function s(c){i=c}function r(c,u){n.drawArrays(i,c,u),t.update(u,i,1)}function o(c,u,f){f!==0&&(n.drawArraysInstanced(i,c,u,f),t.update(u,i,f))}function a(c,u,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,u,0,f);let m=0;for(let g=0;g<f;g++)m+=u[g];t.update(m,i,1)}function l(c,u,f,h){if(f===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let g=0;g<c.length;g++)o(c[g],u[g],h[g]);else{m.multiDrawArraysInstancedWEBGL(i,c,0,u,0,h,0,f);let g=0;for(let M=0;M<f;M++)g+=u[M]*h[M];t.update(g,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function yx(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const L=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(L.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(L){return!(L!==cn&&i.convert(L)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(L){const F=L===Kn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(L!==Jt&&i.convert(L)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&L!==En&&!F)}function l(L){if(L==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";L="mediump"}return L==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(Be("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const f=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),m=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),M=n.getParameter(n.MAX_TEXTURE_SIZE),_=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),d=n.getParameter(n.MAX_VERTEX_ATTRIBS),T=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),A=n.getParameter(n.MAX_VARYING_VECTORS),b=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),R=n.getParameter(n.MAX_SAMPLES),C=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:f,reversedDepthBuffer:h,maxTextures:m,maxVertexTextures:g,maxTextureSize:M,maxCubemapSize:_,maxAttributes:d,maxVertexUniforms:T,maxVaryings:A,maxFragmentUniforms:b,maxSamples:R,samples:C}}function Tx(n){const e=this;let t=null,i=0,s=!1,r=!1;const o=new li,a=new We,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){const m=f.length!==0||h||i!==0||s;return s=h,i=f.length,m},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,h){t=u(f,h,0)},this.setState=function(f,h,m){const g=f.clippingPlanes,M=f.clipIntersection,_=f.clipShadows,d=n.get(f);if(!s||g===null||g.length===0||r&&!_)r?u(null):c();else{const T=r?0:i,A=T*4;let b=d.clippingState||null;l.value=b,b=u(g,h,A,m);for(let R=0;R!==A;++R)b[R]=t[R];d.clippingState=b,this.numIntersection=M?this.numPlanes:0,this.numPlanes+=T}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(f,h,m,g){const M=f!==null?f.length:0;let _=null;if(M!==0){if(_=l.value,g!==!0||_===null){const d=m+M*4,T=h.matrixWorldInverse;a.getNormalMatrix(T),(_===null||_.length<d)&&(_=new Float32Array(d));for(let A=0,b=m;A!==M;++A,b+=4)o.copy(f[A]).applyMatrix4(T,a),o.normal.toArray(_,b),_[b+3]=o.constant}l.value=_,l.needsUpdate=!0}return e.numPlanes=M,e.numIntersection=0,_}}function Ax(n){let e=new WeakMap;function t(o,a){return a===Na?o.mapping=Ii:a===Fa&&(o.mapping=ms),o}function i(o){if(o&&o.isTexture){const a=o.mapping;if(a===Na||a===Fa)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Ah(l.height);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}const fi=4,gu=[.125,.215,.35,.446,.526,.582],Ci=20,wx=256,Ps=new ic,xu=new et;let ia=null,sa=0,ra=0,oa=!1;const Rx=new H;class vu{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){const{size:o=256,position:a=Rx}=r;ia=this._renderer.getRenderTarget(),sa=this._renderer.getActiveCubeFace(),ra=this._renderer.getActiveMipmapLevel(),oa=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Eu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Mu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(ia,sa,ra),this._renderer.xr.enabled=oa,e.scissorTest=!1,Qi(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ii||e.mapping===ms?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ia=this._renderer.getRenderTarget(),sa=this._renderer.getActiveCubeFace(),ra=this._renderer.getActiveMipmapLevel(),oa=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Dt,minFilter:Dt,generateMipmaps:!1,type:Kn,format:cn,colorSpace:gs,depthBuffer:!1},s=Su(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Su(e,t,i);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Cx(r)),this._blurMaterial=Dx(r,e,t),this._ggxMaterial=Px(r,e,t)}return s}_compileMaterial(e){const t=new Pn(new Jn,e);this._renderer.compile(t,Ps)}_sceneToCubeUV(e,t,i,s,r){const l=new sn(90,1,t,i),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],f=this._renderer,h=f.autoClear,m=f.toneMapping;f.getClearColor(xu),f.toneMapping=Tn,f.autoClear=!1,f.state.buffers.depth.getReversed()&&(f.setRenderTarget(s),f.clearDepth(),f.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Pn(new cr,new Sh({name:"PMREM.Background",side:qt,depthWrite:!1,depthTest:!1})));const M=this._backgroundBox,_=M.material;let d=!1;const T=e.background;T?T.isColor&&(_.color.copy(T),e.background=null,d=!0):(_.color.copy(xu),d=!0);for(let A=0;A<6;A++){const b=A%3;b===0?(l.up.set(0,c[A],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[A],r.y,r.z)):b===1?(l.up.set(0,0,c[A]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[A],r.z)):(l.up.set(0,c[A],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[A]));const R=this._cubeSize;Qi(s,b*R,A>2?R:0,R,R),f.setRenderTarget(s),d&&f.render(M,l),f.render(e,l)}f.toneMapping=m,f.autoClear=h,e.background=T}_textureToCubeUV(e,t){const i=this._renderer,s=e.mapping===Ii||e.mapping===ms;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Eu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Mu());const r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;const a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;Qi(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,Ps)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){const s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;const l=o.uniforms,c=i/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),f=Math.sqrt(c*c-u*u),h=0+c*1.25,m=f*h,{_lodMax:g}=this,M=this._sizeLods[i],_=3*M*(i>g-fi?i-g+fi:0),d=4*(this._cubeSize-M);l.envMap.value=e.texture,l.roughness.value=m,l.mipInt.value=g-t,Qi(r,_,d,3*M,2*M),s.setRenderTarget(r),s.render(a,Ps),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-i,Qi(e,_,d,3*M,2*M),s.setRenderTarget(e),s.render(a,Ps)}_blur(e,t,i,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&Qe("blur direction must be either latitudinal or longitudinal!");const u=3,f=this._lodMeshes[s];f.material=c;const h=c.uniforms,m=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*m):2*Math.PI/(2*Ci-1),M=r/g,_=isFinite(r)?1+Math.floor(u*M):Ci;_>Ci&&Be(`sigmaRadians, ${r}, is too large and will clip, as it requested ${_} samples when the maximum is set to ${Ci}`);const d=[];let T=0;for(let L=0;L<Ci;++L){const F=L/M,x=Math.exp(-F*F/2);d.push(x),L===0?T+=x:L<_&&(T+=2*x)}for(let L=0;L<d.length;L++)d[L]=d[L]/T;h.envMap.value=e.texture,h.samples.value=_,h.weights.value=d,h.latitudinal.value=o==="latitudinal",a&&(h.poleAxis.value=a);const{_lodMax:A}=this;h.dTheta.value=g,h.mipInt.value=A-i;const b=this._sizeLods[s],R=3*b*(s>A-fi?s-A+fi:0),C=4*(this._cubeSize-b);Qi(t,R,C,3*b,2*b),l.setRenderTarget(t),l.render(f,Ps)}}function Cx(n){const e=[],t=[],i=[];let s=n;const r=n-fi+1+gu.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);e.push(a);let l=1/a;o>n-fi?l=gu[o-n+fi-1]:o===0&&(l=0),t.push(l);const c=1/(a-2),u=-c,f=1+c,h=[u,u,f,u,f,f,u,u,f,f,u,f],m=6,g=6,M=3,_=2,d=1,T=new Float32Array(M*g*m),A=new Float32Array(_*g*m),b=new Float32Array(d*g*m);for(let C=0;C<m;C++){const L=C%3*2/3-1,F=C>2?0:-1,x=[L,F,0,L+2/3,F,0,L+2/3,F+1,0,L,F,0,L+2/3,F+1,0,L,F+1,0];T.set(x,M*g*C),A.set(h,_*g*C);const E=[C,C,C,C,C,C];b.set(E,d*g*C)}const R=new Jn;R.setAttribute("position",new hn(T,M)),R.setAttribute("uv",new hn(A,_)),R.setAttribute("faceIndex",new hn(b,d)),i.push(new Pn(R,null)),s>fi&&s--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function Su(n,e,t){const i=new An(n,e,t);return i.texture.mapping=po,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Qi(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function Px(n,e,t){return new Dn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:wx,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:mo(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:kn,depthTest:!1,depthWrite:!1})}function Dx(n,e,t){const i=new Float32Array(Ci),s=new H(0,1,0);return new Dn({name:"SphericalGaussianBlur",defines:{n:Ci,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:mo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:kn,depthTest:!1,depthWrite:!1})}function Mu(){return new Dn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:mo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:kn,depthTest:!1,depthWrite:!1})}function Eu(){return new Dn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:mo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:kn,depthTest:!1,depthWrite:!1})}function mo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Lx(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){const l=a.mapping,c=l===Na||l===Fa,u=l===Ii||l===ms;if(c||u){let f=e.get(a);const h=f!==void 0?f.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==h)return t===null&&(t=new vu(n)),f=c?t.fromEquirectangular(a,f):t.fromCubemap(a,f),f.texture.pmremVersion=a.pmremVersion,e.set(a,f),f.texture;if(f!==void 0)return f.texture;{const m=a.image;return c&&m&&m.height>0||u&&m&&s(m)?(t===null&&(t=new vu(n)),f=c?t.fromEquirectangular(a):t.fromCubemap(a),f.texture.pmremVersion=a.pmremVersion,e.set(a,f),a.addEventListener("dispose",r),f.texture):null}}}return a}function s(a){let l=0;const c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function Ix(n){const e={};function t(i){if(e[i]!==void 0)return e[i];const s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const s=t(i);return s===null&&nr("WebGLRenderer: "+i+" extension not supported."),s}}}function Ux(n,e,t,i){const s={},r=new WeakMap;function o(f){const h=f.target;h.index!==null&&e.remove(h.index);for(const g in h.attributes)e.remove(h.attributes[g]);h.removeEventListener("dispose",o),delete s[h.id];const m=r.get(h);m&&(e.remove(m),r.delete(h)),i.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function a(f,h){return s[h.id]===!0||(h.addEventListener("dispose",o),s[h.id]=!0,t.memory.geometries++),h}function l(f){const h=f.attributes;for(const m in h)e.update(h[m],n.ARRAY_BUFFER)}function c(f){const h=[],m=f.index,g=f.attributes.position;let M=0;if(m!==null){const T=m.array;M=m.version;for(let A=0,b=T.length;A<b;A+=3){const R=T[A+0],C=T[A+1],L=T[A+2];h.push(R,C,C,L,L,R)}}else if(g!==void 0){const T=g.array;M=g.version;for(let A=0,b=T.length/3-1;A<b;A+=3){const R=A+0,C=A+1,L=A+2;h.push(R,C,C,L,L,R)}}else return;const _=new(mh(h)?Eh:Mh)(h,1);_.version=M;const d=r.get(f);d&&e.remove(d),r.set(f,_)}function u(f){const h=r.get(f);if(h){const m=f.index;m!==null&&h.version<m.version&&c(f)}else c(f);return r.get(f)}return{get:a,update:l,getWireframeAttribute:u}}function Nx(n,e,t){let i;function s(h){i=h}let r,o;function a(h){r=h.type,o=h.bytesPerElement}function l(h,m){n.drawElements(i,m,r,h*o),t.update(m,i,1)}function c(h,m,g){g!==0&&(n.drawElementsInstanced(i,m,r,h*o,g),t.update(m,i,g))}function u(h,m,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,m,0,r,h,0,g);let _=0;for(let d=0;d<g;d++)_+=m[d];t.update(_,i,1)}function f(h,m,g,M){if(g===0)return;const _=e.get("WEBGL_multi_draw");if(_===null)for(let d=0;d<h.length;d++)c(h[d]/o,m[d],M[d]);else{_.multiDrawElementsInstancedWEBGL(i,m,0,r,h,0,M,0,g);let d=0;for(let T=0;T<g;T++)d+=m[T]*M[T];t.update(d,i,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=f}function Fx(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:Qe("WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function Ox(n,e,t){const i=new WeakMap,s=new xt;function r(o,a,l){const c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,f=u!==void 0?u.length:0;let h=i.get(a);if(h===void 0||h.count!==f){let x=function(){L.dispose(),i.delete(a),a.removeEventListener("dispose",x)};h!==void 0&&h.texture.dispose();const m=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,M=a.morphAttributes.color!==void 0,_=a.morphAttributes.position||[],d=a.morphAttributes.normal||[],T=a.morphAttributes.color||[];let A=0;m===!0&&(A=1),g===!0&&(A=2),M===!0&&(A=3);let b=a.attributes.position.count*A,R=1;b>e.maxTextureSize&&(R=Math.ceil(b/e.maxTextureSize),b=e.maxTextureSize);const C=new Float32Array(b*R*4*f),L=new _h(C,b,R,f);L.type=En,L.needsUpdate=!0;const F=A*4;for(let E=0;E<f;E++){const I=_[E],j=d[E],B=T[E],Z=b*R*4*E;for(let ne=0;ne<I.count;ne++){const X=ne*F;m===!0&&(s.fromBufferAttribute(I,ne),C[Z+X+0]=s.x,C[Z+X+1]=s.y,C[Z+X+2]=s.z,C[Z+X+3]=0),g===!0&&(s.fromBufferAttribute(j,ne),C[Z+X+4]=s.x,C[Z+X+5]=s.y,C[Z+X+6]=s.z,C[Z+X+7]=0),M===!0&&(s.fromBufferAttribute(B,ne),C[Z+X+8]=s.x,C[Z+X+9]=s.y,C[Z+X+10]=s.z,C[Z+X+11]=B.itemSize===4?s.w:1)}}h={count:f,texture:L,size:new ke(b,R)},i.set(a,h),a.addEventListener("dispose",x)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let m=0;for(let M=0;M<c.length;M++)m+=c[M];const g=a.morphTargetsRelative?1:1-m;l.getUniforms().setValue(n,"morphTargetBaseInfluence",g),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",h.size)}return{update:r}}function Bx(n,e,t,i){let s=new WeakMap;function r(l){const c=i.render.frame,u=l.geometry,f=e.get(l,u);if(s.get(f)!==c&&(e.update(f),s.set(f,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const h=l.skeleton;s.get(h)!==c&&(h.update(),s.set(h,c))}return f}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}const zx={[Qf]:"LINEAR_TONE_MAPPING",[eh]:"REINHARD_TONE_MAPPING",[th]:"CINEON_TONE_MAPPING",[nh]:"ACES_FILMIC_TONE_MAPPING",[sh]:"AGX_TONE_MAPPING",[rh]:"NEUTRAL_TONE_MAPPING",[ih]:"CUSTOM_TONE_MAPPING"};function Vx(n,e,t,i,s){const r=new An(e,t,{type:n,depthBuffer:i,stencilBuffer:s}),o=new An(e,t,{type:Kn,depthBuffer:!1,stencilBuffer:!1}),a=new Jn;a.setAttribute("position",new Xn([-1,3,0,-1,-1,0,3,-1,0],3)),a.setAttribute("uv",new Xn([0,2,0,0,2,0],2));const l=new C_({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),c=new Pn(a,l),u=new ic(-1,1,1,-1,0,1);let f=null,h=null,m=!1,g,M=null,_=[],d=!1;this.setSize=function(T,A){r.setSize(T,A),o.setSize(T,A);for(let b=0;b<_.length;b++){const R=_[b];R.setSize&&R.setSize(T,A)}},this.setEffects=function(T){_=T,d=_.length>0&&_[0].isRenderPass===!0;const A=r.width,b=r.height;for(let R=0;R<_.length;R++){const C=_[R];C.setSize&&C.setSize(A,b)}},this.begin=function(T,A){if(m||T.toneMapping===Tn&&_.length===0)return!1;if(M=A,A!==null){const b=A.width,R=A.height;(r.width!==b||r.height!==R)&&this.setSize(b,R)}return d===!1&&T.setRenderTarget(r),g=T.toneMapping,T.toneMapping=Tn,!0},this.hasRenderPass=function(){return d},this.end=function(T,A){T.toneMapping=g,m=!0;let b=r,R=o;for(let C=0;C<_.length;C++){const L=_[C];if(L.enabled!==!1&&(L.render(T,R,b,A),L.needsSwap!==!1)){const F=b;b=R,R=F}}if(f!==T.outputColorSpace||h!==T.toneMapping){f=T.outputColorSpace,h=T.toneMapping,l.defines={},Ze.getTransfer(f)===rt&&(l.defines.SRGB_TRANSFER="");const C=zx[h];C&&(l.defines[C]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=b.texture,T.setRenderTarget(M),T.render(c,u),M=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){r.dispose(),o.dispose(),a.dispose(),l.dispose()}}const Ph=new Vt,xl=new ir(1,1),Dh=new _h,Lh=new r_,Ih=new Th,bu=[],yu=[],Tu=new Float32Array(16),Au=new Float32Array(9),wu=new Float32Array(4);function Ms(n,e,t){const i=n[0];if(i<=0||i>0)return n;const s=e*t;let r=bu[s];if(r===void 0&&(r=new Float32Array(s),bu[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function bt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function yt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function _o(n,e){let t=yu[e];t===void 0&&(t=new Int32Array(e),yu[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function Hx(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Gx(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;n.uniform2fv(this.addr,e),yt(t,e)}}function kx(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(bt(t,e))return;n.uniform3fv(this.addr,e),yt(t,e)}}function Wx(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;n.uniform4fv(this.addr,e),yt(t,e)}}function Xx(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(bt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),yt(t,e)}else{if(bt(t,i))return;wu.set(i),n.uniformMatrix2fv(this.addr,!1,wu),yt(t,i)}}function qx(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(bt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),yt(t,e)}else{if(bt(t,i))return;Au.set(i),n.uniformMatrix3fv(this.addr,!1,Au),yt(t,i)}}function Yx(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(bt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),yt(t,e)}else{if(bt(t,i))return;Tu.set(i),n.uniformMatrix4fv(this.addr,!1,Tu),yt(t,i)}}function jx(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Kx(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;n.uniform2iv(this.addr,e),yt(t,e)}}function $x(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(bt(t,e))return;n.uniform3iv(this.addr,e),yt(t,e)}}function Zx(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;n.uniform4iv(this.addr,e),yt(t,e)}}function Jx(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Qx(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;n.uniform2uiv(this.addr,e),yt(t,e)}}function ev(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(bt(t,e))return;n.uniform3uiv(this.addr,e),yt(t,e)}}function tv(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;n.uniform4uiv(this.addr,e),yt(t,e)}}function nv(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(xl.compareFunction=t.isReversedDepthBuffer()?Ql:Jl,r=xl):r=Ph,t.setTexture2D(e||r,s)}function iv(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||Lh,s)}function sv(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||Ih,s)}function rv(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||Dh,s)}function ov(n){switch(n){case 5126:return Hx;case 35664:return Gx;case 35665:return kx;case 35666:return Wx;case 35674:return Xx;case 35675:return qx;case 35676:return Yx;case 5124:case 35670:return jx;case 35667:case 35671:return Kx;case 35668:case 35672:return $x;case 35669:case 35673:return Zx;case 5125:return Jx;case 36294:return Qx;case 36295:return ev;case 36296:return tv;case 35678:case 36198:case 36298:case 36306:case 35682:return nv;case 35679:case 36299:case 36307:return iv;case 35680:case 36300:case 36308:case 36293:return sv;case 36289:case 36303:case 36311:case 36292:return rv}}function av(n,e){n.uniform1fv(this.addr,e)}function lv(n,e){const t=Ms(e,this.size,2);n.uniform2fv(this.addr,t)}function cv(n,e){const t=Ms(e,this.size,3);n.uniform3fv(this.addr,t)}function uv(n,e){const t=Ms(e,this.size,4);n.uniform4fv(this.addr,t)}function fv(n,e){const t=Ms(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function hv(n,e){const t=Ms(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function dv(n,e){const t=Ms(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function pv(n,e){n.uniform1iv(this.addr,e)}function mv(n,e){n.uniform2iv(this.addr,e)}function _v(n,e){n.uniform3iv(this.addr,e)}function gv(n,e){n.uniform4iv(this.addr,e)}function xv(n,e){n.uniform1uiv(this.addr,e)}function vv(n,e){n.uniform2uiv(this.addr,e)}function Sv(n,e){n.uniform3uiv(this.addr,e)}function Mv(n,e){n.uniform4uiv(this.addr,e)}function Ev(n,e,t){const i=this.cache,s=e.length,r=_o(t,s);bt(i,r)||(n.uniform1iv(this.addr,r),yt(i,r));let o;this.type===n.SAMPLER_2D_SHADOW?o=xl:o=Ph;for(let a=0;a!==s;++a)t.setTexture2D(e[a]||o,r[a])}function bv(n,e,t){const i=this.cache,s=e.length,r=_o(t,s);bt(i,r)||(n.uniform1iv(this.addr,r),yt(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Lh,r[o])}function yv(n,e,t){const i=this.cache,s=e.length,r=_o(t,s);bt(i,r)||(n.uniform1iv(this.addr,r),yt(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Ih,r[o])}function Tv(n,e,t){const i=this.cache,s=e.length,r=_o(t,s);bt(i,r)||(n.uniform1iv(this.addr,r),yt(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Dh,r[o])}function Av(n){switch(n){case 5126:return av;case 35664:return lv;case 35665:return cv;case 35666:return uv;case 35674:return fv;case 35675:return hv;case 35676:return dv;case 5124:case 35670:return pv;case 35667:case 35671:return mv;case 35668:case 35672:return _v;case 35669:case 35673:return gv;case 5125:return xv;case 36294:return vv;case 36295:return Sv;case 36296:return Mv;case 35678:case 36198:case 36298:case 36306:case 35682:return Ev;case 35679:case 36299:case 36307:return bv;case 35680:case 36300:case 36308:case 36293:return yv;case 36289:case 36303:case 36311:case 36292:return Tv}}class wv{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=ov(t.type)}}class Rv{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Av(t.type)}}class Cv{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],i)}}}const aa=/(\w+)(\])?(\[|\.)?/g;function Ru(n,e){n.seq.push(e),n.map[e.id]=e}function Pv(n,e,t){const i=n.name,s=i.length;for(aa.lastIndex=0;;){const r=aa.exec(i),o=aa.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Ru(t,c===void 0?new wv(a,n,e):new Rv(a,n,e));break}else{let f=t.map[a];f===void 0&&(f=new Cv(a),Ru(t,f)),t=f}}}class jr{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){const a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);Pv(a,l,this)}const s=[],r=[];for(const o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){const r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){const s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){const i=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&i.push(o)}return i}}function Cu(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const Dv=37297;let Lv=0;function Iv(n,e){const t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}const Pu=new We;function Uv(n){Ze._getMatrix(Pu,Ze.workingColorSpace,n);const e=`mat3( ${Pu.elements.map(t=>t.toFixed(4))} )`;switch(Ze.getTransfer(n)){case to:return[e,"LinearTransferOETF"];case rt:return[e,"sRGBTransferOETF"];default:return Be("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Du(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+Iv(n.getShaderSource(e),a)}else return r}function Nv(n,e){const t=Uv(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const Fv={[Qf]:"Linear",[eh]:"Reinhard",[th]:"Cineon",[nh]:"ACESFilmic",[sh]:"AgX",[rh]:"Neutral",[ih]:"Custom"};function Ov(n,e){const t=Fv[e];return t===void 0?(Be("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Fr=new H;function Bv(){Ze.getLuminanceCoefficients(Fr);const n=Fr.x.toFixed(4),e=Fr.y.toFixed(4),t=Fr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function zv(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ns).join(`
`)}function Vv(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function Hv(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(e,s),o=r.name;let a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function Ns(n){return n!==""}function Lu(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Iu(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Gv=/^[ \t]*#include +<([\w\d./]+)>/gm;function vl(n){return n.replace(Gv,Wv)}const kv=new Map;function Wv(n,e){let t=Ye[e];if(t===void 0){const i=kv.get(e);if(i!==void 0)t=Ye[i],Be('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return vl(t)}const Xv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Uu(n){return n.replace(Xv,qv)}function qv(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Nu(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const Yv={[Gr]:"SHADOWMAP_TYPE_PCF",[Us]:"SHADOWMAP_TYPE_VSM"};function jv(n){return Yv[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const Kv={[Ii]:"ENVMAP_TYPE_CUBE",[ms]:"ENVMAP_TYPE_CUBE",[po]:"ENVMAP_TYPE_CUBE_UV"};function $v(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":Kv[n.envMapMode]||"ENVMAP_TYPE_CUBE"}const Zv={[ms]:"ENVMAP_MODE_REFRACTION"};function Jv(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":Zv[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}const Qv={[Jf]:"ENVMAP_BLENDING_MULTIPLY",[zm]:"ENVMAP_BLENDING_MIX",[Vm]:"ENVMAP_BLENDING_ADD"};function eS(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":Qv[n.combine]||"ENVMAP_BLENDING_NONE"}function tS(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function nS(n,e,t,i){const s=n.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=jv(t),c=$v(t),u=Jv(t),f=eS(t),h=tS(t),m=zv(t),g=Vv(r),M=s.createProgram();let _,d,T=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ns).join(`
`),_.length>0&&(_+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ns).join(`
`),d.length>0&&(d+=`
`)):(_=[Nu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ns).join(`
`),d=[Nu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+f:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Tn?"#define TONE_MAPPING":"",t.toneMapping!==Tn?Ye.tonemapping_pars_fragment:"",t.toneMapping!==Tn?Ov("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ye.colorspace_pars_fragment,Nv("linearToOutputTexel",t.outputColorSpace),Bv(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ns).join(`
`)),o=vl(o),o=Lu(o,t),o=Iu(o,t),a=vl(a),a=Lu(a,t),a=Iu(a,t),o=Uu(o),a=Uu(a),t.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,_=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,d=["#define varying in",t.glslVersion===jc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===jc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const A=T+_+o,b=T+d+a,R=Cu(s,s.VERTEX_SHADER,A),C=Cu(s,s.FRAGMENT_SHADER,b);s.attachShader(M,R),s.attachShader(M,C),t.index0AttributeName!==void 0?s.bindAttribLocation(M,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(M,0,"position"),s.linkProgram(M);function L(I){if(n.debug.checkShaderErrors){const j=s.getProgramInfoLog(M)||"",B=s.getShaderInfoLog(R)||"",Z=s.getShaderInfoLog(C)||"",ne=j.trim(),X=B.trim(),k=Z.trim();let $=!0,_e=!0;if(s.getProgramParameter(M,s.LINK_STATUS)===!1)if($=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,M,R,C);else{const de=Du(s,R,"vertex"),ge=Du(s,C,"fragment");Qe("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(M,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+ne+`
`+de+`
`+ge)}else ne!==""?Be("WebGLProgram: Program Info Log:",ne):(X===""||k==="")&&(_e=!1);_e&&(I.diagnostics={runnable:$,programLog:ne,vertexShader:{log:X,prefix:_},fragmentShader:{log:k,prefix:d}})}s.deleteShader(R),s.deleteShader(C),F=new jr(s,M),x=Hv(s,M)}let F;this.getUniforms=function(){return F===void 0&&L(this),F};let x;this.getAttributes=function(){return x===void 0&&L(this),x};let E=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=s.getProgramParameter(M,Dv)),E},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(M),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Lv++,this.cacheKey=e,this.usedTimes=1,this.program=M,this.vertexShader=R,this.fragmentShader=C,this}let iS=0;class sS{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new rS(e),t.set(e,i)),i}}class rS{constructor(e){this.id=iS++,this.code=e,this.usedTimes=0}}function oS(n,e,t,i,s,r,o){const a=new xh,l=new sS,c=new Set,u=[],f=new Map,h=s.logarithmicDepthBuffer;let m=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function M(x){return c.add(x),x===0?"uv":`uv${x}`}function _(x,E,I,j,B){const Z=j.fog,ne=B.geometry,X=x.isMeshStandardMaterial?j.environment:null,k=(x.isMeshStandardMaterial?t:e).get(x.envMap||X),$=k&&k.mapping===po?k.image.height:null,_e=g[x.type];x.precision!==null&&(m=s.getMaxPrecision(x.precision),m!==x.precision&&Be("WebGLProgram.getParameters:",x.precision,"not supported, using",m,"instead."));const de=ne.morphAttributes.position||ne.morphAttributes.normal||ne.morphAttributes.color,ge=de!==void 0?de.length:0;let Fe=0;ne.morphAttributes.position!==void 0&&(Fe=1),ne.morphAttributes.normal!==void 0&&(Fe=2),ne.morphAttributes.color!==void 0&&(Fe=3);let He,pt,lt,ee;if(_e){const it=vn[_e];He=it.vertexShader,pt=it.fragmentShader}else He=x.vertexShader,pt=x.fragmentShader,l.update(x),lt=l.getVertexShaderID(x),ee=l.getFragmentShaderID(x);const oe=n.getRenderTarget(),we=n.state.buffers.depth.getReversed(),ze=B.isInstancedMesh===!0,Re=B.isBatchedMesh===!0,$e=!!x.map,w=!!x.matcap,D=!!k,V=!!x.aoMap,Q=!!x.lightMap,Y=!!x.bumpMap,te=!!x.normalMap,y=!!x.displacementMap,ae=!!x.emissiveMap,ie=!!x.metalnessMap,J=!!x.roughnessMap,se=x.anisotropy>0,v=x.clearcoat>0,p=x.dispersion>0,P=x.iridescence>0,G=x.sheen>0,K=x.transmission>0,z=se&&!!x.anisotropyMap,Me=v&&!!x.clearcoatMap,ce=v&&!!x.clearcoatNormalMap,ye=v&&!!x.clearcoatRoughnessMap,De=P&&!!x.iridescenceMap,le=P&&!!x.iridescenceThicknessMap,pe=G&&!!x.sheenColorMap,xe=G&&!!x.sheenRoughnessMap,Te=!!x.specularMap,he=!!x.specularColorMap,Ge=!!x.specularIntensityMap,U=K&&!!x.transmissionMap,be=K&&!!x.thicknessMap,fe=!!x.gradientMap,Ae=!!x.alphaMap,ue=x.alphaTest>0,re=!!x.alphaHash,me=!!x.extensions;let Ve=Tn;x.toneMapped&&(oe===null||oe.isXRRenderTarget===!0)&&(Ve=n.toneMapping);const ut={shaderID:_e,shaderType:x.type,shaderName:x.name,vertexShader:He,fragmentShader:pt,defines:x.defines,customVertexShaderID:lt,customFragmentShaderID:ee,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:m,batching:Re,batchingColor:Re&&B._colorsTexture!==null,instancing:ze,instancingColor:ze&&B.instanceColor!==null,instancingMorph:ze&&B.morphTexture!==null,outputColorSpace:oe===null?n.outputColorSpace:oe.isXRRenderTarget===!0?oe.texture.colorSpace:gs,alphaToCoverage:!!x.alphaToCoverage,map:$e,matcap:w,envMap:D,envMapMode:D&&k.mapping,envMapCubeUVHeight:$,aoMap:V,lightMap:Q,bumpMap:Y,normalMap:te,displacementMap:y,emissiveMap:ae,normalMapObjectSpace:te&&x.normalMapType===km,normalMapTangentSpace:te&&x.normalMapType===ph,metalnessMap:ie,roughnessMap:J,anisotropy:se,anisotropyMap:z,clearcoat:v,clearcoatMap:Me,clearcoatNormalMap:ce,clearcoatRoughnessMap:ye,dispersion:p,iridescence:P,iridescenceMap:De,iridescenceThicknessMap:le,sheen:G,sheenColorMap:pe,sheenRoughnessMap:xe,specularMap:Te,specularColorMap:he,specularIntensityMap:Ge,transmission:K,transmissionMap:U,thicknessMap:be,gradientMap:fe,opaque:x.transparent===!1&&x.blending===us&&x.alphaToCoverage===!1,alphaMap:Ae,alphaTest:ue,alphaHash:re,combine:x.combine,mapUv:$e&&M(x.map.channel),aoMapUv:V&&M(x.aoMap.channel),lightMapUv:Q&&M(x.lightMap.channel),bumpMapUv:Y&&M(x.bumpMap.channel),normalMapUv:te&&M(x.normalMap.channel),displacementMapUv:y&&M(x.displacementMap.channel),emissiveMapUv:ae&&M(x.emissiveMap.channel),metalnessMapUv:ie&&M(x.metalnessMap.channel),roughnessMapUv:J&&M(x.roughnessMap.channel),anisotropyMapUv:z&&M(x.anisotropyMap.channel),clearcoatMapUv:Me&&M(x.clearcoatMap.channel),clearcoatNormalMapUv:ce&&M(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ye&&M(x.clearcoatRoughnessMap.channel),iridescenceMapUv:De&&M(x.iridescenceMap.channel),iridescenceThicknessMapUv:le&&M(x.iridescenceThicknessMap.channel),sheenColorMapUv:pe&&M(x.sheenColorMap.channel),sheenRoughnessMapUv:xe&&M(x.sheenRoughnessMap.channel),specularMapUv:Te&&M(x.specularMap.channel),specularColorMapUv:he&&M(x.specularColorMap.channel),specularIntensityMapUv:Ge&&M(x.specularIntensityMap.channel),transmissionMapUv:U&&M(x.transmissionMap.channel),thicknessMapUv:be&&M(x.thicknessMap.channel),alphaMapUv:Ae&&M(x.alphaMap.channel),vertexTangents:!!ne.attributes.tangent&&(te||se),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!ne.attributes.color&&ne.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!ne.attributes.uv&&($e||Ae),fog:!!Z,useFog:x.fog===!0,fogExp2:!!Z&&Z.isFogExp2,flatShading:x.flatShading===!0&&x.wireframe===!1,sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:we,skinning:B.isSkinnedMesh===!0,morphTargets:ne.morphAttributes.position!==void 0,morphNormals:ne.morphAttributes.normal!==void 0,morphColors:ne.morphAttributes.color!==void 0,morphTargetsCount:ge,morphTextureStride:Fe,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:x.dithering,shadowMapEnabled:n.shadowMap.enabled&&I.length>0,shadowMapType:n.shadowMap.type,toneMapping:Ve,decodeVideoTexture:$e&&x.map.isVideoTexture===!0&&Ze.getTransfer(x.map.colorSpace)===rt,decodeVideoTextureEmissive:ae&&x.emissiveMap.isVideoTexture===!0&&Ze.getTransfer(x.emissiveMap.colorSpace)===rt,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Sn,flipSided:x.side===qt,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:me&&x.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(me&&x.extensions.multiDraw===!0||Re)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return ut.vertexUv1s=c.has(1),ut.vertexUv2s=c.has(2),ut.vertexUv3s=c.has(3),c.clear(),ut}function d(x){const E=[];if(x.shaderID?E.push(x.shaderID):(E.push(x.customVertexShaderID),E.push(x.customFragmentShaderID)),x.defines!==void 0)for(const I in x.defines)E.push(I),E.push(x.defines[I]);return x.isRawShaderMaterial===!1&&(T(E,x),A(E,x),E.push(n.outputColorSpace)),E.push(x.customProgramCacheKey),E.join()}function T(x,E){x.push(E.precision),x.push(E.outputColorSpace),x.push(E.envMapMode),x.push(E.envMapCubeUVHeight),x.push(E.mapUv),x.push(E.alphaMapUv),x.push(E.lightMapUv),x.push(E.aoMapUv),x.push(E.bumpMapUv),x.push(E.normalMapUv),x.push(E.displacementMapUv),x.push(E.emissiveMapUv),x.push(E.metalnessMapUv),x.push(E.roughnessMapUv),x.push(E.anisotropyMapUv),x.push(E.clearcoatMapUv),x.push(E.clearcoatNormalMapUv),x.push(E.clearcoatRoughnessMapUv),x.push(E.iridescenceMapUv),x.push(E.iridescenceThicknessMapUv),x.push(E.sheenColorMapUv),x.push(E.sheenRoughnessMapUv),x.push(E.specularMapUv),x.push(E.specularColorMapUv),x.push(E.specularIntensityMapUv),x.push(E.transmissionMapUv),x.push(E.thicknessMapUv),x.push(E.combine),x.push(E.fogExp2),x.push(E.sizeAttenuation),x.push(E.morphTargetsCount),x.push(E.morphAttributeCount),x.push(E.numDirLights),x.push(E.numPointLights),x.push(E.numSpotLights),x.push(E.numSpotLightMaps),x.push(E.numHemiLights),x.push(E.numRectAreaLights),x.push(E.numDirLightShadows),x.push(E.numPointLightShadows),x.push(E.numSpotLightShadows),x.push(E.numSpotLightShadowsWithMaps),x.push(E.numLightProbes),x.push(E.shadowMapType),x.push(E.toneMapping),x.push(E.numClippingPlanes),x.push(E.numClipIntersection),x.push(E.depthPacking)}function A(x,E){a.disableAll(),E.instancing&&a.enable(0),E.instancingColor&&a.enable(1),E.instancingMorph&&a.enable(2),E.matcap&&a.enable(3),E.envMap&&a.enable(4),E.normalMapObjectSpace&&a.enable(5),E.normalMapTangentSpace&&a.enable(6),E.clearcoat&&a.enable(7),E.iridescence&&a.enable(8),E.alphaTest&&a.enable(9),E.vertexColors&&a.enable(10),E.vertexAlphas&&a.enable(11),E.vertexUv1s&&a.enable(12),E.vertexUv2s&&a.enable(13),E.vertexUv3s&&a.enable(14),E.vertexTangents&&a.enable(15),E.anisotropy&&a.enable(16),E.alphaHash&&a.enable(17),E.batching&&a.enable(18),E.dispersion&&a.enable(19),E.batchingColor&&a.enable(20),E.gradientMap&&a.enable(21),x.push(a.mask),a.disableAll(),E.fog&&a.enable(0),E.useFog&&a.enable(1),E.flatShading&&a.enable(2),E.logarithmicDepthBuffer&&a.enable(3),E.reversedDepthBuffer&&a.enable(4),E.skinning&&a.enable(5),E.morphTargets&&a.enable(6),E.morphNormals&&a.enable(7),E.morphColors&&a.enable(8),E.premultipliedAlpha&&a.enable(9),E.shadowMapEnabled&&a.enable(10),E.doubleSided&&a.enable(11),E.flipSided&&a.enable(12),E.useDepthPacking&&a.enable(13),E.dithering&&a.enable(14),E.transmission&&a.enable(15),E.sheen&&a.enable(16),E.opaque&&a.enable(17),E.pointsUvs&&a.enable(18),E.decodeVideoTexture&&a.enable(19),E.decodeVideoTextureEmissive&&a.enable(20),E.alphaToCoverage&&a.enable(21),x.push(a.mask)}function b(x){const E=g[x.type];let I;if(E){const j=vn[E];I=x_.clone(j.uniforms)}else I=x.uniforms;return I}function R(x,E){let I=f.get(E);return I!==void 0?++I.usedTimes:(I=new nS(n,E,x,r),u.push(I),f.set(E,I)),I}function C(x){if(--x.usedTimes===0){const E=u.indexOf(x);u[E]=u[u.length-1],u.pop(),f.delete(x.cacheKey),x.destroy()}}function L(x){l.remove(x)}function F(){l.dispose()}return{getParameters:_,getProgramCacheKey:d,getUniforms:b,acquireProgram:R,releaseProgram:C,releaseShaderCache:L,programs:u,dispose:F}}function aS(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,l){n.get(o)[a]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function lS(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Fu(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Ou(){const n=[];let e=0;const t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(f,h,m,g,M,_){let d=n[e];return d===void 0?(d={id:f.id,object:f,geometry:h,material:m,groupOrder:g,renderOrder:f.renderOrder,z:M,group:_},n[e]=d):(d.id=f.id,d.object=f,d.geometry=h,d.material=m,d.groupOrder=g,d.renderOrder=f.renderOrder,d.z=M,d.group=_),e++,d}function a(f,h,m,g,M,_){const d=o(f,h,m,g,M,_);m.transmission>0?i.push(d):m.transparent===!0?s.push(d):t.push(d)}function l(f,h,m,g,M,_){const d=o(f,h,m,g,M,_);m.transmission>0?i.unshift(d):m.transparent===!0?s.unshift(d):t.unshift(d)}function c(f,h){t.length>1&&t.sort(f||lS),i.length>1&&i.sort(h||Fu),s.length>1&&s.sort(h||Fu)}function u(){for(let f=e,h=n.length;f<h;f++){const m=n[f];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:a,unshift:l,finish:u,sort:c}}function cS(){let n=new WeakMap;function e(i,s){const r=n.get(i);let o;return r===void 0?(o=new Ou,n.set(i,[o])):s>=r.length?(o=new Ou,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function uS(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new H,color:new et};break;case"SpotLight":t={position:new H,direction:new H,color:new et,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new H,color:new et,distance:0,decay:0};break;case"HemisphereLight":t={direction:new H,skyColor:new et,groundColor:new et};break;case"RectAreaLight":t={color:new et,position:new H,halfWidth:new H,halfHeight:new H};break}return n[e.id]=t,t}}}function fS(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let hS=0;function dS(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function pS(n){const e=new uS,t=fS(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new H);const s=new H,r=new vt,o=new vt;function a(c){let u=0,f=0,h=0;for(let x=0;x<9;x++)i.probe[x].set(0,0,0);let m=0,g=0,M=0,_=0,d=0,T=0,A=0,b=0,R=0,C=0,L=0;c.sort(dS);for(let x=0,E=c.length;x<E;x++){const I=c[x],j=I.color,B=I.intensity,Z=I.distance;let ne=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===_s?ne=I.shadow.map.texture:ne=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)u+=j.r*B,f+=j.g*B,h+=j.b*B;else if(I.isLightProbe){for(let X=0;X<9;X++)i.probe[X].addScaledVector(I.sh.coefficients[X],B);L++}else if(I.isDirectionalLight){const X=e.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){const k=I.shadow,$=t.get(I);$.shadowIntensity=k.intensity,$.shadowBias=k.bias,$.shadowNormalBias=k.normalBias,$.shadowRadius=k.radius,$.shadowMapSize=k.mapSize,i.directionalShadow[m]=$,i.directionalShadowMap[m]=ne,i.directionalShadowMatrix[m]=I.shadow.matrix,T++}i.directional[m]=X,m++}else if(I.isSpotLight){const X=e.get(I);X.position.setFromMatrixPosition(I.matrixWorld),X.color.copy(j).multiplyScalar(B),X.distance=Z,X.coneCos=Math.cos(I.angle),X.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),X.decay=I.decay,i.spot[M]=X;const k=I.shadow;if(I.map&&(i.spotLightMap[R]=I.map,R++,k.updateMatrices(I),I.castShadow&&C++),i.spotLightMatrix[M]=k.matrix,I.castShadow){const $=t.get(I);$.shadowIntensity=k.intensity,$.shadowBias=k.bias,$.shadowNormalBias=k.normalBias,$.shadowRadius=k.radius,$.shadowMapSize=k.mapSize,i.spotShadow[M]=$,i.spotShadowMap[M]=ne,b++}M++}else if(I.isRectAreaLight){const X=e.get(I);X.color.copy(j).multiplyScalar(B),X.halfWidth.set(I.width*.5,0,0),X.halfHeight.set(0,I.height*.5,0),i.rectArea[_]=X,_++}else if(I.isPointLight){const X=e.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),X.distance=I.distance,X.decay=I.decay,I.castShadow){const k=I.shadow,$=t.get(I);$.shadowIntensity=k.intensity,$.shadowBias=k.bias,$.shadowNormalBias=k.normalBias,$.shadowRadius=k.radius,$.shadowMapSize=k.mapSize,$.shadowCameraNear=k.camera.near,$.shadowCameraFar=k.camera.far,i.pointShadow[g]=$,i.pointShadowMap[g]=ne,i.pointShadowMatrix[g]=I.shadow.matrix,A++}i.point[g]=X,g++}else if(I.isHemisphereLight){const X=e.get(I);X.skyColor.copy(I.color).multiplyScalar(B),X.groundColor.copy(I.groundColor).multiplyScalar(B),i.hemi[d]=X,d++}}_>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Se.LTC_FLOAT_1,i.rectAreaLTC2=Se.LTC_FLOAT_2):(i.rectAreaLTC1=Se.LTC_HALF_1,i.rectAreaLTC2=Se.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=f,i.ambient[2]=h;const F=i.hash;(F.directionalLength!==m||F.pointLength!==g||F.spotLength!==M||F.rectAreaLength!==_||F.hemiLength!==d||F.numDirectionalShadows!==T||F.numPointShadows!==A||F.numSpotShadows!==b||F.numSpotMaps!==R||F.numLightProbes!==L)&&(i.directional.length=m,i.spot.length=M,i.rectArea.length=_,i.point.length=g,i.hemi.length=d,i.directionalShadow.length=T,i.directionalShadowMap.length=T,i.pointShadow.length=A,i.pointShadowMap.length=A,i.spotShadow.length=b,i.spotShadowMap.length=b,i.directionalShadowMatrix.length=T,i.pointShadowMatrix.length=A,i.spotLightMatrix.length=b+R-C,i.spotLightMap.length=R,i.numSpotLightShadowsWithMaps=C,i.numLightProbes=L,F.directionalLength=m,F.pointLength=g,F.spotLength=M,F.rectAreaLength=_,F.hemiLength=d,F.numDirectionalShadows=T,F.numPointShadows=A,F.numSpotShadows=b,F.numSpotMaps=R,F.numLightProbes=L,i.version=hS++)}function l(c,u){let f=0,h=0,m=0,g=0,M=0;const _=u.matrixWorldInverse;for(let d=0,T=c.length;d<T;d++){const A=c[d];if(A.isDirectionalLight){const b=i.directional[f];b.direction.setFromMatrixPosition(A.matrixWorld),s.setFromMatrixPosition(A.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(_),f++}else if(A.isSpotLight){const b=i.spot[m];b.position.setFromMatrixPosition(A.matrixWorld),b.position.applyMatrix4(_),b.direction.setFromMatrixPosition(A.matrixWorld),s.setFromMatrixPosition(A.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(_),m++}else if(A.isRectAreaLight){const b=i.rectArea[g];b.position.setFromMatrixPosition(A.matrixWorld),b.position.applyMatrix4(_),o.identity(),r.copy(A.matrixWorld),r.premultiply(_),o.extractRotation(r),b.halfWidth.set(A.width*.5,0,0),b.halfHeight.set(0,A.height*.5,0),b.halfWidth.applyMatrix4(o),b.halfHeight.applyMatrix4(o),g++}else if(A.isPointLight){const b=i.point[h];b.position.setFromMatrixPosition(A.matrixWorld),b.position.applyMatrix4(_),h++}else if(A.isHemisphereLight){const b=i.hemi[M];b.direction.setFromMatrixPosition(A.matrixWorld),b.direction.transformDirection(_),M++}}}return{setup:a,setupView:l,state:i}}function Bu(n){const e=new pS(n),t=[],i=[];function s(u){c.camera=u,t.length=0,i.length=0}function r(u){t.push(u)}function o(u){i.push(u)}function a(){e.setup(t)}function l(u){e.setupView(t,u)}const c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function mS(n){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new Bu(n),e.set(s,[a])):r>=o.length?(a=new Bu(n),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}const _S=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,gS=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,xS=[new H(1,0,0),new H(-1,0,0),new H(0,1,0),new H(0,-1,0),new H(0,0,1),new H(0,0,-1)],vS=[new H(0,-1,0),new H(0,-1,0),new H(0,0,1),new H(0,0,-1),new H(0,-1,0),new H(0,-1,0)],zu=new vt,Ds=new H,la=new H;function SS(n,e,t){let i=new nc;const s=new ke,r=new ke,o=new xt,a=new D_,l=new L_,c={},u=t.maxTextureSize,f={[mi]:qt,[qt]:mi,[Sn]:Sn},h=new Dn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ke},radius:{value:4}},vertexShader:_S,fragmentShader:gS}),m=h.clone();m.defines.HORIZONTAL_PASS=1;const g=new Jn;g.setAttribute("position",new hn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const M=new Pn(g,h),_=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Gr;let d=this.type;this.render=function(C,L,F){if(_.enabled===!1||_.autoUpdate===!1&&_.needsUpdate===!1||C.length===0)return;C.type===Sm&&(Be("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),C.type=Gr);const x=n.getRenderTarget(),E=n.getActiveCubeFace(),I=n.getActiveMipmapLevel(),j=n.state;j.setBlending(kn),j.buffers.depth.getReversed()===!0?j.buffers.color.setClear(0,0,0,0):j.buffers.color.setClear(1,1,1,1),j.buffers.depth.setTest(!0),j.setScissorTest(!1);const B=d!==this.type;B&&L.traverse(function(Z){Z.material&&(Array.isArray(Z.material)?Z.material.forEach(ne=>ne.needsUpdate=!0):Z.material.needsUpdate=!0)});for(let Z=0,ne=C.length;Z<ne;Z++){const X=C[Z],k=X.shadow;if(k===void 0){Be("WebGLShadowMap:",X,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;s.copy(k.mapSize);const $=k.getFrameExtents();if(s.multiply($),r.copy(k.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/$.x),s.x=r.x*$.x,k.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/$.y),s.y=r.y*$.y,k.mapSize.y=r.y)),k.map===null||B===!0){if(k.map!==null&&(k.map.depthTexture!==null&&(k.map.depthTexture.dispose(),k.map.depthTexture=null),k.map.dispose()),this.type===Us){if(X.isPointLight){Be("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}k.map=new An(s.x,s.y,{format:_s,type:Kn,minFilter:Dt,magFilter:Dt,generateMipmaps:!1}),k.map.texture.name=X.name+".shadowMap",k.map.depthTexture=new ir(s.x,s.y,En),k.map.depthTexture.name=X.name+".shadowMapDepth",k.map.depthTexture.format=$n,k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=At,k.map.depthTexture.magFilter=At}else{X.isPointLight?(k.map=new Ah(s.x),k.map.depthTexture=new R_(s.x,Rn)):(k.map=new An(s.x,s.y),k.map.depthTexture=new ir(s.x,s.y,Rn)),k.map.depthTexture.name=X.name+".shadowMap",k.map.depthTexture.format=$n;const de=n.state.buffers.depth.getReversed();this.type===Gr?(k.map.depthTexture.compareFunction=de?Ql:Jl,k.map.depthTexture.minFilter=Dt,k.map.depthTexture.magFilter=Dt):(k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=At,k.map.depthTexture.magFilter=At)}k.camera.updateProjectionMatrix()}const _e=k.map.isWebGLCubeRenderTarget?6:1;for(let de=0;de<_e;de++){if(k.map.isWebGLCubeRenderTarget)n.setRenderTarget(k.map,de),n.clear();else{de===0&&(n.setRenderTarget(k.map),n.clear());const ge=k.getViewport(de);o.set(r.x*ge.x,r.y*ge.y,r.x*ge.z,r.y*ge.w),j.viewport(o)}if(X.isPointLight){const ge=k.camera,Fe=k.matrix,He=X.distance||ge.far;He!==ge.far&&(ge.far=He,ge.updateProjectionMatrix()),Ds.setFromMatrixPosition(X.matrixWorld),ge.position.copy(Ds),la.copy(ge.position),la.add(xS[de]),ge.up.copy(vS[de]),ge.lookAt(la),ge.updateMatrixWorld(),Fe.makeTranslation(-Ds.x,-Ds.y,-Ds.z),zu.multiplyMatrices(ge.projectionMatrix,ge.matrixWorldInverse),k._frustum.setFromProjectionMatrix(zu,ge.coordinateSystem,ge.reversedDepth)}else k.updateMatrices(X);i=k.getFrustum(),b(L,F,k.camera,X,this.type)}k.isPointLightShadow!==!0&&this.type===Us&&T(k,F),k.needsUpdate=!1}d=this.type,_.needsUpdate=!1,n.setRenderTarget(x,E,I)};function T(C,L){const F=e.update(M);h.defines.VSM_SAMPLES!==C.blurSamples&&(h.defines.VSM_SAMPLES=C.blurSamples,m.defines.VSM_SAMPLES=C.blurSamples,h.needsUpdate=!0,m.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new An(s.x,s.y,{format:_s,type:Kn})),h.uniforms.shadow_pass.value=C.map.depthTexture,h.uniforms.resolution.value=C.mapSize,h.uniforms.radius.value=C.radius,n.setRenderTarget(C.mapPass),n.clear(),n.renderBufferDirect(L,null,F,h,M,null),m.uniforms.shadow_pass.value=C.mapPass.texture,m.uniforms.resolution.value=C.mapSize,m.uniforms.radius.value=C.radius,n.setRenderTarget(C.map),n.clear(),n.renderBufferDirect(L,null,F,m,M,null)}function A(C,L,F,x){let E=null;const I=F.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(I!==void 0)E=I;else if(E=F.isPointLight===!0?l:a,n.localClippingEnabled&&L.clipShadows===!0&&Array.isArray(L.clippingPlanes)&&L.clippingPlanes.length!==0||L.displacementMap&&L.displacementScale!==0||L.alphaMap&&L.alphaTest>0||L.map&&L.alphaTest>0||L.alphaToCoverage===!0){const j=E.uuid,B=L.uuid;let Z=c[j];Z===void 0&&(Z={},c[j]=Z);let ne=Z[B];ne===void 0&&(ne=E.clone(),Z[B]=ne,L.addEventListener("dispose",R)),E=ne}if(E.visible=L.visible,E.wireframe=L.wireframe,x===Us?E.side=L.shadowSide!==null?L.shadowSide:L.side:E.side=L.shadowSide!==null?L.shadowSide:f[L.side],E.alphaMap=L.alphaMap,E.alphaTest=L.alphaToCoverage===!0?.5:L.alphaTest,E.map=L.map,E.clipShadows=L.clipShadows,E.clippingPlanes=L.clippingPlanes,E.clipIntersection=L.clipIntersection,E.displacementMap=L.displacementMap,E.displacementScale=L.displacementScale,E.displacementBias=L.displacementBias,E.wireframeLinewidth=L.wireframeLinewidth,E.linewidth=L.linewidth,F.isPointLight===!0&&E.isMeshDistanceMaterial===!0){const j=n.properties.get(E);j.light=F}return E}function b(C,L,F,x,E){if(C.visible===!1)return;if(C.layers.test(L.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&E===Us)&&(!C.frustumCulled||i.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(F.matrixWorldInverse,C.matrixWorld);const B=e.update(C),Z=C.material;if(Array.isArray(Z)){const ne=B.groups;for(let X=0,k=ne.length;X<k;X++){const $=ne[X],_e=Z[$.materialIndex];if(_e&&_e.visible){const de=A(C,_e,x,E);C.onBeforeShadow(n,C,L,F,B,de,$),n.renderBufferDirect(F,null,B,de,C,$),C.onAfterShadow(n,C,L,F,B,de,$)}}}else if(Z.visible){const ne=A(C,Z,x,E);C.onBeforeShadow(n,C,L,F,B,ne,null),n.renderBufferDirect(F,null,B,ne,C,null),C.onAfterShadow(n,C,L,F,B,ne,null)}}const j=C.children;for(let B=0,Z=j.length;B<Z;B++)b(j[B],L,F,x,E)}function R(C){C.target.removeEventListener("dispose",R);for(const F in c){const x=c[F],E=C.target.uuid;E in x&&(x[E].dispose(),delete x[E])}}}const MS={[Ra]:Ca,[Pa]:Ia,[Da]:Ua,[ps]:La,[Ca]:Ra,[Ia]:Pa,[Ua]:Da,[La]:ps};function ES(n,e){function t(){let U=!1;const be=new xt;let fe=null;const Ae=new xt(0,0,0,0);return{setMask:function(ue){fe!==ue&&!U&&(n.colorMask(ue,ue,ue,ue),fe=ue)},setLocked:function(ue){U=ue},setClear:function(ue,re,me,Ve,ut){ut===!0&&(ue*=Ve,re*=Ve,me*=Ve),be.set(ue,re,me,Ve),Ae.equals(be)===!1&&(n.clearColor(ue,re,me,Ve),Ae.copy(be))},reset:function(){U=!1,fe=null,Ae.set(-1,0,0,0)}}}function i(){let U=!1,be=!1,fe=null,Ae=null,ue=null;return{setReversed:function(re){if(be!==re){const me=e.get("EXT_clip_control");re?me.clipControlEXT(me.LOWER_LEFT_EXT,me.ZERO_TO_ONE_EXT):me.clipControlEXT(me.LOWER_LEFT_EXT,me.NEGATIVE_ONE_TO_ONE_EXT),be=re;const Ve=ue;ue=null,this.setClear(Ve)}},getReversed:function(){return be},setTest:function(re){re?oe(n.DEPTH_TEST):we(n.DEPTH_TEST)},setMask:function(re){fe!==re&&!U&&(n.depthMask(re),fe=re)},setFunc:function(re){if(be&&(re=MS[re]),Ae!==re){switch(re){case Ra:n.depthFunc(n.NEVER);break;case Ca:n.depthFunc(n.ALWAYS);break;case Pa:n.depthFunc(n.LESS);break;case ps:n.depthFunc(n.LEQUAL);break;case Da:n.depthFunc(n.EQUAL);break;case La:n.depthFunc(n.GEQUAL);break;case Ia:n.depthFunc(n.GREATER);break;case Ua:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}Ae=re}},setLocked:function(re){U=re},setClear:function(re){ue!==re&&(be&&(re=1-re),n.clearDepth(re),ue=re)},reset:function(){U=!1,fe=null,Ae=null,ue=null,be=!1}}}function s(){let U=!1,be=null,fe=null,Ae=null,ue=null,re=null,me=null,Ve=null,ut=null;return{setTest:function(it){U||(it?oe(n.STENCIL_TEST):we(n.STENCIL_TEST))},setMask:function(it){be!==it&&!U&&(n.stencilMask(it),be=it)},setFunc:function(it,dn,Ln){(fe!==it||Ae!==dn||ue!==Ln)&&(n.stencilFunc(it,dn,Ln),fe=it,Ae=dn,ue=Ln)},setOp:function(it,dn,Ln){(re!==it||me!==dn||Ve!==Ln)&&(n.stencilOp(it,dn,Ln),re=it,me=dn,Ve=Ln)},setLocked:function(it){U=it},setClear:function(it){ut!==it&&(n.clearStencil(it),ut=it)},reset:function(){U=!1,be=null,fe=null,Ae=null,ue=null,re=null,me=null,Ve=null,ut=null}}}const r=new t,o=new i,a=new s,l=new WeakMap,c=new WeakMap;let u={},f={},h=new WeakMap,m=[],g=null,M=!1,_=null,d=null,T=null,A=null,b=null,R=null,C=null,L=new et(0,0,0),F=0,x=!1,E=null,I=null,j=null,B=null,Z=null;const ne=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,k=0;const $=n.getParameter(n.VERSION);$.indexOf("WebGL")!==-1?(k=parseFloat(/^WebGL (\d)/.exec($)[1]),X=k>=1):$.indexOf("OpenGL ES")!==-1&&(k=parseFloat(/^OpenGL ES (\d)/.exec($)[1]),X=k>=2);let _e=null,de={};const ge=n.getParameter(n.SCISSOR_BOX),Fe=n.getParameter(n.VIEWPORT),He=new xt().fromArray(ge),pt=new xt().fromArray(Fe);function lt(U,be,fe,Ae){const ue=new Uint8Array(4),re=n.createTexture();n.bindTexture(U,re),n.texParameteri(U,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(U,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let me=0;me<fe;me++)U===n.TEXTURE_3D||U===n.TEXTURE_2D_ARRAY?n.texImage3D(be,0,n.RGBA,1,1,Ae,0,n.RGBA,n.UNSIGNED_BYTE,ue):n.texImage2D(be+me,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,ue);return re}const ee={};ee[n.TEXTURE_2D]=lt(n.TEXTURE_2D,n.TEXTURE_2D,1),ee[n.TEXTURE_CUBE_MAP]=lt(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),ee[n.TEXTURE_2D_ARRAY]=lt(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),ee[n.TEXTURE_3D]=lt(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),oe(n.DEPTH_TEST),o.setFunc(ps),Y(!1),te(Gc),oe(n.CULL_FACE),V(kn);function oe(U){u[U]!==!0&&(n.enable(U),u[U]=!0)}function we(U){u[U]!==!1&&(n.disable(U),u[U]=!1)}function ze(U,be){return f[U]!==be?(n.bindFramebuffer(U,be),f[U]=be,U===n.DRAW_FRAMEBUFFER&&(f[n.FRAMEBUFFER]=be),U===n.FRAMEBUFFER&&(f[n.DRAW_FRAMEBUFFER]=be),!0):!1}function Re(U,be){let fe=m,Ae=!1;if(U){fe=h.get(be),fe===void 0&&(fe=[],h.set(be,fe));const ue=U.textures;if(fe.length!==ue.length||fe[0]!==n.COLOR_ATTACHMENT0){for(let re=0,me=ue.length;re<me;re++)fe[re]=n.COLOR_ATTACHMENT0+re;fe.length=ue.length,Ae=!0}}else fe[0]!==n.BACK&&(fe[0]=n.BACK,Ae=!0);Ae&&n.drawBuffers(fe)}function $e(U){return g!==U?(n.useProgram(U),g=U,!0):!1}const w={[Ri]:n.FUNC_ADD,[Em]:n.FUNC_SUBTRACT,[bm]:n.FUNC_REVERSE_SUBTRACT};w[ym]=n.MIN,w[Tm]=n.MAX;const D={[Am]:n.ZERO,[wm]:n.ONE,[Rm]:n.SRC_COLOR,[Aa]:n.SRC_ALPHA,[Um]:n.SRC_ALPHA_SATURATE,[Lm]:n.DST_COLOR,[Pm]:n.DST_ALPHA,[Cm]:n.ONE_MINUS_SRC_COLOR,[wa]:n.ONE_MINUS_SRC_ALPHA,[Im]:n.ONE_MINUS_DST_COLOR,[Dm]:n.ONE_MINUS_DST_ALPHA,[Nm]:n.CONSTANT_COLOR,[Fm]:n.ONE_MINUS_CONSTANT_COLOR,[Om]:n.CONSTANT_ALPHA,[Bm]:n.ONE_MINUS_CONSTANT_ALPHA};function V(U,be,fe,Ae,ue,re,me,Ve,ut,it){if(U===kn){M===!0&&(we(n.BLEND),M=!1);return}if(M===!1&&(oe(n.BLEND),M=!0),U!==Mm){if(U!==_||it!==x){if((d!==Ri||b!==Ri)&&(n.blendEquation(n.FUNC_ADD),d=Ri,b=Ri),it)switch(U){case us:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case kc:n.blendFunc(n.ONE,n.ONE);break;case Wc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Xc:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Qe("WebGLState: Invalid blending: ",U);break}else switch(U){case us:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case kc:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Wc:Qe("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Xc:Qe("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Qe("WebGLState: Invalid blending: ",U);break}T=null,A=null,R=null,C=null,L.set(0,0,0),F=0,_=U,x=it}return}ue=ue||be,re=re||fe,me=me||Ae,(be!==d||ue!==b)&&(n.blendEquationSeparate(w[be],w[ue]),d=be,b=ue),(fe!==T||Ae!==A||re!==R||me!==C)&&(n.blendFuncSeparate(D[fe],D[Ae],D[re],D[me]),T=fe,A=Ae,R=re,C=me),(Ve.equals(L)===!1||ut!==F)&&(n.blendColor(Ve.r,Ve.g,Ve.b,ut),L.copy(Ve),F=ut),_=U,x=!1}function Q(U,be){U.side===Sn?we(n.CULL_FACE):oe(n.CULL_FACE);let fe=U.side===qt;be&&(fe=!fe),Y(fe),U.blending===us&&U.transparent===!1?V(kn):V(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),o.setFunc(U.depthFunc),o.setTest(U.depthTest),o.setMask(U.depthWrite),r.setMask(U.colorWrite);const Ae=U.stencilWrite;a.setTest(Ae),Ae&&(a.setMask(U.stencilWriteMask),a.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),a.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),ae(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?oe(n.SAMPLE_ALPHA_TO_COVERAGE):we(n.SAMPLE_ALPHA_TO_COVERAGE)}function Y(U){E!==U&&(U?n.frontFace(n.CW):n.frontFace(n.CCW),E=U)}function te(U){U!==xm?(oe(n.CULL_FACE),U!==I&&(U===Gc?n.cullFace(n.BACK):U===vm?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):we(n.CULL_FACE),I=U}function y(U){U!==j&&(X&&n.lineWidth(U),j=U)}function ae(U,be,fe){U?(oe(n.POLYGON_OFFSET_FILL),(B!==be||Z!==fe)&&(n.polygonOffset(be,fe),B=be,Z=fe)):we(n.POLYGON_OFFSET_FILL)}function ie(U){U?oe(n.SCISSOR_TEST):we(n.SCISSOR_TEST)}function J(U){U===void 0&&(U=n.TEXTURE0+ne-1),_e!==U&&(n.activeTexture(U),_e=U)}function se(U,be,fe){fe===void 0&&(_e===null?fe=n.TEXTURE0+ne-1:fe=_e);let Ae=de[fe];Ae===void 0&&(Ae={type:void 0,texture:void 0},de[fe]=Ae),(Ae.type!==U||Ae.texture!==be)&&(_e!==fe&&(n.activeTexture(fe),_e=fe),n.bindTexture(U,be||ee[U]),Ae.type=U,Ae.texture=be)}function v(){const U=de[_e];U!==void 0&&U.type!==void 0&&(n.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function p(){try{n.compressedTexImage2D(...arguments)}catch(U){Qe("WebGLState:",U)}}function P(){try{n.compressedTexImage3D(...arguments)}catch(U){Qe("WebGLState:",U)}}function G(){try{n.texSubImage2D(...arguments)}catch(U){Qe("WebGLState:",U)}}function K(){try{n.texSubImage3D(...arguments)}catch(U){Qe("WebGLState:",U)}}function z(){try{n.compressedTexSubImage2D(...arguments)}catch(U){Qe("WebGLState:",U)}}function Me(){try{n.compressedTexSubImage3D(...arguments)}catch(U){Qe("WebGLState:",U)}}function ce(){try{n.texStorage2D(...arguments)}catch(U){Qe("WebGLState:",U)}}function ye(){try{n.texStorage3D(...arguments)}catch(U){Qe("WebGLState:",U)}}function De(){try{n.texImage2D(...arguments)}catch(U){Qe("WebGLState:",U)}}function le(){try{n.texImage3D(...arguments)}catch(U){Qe("WebGLState:",U)}}function pe(U){He.equals(U)===!1&&(n.scissor(U.x,U.y,U.z,U.w),He.copy(U))}function xe(U){pt.equals(U)===!1&&(n.viewport(U.x,U.y,U.z,U.w),pt.copy(U))}function Te(U,be){let fe=c.get(be);fe===void 0&&(fe=new WeakMap,c.set(be,fe));let Ae=fe.get(U);Ae===void 0&&(Ae=n.getUniformBlockIndex(be,U.name),fe.set(U,Ae))}function he(U,be){const Ae=c.get(be).get(U);l.get(be)!==Ae&&(n.uniformBlockBinding(be,Ae,U.__bindingPointIndex),l.set(be,Ae))}function Ge(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),u={},_e=null,de={},f={},h=new WeakMap,m=[],g=null,M=!1,_=null,d=null,T=null,A=null,b=null,R=null,C=null,L=new et(0,0,0),F=0,x=!1,E=null,I=null,j=null,B=null,Z=null,He.set(0,0,n.canvas.width,n.canvas.height),pt.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:oe,disable:we,bindFramebuffer:ze,drawBuffers:Re,useProgram:$e,setBlending:V,setMaterial:Q,setFlipSided:Y,setCullFace:te,setLineWidth:y,setPolygonOffset:ae,setScissorTest:ie,activeTexture:J,bindTexture:se,unbindTexture:v,compressedTexImage2D:p,compressedTexImage3D:P,texImage2D:De,texImage3D:le,updateUBOMapping:Te,uniformBlockBinding:he,texStorage2D:ce,texStorage3D:ye,texSubImage2D:G,texSubImage3D:K,compressedTexSubImage2D:z,compressedTexSubImage3D:Me,scissor:pe,viewport:xe,reset:Ge}}function bS(n,e,t,i,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ke,u=new WeakMap;let f;const h=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(v,p){return m?new OffscreenCanvas(v,p):io("canvas")}function M(v,p,P){let G=1;const K=se(v);if((K.width>P||K.height>P)&&(G=P/Math.max(K.width,K.height)),G<1)if(typeof HTMLImageElement<"u"&&v instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&v instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&v instanceof ImageBitmap||typeof VideoFrame<"u"&&v instanceof VideoFrame){const z=Math.floor(G*K.width),Me=Math.floor(G*K.height);f===void 0&&(f=g(z,Me));const ce=p?g(z,Me):f;return ce.width=z,ce.height=Me,ce.getContext("2d").drawImage(v,0,0,z,Me),Be("WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+z+"x"+Me+")."),ce}else return"data"in v&&Be("WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),v;return v}function _(v){return v.generateMipmaps}function d(v){n.generateMipmap(v)}function T(v){return v.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:v.isWebGL3DRenderTarget?n.TEXTURE_3D:v.isWebGLArrayRenderTarget||v.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function A(v,p,P,G,K=!1){if(v!==null){if(n[v]!==void 0)return n[v];Be("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+v+"'")}let z=p;if(p===n.RED&&(P===n.FLOAT&&(z=n.R32F),P===n.HALF_FLOAT&&(z=n.R16F),P===n.UNSIGNED_BYTE&&(z=n.R8)),p===n.RED_INTEGER&&(P===n.UNSIGNED_BYTE&&(z=n.R8UI),P===n.UNSIGNED_SHORT&&(z=n.R16UI),P===n.UNSIGNED_INT&&(z=n.R32UI),P===n.BYTE&&(z=n.R8I),P===n.SHORT&&(z=n.R16I),P===n.INT&&(z=n.R32I)),p===n.RG&&(P===n.FLOAT&&(z=n.RG32F),P===n.HALF_FLOAT&&(z=n.RG16F),P===n.UNSIGNED_BYTE&&(z=n.RG8)),p===n.RG_INTEGER&&(P===n.UNSIGNED_BYTE&&(z=n.RG8UI),P===n.UNSIGNED_SHORT&&(z=n.RG16UI),P===n.UNSIGNED_INT&&(z=n.RG32UI),P===n.BYTE&&(z=n.RG8I),P===n.SHORT&&(z=n.RG16I),P===n.INT&&(z=n.RG32I)),p===n.RGB_INTEGER&&(P===n.UNSIGNED_BYTE&&(z=n.RGB8UI),P===n.UNSIGNED_SHORT&&(z=n.RGB16UI),P===n.UNSIGNED_INT&&(z=n.RGB32UI),P===n.BYTE&&(z=n.RGB8I),P===n.SHORT&&(z=n.RGB16I),P===n.INT&&(z=n.RGB32I)),p===n.RGBA_INTEGER&&(P===n.UNSIGNED_BYTE&&(z=n.RGBA8UI),P===n.UNSIGNED_SHORT&&(z=n.RGBA16UI),P===n.UNSIGNED_INT&&(z=n.RGBA32UI),P===n.BYTE&&(z=n.RGBA8I),P===n.SHORT&&(z=n.RGBA16I),P===n.INT&&(z=n.RGBA32I)),p===n.RGB&&(P===n.UNSIGNED_INT_5_9_9_9_REV&&(z=n.RGB9_E5),P===n.UNSIGNED_INT_10F_11F_11F_REV&&(z=n.R11F_G11F_B10F)),p===n.RGBA){const Me=K?to:Ze.getTransfer(G);P===n.FLOAT&&(z=n.RGBA32F),P===n.HALF_FLOAT&&(z=n.RGBA16F),P===n.UNSIGNED_BYTE&&(z=Me===rt?n.SRGB8_ALPHA8:n.RGBA8),P===n.UNSIGNED_SHORT_4_4_4_4&&(z=n.RGBA4),P===n.UNSIGNED_SHORT_5_5_5_1&&(z=n.RGB5_A1)}return(z===n.R16F||z===n.R32F||z===n.RG16F||z===n.RG32F||z===n.RGBA16F||z===n.RGBA32F)&&e.get("EXT_color_buffer_float"),z}function b(v,p){let P;return v?p===null||p===Rn||p===tr?P=n.DEPTH24_STENCIL8:p===En?P=n.DEPTH32F_STENCIL8:p===er&&(P=n.DEPTH24_STENCIL8,Be("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):p===null||p===Rn||p===tr?P=n.DEPTH_COMPONENT24:p===En?P=n.DEPTH_COMPONENT32F:p===er&&(P=n.DEPTH_COMPONENT16),P}function R(v,p){return _(v)===!0||v.isFramebufferTexture&&v.minFilter!==At&&v.minFilter!==Dt?Math.log2(Math.max(p.width,p.height))+1:v.mipmaps!==void 0&&v.mipmaps.length>0?v.mipmaps.length:v.isCompressedTexture&&Array.isArray(v.image)?p.mipmaps.length:1}function C(v){const p=v.target;p.removeEventListener("dispose",C),F(p),p.isVideoTexture&&u.delete(p)}function L(v){const p=v.target;p.removeEventListener("dispose",L),E(p)}function F(v){const p=i.get(v);if(p.__webglInit===void 0)return;const P=v.source,G=h.get(P);if(G){const K=G[p.__cacheKey];K.usedTimes--,K.usedTimes===0&&x(v),Object.keys(G).length===0&&h.delete(P)}i.remove(v)}function x(v){const p=i.get(v);n.deleteTexture(p.__webglTexture);const P=v.source,G=h.get(P);delete G[p.__cacheKey],o.memory.textures--}function E(v){const p=i.get(v);if(v.depthTexture&&(v.depthTexture.dispose(),i.remove(v.depthTexture)),v.isWebGLCubeRenderTarget)for(let G=0;G<6;G++){if(Array.isArray(p.__webglFramebuffer[G]))for(let K=0;K<p.__webglFramebuffer[G].length;K++)n.deleteFramebuffer(p.__webglFramebuffer[G][K]);else n.deleteFramebuffer(p.__webglFramebuffer[G]);p.__webglDepthbuffer&&n.deleteRenderbuffer(p.__webglDepthbuffer[G])}else{if(Array.isArray(p.__webglFramebuffer))for(let G=0;G<p.__webglFramebuffer.length;G++)n.deleteFramebuffer(p.__webglFramebuffer[G]);else n.deleteFramebuffer(p.__webglFramebuffer);if(p.__webglDepthbuffer&&n.deleteRenderbuffer(p.__webglDepthbuffer),p.__webglMultisampledFramebuffer&&n.deleteFramebuffer(p.__webglMultisampledFramebuffer),p.__webglColorRenderbuffer)for(let G=0;G<p.__webglColorRenderbuffer.length;G++)p.__webglColorRenderbuffer[G]&&n.deleteRenderbuffer(p.__webglColorRenderbuffer[G]);p.__webglDepthRenderbuffer&&n.deleteRenderbuffer(p.__webglDepthRenderbuffer)}const P=v.textures;for(let G=0,K=P.length;G<K;G++){const z=i.get(P[G]);z.__webglTexture&&(n.deleteTexture(z.__webglTexture),o.memory.textures--),i.remove(P[G])}i.remove(v)}let I=0;function j(){I=0}function B(){const v=I;return v>=s.maxTextures&&Be("WebGLTextures: Trying to use "+v+" texture units while this GPU supports only "+s.maxTextures),I+=1,v}function Z(v){const p=[];return p.push(v.wrapS),p.push(v.wrapT),p.push(v.wrapR||0),p.push(v.magFilter),p.push(v.minFilter),p.push(v.anisotropy),p.push(v.internalFormat),p.push(v.format),p.push(v.type),p.push(v.generateMipmaps),p.push(v.premultiplyAlpha),p.push(v.flipY),p.push(v.unpackAlignment),p.push(v.colorSpace),p.join()}function ne(v,p){const P=i.get(v);if(v.isVideoTexture&&ie(v),v.isRenderTargetTexture===!1&&v.isExternalTexture!==!0&&v.version>0&&P.__version!==v.version){const G=v.image;if(G===null)Be("WebGLRenderer: Texture marked for update but no image data found.");else if(G.complete===!1)Be("WebGLRenderer: Texture marked for update but image is incomplete");else{ee(P,v,p);return}}else v.isExternalTexture&&(P.__webglTexture=v.sourceTexture?v.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,P.__webglTexture,n.TEXTURE0+p)}function X(v,p){const P=i.get(v);if(v.isRenderTargetTexture===!1&&v.version>0&&P.__version!==v.version){ee(P,v,p);return}else v.isExternalTexture&&(P.__webglTexture=v.sourceTexture?v.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,P.__webglTexture,n.TEXTURE0+p)}function k(v,p){const P=i.get(v);if(v.isRenderTargetTexture===!1&&v.version>0&&P.__version!==v.version){ee(P,v,p);return}t.bindTexture(n.TEXTURE_3D,P.__webglTexture,n.TEXTURE0+p)}function $(v,p){const P=i.get(v);if(v.isCubeDepthTexture!==!0&&v.version>0&&P.__version!==v.version){oe(P,v,p);return}t.bindTexture(n.TEXTURE_CUBE_MAP,P.__webglTexture,n.TEXTURE0+p)}const _e={[Oa]:n.REPEAT,[Hn]:n.CLAMP_TO_EDGE,[Ba]:n.MIRRORED_REPEAT},de={[At]:n.NEAREST,[Hm]:n.NEAREST_MIPMAP_NEAREST,[_r]:n.NEAREST_MIPMAP_LINEAR,[Dt]:n.LINEAR,[Lo]:n.LINEAR_MIPMAP_NEAREST,[Pi]:n.LINEAR_MIPMAP_LINEAR},ge={[Wm]:n.NEVER,[Km]:n.ALWAYS,[Xm]:n.LESS,[Jl]:n.LEQUAL,[qm]:n.EQUAL,[Ql]:n.GEQUAL,[Ym]:n.GREATER,[jm]:n.NOTEQUAL};function Fe(v,p){if(p.type===En&&e.has("OES_texture_float_linear")===!1&&(p.magFilter===Dt||p.magFilter===Lo||p.magFilter===_r||p.magFilter===Pi||p.minFilter===Dt||p.minFilter===Lo||p.minFilter===_r||p.minFilter===Pi)&&Be("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(v,n.TEXTURE_WRAP_S,_e[p.wrapS]),n.texParameteri(v,n.TEXTURE_WRAP_T,_e[p.wrapT]),(v===n.TEXTURE_3D||v===n.TEXTURE_2D_ARRAY)&&n.texParameteri(v,n.TEXTURE_WRAP_R,_e[p.wrapR]),n.texParameteri(v,n.TEXTURE_MAG_FILTER,de[p.magFilter]),n.texParameteri(v,n.TEXTURE_MIN_FILTER,de[p.minFilter]),p.compareFunction&&(n.texParameteri(v,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(v,n.TEXTURE_COMPARE_FUNC,ge[p.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(p.magFilter===At||p.minFilter!==_r&&p.minFilter!==Pi||p.type===En&&e.has("OES_texture_float_linear")===!1)return;if(p.anisotropy>1||i.get(p).__currentAnisotropy){const P=e.get("EXT_texture_filter_anisotropic");n.texParameterf(v,P.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(p.anisotropy,s.getMaxAnisotropy())),i.get(p).__currentAnisotropy=p.anisotropy}}}function He(v,p){let P=!1;v.__webglInit===void 0&&(v.__webglInit=!0,p.addEventListener("dispose",C));const G=p.source;let K=h.get(G);K===void 0&&(K={},h.set(G,K));const z=Z(p);if(z!==v.__cacheKey){K[z]===void 0&&(K[z]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,P=!0),K[z].usedTimes++;const Me=K[v.__cacheKey];Me!==void 0&&(K[v.__cacheKey].usedTimes--,Me.usedTimes===0&&x(p)),v.__cacheKey=z,v.__webglTexture=K[z].texture}return P}function pt(v,p,P){return Math.floor(Math.floor(v/P)/p)}function lt(v,p,P,G){const z=v.updateRanges;if(z.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,p.width,p.height,P,G,p.data);else{z.sort((le,pe)=>le.start-pe.start);let Me=0;for(let le=1;le<z.length;le++){const pe=z[Me],xe=z[le],Te=pe.start+pe.count,he=pt(xe.start,p.width,4),Ge=pt(pe.start,p.width,4);xe.start<=Te+1&&he===Ge&&pt(xe.start+xe.count-1,p.width,4)===he?pe.count=Math.max(pe.count,xe.start+xe.count-pe.start):(++Me,z[Me]=xe)}z.length=Me+1;const ce=n.getParameter(n.UNPACK_ROW_LENGTH),ye=n.getParameter(n.UNPACK_SKIP_PIXELS),De=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,p.width);for(let le=0,pe=z.length;le<pe;le++){const xe=z[le],Te=Math.floor(xe.start/4),he=Math.ceil(xe.count/4),Ge=Te%p.width,U=Math.floor(Te/p.width),be=he,fe=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,Ge),n.pixelStorei(n.UNPACK_SKIP_ROWS,U),t.texSubImage2D(n.TEXTURE_2D,0,Ge,U,be,fe,P,G,p.data)}v.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,ce),n.pixelStorei(n.UNPACK_SKIP_PIXELS,ye),n.pixelStorei(n.UNPACK_SKIP_ROWS,De)}}function ee(v,p,P){let G=n.TEXTURE_2D;(p.isDataArrayTexture||p.isCompressedArrayTexture)&&(G=n.TEXTURE_2D_ARRAY),p.isData3DTexture&&(G=n.TEXTURE_3D);const K=He(v,p),z=p.source;t.bindTexture(G,v.__webglTexture,n.TEXTURE0+P);const Me=i.get(z);if(z.version!==Me.__version||K===!0){t.activeTexture(n.TEXTURE0+P);const ce=Ze.getPrimaries(Ze.workingColorSpace),ye=p.colorSpace===ui?null:Ze.getPrimaries(p.colorSpace),De=p.colorSpace===ui||ce===ye?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,p.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,p.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,p.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,De);let le=M(p.image,!1,s.maxTextureSize);le=J(p,le);const pe=r.convert(p.format,p.colorSpace),xe=r.convert(p.type);let Te=A(p.internalFormat,pe,xe,p.colorSpace,p.isVideoTexture);Fe(G,p);let he;const Ge=p.mipmaps,U=p.isVideoTexture!==!0,be=Me.__version===void 0||K===!0,fe=z.dataReady,Ae=R(p,le);if(p.isDepthTexture)Te=b(p.format===Di,p.type),be&&(U?t.texStorage2D(n.TEXTURE_2D,1,Te,le.width,le.height):t.texImage2D(n.TEXTURE_2D,0,Te,le.width,le.height,0,pe,xe,null));else if(p.isDataTexture)if(Ge.length>0){U&&be&&t.texStorage2D(n.TEXTURE_2D,Ae,Te,Ge[0].width,Ge[0].height);for(let ue=0,re=Ge.length;ue<re;ue++)he=Ge[ue],U?fe&&t.texSubImage2D(n.TEXTURE_2D,ue,0,0,he.width,he.height,pe,xe,he.data):t.texImage2D(n.TEXTURE_2D,ue,Te,he.width,he.height,0,pe,xe,he.data);p.generateMipmaps=!1}else U?(be&&t.texStorage2D(n.TEXTURE_2D,Ae,Te,le.width,le.height),fe&&lt(p,le,pe,xe)):t.texImage2D(n.TEXTURE_2D,0,Te,le.width,le.height,0,pe,xe,le.data);else if(p.isCompressedTexture)if(p.isCompressedArrayTexture){U&&be&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Ae,Te,Ge[0].width,Ge[0].height,le.depth);for(let ue=0,re=Ge.length;ue<re;ue++)if(he=Ge[ue],p.format!==cn)if(pe!==null)if(U){if(fe)if(p.layerUpdates.size>0){const me=_u(he.width,he.height,p.format,p.type);for(const Ve of p.layerUpdates){const ut=he.data.subarray(Ve*me/he.data.BYTES_PER_ELEMENT,(Ve+1)*me/he.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ue,0,0,Ve,he.width,he.height,1,pe,ut)}p.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ue,0,0,0,he.width,he.height,le.depth,pe,he.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,ue,Te,he.width,he.height,le.depth,0,he.data,0,0);else Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else U?fe&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,ue,0,0,0,he.width,he.height,le.depth,pe,xe,he.data):t.texImage3D(n.TEXTURE_2D_ARRAY,ue,Te,he.width,he.height,le.depth,0,pe,xe,he.data)}else{U&&be&&t.texStorage2D(n.TEXTURE_2D,Ae,Te,Ge[0].width,Ge[0].height);for(let ue=0,re=Ge.length;ue<re;ue++)he=Ge[ue],p.format!==cn?pe!==null?U?fe&&t.compressedTexSubImage2D(n.TEXTURE_2D,ue,0,0,he.width,he.height,pe,he.data):t.compressedTexImage2D(n.TEXTURE_2D,ue,Te,he.width,he.height,0,he.data):Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):U?fe&&t.texSubImage2D(n.TEXTURE_2D,ue,0,0,he.width,he.height,pe,xe,he.data):t.texImage2D(n.TEXTURE_2D,ue,Te,he.width,he.height,0,pe,xe,he.data)}else if(p.isDataArrayTexture)if(U){if(be&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Ae,Te,le.width,le.height,le.depth),fe)if(p.layerUpdates.size>0){const ue=_u(le.width,le.height,p.format,p.type);for(const re of p.layerUpdates){const me=le.data.subarray(re*ue/le.data.BYTES_PER_ELEMENT,(re+1)*ue/le.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,re,le.width,le.height,1,pe,xe,me)}p.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,le.width,le.height,le.depth,pe,xe,le.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Te,le.width,le.height,le.depth,0,pe,xe,le.data);else if(p.isData3DTexture)U?(be&&t.texStorage3D(n.TEXTURE_3D,Ae,Te,le.width,le.height,le.depth),fe&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,le.width,le.height,le.depth,pe,xe,le.data)):t.texImage3D(n.TEXTURE_3D,0,Te,le.width,le.height,le.depth,0,pe,xe,le.data);else if(p.isFramebufferTexture){if(be)if(U)t.texStorage2D(n.TEXTURE_2D,Ae,Te,le.width,le.height);else{let ue=le.width,re=le.height;for(let me=0;me<Ae;me++)t.texImage2D(n.TEXTURE_2D,me,Te,ue,re,0,pe,xe,null),ue>>=1,re>>=1}}else if(Ge.length>0){if(U&&be){const ue=se(Ge[0]);t.texStorage2D(n.TEXTURE_2D,Ae,Te,ue.width,ue.height)}for(let ue=0,re=Ge.length;ue<re;ue++)he=Ge[ue],U?fe&&t.texSubImage2D(n.TEXTURE_2D,ue,0,0,pe,xe,he):t.texImage2D(n.TEXTURE_2D,ue,Te,pe,xe,he);p.generateMipmaps=!1}else if(U){if(be){const ue=se(le);t.texStorage2D(n.TEXTURE_2D,Ae,Te,ue.width,ue.height)}fe&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,pe,xe,le)}else t.texImage2D(n.TEXTURE_2D,0,Te,pe,xe,le);_(p)&&d(G),Me.__version=z.version,p.onUpdate&&p.onUpdate(p)}v.__version=p.version}function oe(v,p,P){if(p.image.length!==6)return;const G=He(v,p),K=p.source;t.bindTexture(n.TEXTURE_CUBE_MAP,v.__webglTexture,n.TEXTURE0+P);const z=i.get(K);if(K.version!==z.__version||G===!0){t.activeTexture(n.TEXTURE0+P);const Me=Ze.getPrimaries(Ze.workingColorSpace),ce=p.colorSpace===ui?null:Ze.getPrimaries(p.colorSpace),ye=p.colorSpace===ui||Me===ce?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,p.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,p.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,p.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye);const De=p.isCompressedTexture||p.image[0].isCompressedTexture,le=p.image[0]&&p.image[0].isDataTexture,pe=[];for(let re=0;re<6;re++)!De&&!le?pe[re]=M(p.image[re],!0,s.maxCubemapSize):pe[re]=le?p.image[re].image:p.image[re],pe[re]=J(p,pe[re]);const xe=pe[0],Te=r.convert(p.format,p.colorSpace),he=r.convert(p.type),Ge=A(p.internalFormat,Te,he,p.colorSpace),U=p.isVideoTexture!==!0,be=z.__version===void 0||G===!0,fe=K.dataReady;let Ae=R(p,xe);Fe(n.TEXTURE_CUBE_MAP,p);let ue;if(De){U&&be&&t.texStorage2D(n.TEXTURE_CUBE_MAP,Ae,Ge,xe.width,xe.height);for(let re=0;re<6;re++){ue=pe[re].mipmaps;for(let me=0;me<ue.length;me++){const Ve=ue[me];p.format!==cn?Te!==null?U?fe&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,me,0,0,Ve.width,Ve.height,Te,Ve.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,me,Ge,Ve.width,Ve.height,0,Ve.data):Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?fe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,me,0,0,Ve.width,Ve.height,Te,he,Ve.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,me,Ge,Ve.width,Ve.height,0,Te,he,Ve.data)}}}else{if(ue=p.mipmaps,U&&be){ue.length>0&&Ae++;const re=se(pe[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,Ae,Ge,re.width,re.height)}for(let re=0;re<6;re++)if(le){U?fe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,0,0,pe[re].width,pe[re].height,Te,he,pe[re].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,Ge,pe[re].width,pe[re].height,0,Te,he,pe[re].data);for(let me=0;me<ue.length;me++){const ut=ue[me].image[re].image;U?fe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,me+1,0,0,ut.width,ut.height,Te,he,ut.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,me+1,Ge,ut.width,ut.height,0,Te,he,ut.data)}}else{U?fe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,0,0,Te,he,pe[re]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,Ge,Te,he,pe[re]);for(let me=0;me<ue.length;me++){const Ve=ue[me];U?fe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,me+1,0,0,Te,he,Ve.image[re]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,me+1,Ge,Te,he,Ve.image[re])}}}_(p)&&d(n.TEXTURE_CUBE_MAP),z.__version=K.version,p.onUpdate&&p.onUpdate(p)}v.__version=p.version}function we(v,p,P,G,K,z){const Me=r.convert(P.format,P.colorSpace),ce=r.convert(P.type),ye=A(P.internalFormat,Me,ce,P.colorSpace),De=i.get(p),le=i.get(P);if(le.__renderTarget=p,!De.__hasExternalTextures){const pe=Math.max(1,p.width>>z),xe=Math.max(1,p.height>>z);K===n.TEXTURE_3D||K===n.TEXTURE_2D_ARRAY?t.texImage3D(K,z,ye,pe,xe,p.depth,0,Me,ce,null):t.texImage2D(K,z,ye,pe,xe,0,Me,ce,null)}t.bindFramebuffer(n.FRAMEBUFFER,v),ae(p)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,G,K,le.__webglTexture,0,y(p)):(K===n.TEXTURE_2D||K>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,G,K,le.__webglTexture,z),t.bindFramebuffer(n.FRAMEBUFFER,null)}function ze(v,p,P){if(n.bindRenderbuffer(n.RENDERBUFFER,v),p.depthBuffer){const G=p.depthTexture,K=G&&G.isDepthTexture?G.type:null,z=b(p.stencilBuffer,K),Me=p.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;ae(p)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,y(p),z,p.width,p.height):P?n.renderbufferStorageMultisample(n.RENDERBUFFER,y(p),z,p.width,p.height):n.renderbufferStorage(n.RENDERBUFFER,z,p.width,p.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Me,n.RENDERBUFFER,v)}else{const G=p.textures;for(let K=0;K<G.length;K++){const z=G[K],Me=r.convert(z.format,z.colorSpace),ce=r.convert(z.type),ye=A(z.internalFormat,Me,ce,z.colorSpace);ae(p)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,y(p),ye,p.width,p.height):P?n.renderbufferStorageMultisample(n.RENDERBUFFER,y(p),ye,p.width,p.height):n.renderbufferStorage(n.RENDERBUFFER,ye,p.width,p.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Re(v,p,P){const G=p.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,v),!(p.depthTexture&&p.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const K=i.get(p.depthTexture);if(K.__renderTarget=p,(!K.__webglTexture||p.depthTexture.image.width!==p.width||p.depthTexture.image.height!==p.height)&&(p.depthTexture.image.width=p.width,p.depthTexture.image.height=p.height,p.depthTexture.needsUpdate=!0),G){if(K.__webglInit===void 0&&(K.__webglInit=!0,p.depthTexture.addEventListener("dispose",C)),K.__webglTexture===void 0){K.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,K.__webglTexture),Fe(n.TEXTURE_CUBE_MAP,p.depthTexture);const De=r.convert(p.depthTexture.format),le=r.convert(p.depthTexture.type);let pe;p.depthTexture.format===$n?pe=n.DEPTH_COMPONENT24:p.depthTexture.format===Di&&(pe=n.DEPTH24_STENCIL8);for(let xe=0;xe<6;xe++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,pe,p.width,p.height,0,De,le,null)}}else ne(p.depthTexture,0);const z=K.__webglTexture,Me=y(p),ce=G?n.TEXTURE_CUBE_MAP_POSITIVE_X+P:n.TEXTURE_2D,ye=p.depthTexture.format===Di?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(p.depthTexture.format===$n)ae(p)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ye,ce,z,0,Me):n.framebufferTexture2D(n.FRAMEBUFFER,ye,ce,z,0);else if(p.depthTexture.format===Di)ae(p)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ye,ce,z,0,Me):n.framebufferTexture2D(n.FRAMEBUFFER,ye,ce,z,0);else throw new Error("Unknown depthTexture format")}function $e(v){const p=i.get(v),P=v.isWebGLCubeRenderTarget===!0;if(p.__boundDepthTexture!==v.depthTexture){const G=v.depthTexture;if(p.__depthDisposeCallback&&p.__depthDisposeCallback(),G){const K=()=>{delete p.__boundDepthTexture,delete p.__depthDisposeCallback,G.removeEventListener("dispose",K)};G.addEventListener("dispose",K),p.__depthDisposeCallback=K}p.__boundDepthTexture=G}if(v.depthTexture&&!p.__autoAllocateDepthBuffer)if(P)for(let G=0;G<6;G++)Re(p.__webglFramebuffer[G],v,G);else{const G=v.texture.mipmaps;G&&G.length>0?Re(p.__webglFramebuffer[0],v,0):Re(p.__webglFramebuffer,v,0)}else if(P){p.__webglDepthbuffer=[];for(let G=0;G<6;G++)if(t.bindFramebuffer(n.FRAMEBUFFER,p.__webglFramebuffer[G]),p.__webglDepthbuffer[G]===void 0)p.__webglDepthbuffer[G]=n.createRenderbuffer(),ze(p.__webglDepthbuffer[G],v,!1);else{const K=v.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,z=p.__webglDepthbuffer[G];n.bindRenderbuffer(n.RENDERBUFFER,z),n.framebufferRenderbuffer(n.FRAMEBUFFER,K,n.RENDERBUFFER,z)}}else{const G=v.texture.mipmaps;if(G&&G.length>0?t.bindFramebuffer(n.FRAMEBUFFER,p.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,p.__webglFramebuffer),p.__webglDepthbuffer===void 0)p.__webglDepthbuffer=n.createRenderbuffer(),ze(p.__webglDepthbuffer,v,!1);else{const K=v.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,z=p.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,z),n.framebufferRenderbuffer(n.FRAMEBUFFER,K,n.RENDERBUFFER,z)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function w(v,p,P){const G=i.get(v);p!==void 0&&we(G.__webglFramebuffer,v,v.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),P!==void 0&&$e(v)}function D(v){const p=v.texture,P=i.get(v),G=i.get(p);v.addEventListener("dispose",L);const K=v.textures,z=v.isWebGLCubeRenderTarget===!0,Me=K.length>1;if(Me||(G.__webglTexture===void 0&&(G.__webglTexture=n.createTexture()),G.__version=p.version,o.memory.textures++),z){P.__webglFramebuffer=[];for(let ce=0;ce<6;ce++)if(p.mipmaps&&p.mipmaps.length>0){P.__webglFramebuffer[ce]=[];for(let ye=0;ye<p.mipmaps.length;ye++)P.__webglFramebuffer[ce][ye]=n.createFramebuffer()}else P.__webglFramebuffer[ce]=n.createFramebuffer()}else{if(p.mipmaps&&p.mipmaps.length>0){P.__webglFramebuffer=[];for(let ce=0;ce<p.mipmaps.length;ce++)P.__webglFramebuffer[ce]=n.createFramebuffer()}else P.__webglFramebuffer=n.createFramebuffer();if(Me)for(let ce=0,ye=K.length;ce<ye;ce++){const De=i.get(K[ce]);De.__webglTexture===void 0&&(De.__webglTexture=n.createTexture(),o.memory.textures++)}if(v.samples>0&&ae(v)===!1){P.__webglMultisampledFramebuffer=n.createFramebuffer(),P.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,P.__webglMultisampledFramebuffer);for(let ce=0;ce<K.length;ce++){const ye=K[ce];P.__webglColorRenderbuffer[ce]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,P.__webglColorRenderbuffer[ce]);const De=r.convert(ye.format,ye.colorSpace),le=r.convert(ye.type),pe=A(ye.internalFormat,De,le,ye.colorSpace,v.isXRRenderTarget===!0),xe=y(v);n.renderbufferStorageMultisample(n.RENDERBUFFER,xe,pe,v.width,v.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.RENDERBUFFER,P.__webglColorRenderbuffer[ce])}n.bindRenderbuffer(n.RENDERBUFFER,null),v.depthBuffer&&(P.__webglDepthRenderbuffer=n.createRenderbuffer(),ze(P.__webglDepthRenderbuffer,v,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(z){t.bindTexture(n.TEXTURE_CUBE_MAP,G.__webglTexture),Fe(n.TEXTURE_CUBE_MAP,p);for(let ce=0;ce<6;ce++)if(p.mipmaps&&p.mipmaps.length>0)for(let ye=0;ye<p.mipmaps.length;ye++)we(P.__webglFramebuffer[ce][ye],v,p,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ce,ye);else we(P.__webglFramebuffer[ce],v,p,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0);_(p)&&d(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Me){for(let ce=0,ye=K.length;ce<ye;ce++){const De=K[ce],le=i.get(De);let pe=n.TEXTURE_2D;(v.isWebGL3DRenderTarget||v.isWebGLArrayRenderTarget)&&(pe=v.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(pe,le.__webglTexture),Fe(pe,De),we(P.__webglFramebuffer,v,De,n.COLOR_ATTACHMENT0+ce,pe,0),_(De)&&d(pe)}t.unbindTexture()}else{let ce=n.TEXTURE_2D;if((v.isWebGL3DRenderTarget||v.isWebGLArrayRenderTarget)&&(ce=v.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ce,G.__webglTexture),Fe(ce,p),p.mipmaps&&p.mipmaps.length>0)for(let ye=0;ye<p.mipmaps.length;ye++)we(P.__webglFramebuffer[ye],v,p,n.COLOR_ATTACHMENT0,ce,ye);else we(P.__webglFramebuffer,v,p,n.COLOR_ATTACHMENT0,ce,0);_(p)&&d(ce),t.unbindTexture()}v.depthBuffer&&$e(v)}function V(v){const p=v.textures;for(let P=0,G=p.length;P<G;P++){const K=p[P];if(_(K)){const z=T(v),Me=i.get(K).__webglTexture;t.bindTexture(z,Me),d(z),t.unbindTexture()}}}const Q=[],Y=[];function te(v){if(v.samples>0){if(ae(v)===!1){const p=v.textures,P=v.width,G=v.height;let K=n.COLOR_BUFFER_BIT;const z=v.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Me=i.get(v),ce=p.length>1;if(ce)for(let De=0;De<p.length;De++)t.bindFramebuffer(n.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+De,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Me.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+De,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Me.__webglMultisampledFramebuffer);const ye=v.texture.mipmaps;ye&&ye.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Me.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Me.__webglFramebuffer);for(let De=0;De<p.length;De++){if(v.resolveDepthBuffer&&(v.depthBuffer&&(K|=n.DEPTH_BUFFER_BIT),v.stencilBuffer&&v.resolveStencilBuffer&&(K|=n.STENCIL_BUFFER_BIT)),ce){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Me.__webglColorRenderbuffer[De]);const le=i.get(p[De]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,le,0)}n.blitFramebuffer(0,0,P,G,0,0,P,G,K,n.NEAREST),l===!0&&(Q.length=0,Y.length=0,Q.push(n.COLOR_ATTACHMENT0+De),v.depthBuffer&&v.resolveDepthBuffer===!1&&(Q.push(z),Y.push(z),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Y)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Q))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),ce)for(let De=0;De<p.length;De++){t.bindFramebuffer(n.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+De,n.RENDERBUFFER,Me.__webglColorRenderbuffer[De]);const le=i.get(p[De]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Me.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+De,n.TEXTURE_2D,le,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Me.__webglMultisampledFramebuffer)}else if(v.depthBuffer&&v.resolveDepthBuffer===!1&&l){const p=v.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[p])}}}function y(v){return Math.min(s.maxSamples,v.samples)}function ae(v){const p=i.get(v);return v.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&p.__useRenderToTexture!==!1}function ie(v){const p=o.render.frame;u.get(v)!==p&&(u.set(v,p),v.update())}function J(v,p){const P=v.colorSpace,G=v.format,K=v.type;return v.isCompressedTexture===!0||v.isVideoTexture===!0||P!==gs&&P!==ui&&(Ze.getTransfer(P)===rt?(G!==cn||K!==Jt)&&Be("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Qe("WebGLTextures: Unsupported texture color space:",P)),p}function se(v){return typeof HTMLImageElement<"u"&&v instanceof HTMLImageElement?(c.width=v.naturalWidth||v.width,c.height=v.naturalHeight||v.height):typeof VideoFrame<"u"&&v instanceof VideoFrame?(c.width=v.displayWidth,c.height=v.displayHeight):(c.width=v.width,c.height=v.height),c}this.allocateTextureUnit=B,this.resetTextureUnits=j,this.setTexture2D=ne,this.setTexture2DArray=X,this.setTexture3D=k,this.setTextureCube=$,this.rebindTextures=w,this.setupRenderTarget=D,this.updateRenderTargetMipmap=V,this.updateMultisampleRenderTarget=te,this.setupDepthRenderbuffer=$e,this.setupFrameBufferTexture=we,this.useMultisampledRTT=ae,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function yS(n,e){function t(i,s=ui){let r;const o=Ze.getTransfer(s);if(i===Jt)return n.UNSIGNED_BYTE;if(i===Yl)return n.UNSIGNED_SHORT_4_4_4_4;if(i===jl)return n.UNSIGNED_SHORT_5_5_5_1;if(i===ch)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===uh)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===ah)return n.BYTE;if(i===lh)return n.SHORT;if(i===er)return n.UNSIGNED_SHORT;if(i===ql)return n.INT;if(i===Rn)return n.UNSIGNED_INT;if(i===En)return n.FLOAT;if(i===Kn)return n.HALF_FLOAT;if(i===fh)return n.ALPHA;if(i===hh)return n.RGB;if(i===cn)return n.RGBA;if(i===$n)return n.DEPTH_COMPONENT;if(i===Di)return n.DEPTH_STENCIL;if(i===dh)return n.RED;if(i===Kl)return n.RED_INTEGER;if(i===_s)return n.RG;if(i===$l)return n.RG_INTEGER;if(i===Zl)return n.RGBA_INTEGER;if(i===kr||i===Wr||i===Xr||i===qr)if(o===rt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===kr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Wr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Xr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===qr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===kr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Wr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Xr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===qr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===za||i===Va||i===Ha||i===Ga)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===za)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Va)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Ha)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Ga)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===ka||i===Wa||i===Xa||i===qa||i===Ya||i===ja||i===Ka)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===ka||i===Wa)return o===rt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Xa)return o===rt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===qa)return r.COMPRESSED_R11_EAC;if(i===Ya)return r.COMPRESSED_SIGNED_R11_EAC;if(i===ja)return r.COMPRESSED_RG11_EAC;if(i===Ka)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===$a||i===Za||i===Ja||i===Qa||i===el||i===tl||i===nl||i===il||i===sl||i===rl||i===ol||i===al||i===ll||i===cl)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===$a)return o===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Za)return o===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Ja)return o===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Qa)return o===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===el)return o===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===tl)return o===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===nl)return o===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===il)return o===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===sl)return o===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===rl)return o===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===ol)return o===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===al)return o===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===ll)return o===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===cl)return o===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===ul||i===fl||i===hl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===ul)return o===rt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===fl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===hl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===dl||i===pl||i===ml||i===_l)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===dl)return r.COMPRESSED_RED_RGTC1_EXT;if(i===pl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===ml)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===_l)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===tr?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}const TS=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,AS=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class wS{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new wh(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Dn({vertexShader:TS,fragmentShader:AS,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Pn(new ur(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class RS extends Oi{constructor(e,t){super();const i=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,f=null,h=null,m=null,g=null;const M=typeof XRWebGLBinding<"u",_=new wS,d={},T=t.getContextAttributes();let A=null,b=null;const R=[],C=[],L=new ke;let F=null;const x=new sn;x.viewport=new xt;const E=new sn;E.viewport=new xt;const I=[x,E],j=new O_;let B=null,Z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ee){let oe=R[ee];return oe===void 0&&(oe=new ea,R[ee]=oe),oe.getTargetRaySpace()},this.getControllerGrip=function(ee){let oe=R[ee];return oe===void 0&&(oe=new ea,R[ee]=oe),oe.getGripSpace()},this.getHand=function(ee){let oe=R[ee];return oe===void 0&&(oe=new ea,R[ee]=oe),oe.getHandSpace()};function ne(ee){const oe=C.indexOf(ee.inputSource);if(oe===-1)return;const we=R[oe];we!==void 0&&(we.update(ee.inputSource,ee.frame,c||o),we.dispatchEvent({type:ee.type,data:ee.inputSource}))}function X(){s.removeEventListener("select",ne),s.removeEventListener("selectstart",ne),s.removeEventListener("selectend",ne),s.removeEventListener("squeeze",ne),s.removeEventListener("squeezestart",ne),s.removeEventListener("squeezeend",ne),s.removeEventListener("end",X),s.removeEventListener("inputsourceschange",k);for(let ee=0;ee<R.length;ee++){const oe=C[ee];oe!==null&&(C[ee]=null,R[ee].disconnect(oe))}B=null,Z=null,_.reset();for(const ee in d)delete d[ee];e.setRenderTarget(A),m=null,h=null,f=null,s=null,b=null,lt.stop(),i.isPresenting=!1,e.setPixelRatio(F),e.setSize(L.width,L.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ee){r=ee,i.isPresenting===!0&&Be("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ee){a=ee,i.isPresenting===!0&&Be("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(ee){c=ee},this.getBaseLayer=function(){return h!==null?h:m},this.getBinding=function(){return f===null&&M&&(f=new XRWebGLBinding(s,t)),f},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(ee){if(s=ee,s!==null){if(A=e.getRenderTarget(),s.addEventListener("select",ne),s.addEventListener("selectstart",ne),s.addEventListener("selectend",ne),s.addEventListener("squeeze",ne),s.addEventListener("squeezestart",ne),s.addEventListener("squeezeend",ne),s.addEventListener("end",X),s.addEventListener("inputsourceschange",k),T.xrCompatible!==!0&&await t.makeXRCompatible(),F=e.getPixelRatio(),e.getSize(L),M&&"createProjectionLayer"in XRWebGLBinding.prototype){let we=null,ze=null,Re=null;T.depth&&(Re=T.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,we=T.stencil?Di:$n,ze=T.stencil?tr:Rn);const $e={colorFormat:t.RGBA8,depthFormat:Re,scaleFactor:r};f=this.getBinding(),h=f.createProjectionLayer($e),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),b=new An(h.textureWidth,h.textureHeight,{format:cn,type:Jt,depthTexture:new ir(h.textureWidth,h.textureHeight,ze,void 0,void 0,void 0,void 0,void 0,void 0,we),stencilBuffer:T.stencil,colorSpace:e.outputColorSpace,samples:T.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{const we={antialias:T.antialias,alpha:!0,depth:T.depth,stencil:T.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,t,we),s.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),b=new An(m.framebufferWidth,m.framebufferHeight,{format:cn,type:Jt,colorSpace:e.outputColorSpace,stencilBuffer:T.stencil,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),lt.setContext(s),lt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function k(ee){for(let oe=0;oe<ee.removed.length;oe++){const we=ee.removed[oe],ze=C.indexOf(we);ze>=0&&(C[ze]=null,R[ze].disconnect(we))}for(let oe=0;oe<ee.added.length;oe++){const we=ee.added[oe];let ze=C.indexOf(we);if(ze===-1){for(let $e=0;$e<R.length;$e++)if($e>=C.length){C.push(we),ze=$e;break}else if(C[$e]===null){C[$e]=we,ze=$e;break}if(ze===-1)break}const Re=R[ze];Re&&Re.connect(we)}}const $=new H,_e=new H;function de(ee,oe,we){$.setFromMatrixPosition(oe.matrixWorld),_e.setFromMatrixPosition(we.matrixWorld);const ze=$.distanceTo(_e),Re=oe.projectionMatrix.elements,$e=we.projectionMatrix.elements,w=Re[14]/(Re[10]-1),D=Re[14]/(Re[10]+1),V=(Re[9]+1)/Re[5],Q=(Re[9]-1)/Re[5],Y=(Re[8]-1)/Re[0],te=($e[8]+1)/$e[0],y=w*Y,ae=w*te,ie=ze/(-Y+te),J=ie*-Y;if(oe.matrixWorld.decompose(ee.position,ee.quaternion,ee.scale),ee.translateX(J),ee.translateZ(ie),ee.matrixWorld.compose(ee.position,ee.quaternion,ee.scale),ee.matrixWorldInverse.copy(ee.matrixWorld).invert(),Re[10]===-1)ee.projectionMatrix.copy(oe.projectionMatrix),ee.projectionMatrixInverse.copy(oe.projectionMatrixInverse);else{const se=w+ie,v=D+ie,p=y-J,P=ae+(ze-J),G=V*D/v*se,K=Q*D/v*se;ee.projectionMatrix.makePerspective(p,P,G,K,se,v),ee.projectionMatrixInverse.copy(ee.projectionMatrix).invert()}}function ge(ee,oe){oe===null?ee.matrixWorld.copy(ee.matrix):ee.matrixWorld.multiplyMatrices(oe.matrixWorld,ee.matrix),ee.matrixWorldInverse.copy(ee.matrixWorld).invert()}this.updateCamera=function(ee){if(s===null)return;let oe=ee.near,we=ee.far;_.texture!==null&&(_.depthNear>0&&(oe=_.depthNear),_.depthFar>0&&(we=_.depthFar)),j.near=E.near=x.near=oe,j.far=E.far=x.far=we,(B!==j.near||Z!==j.far)&&(s.updateRenderState({depthNear:j.near,depthFar:j.far}),B=j.near,Z=j.far),j.layers.mask=ee.layers.mask|6,x.layers.mask=j.layers.mask&3,E.layers.mask=j.layers.mask&5;const ze=ee.parent,Re=j.cameras;ge(j,ze);for(let $e=0;$e<Re.length;$e++)ge(Re[$e],ze);Re.length===2?de(j,x,E):j.projectionMatrix.copy(x.projectionMatrix),Fe(ee,j,ze)};function Fe(ee,oe,we){we===null?ee.matrix.copy(oe.matrixWorld):(ee.matrix.copy(we.matrixWorld),ee.matrix.invert(),ee.matrix.multiply(oe.matrixWorld)),ee.matrix.decompose(ee.position,ee.quaternion,ee.scale),ee.updateMatrixWorld(!0),ee.projectionMatrix.copy(oe.projectionMatrix),ee.projectionMatrixInverse.copy(oe.projectionMatrixInverse),ee.isPerspectiveCamera&&(ee.fov=gl*2*Math.atan(1/ee.projectionMatrix.elements[5]),ee.zoom=1)}this.getCamera=function(){return j},this.getFoveation=function(){if(!(h===null&&m===null))return l},this.setFoveation=function(ee){l=ee,h!==null&&(h.fixedFoveation=ee),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=ee)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(j)},this.getCameraTexture=function(ee){return d[ee]};let He=null;function pt(ee,oe){if(u=oe.getViewerPose(c||o),g=oe,u!==null){const we=u.views;m!==null&&(e.setRenderTargetFramebuffer(b,m.framebuffer),e.setRenderTarget(b));let ze=!1;we.length!==j.cameras.length&&(j.cameras.length=0,ze=!0);for(let D=0;D<we.length;D++){const V=we[D];let Q=null;if(m!==null)Q=m.getViewport(V);else{const te=f.getViewSubImage(h,V);Q=te.viewport,D===0&&(e.setRenderTargetTextures(b,te.colorTexture,te.depthStencilTexture),e.setRenderTarget(b))}let Y=I[D];Y===void 0&&(Y=new sn,Y.layers.enable(D),Y.viewport=new xt,I[D]=Y),Y.matrix.fromArray(V.transform.matrix),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.projectionMatrix.fromArray(V.projectionMatrix),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert(),Y.viewport.set(Q.x,Q.y,Q.width,Q.height),D===0&&(j.matrix.copy(Y.matrix),j.matrix.decompose(j.position,j.quaternion,j.scale)),ze===!0&&j.cameras.push(Y)}const Re=s.enabledFeatures;if(Re&&Re.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&M){f=i.getBinding();const D=f.getDepthInformation(we[0]);D&&D.isValid&&D.texture&&_.init(D,s.renderState)}if(Re&&Re.includes("camera-access")&&M){e.state.unbindTexture(),f=i.getBinding();for(let D=0;D<we.length;D++){const V=we[D].camera;if(V){let Q=d[V];Q||(Q=new wh,d[V]=Q);const Y=f.getCameraImage(V);Q.sourceTexture=Y}}}}for(let we=0;we<R.length;we++){const ze=C[we],Re=R[we];ze!==null&&Re!==void 0&&Re.update(ze,oe,c||o)}He&&He(ee,oe),oe.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:oe}),g=null}const lt=new Ch;lt.setAnimationLoop(pt),this.setAnimationLoop=function(ee){He=ee},this.dispose=function(){}}}const Ai=new Cn,CS=new vt;function PS(n,e){function t(_,d){_.matrixAutoUpdate===!0&&_.updateMatrix(),d.value.copy(_.matrix)}function i(_,d){d.color.getRGB(_.fogColor.value,bh(n)),d.isFog?(_.fogNear.value=d.near,_.fogFar.value=d.far):d.isFogExp2&&(_.fogDensity.value=d.density)}function s(_,d,T,A,b){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(_,d):d.isMeshToonMaterial?(r(_,d),f(_,d)):d.isMeshPhongMaterial?(r(_,d),u(_,d)):d.isMeshStandardMaterial?(r(_,d),h(_,d),d.isMeshPhysicalMaterial&&m(_,d,b)):d.isMeshMatcapMaterial?(r(_,d),g(_,d)):d.isMeshDepthMaterial?r(_,d):d.isMeshDistanceMaterial?(r(_,d),M(_,d)):d.isMeshNormalMaterial?r(_,d):d.isLineBasicMaterial?(o(_,d),d.isLineDashedMaterial&&a(_,d)):d.isPointsMaterial?l(_,d,T,A):d.isSpriteMaterial?c(_,d):d.isShadowMaterial?(_.color.value.copy(d.color),_.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(_,d){_.opacity.value=d.opacity,d.color&&_.diffuse.value.copy(d.color),d.emissive&&_.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(_.map.value=d.map,t(d.map,_.mapTransform)),d.alphaMap&&(_.alphaMap.value=d.alphaMap,t(d.alphaMap,_.alphaMapTransform)),d.bumpMap&&(_.bumpMap.value=d.bumpMap,t(d.bumpMap,_.bumpMapTransform),_.bumpScale.value=d.bumpScale,d.side===qt&&(_.bumpScale.value*=-1)),d.normalMap&&(_.normalMap.value=d.normalMap,t(d.normalMap,_.normalMapTransform),_.normalScale.value.copy(d.normalScale),d.side===qt&&_.normalScale.value.negate()),d.displacementMap&&(_.displacementMap.value=d.displacementMap,t(d.displacementMap,_.displacementMapTransform),_.displacementScale.value=d.displacementScale,_.displacementBias.value=d.displacementBias),d.emissiveMap&&(_.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,_.emissiveMapTransform)),d.specularMap&&(_.specularMap.value=d.specularMap,t(d.specularMap,_.specularMapTransform)),d.alphaTest>0&&(_.alphaTest.value=d.alphaTest);const T=e.get(d),A=T.envMap,b=T.envMapRotation;A&&(_.envMap.value=A,Ai.copy(b),Ai.x*=-1,Ai.y*=-1,Ai.z*=-1,A.isCubeTexture&&A.isRenderTargetTexture===!1&&(Ai.y*=-1,Ai.z*=-1),_.envMapRotation.value.setFromMatrix4(CS.makeRotationFromEuler(Ai)),_.flipEnvMap.value=A.isCubeTexture&&A.isRenderTargetTexture===!1?-1:1,_.reflectivity.value=d.reflectivity,_.ior.value=d.ior,_.refractionRatio.value=d.refractionRatio),d.lightMap&&(_.lightMap.value=d.lightMap,_.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,_.lightMapTransform)),d.aoMap&&(_.aoMap.value=d.aoMap,_.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,_.aoMapTransform))}function o(_,d){_.diffuse.value.copy(d.color),_.opacity.value=d.opacity,d.map&&(_.map.value=d.map,t(d.map,_.mapTransform))}function a(_,d){_.dashSize.value=d.dashSize,_.totalSize.value=d.dashSize+d.gapSize,_.scale.value=d.scale}function l(_,d,T,A){_.diffuse.value.copy(d.color),_.opacity.value=d.opacity,_.size.value=d.size*T,_.scale.value=A*.5,d.map&&(_.map.value=d.map,t(d.map,_.uvTransform)),d.alphaMap&&(_.alphaMap.value=d.alphaMap,t(d.alphaMap,_.alphaMapTransform)),d.alphaTest>0&&(_.alphaTest.value=d.alphaTest)}function c(_,d){_.diffuse.value.copy(d.color),_.opacity.value=d.opacity,_.rotation.value=d.rotation,d.map&&(_.map.value=d.map,t(d.map,_.mapTransform)),d.alphaMap&&(_.alphaMap.value=d.alphaMap,t(d.alphaMap,_.alphaMapTransform)),d.alphaTest>0&&(_.alphaTest.value=d.alphaTest)}function u(_,d){_.specular.value.copy(d.specular),_.shininess.value=Math.max(d.shininess,1e-4)}function f(_,d){d.gradientMap&&(_.gradientMap.value=d.gradientMap)}function h(_,d){_.metalness.value=d.metalness,d.metalnessMap&&(_.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,_.metalnessMapTransform)),_.roughness.value=d.roughness,d.roughnessMap&&(_.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,_.roughnessMapTransform)),d.envMap&&(_.envMapIntensity.value=d.envMapIntensity)}function m(_,d,T){_.ior.value=d.ior,d.sheen>0&&(_.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),_.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(_.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,_.sheenColorMapTransform)),d.sheenRoughnessMap&&(_.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,_.sheenRoughnessMapTransform))),d.clearcoat>0&&(_.clearcoat.value=d.clearcoat,_.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(_.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,_.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(_.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,_.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(_.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,_.clearcoatNormalMapTransform),_.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===qt&&_.clearcoatNormalScale.value.negate())),d.dispersion>0&&(_.dispersion.value=d.dispersion),d.iridescence>0&&(_.iridescence.value=d.iridescence,_.iridescenceIOR.value=d.iridescenceIOR,_.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],_.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(_.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,_.iridescenceMapTransform)),d.iridescenceThicknessMap&&(_.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,_.iridescenceThicknessMapTransform))),d.transmission>0&&(_.transmission.value=d.transmission,_.transmissionSamplerMap.value=T.texture,_.transmissionSamplerSize.value.set(T.width,T.height),d.transmissionMap&&(_.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,_.transmissionMapTransform)),_.thickness.value=d.thickness,d.thicknessMap&&(_.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,_.thicknessMapTransform)),_.attenuationDistance.value=d.attenuationDistance,_.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(_.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(_.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,_.anisotropyMapTransform))),_.specularIntensity.value=d.specularIntensity,_.specularColor.value.copy(d.specularColor),d.specularColorMap&&(_.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,_.specularColorMapTransform)),d.specularIntensityMap&&(_.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,_.specularIntensityMapTransform))}function g(_,d){d.matcap&&(_.matcap.value=d.matcap)}function M(_,d){const T=e.get(d).light;_.referencePosition.value.setFromMatrixPosition(T.matrixWorld),_.nearDistance.value=T.shadow.camera.near,_.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function DS(n,e,t,i){let s={},r={},o=[];const a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(T,A){const b=A.program;i.uniformBlockBinding(T,b)}function c(T,A){let b=s[T.id];b===void 0&&(g(T),b=u(T),s[T.id]=b,T.addEventListener("dispose",_));const R=A.program;i.updateUBOMapping(T,R);const C=e.render.frame;r[T.id]!==C&&(h(T),r[T.id]=C)}function u(T){const A=f();T.__bindingPointIndex=A;const b=n.createBuffer(),R=T.__size,C=T.usage;return n.bindBuffer(n.UNIFORM_BUFFER,b),n.bufferData(n.UNIFORM_BUFFER,R,C),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,A,b),b}function f(){for(let T=0;T<a;T++)if(o.indexOf(T)===-1)return o.push(T),T;return Qe("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(T){const A=s[T.id],b=T.uniforms,R=T.__cache;n.bindBuffer(n.UNIFORM_BUFFER,A);for(let C=0,L=b.length;C<L;C++){const F=Array.isArray(b[C])?b[C]:[b[C]];for(let x=0,E=F.length;x<E;x++){const I=F[x];if(m(I,C,x,R)===!0){const j=I.__offset,B=Array.isArray(I.value)?I.value:[I.value];let Z=0;for(let ne=0;ne<B.length;ne++){const X=B[ne],k=M(X);typeof X=="number"||typeof X=="boolean"?(I.__data[0]=X,n.bufferSubData(n.UNIFORM_BUFFER,j+Z,I.__data)):X.isMatrix3?(I.__data[0]=X.elements[0],I.__data[1]=X.elements[1],I.__data[2]=X.elements[2],I.__data[3]=0,I.__data[4]=X.elements[3],I.__data[5]=X.elements[4],I.__data[6]=X.elements[5],I.__data[7]=0,I.__data[8]=X.elements[6],I.__data[9]=X.elements[7],I.__data[10]=X.elements[8],I.__data[11]=0):(X.toArray(I.__data,Z),Z+=k.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,j,I.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function m(T,A,b,R){const C=T.value,L=A+"_"+b;if(R[L]===void 0)return typeof C=="number"||typeof C=="boolean"?R[L]=C:R[L]=C.clone(),!0;{const F=R[L];if(typeof C=="number"||typeof C=="boolean"){if(F!==C)return R[L]=C,!0}else if(F.equals(C)===!1)return F.copy(C),!0}return!1}function g(T){const A=T.uniforms;let b=0;const R=16;for(let L=0,F=A.length;L<F;L++){const x=Array.isArray(A[L])?A[L]:[A[L]];for(let E=0,I=x.length;E<I;E++){const j=x[E],B=Array.isArray(j.value)?j.value:[j.value];for(let Z=0,ne=B.length;Z<ne;Z++){const X=B[Z],k=M(X),$=b%R,_e=$%k.boundary,de=$+_e;b+=_e,de!==0&&R-de<k.storage&&(b+=R-de),j.__data=new Float32Array(k.storage/Float32Array.BYTES_PER_ELEMENT),j.__offset=b,b+=k.storage}}}const C=b%R;return C>0&&(b+=R-C),T.__size=b,T.__cache={},this}function M(T){const A={boundary:0,storage:0};return typeof T=="number"||typeof T=="boolean"?(A.boundary=4,A.storage=4):T.isVector2?(A.boundary=8,A.storage=8):T.isVector3||T.isColor?(A.boundary=16,A.storage=12):T.isVector4?(A.boundary=16,A.storage=16):T.isMatrix3?(A.boundary=48,A.storage=48):T.isMatrix4?(A.boundary=64,A.storage=64):T.isTexture?Be("WebGLRenderer: Texture samplers can not be part of an uniforms group."):Be("WebGLRenderer: Unsupported uniform value type.",T),A}function _(T){const A=T.target;A.removeEventListener("dispose",_);const b=o.indexOf(A.__bindingPointIndex);o.splice(b,1),n.deleteBuffer(s[A.id]),delete s[A.id],delete r[A.id]}function d(){for(const T in s)n.deleteBuffer(s[T]);o=[],s={},r={}}return{bind:l,update:c,dispose:d}}const LS=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let mn=null;function IS(){return mn===null&&(mn=new y_(LS,16,16,_s,Kn),mn.name="DFG_LUT",mn.minFilter=Dt,mn.magFilter=Dt,mn.wrapS=Hn,mn.wrapT=Hn,mn.generateMipmaps=!1,mn.needsUpdate=!0),mn}class US{constructor(e={}){const{canvas:t=$m(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:h=!1,outputBufferType:m=Jt}=e;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=o;const M=m,_=new Set([Zl,$l,Kl]),d=new Set([Jt,Rn,er,tr,Yl,jl]),T=new Uint32Array(4),A=new Int32Array(4);let b=null,R=null;const C=[],L=[];let F=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Tn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const x=this;let E=!1;this._outputColorSpace=nn;let I=0,j=0,B=null,Z=-1,ne=null;const X=new xt,k=new xt;let $=null;const _e=new et(0);let de=0,ge=t.width,Fe=t.height,He=1,pt=null,lt=null;const ee=new xt(0,0,ge,Fe),oe=new xt(0,0,ge,Fe);let we=!1;const ze=new nc;let Re=!1,$e=!1;const w=new vt,D=new H,V=new xt,Q={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Y=!1;function te(){return B===null?He:1}let y=i;function ae(S,N){return t.getContext(S,N)}try{const S={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Xl}`),t.addEventListener("webglcontextlost",Ve,!1),t.addEventListener("webglcontextrestored",ut,!1),t.addEventListener("webglcontextcreationerror",it,!1),y===null){const N="webgl2";if(y=ae(N,S),y===null)throw ae(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(S){throw Qe("WebGLRenderer: "+S.message),S}let ie,J,se,v,p,P,G,K,z,Me,ce,ye,De,le,pe,xe,Te,he,Ge,U,be,fe,Ae,ue;function re(){ie=new Ix(y),ie.init(),fe=new yS(y,ie),J=new yx(y,ie,e,fe),se=new ES(y,ie),J.reversedDepthBuffer&&h&&se.buffers.depth.setReversed(!0),v=new Fx(y),p=new aS,P=new bS(y,ie,se,p,J,fe,v),G=new Ax(x),K=new Lx(x),z=new V_(y),Ae=new Ex(y,z),Me=new Ux(y,z,v,Ae),ce=new Bx(y,Me,z,v),Ge=new Ox(y,J,P),xe=new Tx(p),ye=new oS(x,G,K,ie,J,Ae,xe),De=new PS(x,p),le=new cS,pe=new mS(ie),he=new Mx(x,G,K,se,ce,g,l),Te=new SS(x,ce,J),ue=new DS(y,v,J,se),U=new bx(y,ie,v),be=new Nx(y,ie,v),v.programs=ye.programs,x.capabilities=J,x.extensions=ie,x.properties=p,x.renderLists=le,x.shadowMap=Te,x.state=se,x.info=v}re(),M!==Jt&&(F=new Vx(M,t.width,t.height,s,r));const me=new RS(x,y);this.xr=me,this.getContext=function(){return y},this.getContextAttributes=function(){return y.getContextAttributes()},this.forceContextLoss=function(){const S=ie.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=ie.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return He},this.setPixelRatio=function(S){S!==void 0&&(He=S,this.setSize(ge,Fe,!1))},this.getSize=function(S){return S.set(ge,Fe)},this.setSize=function(S,N,q=!0){if(me.isPresenting){Be("WebGLRenderer: Can't change size while VR device is presenting.");return}ge=S,Fe=N,t.width=Math.floor(S*He),t.height=Math.floor(N*He),q===!0&&(t.style.width=S+"px",t.style.height=N+"px"),F!==null&&F.setSize(t.width,t.height),this.setViewport(0,0,S,N)},this.getDrawingBufferSize=function(S){return S.set(ge*He,Fe*He).floor()},this.setDrawingBufferSize=function(S,N,q){ge=S,Fe=N,He=q,t.width=Math.floor(S*q),t.height=Math.floor(N*q),this.setViewport(0,0,S,N)},this.setEffects=function(S){if(M===Jt){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(S){for(let N=0;N<S.length;N++)if(S[N].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}F.setEffects(S||[])},this.getCurrentViewport=function(S){return S.copy(X)},this.getViewport=function(S){return S.copy(ee)},this.setViewport=function(S,N,q,W){S.isVector4?ee.set(S.x,S.y,S.z,S.w):ee.set(S,N,q,W),se.viewport(X.copy(ee).multiplyScalar(He).round())},this.getScissor=function(S){return S.copy(oe)},this.setScissor=function(S,N,q,W){S.isVector4?oe.set(S.x,S.y,S.z,S.w):oe.set(S,N,q,W),se.scissor(k.copy(oe).multiplyScalar(He).round())},this.getScissorTest=function(){return we},this.setScissorTest=function(S){se.setScissorTest(we=S)},this.setOpaqueSort=function(S){pt=S},this.setTransparentSort=function(S){lt=S},this.getClearColor=function(S){return S.copy(he.getClearColor())},this.setClearColor=function(){he.setClearColor(...arguments)},this.getClearAlpha=function(){return he.getClearAlpha()},this.setClearAlpha=function(){he.setClearAlpha(...arguments)},this.clear=function(S=!0,N=!0,q=!0){let W=0;if(S){let O=!1;if(B!==null){const ve=B.texture.format;O=_.has(ve)}if(O){const ve=B.texture.type,Ce=d.has(ve),Ee=he.getClearColor(),Pe=he.getClearAlpha(),Le=Ee.r,Oe=Ee.g,Ue=Ee.b;Ce?(T[0]=Le,T[1]=Oe,T[2]=Ue,T[3]=Pe,y.clearBufferuiv(y.COLOR,0,T)):(A[0]=Le,A[1]=Oe,A[2]=Ue,A[3]=Pe,y.clearBufferiv(y.COLOR,0,A))}else W|=y.COLOR_BUFFER_BIT}N&&(W|=y.DEPTH_BUFFER_BIT),q&&(W|=y.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),y.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Ve,!1),t.removeEventListener("webglcontextrestored",ut,!1),t.removeEventListener("webglcontextcreationerror",it,!1),he.dispose(),le.dispose(),pe.dispose(),p.dispose(),G.dispose(),K.dispose(),ce.dispose(),Ae.dispose(),ue.dispose(),ye.dispose(),me.dispose(),me.removeEventListener("sessionstart",ac),me.removeEventListener("sessionend",lc),gi.stop()};function Ve(S){S.preventDefault(),$c("WebGLRenderer: Context Lost."),E=!0}function ut(){$c("WebGLRenderer: Context Restored."),E=!1;const S=v.autoReset,N=Te.enabled,q=Te.autoUpdate,W=Te.needsUpdate,O=Te.type;re(),v.autoReset=S,Te.enabled=N,Te.autoUpdate=q,Te.needsUpdate=W,Te.type=O}function it(S){Qe("WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function dn(S){const N=S.target;N.removeEventListener("dispose",dn),Ln(N)}function Ln(S){Vh(S),p.remove(S)}function Vh(S){const N=p.get(S).programs;N!==void 0&&(N.forEach(function(q){ye.releaseProgram(q)}),S.isShaderMaterial&&ye.releaseShaderCache(S))}this.renderBufferDirect=function(S,N,q,W,O,ve){N===null&&(N=Q);const Ce=O.isMesh&&O.matrixWorld.determinant()<0,Ee=Gh(S,N,q,W,O);se.setMaterial(W,Ce);let Pe=q.index,Le=1;if(W.wireframe===!0){if(Pe=Me.getWireframeAttribute(q),Pe===void 0)return;Le=2}const Oe=q.drawRange,Ue=q.attributes.position;let je=Oe.start*Le,ot=(Oe.start+Oe.count)*Le;ve!==null&&(je=Math.max(je,ve.start*Le),ot=Math.min(ot,(ve.start+ve.count)*Le)),Pe!==null?(je=Math.max(je,0),ot=Math.min(ot,Pe.count)):Ue!=null&&(je=Math.max(je,0),ot=Math.min(ot,Ue.count));const _t=ot-je;if(_t<0||_t===1/0)return;Ae.setup(O,W,Ee,q,Pe);let gt,ct=U;if(Pe!==null&&(gt=z.get(Pe),ct=be,ct.setIndex(gt)),O.isMesh)W.wireframe===!0?(se.setLineWidth(W.wireframeLinewidth*te()),ct.setMode(y.LINES)):ct.setMode(y.TRIANGLES);else if(O.isLine){let Ne=W.linewidth;Ne===void 0&&(Ne=1),se.setLineWidth(Ne*te()),O.isLineSegments?ct.setMode(y.LINES):O.isLineLoop?ct.setMode(y.LINE_LOOP):ct.setMode(y.LINE_STRIP)}else O.isPoints?ct.setMode(y.POINTS):O.isSprite&&ct.setMode(y.TRIANGLES);if(O.isBatchedMesh)if(O._multiDrawInstances!==null)nr("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),ct.renderMultiDrawInstances(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount,O._multiDrawInstances);else if(ie.get("WEBGL_multi_draw"))ct.renderMultiDraw(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount);else{const Ne=O._multiDrawStarts,st=O._multiDrawCounts,Je=O._multiDrawCount,Yt=Pe?z.get(Pe).bytesPerElement:1,Bi=p.get(W).currentProgram.getUniforms();for(let jt=0;jt<Je;jt++)Bi.setValue(y,"_gl_DrawID",jt),ct.render(Ne[jt]/Yt,st[jt])}else if(O.isInstancedMesh)ct.renderInstances(je,_t,O.count);else if(q.isInstancedBufferGeometry){const Ne=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,st=Math.min(q.instanceCount,Ne);ct.renderInstances(je,_t,st)}else ct.render(je,_t)};function oc(S,N,q){S.transparent===!0&&S.side===Sn&&S.forceSinglePass===!1?(S.side=qt,S.needsUpdate=!0,hr(S,N,q),S.side=mi,S.needsUpdate=!0,hr(S,N,q),S.side=Sn):hr(S,N,q)}this.compile=function(S,N,q=null){q===null&&(q=S),R=pe.get(q),R.init(N),L.push(R),q.traverseVisible(function(O){O.isLight&&O.layers.test(N.layers)&&(R.pushLight(O),O.castShadow&&R.pushShadow(O))}),S!==q&&S.traverseVisible(function(O){O.isLight&&O.layers.test(N.layers)&&(R.pushLight(O),O.castShadow&&R.pushShadow(O))}),R.setupLights();const W=new Set;return S.traverse(function(O){if(!(O.isMesh||O.isPoints||O.isLine||O.isSprite))return;const ve=O.material;if(ve)if(Array.isArray(ve))for(let Ce=0;Ce<ve.length;Ce++){const Ee=ve[Ce];oc(Ee,q,O),W.add(Ee)}else oc(ve,q,O),W.add(ve)}),R=L.pop(),W},this.compileAsync=function(S,N,q=null){const W=this.compile(S,N,q);return new Promise(O=>{function ve(){if(W.forEach(function(Ce){p.get(Ce).currentProgram.isReady()&&W.delete(Ce)}),W.size===0){O(S);return}setTimeout(ve,10)}ie.get("KHR_parallel_shader_compile")!==null?ve():setTimeout(ve,10)})};let xo=null;function Hh(S){xo&&xo(S)}function ac(){gi.stop()}function lc(){gi.start()}const gi=new Ch;gi.setAnimationLoop(Hh),typeof self<"u"&&gi.setContext(self),this.setAnimationLoop=function(S){xo=S,me.setAnimationLoop(S),S===null?gi.stop():gi.start()},me.addEventListener("sessionstart",ac),me.addEventListener("sessionend",lc),this.render=function(S,N){if(N!==void 0&&N.isCamera!==!0){Qe("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(E===!0)return;const q=me.enabled===!0&&me.isPresenting===!0,W=F!==null&&(B===null||q)&&F.begin(x,B);if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),me.enabled===!0&&me.isPresenting===!0&&(F===null||F.isCompositing()===!1)&&(me.cameraAutoUpdate===!0&&me.updateCamera(N),N=me.getCamera()),S.isScene===!0&&S.onBeforeRender(x,S,N,B),R=pe.get(S,L.length),R.init(N),L.push(R),w.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),ze.setFromProjectionMatrix(w,bn,N.reversedDepth),$e=this.localClippingEnabled,Re=xe.init(this.clippingPlanes,$e),b=le.get(S,C.length),b.init(),C.push(b),me.enabled===!0&&me.isPresenting===!0){const Ce=x.xr.getDepthSensingMesh();Ce!==null&&vo(Ce,N,-1/0,x.sortObjects)}vo(S,N,0,x.sortObjects),b.finish(),x.sortObjects===!0&&b.sort(pt,lt),Y=me.enabled===!1||me.isPresenting===!1||me.hasDepthSensing()===!1,Y&&he.addToRenderList(b,S),this.info.render.frame++,Re===!0&&xe.beginShadows();const O=R.state.shadowsArray;if(Te.render(O,S,N),Re===!0&&xe.endShadows(),this.info.autoReset===!0&&this.info.reset(),(W&&F.hasRenderPass())===!1){const Ce=b.opaque,Ee=b.transmissive;if(R.setupLights(),N.isArrayCamera){const Pe=N.cameras;if(Ee.length>0)for(let Le=0,Oe=Pe.length;Le<Oe;Le++){const Ue=Pe[Le];uc(Ce,Ee,S,Ue)}Y&&he.render(S);for(let Le=0,Oe=Pe.length;Le<Oe;Le++){const Ue=Pe[Le];cc(b,S,Ue,Ue.viewport)}}else Ee.length>0&&uc(Ce,Ee,S,N),Y&&he.render(S),cc(b,S,N)}B!==null&&j===0&&(P.updateMultisampleRenderTarget(B),P.updateRenderTargetMipmap(B)),W&&F.end(x),S.isScene===!0&&S.onAfterRender(x,S,N),Ae.resetDefaultState(),Z=-1,ne=null,L.pop(),L.length>0?(R=L[L.length-1],Re===!0&&xe.setGlobalState(x.clippingPlanes,R.state.camera)):R=null,C.pop(),C.length>0?b=C[C.length-1]:b=null};function vo(S,N,q,W){if(S.visible===!1)return;if(S.layers.test(N.layers)){if(S.isGroup)q=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(N);else if(S.isLight)R.pushLight(S),S.castShadow&&R.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||ze.intersectsSprite(S)){W&&V.setFromMatrixPosition(S.matrixWorld).applyMatrix4(w);const Ce=ce.update(S),Ee=S.material;Ee.visible&&b.push(S,Ce,Ee,q,V.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||ze.intersectsObject(S))){const Ce=ce.update(S),Ee=S.material;if(W&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),V.copy(S.boundingSphere.center)):(Ce.boundingSphere===null&&Ce.computeBoundingSphere(),V.copy(Ce.boundingSphere.center)),V.applyMatrix4(S.matrixWorld).applyMatrix4(w)),Array.isArray(Ee)){const Pe=Ce.groups;for(let Le=0,Oe=Pe.length;Le<Oe;Le++){const Ue=Pe[Le],je=Ee[Ue.materialIndex];je&&je.visible&&b.push(S,Ce,je,q,V.z,Ue)}}else Ee.visible&&b.push(S,Ce,Ee,q,V.z,null)}}const ve=S.children;for(let Ce=0,Ee=ve.length;Ce<Ee;Ce++)vo(ve[Ce],N,q,W)}function cc(S,N,q,W){const{opaque:O,transmissive:ve,transparent:Ce}=S;R.setupLightsView(q),Re===!0&&xe.setGlobalState(x.clippingPlanes,q),W&&se.viewport(X.copy(W)),O.length>0&&fr(O,N,q),ve.length>0&&fr(ve,N,q),Ce.length>0&&fr(Ce,N,q),se.buffers.depth.setTest(!0),se.buffers.depth.setMask(!0),se.buffers.color.setMask(!0),se.setPolygonOffset(!1)}function uc(S,N,q,W){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(R.state.transmissionRenderTarget[W.id]===void 0){const je=ie.has("EXT_color_buffer_half_float")||ie.has("EXT_color_buffer_float");R.state.transmissionRenderTarget[W.id]=new An(1,1,{generateMipmaps:!0,type:je?Kn:Jt,minFilter:Pi,samples:J.samples,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ze.workingColorSpace})}const ve=R.state.transmissionRenderTarget[W.id],Ce=W.viewport||X;ve.setSize(Ce.z*x.transmissionResolutionScale,Ce.w*x.transmissionResolutionScale);const Ee=x.getRenderTarget(),Pe=x.getActiveCubeFace(),Le=x.getActiveMipmapLevel();x.setRenderTarget(ve),x.getClearColor(_e),de=x.getClearAlpha(),de<1&&x.setClearColor(16777215,.5),x.clear(),Y&&he.render(q);const Oe=x.toneMapping;x.toneMapping=Tn;const Ue=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),R.setupLightsView(W),Re===!0&&xe.setGlobalState(x.clippingPlanes,W),fr(S,q,W),P.updateMultisampleRenderTarget(ve),P.updateRenderTargetMipmap(ve),ie.has("WEBGL_multisampled_render_to_texture")===!1){let je=!1;for(let ot=0,_t=N.length;ot<_t;ot++){const gt=N[ot],{object:ct,geometry:Ne,material:st,group:Je}=gt;if(st.side===Sn&&ct.layers.test(W.layers)){const Yt=st.side;st.side=qt,st.needsUpdate=!0,fc(ct,q,W,Ne,st,Je),st.side=Yt,st.needsUpdate=!0,je=!0}}je===!0&&(P.updateMultisampleRenderTarget(ve),P.updateRenderTargetMipmap(ve))}x.setRenderTarget(Ee,Pe,Le),x.setClearColor(_e,de),Ue!==void 0&&(W.viewport=Ue),x.toneMapping=Oe}function fr(S,N,q){const W=N.isScene===!0?N.overrideMaterial:null;for(let O=0,ve=S.length;O<ve;O++){const Ce=S[O],{object:Ee,geometry:Pe,group:Le}=Ce;let Oe=Ce.material;Oe.allowOverride===!0&&W!==null&&(Oe=W),Ee.layers.test(q.layers)&&fc(Ee,N,q,Pe,Oe,Le)}}function fc(S,N,q,W,O,ve){S.onBeforeRender(x,N,q,W,O,ve),S.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),O.onBeforeRender(x,N,q,W,S,ve),O.transparent===!0&&O.side===Sn&&O.forceSinglePass===!1?(O.side=qt,O.needsUpdate=!0,x.renderBufferDirect(q,N,W,O,S,ve),O.side=mi,O.needsUpdate=!0,x.renderBufferDirect(q,N,W,O,S,ve),O.side=Sn):x.renderBufferDirect(q,N,W,O,S,ve),S.onAfterRender(x,N,q,W,O,ve)}function hr(S,N,q){N.isScene!==!0&&(N=Q);const W=p.get(S),O=R.state.lights,ve=R.state.shadowsArray,Ce=O.state.version,Ee=ye.getParameters(S,O.state,ve,N,q),Pe=ye.getProgramCacheKey(Ee);let Le=W.programs;W.environment=S.isMeshStandardMaterial?N.environment:null,W.fog=N.fog,W.envMap=(S.isMeshStandardMaterial?K:G).get(S.envMap||W.environment),W.envMapRotation=W.environment!==null&&S.envMap===null?N.environmentRotation:S.envMapRotation,Le===void 0&&(S.addEventListener("dispose",dn),Le=new Map,W.programs=Le);let Oe=Le.get(Pe);if(Oe!==void 0){if(W.currentProgram===Oe&&W.lightsStateVersion===Ce)return dc(S,Ee),Oe}else Ee.uniforms=ye.getUniforms(S),S.onBeforeCompile(Ee,x),Oe=ye.acquireProgram(Ee,Pe),Le.set(Pe,Oe),W.uniforms=Ee.uniforms;const Ue=W.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Ue.clippingPlanes=xe.uniform),dc(S,Ee),W.needsLights=Wh(S),W.lightsStateVersion=Ce,W.needsLights&&(Ue.ambientLightColor.value=O.state.ambient,Ue.lightProbe.value=O.state.probe,Ue.directionalLights.value=O.state.directional,Ue.directionalLightShadows.value=O.state.directionalShadow,Ue.spotLights.value=O.state.spot,Ue.spotLightShadows.value=O.state.spotShadow,Ue.rectAreaLights.value=O.state.rectArea,Ue.ltc_1.value=O.state.rectAreaLTC1,Ue.ltc_2.value=O.state.rectAreaLTC2,Ue.pointLights.value=O.state.point,Ue.pointLightShadows.value=O.state.pointShadow,Ue.hemisphereLights.value=O.state.hemi,Ue.directionalShadowMap.value=O.state.directionalShadowMap,Ue.directionalShadowMatrix.value=O.state.directionalShadowMatrix,Ue.spotShadowMap.value=O.state.spotShadowMap,Ue.spotLightMatrix.value=O.state.spotLightMatrix,Ue.spotLightMap.value=O.state.spotLightMap,Ue.pointShadowMap.value=O.state.pointShadowMap,Ue.pointShadowMatrix.value=O.state.pointShadowMatrix),W.currentProgram=Oe,W.uniformsList=null,Oe}function hc(S){if(S.uniformsList===null){const N=S.currentProgram.getUniforms();S.uniformsList=jr.seqWithValue(N.seq,S.uniforms)}return S.uniformsList}function dc(S,N){const q=p.get(S);q.outputColorSpace=N.outputColorSpace,q.batching=N.batching,q.batchingColor=N.batchingColor,q.instancing=N.instancing,q.instancingColor=N.instancingColor,q.instancingMorph=N.instancingMorph,q.skinning=N.skinning,q.morphTargets=N.morphTargets,q.morphNormals=N.morphNormals,q.morphColors=N.morphColors,q.morphTargetsCount=N.morphTargetsCount,q.numClippingPlanes=N.numClippingPlanes,q.numIntersection=N.numClipIntersection,q.vertexAlphas=N.vertexAlphas,q.vertexTangents=N.vertexTangents,q.toneMapping=N.toneMapping}function Gh(S,N,q,W,O){N.isScene!==!0&&(N=Q),P.resetTextureUnits();const ve=N.fog,Ce=W.isMeshStandardMaterial?N.environment:null,Ee=B===null?x.outputColorSpace:B.isXRRenderTarget===!0?B.texture.colorSpace:gs,Pe=(W.isMeshStandardMaterial?K:G).get(W.envMap||Ce),Le=W.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,Oe=!!q.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),Ue=!!q.morphAttributes.position,je=!!q.morphAttributes.normal,ot=!!q.morphAttributes.color;let _t=Tn;W.toneMapped&&(B===null||B.isXRRenderTarget===!0)&&(_t=x.toneMapping);const gt=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,ct=gt!==void 0?gt.length:0,Ne=p.get(W),st=R.state.lights;if(Re===!0&&($e===!0||S!==ne)){const Nt=S===ne&&W.id===Z;xe.setState(W,S,Nt)}let Je=!1;W.version===Ne.__version?(Ne.needsLights&&Ne.lightsStateVersion!==st.state.version||Ne.outputColorSpace!==Ee||O.isBatchedMesh&&Ne.batching===!1||!O.isBatchedMesh&&Ne.batching===!0||O.isBatchedMesh&&Ne.batchingColor===!0&&O.colorTexture===null||O.isBatchedMesh&&Ne.batchingColor===!1&&O.colorTexture!==null||O.isInstancedMesh&&Ne.instancing===!1||!O.isInstancedMesh&&Ne.instancing===!0||O.isSkinnedMesh&&Ne.skinning===!1||!O.isSkinnedMesh&&Ne.skinning===!0||O.isInstancedMesh&&Ne.instancingColor===!0&&O.instanceColor===null||O.isInstancedMesh&&Ne.instancingColor===!1&&O.instanceColor!==null||O.isInstancedMesh&&Ne.instancingMorph===!0&&O.morphTexture===null||O.isInstancedMesh&&Ne.instancingMorph===!1&&O.morphTexture!==null||Ne.envMap!==Pe||W.fog===!0&&Ne.fog!==ve||Ne.numClippingPlanes!==void 0&&(Ne.numClippingPlanes!==xe.numPlanes||Ne.numIntersection!==xe.numIntersection)||Ne.vertexAlphas!==Le||Ne.vertexTangents!==Oe||Ne.morphTargets!==Ue||Ne.morphNormals!==je||Ne.morphColors!==ot||Ne.toneMapping!==_t||Ne.morphTargetsCount!==ct)&&(Je=!0):(Je=!0,Ne.__version=W.version);let Yt=Ne.currentProgram;Je===!0&&(Yt=hr(W,N,O));let Bi=!1,jt=!1,Es=!1;const ft=Yt.getUniforms(),Ht=Ne.uniforms;if(se.useProgram(Yt.program)&&(Bi=!0,jt=!0,Es=!0),W.id!==Z&&(Z=W.id,jt=!0),Bi||ne!==S){se.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),ft.setValue(y,"projectionMatrix",S.projectionMatrix),ft.setValue(y,"viewMatrix",S.matrixWorldInverse);const Gt=ft.map.cameraPosition;Gt!==void 0&&Gt.setValue(y,D.setFromMatrixPosition(S.matrixWorld)),J.logarithmicDepthBuffer&&ft.setValue(y,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&ft.setValue(y,"isOrthographic",S.isOrthographicCamera===!0),ne!==S&&(ne=S,jt=!0,Es=!0)}if(Ne.needsLights&&(st.state.directionalShadowMap.length>0&&ft.setValue(y,"directionalShadowMap",st.state.directionalShadowMap,P),st.state.spotShadowMap.length>0&&ft.setValue(y,"spotShadowMap",st.state.spotShadowMap,P),st.state.pointShadowMap.length>0&&ft.setValue(y,"pointShadowMap",st.state.pointShadowMap,P)),O.isSkinnedMesh){ft.setOptional(y,O,"bindMatrix"),ft.setOptional(y,O,"bindMatrixInverse");const Nt=O.skeleton;Nt&&(Nt.boneTexture===null&&Nt.computeBoneTexture(),ft.setValue(y,"boneTexture",Nt.boneTexture,P))}O.isBatchedMesh&&(ft.setOptional(y,O,"batchingTexture"),ft.setValue(y,"batchingTexture",O._matricesTexture,P),ft.setOptional(y,O,"batchingIdTexture"),ft.setValue(y,"batchingIdTexture",O._indirectTexture,P),ft.setOptional(y,O,"batchingColorTexture"),O._colorsTexture!==null&&ft.setValue(y,"batchingColorTexture",O._colorsTexture,P));const en=q.morphAttributes;if((en.position!==void 0||en.normal!==void 0||en.color!==void 0)&&Ge.update(O,q,Yt),(jt||Ne.receiveShadow!==O.receiveShadow)&&(Ne.receiveShadow=O.receiveShadow,ft.setValue(y,"receiveShadow",O.receiveShadow)),W.isMeshGouraudMaterial&&W.envMap!==null&&(Ht.envMap.value=Pe,Ht.flipEnvMap.value=Pe.isCubeTexture&&Pe.isRenderTargetTexture===!1?-1:1),W.isMeshStandardMaterial&&W.envMap===null&&N.environment!==null&&(Ht.envMapIntensity.value=N.environmentIntensity),Ht.dfgLUT!==void 0&&(Ht.dfgLUT.value=IS()),jt&&(ft.setValue(y,"toneMappingExposure",x.toneMappingExposure),Ne.needsLights&&kh(Ht,Es),ve&&W.fog===!0&&De.refreshFogUniforms(Ht,ve),De.refreshMaterialUniforms(Ht,W,He,Fe,R.state.transmissionRenderTarget[S.id]),jr.upload(y,hc(Ne),Ht,P)),W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(jr.upload(y,hc(Ne),Ht,P),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&ft.setValue(y,"center",O.center),ft.setValue(y,"modelViewMatrix",O.modelViewMatrix),ft.setValue(y,"normalMatrix",O.normalMatrix),ft.setValue(y,"modelMatrix",O.matrixWorld),W.isShaderMaterial||W.isRawShaderMaterial){const Nt=W.uniformsGroups;for(let Gt=0,So=Nt.length;Gt<So;Gt++){const xi=Nt[Gt];ue.update(xi,Yt),ue.bind(xi,Yt)}}return Yt}function kh(S,N){S.ambientLightColor.needsUpdate=N,S.lightProbe.needsUpdate=N,S.directionalLights.needsUpdate=N,S.directionalLightShadows.needsUpdate=N,S.pointLights.needsUpdate=N,S.pointLightShadows.needsUpdate=N,S.spotLights.needsUpdate=N,S.spotLightShadows.needsUpdate=N,S.rectAreaLights.needsUpdate=N,S.hemisphereLights.needsUpdate=N}function Wh(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return I},this.getActiveMipmapLevel=function(){return j},this.getRenderTarget=function(){return B},this.setRenderTargetTextures=function(S,N,q){const W=p.get(S);W.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,W.__autoAllocateDepthBuffer===!1&&(W.__useRenderToTexture=!1),p.get(S.texture).__webglTexture=N,p.get(S.depthTexture).__webglTexture=W.__autoAllocateDepthBuffer?void 0:q,W.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,N){const q=p.get(S);q.__webglFramebuffer=N,q.__useDefaultFramebuffer=N===void 0};const Xh=y.createFramebuffer();this.setRenderTarget=function(S,N=0,q=0){B=S,I=N,j=q;let W=null,O=!1,ve=!1;if(S){const Ee=p.get(S);if(Ee.__useDefaultFramebuffer!==void 0){se.bindFramebuffer(y.FRAMEBUFFER,Ee.__webglFramebuffer),X.copy(S.viewport),k.copy(S.scissor),$=S.scissorTest,se.viewport(X),se.scissor(k),se.setScissorTest($),Z=-1;return}else if(Ee.__webglFramebuffer===void 0)P.setupRenderTarget(S);else if(Ee.__hasExternalTextures)P.rebindTextures(S,p.get(S.texture).__webglTexture,p.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){const Oe=S.depthTexture;if(Ee.__boundDepthTexture!==Oe){if(Oe!==null&&p.has(Oe)&&(S.width!==Oe.image.width||S.height!==Oe.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");P.setupDepthRenderbuffer(S)}}const Pe=S.texture;(Pe.isData3DTexture||Pe.isDataArrayTexture||Pe.isCompressedArrayTexture)&&(ve=!0);const Le=p.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Le[N])?W=Le[N][q]:W=Le[N],O=!0):S.samples>0&&P.useMultisampledRTT(S)===!1?W=p.get(S).__webglMultisampledFramebuffer:Array.isArray(Le)?W=Le[q]:W=Le,X.copy(S.viewport),k.copy(S.scissor),$=S.scissorTest}else X.copy(ee).multiplyScalar(He).floor(),k.copy(oe).multiplyScalar(He).floor(),$=we;if(q!==0&&(W=Xh),se.bindFramebuffer(y.FRAMEBUFFER,W)&&se.drawBuffers(S,W),se.viewport(X),se.scissor(k),se.setScissorTest($),O){const Ee=p.get(S.texture);y.framebufferTexture2D(y.FRAMEBUFFER,y.COLOR_ATTACHMENT0,y.TEXTURE_CUBE_MAP_POSITIVE_X+N,Ee.__webglTexture,q)}else if(ve){const Ee=N;for(let Pe=0;Pe<S.textures.length;Pe++){const Le=p.get(S.textures[Pe]);y.framebufferTextureLayer(y.FRAMEBUFFER,y.COLOR_ATTACHMENT0+Pe,Le.__webglTexture,q,Ee)}}else if(S!==null&&q!==0){const Ee=p.get(S.texture);y.framebufferTexture2D(y.FRAMEBUFFER,y.COLOR_ATTACHMENT0,y.TEXTURE_2D,Ee.__webglTexture,q)}Z=-1},this.readRenderTargetPixels=function(S,N,q,W,O,ve,Ce,Ee=0){if(!(S&&S.isWebGLRenderTarget)){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Pe=p.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Ce!==void 0&&(Pe=Pe[Ce]),Pe){se.bindFramebuffer(y.FRAMEBUFFER,Pe);try{const Le=S.textures[Ee],Oe=Le.format,Ue=Le.type;if(!J.textureFormatReadable(Oe)){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!J.textureTypeReadable(Ue)){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=S.width-W&&q>=0&&q<=S.height-O&&(S.textures.length>1&&y.readBuffer(y.COLOR_ATTACHMENT0+Ee),y.readPixels(N,q,W,O,fe.convert(Oe),fe.convert(Ue),ve))}finally{const Le=B!==null?p.get(B).__webglFramebuffer:null;se.bindFramebuffer(y.FRAMEBUFFER,Le)}}},this.readRenderTargetPixelsAsync=async function(S,N,q,W,O,ve,Ce,Ee=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Pe=p.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Ce!==void 0&&(Pe=Pe[Ce]),Pe)if(N>=0&&N<=S.width-W&&q>=0&&q<=S.height-O){se.bindFramebuffer(y.FRAMEBUFFER,Pe);const Le=S.textures[Ee],Oe=Le.format,Ue=Le.type;if(!J.textureFormatReadable(Oe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!J.textureTypeReadable(Ue))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const je=y.createBuffer();y.bindBuffer(y.PIXEL_PACK_BUFFER,je),y.bufferData(y.PIXEL_PACK_BUFFER,ve.byteLength,y.STREAM_READ),S.textures.length>1&&y.readBuffer(y.COLOR_ATTACHMENT0+Ee),y.readPixels(N,q,W,O,fe.convert(Oe),fe.convert(Ue),0);const ot=B!==null?p.get(B).__webglFramebuffer:null;se.bindFramebuffer(y.FRAMEBUFFER,ot);const _t=y.fenceSync(y.SYNC_GPU_COMMANDS_COMPLETE,0);return y.flush(),await Zm(y,_t,4),y.bindBuffer(y.PIXEL_PACK_BUFFER,je),y.getBufferSubData(y.PIXEL_PACK_BUFFER,0,ve),y.deleteBuffer(je),y.deleteSync(_t),ve}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,N=null,q=0){const W=Math.pow(2,-q),O=Math.floor(S.image.width*W),ve=Math.floor(S.image.height*W),Ce=N!==null?N.x:0,Ee=N!==null?N.y:0;P.setTexture2D(S,0),y.copyTexSubImage2D(y.TEXTURE_2D,q,0,0,Ce,Ee,O,ve),se.unbindTexture()};const qh=y.createFramebuffer(),Yh=y.createFramebuffer();this.copyTextureToTexture=function(S,N,q=null,W=null,O=0,ve=null){ve===null&&(O!==0?(nr("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ve=O,O=0):ve=0);let Ce,Ee,Pe,Le,Oe,Ue,je,ot,_t;const gt=S.isCompressedTexture?S.mipmaps[ve]:S.image;if(q!==null)Ce=q.max.x-q.min.x,Ee=q.max.y-q.min.y,Pe=q.isBox3?q.max.z-q.min.z:1,Le=q.min.x,Oe=q.min.y,Ue=q.isBox3?q.min.z:0;else{const en=Math.pow(2,-O);Ce=Math.floor(gt.width*en),Ee=Math.floor(gt.height*en),S.isDataArrayTexture?Pe=gt.depth:S.isData3DTexture?Pe=Math.floor(gt.depth*en):Pe=1,Le=0,Oe=0,Ue=0}W!==null?(je=W.x,ot=W.y,_t=W.z):(je=0,ot=0,_t=0);const ct=fe.convert(N.format),Ne=fe.convert(N.type);let st;N.isData3DTexture?(P.setTexture3D(N,0),st=y.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(P.setTexture2DArray(N,0),st=y.TEXTURE_2D_ARRAY):(P.setTexture2D(N,0),st=y.TEXTURE_2D),y.pixelStorei(y.UNPACK_FLIP_Y_WEBGL,N.flipY),y.pixelStorei(y.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),y.pixelStorei(y.UNPACK_ALIGNMENT,N.unpackAlignment);const Je=y.getParameter(y.UNPACK_ROW_LENGTH),Yt=y.getParameter(y.UNPACK_IMAGE_HEIGHT),Bi=y.getParameter(y.UNPACK_SKIP_PIXELS),jt=y.getParameter(y.UNPACK_SKIP_ROWS),Es=y.getParameter(y.UNPACK_SKIP_IMAGES);y.pixelStorei(y.UNPACK_ROW_LENGTH,gt.width),y.pixelStorei(y.UNPACK_IMAGE_HEIGHT,gt.height),y.pixelStorei(y.UNPACK_SKIP_PIXELS,Le),y.pixelStorei(y.UNPACK_SKIP_ROWS,Oe),y.pixelStorei(y.UNPACK_SKIP_IMAGES,Ue);const ft=S.isDataArrayTexture||S.isData3DTexture,Ht=N.isDataArrayTexture||N.isData3DTexture;if(S.isDepthTexture){const en=p.get(S),Nt=p.get(N),Gt=p.get(en.__renderTarget),So=p.get(Nt.__renderTarget);se.bindFramebuffer(y.READ_FRAMEBUFFER,Gt.__webglFramebuffer),se.bindFramebuffer(y.DRAW_FRAMEBUFFER,So.__webglFramebuffer);for(let xi=0;xi<Pe;xi++)ft&&(y.framebufferTextureLayer(y.READ_FRAMEBUFFER,y.COLOR_ATTACHMENT0,p.get(S).__webglTexture,O,Ue+xi),y.framebufferTextureLayer(y.DRAW_FRAMEBUFFER,y.COLOR_ATTACHMENT0,p.get(N).__webglTexture,ve,_t+xi)),y.blitFramebuffer(Le,Oe,Ce,Ee,je,ot,Ce,Ee,y.DEPTH_BUFFER_BIT,y.NEAREST);se.bindFramebuffer(y.READ_FRAMEBUFFER,null),se.bindFramebuffer(y.DRAW_FRAMEBUFFER,null)}else if(O!==0||S.isRenderTargetTexture||p.has(S)){const en=p.get(S),Nt=p.get(N);se.bindFramebuffer(y.READ_FRAMEBUFFER,qh),se.bindFramebuffer(y.DRAW_FRAMEBUFFER,Yh);for(let Gt=0;Gt<Pe;Gt++)ft?y.framebufferTextureLayer(y.READ_FRAMEBUFFER,y.COLOR_ATTACHMENT0,en.__webglTexture,O,Ue+Gt):y.framebufferTexture2D(y.READ_FRAMEBUFFER,y.COLOR_ATTACHMENT0,y.TEXTURE_2D,en.__webglTexture,O),Ht?y.framebufferTextureLayer(y.DRAW_FRAMEBUFFER,y.COLOR_ATTACHMENT0,Nt.__webglTexture,ve,_t+Gt):y.framebufferTexture2D(y.DRAW_FRAMEBUFFER,y.COLOR_ATTACHMENT0,y.TEXTURE_2D,Nt.__webglTexture,ve),O!==0?y.blitFramebuffer(Le,Oe,Ce,Ee,je,ot,Ce,Ee,y.COLOR_BUFFER_BIT,y.NEAREST):Ht?y.copyTexSubImage3D(st,ve,je,ot,_t+Gt,Le,Oe,Ce,Ee):y.copyTexSubImage2D(st,ve,je,ot,Le,Oe,Ce,Ee);se.bindFramebuffer(y.READ_FRAMEBUFFER,null),se.bindFramebuffer(y.DRAW_FRAMEBUFFER,null)}else Ht?S.isDataTexture||S.isData3DTexture?y.texSubImage3D(st,ve,je,ot,_t,Ce,Ee,Pe,ct,Ne,gt.data):N.isCompressedArrayTexture?y.compressedTexSubImage3D(st,ve,je,ot,_t,Ce,Ee,Pe,ct,gt.data):y.texSubImage3D(st,ve,je,ot,_t,Ce,Ee,Pe,ct,Ne,gt):S.isDataTexture?y.texSubImage2D(y.TEXTURE_2D,ve,je,ot,Ce,Ee,ct,Ne,gt.data):S.isCompressedTexture?y.compressedTexSubImage2D(y.TEXTURE_2D,ve,je,ot,gt.width,gt.height,ct,gt.data):y.texSubImage2D(y.TEXTURE_2D,ve,je,ot,Ce,Ee,ct,Ne,gt);y.pixelStorei(y.UNPACK_ROW_LENGTH,Je),y.pixelStorei(y.UNPACK_IMAGE_HEIGHT,Yt),y.pixelStorei(y.UNPACK_SKIP_PIXELS,Bi),y.pixelStorei(y.UNPACK_SKIP_ROWS,jt),y.pixelStorei(y.UNPACK_SKIP_IMAGES,Es),ve===0&&N.generateMipmaps&&y.generateMipmap(st),se.unbindTexture()},this.initRenderTarget=function(S){p.get(S).__webglFramebuffer===void 0&&P.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?P.setTextureCube(S,0):S.isData3DTexture?P.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?P.setTexture2DArray(S,0):P.setTexture2D(S,0),se.unbindTexture()},this.resetState=function(){I=0,j=0,B=null,se.reset(),Ae.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return bn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Ze._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ze._getUnpackColorSpace()}}const Vu={type:"change"},sc={type:"start"},Uh={type:"end"},Or=new gh,Hu=new li,NS=Math.cos(70*Qm.DEG2RAD),Mt=new H,Wt=2*Math.PI,at={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},ca=1e-6;class FS extends B_{constructor(e,t=null){super(e,t),this.state=at.NONE,this.target=new H,this.cursor=new H,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:cs.ROTATE,MIDDLE:cs.DOLLY,RIGHT:cs.PAN},this.touches={ONE:ns.ROTATE,TWO:ns.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new H,this._lastQuaternion=new Ui,this._lastTargetPosition=new H,this._quat=new Ui().setFromUnitVectors(e.up,new H(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new mu,this._sphericalDelta=new mu,this._scale=1,this._panOffset=new H,this._rotateStart=new ke,this._rotateEnd=new ke,this._rotateDelta=new ke,this._panStart=new ke,this._panEnd=new ke,this._panDelta=new ke,this._dollyStart=new ke,this._dollyEnd=new ke,this._dollyDelta=new ke,this._dollyDirection=new H,this._mouse=new ke,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=BS.bind(this),this._onPointerDown=OS.bind(this),this._onPointerUp=zS.bind(this),this._onContextMenu=qS.bind(this),this._onMouseWheel=GS.bind(this),this._onKeyDown=kS.bind(this),this._onTouchStart=WS.bind(this),this._onTouchMove=XS.bind(this),this._onMouseDown=VS.bind(this),this._onMouseMove=HS.bind(this),this._interceptControlDown=YS.bind(this),this._interceptControlUp=jS.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Vu),this.update(),this.state=at.NONE}update(e=null){const t=this.object.position;Mt.copy(t).sub(this.target),Mt.applyQuaternion(this._quat),this._spherical.setFromVector3(Mt),this.autoRotate&&this.state===at.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=Wt:i>Math.PI&&(i-=Wt),s<-Math.PI?s+=Wt:s>Math.PI&&(s-=Wt),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Mt.setFromSpherical(this._spherical),Mt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Mt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){const a=Mt.length();o=this._clampDistance(a*this._scale);const l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){const a=new H(this._mouse.x,this._mouse.y,0);a.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;const c=new H(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=Mt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(Or.origin.copy(this.object.position),Or.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Or.direction))<NS?this.object.lookAt(this.target):(Hu.setFromNormalAndCoplanarPoint(this.object.up,this.target),Or.intersectPlane(Hu,this.target))))}else if(this.object.isOrthographicCamera){const o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>ca||8*(1-this._lastQuaternion.dot(this.object.quaternion))>ca||this._lastTargetPosition.distanceToSquared(this.target)>ca?(this.dispatchEvent(Vu),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?Wt/60*this.autoRotateSpeed*e:Wt/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Mt.setFromMatrixColumn(t,0),Mt.multiplyScalar(-e),this._panOffset.add(Mt)}_panUp(e,t){this.screenSpacePanning===!0?Mt.setFromMatrixColumn(t,1):(Mt.setFromMatrixColumn(t,0),Mt.crossVectors(this.object.up,Mt)),Mt.multiplyScalar(e),this._panOffset.add(Mt)}_pan(e,t){const i=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;Mt.copy(s).sub(this.target);let r=Mt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/i.clientHeight,this.object.matrix),this._panUp(2*t*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const i=this.domElement.getBoundingClientRect(),s=e-i.left,r=t-i.top,o=i.width,a=i.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(Wt*this._rotateDelta.x/t.clientHeight),this._rotateUp(Wt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(Wt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-Wt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(Wt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-Wt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(i,s)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const i=this._getSecondPointerPosition(e),s=.5*(e.pageX+i.x),r=.5*(e.pageY+i.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(Wt*this._rotateDelta.x/t.clientHeight),this._rotateUp(Wt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new ke,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}}function OS(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n)))}function BS(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function zS(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Uh),this.state=at.NONE;break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function VS(n){let e;switch(n.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case cs.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=at.DOLLY;break;case cs.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=at.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=at.ROTATE}break;case cs.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=at.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=at.PAN}break;default:this.state=at.NONE}this.state!==at.NONE&&this.dispatchEvent(sc)}function HS(n){switch(this.state){case at.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case at.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case at.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function GS(n){this.enabled===!1||this.enableZoom===!1||this.state!==at.NONE||(n.preventDefault(),this.dispatchEvent(sc),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(Uh))}function kS(n){this.enabled!==!1&&this._handleKeyDown(n)}function WS(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case ns.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=at.TOUCH_ROTATE;break;case ns.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=at.TOUCH_PAN;break;default:this.state=at.NONE}break;case 2:switch(this.touches.TWO){case ns.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=at.TOUCH_DOLLY_PAN;break;case ns.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=at.TOUCH_DOLLY_ROTATE;break;default:this.state=at.NONE}break;default:this.state=at.NONE}this.state!==at.NONE&&this.dispatchEvent(sc)}function XS(n){switch(this._trackPointer(n),this.state){case at.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case at.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case at.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case at.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=at.NONE}}function qS(n){this.enabled!==!1&&n.preventDefault()}function YS(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function jS(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}const KS="modulepreload",$S=function(n){return"/oxscape/"+n},Gu={},ZS=function(e,t,i){let s=Promise.resolve();if(t&&t.length>0){let l=function(c){return Promise.all(c.map(u=>Promise.resolve(u).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),a=o?.nonce||o?.getAttribute("nonce");s=l(t.map(c=>{if(c=$S(c),c in Gu)return;Gu[c]=!0;const u=c.endsWith(".css"),f=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${f}`))return;const h=document.createElement("link");if(h.rel=u?"stylesheet":KS,u||(h.as="script"),h.crossOrigin="",h.href=c,a&&h.setAttribute("nonce",a),document.head.appendChild(h),u)return new Promise((m,g)=>{h.addEventListener("load",m),h.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${c}`)))})}))}function r(o){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=o,window.dispatchEvent(a),!a.defaultPrevented)throw o}return s.then(o=>{for(const a of o||[])a.status==="rejected"&&r(a.reason);return e().catch(r)})};function Nh(n,e){return new Promise(t=>{n.addEventListener("message",function i({data:s}){s?.type===e&&(n.removeEventListener("message",i),t(s))})})}Nh(self,"wasm_bindgen_worker_init").then(async({init:n,receiver:e})=>{const t=await ZS(()=>Promise.resolve().then(()=>hM),void 0);await t.default(n),postMessage({type:"wasm_bindgen_worker_ready"}),t.wbg_rayon_start_worker(e)});async function JS(n,e,t){if(t.numThreads()===0)throw new Error("num_threads must be > 0.");const i={type:"wasm_bindgen_worker_init",init:{module_or_path:n,memory:e},receiver:t.receiver()};await Promise.all(Array.from({length:t.numThreads()},async()=>{const s=new Worker(new URL("/oxscape/assets/workerHelpers-GFFM51r_.js",import.meta.url),{type:"module"});return s.postMessage(i),await Nh(s,"wasm_bindgen_worker_ready"),s})),t.build()}let Ie;function Fs(n){const e=Ie.__externref_table_alloc();return Ie.__wbindgen_externrefs.set(e,n),e}function QS(n,e){if(!(n instanceof e))throw new Error(`expected instance of ${e.name}`)}function eM(n,e){return n=n>>>0,nM().subarray(n/8,n/8+e)}function tM(n,e){return n=n>>>0,iM().subarray(n/4,n/4+e)}let Os=null;function nM(){return(Os===null||Os.buffer!==Ie.memory.buffer)&&(Os=new Float64Array(Ie.memory.buffer)),Os}function ua(n,e){return n=n>>>0,aM(n,e)}let Bs=null;function iM(){return(Bs===null||Bs.buffer!==Ie.memory.buffer)&&(Bs=new Uint32Array(Ie.memory.buffer)),Bs}let zs=null;function sM(){return(zs===null||zs.buffer!==Ie.memory.buffer)&&(zs=new Uint8Array(Ie.memory.buffer)),zs}function rM(n,e){try{return n.apply(this,e)}catch(t){const i=Fs(t);Ie.__wbindgen_exn_store(i)}}function Br(n){return n==null}function fa(n){const e=Ie.__wbindgen_externrefs.get(n);return Ie.__externref_table_dealloc(n),e}let Ys=typeof TextDecoder<"u"?new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}):void 0;Ys&&Ys.decode();const oM=2146435072;let ha=0;function aM(n,e){return ha+=e,ha>=oM&&(Ys=new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}),Ys.decode(),ha=e),Ys.decode(sM().slice(n,n+e))}const ku=typeof FinalizationRegistry>"u"?{register:()=>{},unregister:()=>{}}:new FinalizationRegistry(n=>Ie.__wbg_params_free(n>>>0,1)),Wu=typeof FinalizationRegistry>"u"?{register:()=>{},unregister:()=>{}}:new FinalizationRegistry(n=>Ie.__wbg_simulation_free(n>>>0,1)),Xu=typeof FinalizationRegistry>"u"?{register:()=>{},unregister:()=>{}}:new FinalizationRegistry(n=>Ie.__wbg_wbg_rayon_poolbuilder_free(n>>>0,1));class Ni{static __wrap(e){e=e>>>0;const t=Object.create(Ni.prototype);return t.__wbg_ptr=e,ku.register(t,t.__wbg_ptr,t),t}__destroy_into_raw(){const e=this.__wbg_ptr;return this.__wbg_ptr=0,ku.unregister(this),e}free(){const e=this.__destroy_into_raw();Ie.__wbg_params_free(e,0)}get keq(){return Ie.__wbg_get_params_keq(this.__wbg_ptr)}set keq(e){Ie.__wbg_set_params_keq(this.__wbg_ptr,e)}get neq(){return Ie.__wbg_get_params_neq(this.__wbg_ptr)}set neq(e){Ie.__wbg_set_params_neq(this.__wbg_ptr,e)}get meq(){return Ie.__wbg_get_params_meq(this.__wbg_ptr)}set meq(e){Ie.__wbg_set_params_meq(this.__wbg_ptr,e)}get ueq(){return Ie.__wbg_get_params_ueq(this.__wbg_ptr)}set ueq(e){Ie.__wbg_set_params_ueq(this.__wbg_ptr,e)}get dt(){return Ie.__wbg_get_params_dt(this.__wbg_ptr)}set dt(e){Ie.__wbg_set_params_dt(this.__wbg_ptr,e)}get tol(){return Ie.__wbg_get_params_tol(this.__wbg_ptr)}set tol(e){Ie.__wbg_set_params_tol(this.__wbg_ptr,e)}get cell_area(){return Ie.__wbg_get_params_cell_area(this.__wbg_ptr)}set cell_area(e){Ie.__wbg_set_params_cell_area(this.__wbg_ptr,e)}}Symbol.dispose&&(Ni.prototype[Symbol.dispose]=Ni.prototype.free);class so{__destroy_into_raw(){const e=this.__wbg_ptr;return this.__wbg_ptr=0,Wu.unregister(this),e}free(){const e=this.__destroy_into_raw();Ie.__wbg_simulation_free(e,0)}random_dem(e){const t=Ie.simulation_random_dem(this.__wbg_ptr,e);if(t[1])throw fa(t[0])}set params(e){QS(e,Ni);var t=e.__destroy_into_raw();Ie.simulation_set_params(this.__wbg_ptr,t)}acc(){return Ie.simulation_acc(this.__wbg_ptr)}dem(){return Ie.simulation_dem(this.__wbg_ptr)}constructor(e,t,i){const s=Ie.simulation_new(e,t,i);if(s[2])throw fa(s[1]);return this.__wbg_ptr=s[0]>>>0,Wu.register(this,this.__wbg_ptr,this),this}step(){const e=Ie.simulation_step(this.__wbg_ptr);if(e[1])throw fa(e[0])}stack(){return Ie.simulation_stack(this.__wbg_ptr)}width(){return Ie.simulation_width(this.__wbg_ptr)>>>0}height(){return Ie.simulation_height(this.__wbg_ptr)>>>0}levels(){return Ie.simulation_levels(this.__wbg_ptr)}get params(){const e=Ie.simulation_params(this.__wbg_ptr);return Ni.__wrap(e)}switch(){Ie.simulation_switch(this.__wbg_ptr)}}Symbol.dispose&&(so.prototype[Symbol.dispose]=so.prototype.free);function Fh(n){return Ie.initThreadPool(n)}class vs{static __wrap(e){e=e>>>0;const t=Object.create(vs.prototype);return t.__wbg_ptr=e,Xu.register(t,t.__wbg_ptr,t),t}__destroy_into_raw(){const e=this.__wbg_ptr;return this.__wbg_ptr=0,Xu.unregister(this),e}free(){const e=this.__destroy_into_raw();Ie.__wbg_wbg_rayon_poolbuilder_free(e,0)}numThreads(){return Ie.wbg_rayon_poolbuilder_numThreads(this.__wbg_ptr)>>>0}build(){Ie.wbg_rayon_poolbuilder_build(this.__wbg_ptr)}receiver(){return Ie.wbg_rayon_poolbuilder_receiver(this.__wbg_ptr)>>>0}}Symbol.dispose&&(vs.prototype[Symbol.dispose]=vs.prototype.free);function lM(n){Ie.wbg_rayon_start_worker(n)}const cM=new Set(["basic","cors","default"]);async function uM(n,e){if(typeof Response=="function"&&n instanceof Response){if(typeof WebAssembly.instantiateStreaming=="function")try{return await WebAssembly.instantiateStreaming(n,e)}catch(i){if(n.ok&&cM.has(n.type)&&n.headers.get("Content-Type")!=="application/wasm")console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",i);else throw i}const t=await n.arrayBuffer();return await WebAssembly.instantiate(t,e)}else{const t=await WebAssembly.instantiate(n,e);return t instanceof WebAssembly.Instance?{instance:t,module:n}:t}}function Oh(n){const e={};return e.wbg={},e.wbg.__wbg___wbindgen_is_undefined_f6b95eab589e0269=function(t){return t===void 0},e.wbg.__wbg___wbindgen_memory_a342e963fbcabd68=function(){return Ie.memory},e.wbg.__wbg___wbindgen_module_967adef62ea6cbf8=function(){return go.__wbindgen_wasm_module},e.wbg.__wbg___wbindgen_throw_dd24417ed36fc46e=function(t,i){throw new Error(ua(t,i))},e.wbg.__wbg_call_abb4ff46ce38be40=function(){return rM(function(t,i){return t.call(i)},arguments)},e.wbg.__wbg_instanceof_Window_b5cf7783caa68180=function(t){let i;try{i=t instanceof Window}catch{i=!1}return i},e.wbg.__wbg_new_no_args_cb138f77cf6151ee=function(t,i){return new Function(ua(t,i))},e.wbg.__wbg_startWorkers_2ca11761e08ff5d5=function(t,i,s){return JS(t,i,vs.__wrap(s))},e.wbg.__wbg_static_accessor_GLOBAL_769e6b65d6557335=function(){const t=typeof global>"u"?null:global;return Br(t)?0:Fs(t)},e.wbg.__wbg_static_accessor_GLOBAL_THIS_60cf02db4de8e1c1=function(){const t=typeof globalThis>"u"?null:globalThis;return Br(t)?0:Fs(t)},e.wbg.__wbg_static_accessor_SELF_08f5a74c69739274=function(){const t=typeof self>"u"?null:self;return Br(t)?0:Fs(t)},e.wbg.__wbg_static_accessor_WINDOW_a8924b26aa92d024=function(){const t=typeof window>"u"?null:window;return Br(t)?0:Fs(t)},e.wbg.__wbindgen_cast_2241b6af4c4b2941=function(t,i){return ua(t,i)},e.wbg.__wbindgen_cast_4af8e60a922bcf35=function(t,i){return eM(t,i)},e.wbg.__wbindgen_cast_7c316abdc43840a3=function(t,i){return tM(t,i)},e.wbg.__wbindgen_init_externref_table=function(){const t=Ie.__wbindgen_externrefs,i=t.grow(4);t.set(0,void 0),t.set(i+0,void 0),t.set(i+1,null),t.set(i+2,!0),t.set(i+3,!1)},e.wbg.memory=n||new WebAssembly.Memory({initial:18,maximum:16384,shared:!0}),e}function Bh(n,e,t){if(Ie=n.exports,go.__wbindgen_wasm_module=e,Os=null,Bs=null,zs=null,typeof t<"u"&&(typeof t!="number"||t===0||t%65536!==0))throw"invalid stack size";return Ie.__wbindgen_start(t),Ie}function fM(n,e){if(Ie!==void 0)return Ie;let t;typeof n<"u"&&(Object.getPrototypeOf(n)===Object.prototype?{module:n,memory:e,thread_stack_size:t}=n:console.warn("using deprecated parameters for `initSync()`; pass a single object instead"));const i=Oh(e);n instanceof WebAssembly.Module||(n=new WebAssembly.Module(n));const s=new WebAssembly.Instance(n,i);return Bh(s,n,t)}async function go(n,e){if(Ie!==void 0)return Ie;let t;typeof n<"u"&&(Object.getPrototypeOf(n)===Object.prototype?{module_or_path:n,memory:e,thread_stack_size:t}=n:console.warn("using deprecated parameters for the initialization function; pass a single object instead")),typeof n>"u"&&(n=new URL("/oxscape/assets/oxscape_wasm_bg-Dwsmqfmz.wasm",import.meta.url));const i=Oh(e);(typeof n=="string"||typeof Request=="function"&&n instanceof Request||typeof URL=="function"&&n instanceof URL)&&(n=fetch(n));const{instance:s,module:r}=await uM(await n,i);return Bh(s,r,t)}const hM=Object.freeze(Object.defineProperty({__proto__:null,Params:Ni,Simulation:so,default:go,initSync:fM,initThreadPool:Fh,wbg_rayon_PoolBuilder:vs,wbg_rayon_start_worker:lM},Symbol.toStringTag,{value:"Module"})),Ls=Ss(!1),dM=Ss(!1),da=Ss(!0),qu=Ss(0),Yu=Ss(0);function zh(){function n(){Ls.value=!0}function e(){Ls.value=!1}function t(){Ls.value=!Ls.value}function i(){qu.value++}function s(){Yu.value++}function r(){da.value=!da.value}return{isPlaying:Ls,isInitialized:dM,mFlow:da,stepRequested:qu,resetRequested:Yu,play:n,pause:e,toggle:t,step:i,reset:s,switchMetric:r}}const pM=Ol({__name:"CanvasView",setup(n){const e=Ss(null),{isPlaying:t,stepRequested:i,resetRequested:s,isInitialized:r,mFlow:o}=zh();let a,l,c,u,f,h,m;function g(T){if(T<.2)return{r:0,g:T*2.5,b:.5-T};if(T<.5)return{r:.2,g:.6,b:.1};if(T<.8)return{r:.5,g:.35,b:.2};{const A=(T-.8)*5;return{r:.5+A*.5,g:.35+A*.65,b:.2+A*.8}}}as(i,()=>{a.step();const T=new Float32Array(a.dem());_(T,25),f.update(),l.render(c,u)}),as(s,()=>{a.random_dem(Math.floor(Math.random()*42))}),as(o,()=>{a.switch()});function M(T,A,b,R=50){const C=new ur(A,b,A-1,b-1),L=C.attributes.position.array;let F=1/0,x=-1/0;for(let B=0;B<T.length;B++)F=Math.min(F,T[B]),x=Math.max(x,T[B]);const E=new Float32Array(T.length*3);for(let B=0;B<T.length;B++){L[B*3+2]=T[B]*R;const Z=(T[B]-F)/(x-F),ne=g(Z);E[B*3]=ne.r,E[B*3+1]=ne.g,E[B*3+2]=ne.b}C.setAttribute("color",new hn(E,3)),C.computeVertexNormals();const I=new P_({vertexColors:!0,side:Sn,flatShading:!1}),j=new Pn(C,I);return j.rotation.x=-Math.PI/2,j}function _(T,A=1){if(!h)return;const b=h.geometry,R=b.attributes.position.array,C=b.attributes.color.array;let L=1/0,F=-1/0;for(let x=0;x<T.length;x++)L=Math.min(L,T[x]),F=Math.max(F,T[x]);for(let x=0;x<T.length;x++){R[x*3+2]=T[x]*A;const E=(T[x]-L)/(F-L),I=g(E);C[x*3]=I.r,C[x*3+1]=I.g,C[x*3+2]=I.b}b.attributes.position.needsUpdate=!0,b.attributes.color.needsUpdate=!0,b.computeVertexNormals()}Pf(async()=>{await go(),await Fh(navigator.hardwareConcurrency);const T=250,A=250;a=new so(T,A,Math.floor(Math.random()*42));let b=a.params;b.cell_area=1e4,b.ueq=2e-5,a.params=b,console.log(a.width(),a.height()),c=new b_,c.background=new et(8900331),u=new sn(60,e.value.clientWidth/e.value.clientHeight,.1,2e3),u.position.set(0,200,0),u.lookAt(0,0,0),l=new US({antialias:!0}),l.setSize(e.value.clientWidth,e.value.clientHeight),l.setPixelRatio(window.devicePixelRatio),e.value.appendChild(l.domElement),f=new FS(u,l.domElement),f.enableDamping=!0,f.dampingFactor=.05;const R=new F_(4210752,.6);c.add(R);const C=new N_(16777215,1);C.position.set(100,200,100),C.castShadow=!0,c.add(C);const L=new Float32Array(a.dem());h=M(L,T,A,50),c.add(h),r.value=!0,window.addEventListener("resize",d);function F(){if(t.value){a.step();const x=new Float32Array(a.dem());_(x,25),f.update()}l.render(c,u),m=requestAnimationFrame(F)}F()});function d(){!e.value||!u||!l||(u.aspect=e.value.clientWidth/e.value.clientHeight,u.updateProjectionMatrix(),l.setSize(e.value.clientWidth,e.value.clientHeight))}return Bl(()=>{window.removeEventListener("resize",d),cancelAnimationFrame(m),h&&(h.geometry.dispose(),h.material.dispose()),l&&l.dispose(),f&&f.dispose()}),(T,A)=>(Hl(),Gl("div",{class:"canvas-container",ref_key:"container",ref:e},null,512))}}),rc=(n,e)=>{const t=n.__vccOpts||n;for(const[i,s]of e)t[i]=s;return t},mM=rc(pM,[["__scopeId","data-v-b15e68f6"]]),_M={class:"controls"},gM=["disabled"],xM=["disabled"],vM=["disabled"],SM=["disabled"],MM=Ol({__name:"Controls",setup(n){const{isPlaying:e,isInitialized:t,mFlow:i,toggle:s,step:r,reset:o,switchMetric:a}=zh();return(l,c)=>(Hl(),Gl("div",_M,[ts("button",{onClick:c[0]||(c[0]=(...u)=>Ct(s)&&Ct(s)(...u)),disabled:!Ct(t)},pa(Ct(e)?"Pause":"Play"),9,gM),ts("button",{onClick:c[1]||(c[1]=(...u)=>Ct(r)&&Ct(r)(...u)),disabled:!Ct(t)||Ct(e)}," Step ",8,xM),ts("button",{onClick:c[2]||(c[2]=(...u)=>Ct(o)&&Ct(o)(...u)),disabled:!Ct(t)}," Reset ",8,vM),ts("button",{onClick:c[3]||(c[3]=(...u)=>Ct(a)&&Ct(a)(...u)),disabled:!Ct(t)},pa(Ct(i)?"Dinf":"D8"),9,SM)]))}}),EM=rc(MM,[["__scopeId","data-v-85d1f811"]]),bM={class:"app"},yM=Ol({__name:"App",setup(n){return(e,t)=>(Hl(),Gl("div",bM,[Gn(mM,{class:"canvas"}),Gn(EM,{class:"controls"})]))}}),TM=rc(yM,[["__scopeId","data-v-8e94c0aa"]]);mm(TM).mount("#app");
