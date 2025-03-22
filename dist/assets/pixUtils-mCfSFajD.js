import{a0 as gt}from"./index-PF3D36V0.js";import{a as ht}from"./addDays-Db2LM6jR.js";var O={},Ot=function(){return typeof Promise=="function"&&Promise.prototype&&Promise.prototype.then},Et={},N={};let it;const $t=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];N.getSymbolSize=function(t){if(!t)throw new Error('"version" cannot be null or undefined');if(t<1||t>40)throw new Error('"version" should be in range from 1 to 40');return t*4+17};N.getSymbolTotalCodewords=function(t){return $t[t]};N.getBCHDigit=function(e){let t=0;for(;e!==0;)t++,e>>>=1;return t};N.setToSJISFunction=function(t){if(typeof t!="function")throw new Error('"toSJISFunc" is not a valid function.');it=t};N.isKanjiModeEnabled=function(){return typeof it<"u"};N.toSJIS=function(t){return it(t)};var J={};(function(e){e.L={bit:1},e.M={bit:0},e.Q={bit:3},e.H={bit:2};function t(o){if(typeof o!="string")throw new Error("Param is not a string");switch(o.toLowerCase()){case"l":case"low":return e.L;case"m":case"medium":return e.M;case"q":case"quartile":return e.Q;case"h":case"high":return e.H;default:throw new Error("Unknown EC Level: "+o)}}e.isValid=function(r){return r&&typeof r.bit<"u"&&r.bit>=0&&r.bit<4},e.from=function(r,n){if(e.isValid(r))return r;try{return t(r)}catch{return n}}})(J);function pt(){this.buffer=[],this.length=0}pt.prototype={get:function(e){const t=Math.floor(e/8);return(this.buffer[t]>>>7-e%8&1)===1},put:function(e,t){for(let o=0;o<t;o++)this.putBit((e>>>t-o-1&1)===1)},getLengthInBits:function(){return this.length},putBit:function(e){const t=Math.floor(this.length/8);this.buffer.length<=t&&this.buffer.push(0),e&&(this.buffer[t]|=128>>>this.length%8),this.length++}};var kt=pt;function V(e){if(!e||e<1)throw new Error("BitMatrix size must be defined and greater than 0");this.size=e,this.data=new Uint8Array(e*e),this.reservedBit=new Uint8Array(e*e)}V.prototype.set=function(e,t,o,r){const n=e*this.size+t;this.data[n]=o,r&&(this.reservedBit[n]=!0)};V.prototype.get=function(e,t){return this.data[e*this.size+t]};V.prototype.xor=function(e,t,o){this.data[e*this.size+t]^=o};V.prototype.isReserved=function(e,t){return this.reservedBit[e*this.size+t]};var vt=V,yt={};(function(e){const t=N.getSymbolSize;e.getRowColCoords=function(r){if(r===1)return[];const n=Math.floor(r/7)+2,i=t(r),s=i===145?26:Math.ceil((i-13)/(2*n-2))*2,c=[i-7];for(let a=1;a<n-1;a++)c[a]=c[a-1]-s;return c.push(6),c.reverse()},e.getPositions=function(r){const n=[],i=e.getRowColCoords(r),s=i.length;for(let c=0;c<s;c++)for(let a=0;a<s;a++)c===0&&a===0||c===0&&a===s-1||c===s-1&&a===0||n.push([i[c],i[a]]);return n}})(yt);var At={};const Vt=N.getSymbolSize,Ct=7;At.getPositions=function(t){const o=Vt(t);return[[0,0],[o-Ct,0],[0,o-Ct]]};var Tt={};(function(e){e.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};const t={N1:3,N2:3,N3:40,N4:10};e.isValid=function(n){return n!=null&&n!==""&&!isNaN(n)&&n>=0&&n<=7},e.from=function(n){return e.isValid(n)?parseInt(n,10):void 0},e.getPenaltyN1=function(n){const i=n.size;let s=0,c=0,a=0,l=null,u=null;for(let p=0;p<i;p++){c=a=0,l=u=null;for(let C=0;C<i;C++){let d=n.get(p,C);d===l?c++:(c>=5&&(s+=t.N1+(c-5)),l=d,c=1),d=n.get(C,p),d===u?a++:(a>=5&&(s+=t.N1+(a-5)),u=d,a=1)}c>=5&&(s+=t.N1+(c-5)),a>=5&&(s+=t.N1+(a-5))}return s},e.getPenaltyN2=function(n){const i=n.size;let s=0;for(let c=0;c<i-1;c++)for(let a=0;a<i-1;a++){const l=n.get(c,a)+n.get(c,a+1)+n.get(c+1,a)+n.get(c+1,a+1);(l===4||l===0)&&s++}return s*t.N2},e.getPenaltyN3=function(n){const i=n.size;let s=0,c=0,a=0;for(let l=0;l<i;l++){c=a=0;for(let u=0;u<i;u++)c=c<<1&2047|n.get(l,u),u>=10&&(c===1488||c===93)&&s++,a=a<<1&2047|n.get(u,l),u>=10&&(a===1488||a===93)&&s++}return s*t.N3},e.getPenaltyN4=function(n){let i=0;const s=n.data.length;for(let a=0;a<s;a++)i+=n.data[a];return Math.abs(Math.ceil(i*100/s/5)-10)*t.N4};function o(r,n,i){switch(r){case e.Patterns.PATTERN000:return(n+i)%2===0;case e.Patterns.PATTERN001:return n%2===0;case e.Patterns.PATTERN010:return i%3===0;case e.Patterns.PATTERN011:return(n+i)%3===0;case e.Patterns.PATTERN100:return(Math.floor(n/2)+Math.floor(i/3))%2===0;case e.Patterns.PATTERN101:return n*i%2+n*i%3===0;case e.Patterns.PATTERN110:return(n*i%2+n*i%3)%2===0;case e.Patterns.PATTERN111:return(n*i%3+(n+i)%2)%2===0;default:throw new Error("bad maskPattern:"+r)}}e.applyMask=function(n,i){const s=i.size;for(let c=0;c<s;c++)for(let a=0;a<s;a++)i.isReserved(a,c)||i.xor(a,c,o(n,a,c))},e.getBestMask=function(n,i){const s=Object.keys(e.Patterns).length;let c=0,a=1/0;for(let l=0;l<s;l++){i(l),e.applyMask(l,n);const u=e.getPenaltyN1(n)+e.getPenaltyN2(n)+e.getPenaltyN3(n)+e.getPenaltyN4(n);e.applyMask(l,n),u<a&&(a=u,c=l)}return c}})(Tt);var G={};const _=J,z=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],H=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];G.getBlocksCount=function(t,o){switch(o){case _.L:return z[(t-1)*4+0];case _.M:return z[(t-1)*4+1];case _.Q:return z[(t-1)*4+2];case _.H:return z[(t-1)*4+3];default:return}};G.getTotalCodewordsCount=function(t,o){switch(o){case _.L:return H[(t-1)*4+0];case _.M:return H[(t-1)*4+1];case _.Q:return H[(t-1)*4+2];case _.H:return H[(t-1)*4+3];default:return}};var It={},j={};const k=new Uint8Array(512),Y=new Uint8Array(256);(function(){let t=1;for(let o=0;o<255;o++)k[o]=t,Y[t]=o,t<<=1,t&256&&(t^=285);for(let o=255;o<512;o++)k[o]=k[o-255]})();j.log=function(t){if(t<1)throw new Error("log("+t+")");return Y[t]};j.exp=function(t){return k[t]};j.mul=function(t,o){return t===0||o===0?0:k[Y[t]+Y[o]]};(function(e){const t=j;e.mul=function(r,n){const i=new Uint8Array(r.length+n.length-1);for(let s=0;s<r.length;s++)for(let c=0;c<n.length;c++)i[s+c]^=t.mul(r[s],n[c]);return i},e.mod=function(r,n){let i=new Uint8Array(r);for(;i.length-n.length>=0;){const s=i[0];for(let a=0;a<n.length;a++)i[a]^=t.mul(n[a],s);let c=0;for(;c<i.length&&i[c]===0;)c++;i=i.slice(c)}return i},e.generateECPolynomial=function(r){let n=new Uint8Array([1]);for(let i=0;i<r;i++)n=e.mul(n,new Uint8Array([1,t.exp(i)]));return n}})(It);const Nt=It;function st(e){this.genPoly=void 0,this.degree=e,this.degree&&this.initialize(this.degree)}st.prototype.initialize=function(t){this.degree=t,this.genPoly=Nt.generateECPolynomial(this.degree)};st.prototype.encode=function(t){if(!this.genPoly)throw new Error("Encoder not initialized");const o=new Uint8Array(t.length+this.degree);o.set(t);const r=Nt.mod(o,this.genPoly),n=this.degree-r.length;if(n>0){const i=new Uint8Array(this.degree);return i.set(r,n),i}return r};var zt=st,Mt={},P={},at={};at.isValid=function(t){return!isNaN(t)&&t>=1&&t<=40};var B={};const Rt="[0-9]+",Ht="[A-Z $%*+\\-./:]+";let v="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";v=v.replace(/u/g,"\\u");const Yt="(?:(?![A-Z0-9 $%*+\\-./:]|"+v+`)(?:.|[\r
]))+`;B.KANJI=new RegExp(v,"g");B.BYTE_KANJI=new RegExp("[^A-Z0-9 $%*+\\-./:]+","g");B.BYTE=new RegExp(Yt,"g");B.NUMERIC=new RegExp(Rt,"g");B.ALPHANUMERIC=new RegExp(Ht,"g");const Kt=new RegExp("^"+v+"$"),Jt=new RegExp("^"+Rt+"$"),Gt=new RegExp("^[A-Z0-9 $%*+\\-./:]+$");B.testKanji=function(t){return Kt.test(t)};B.testNumeric=function(t){return Jt.test(t)};B.testAlphanumeric=function(t){return Gt.test(t)};(function(e){const t=at,o=B;e.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},e.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},e.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},e.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},e.MIXED={bit:-1},e.getCharCountIndicator=function(i,s){if(!i.ccBits)throw new Error("Invalid mode: "+i);if(!t.isValid(s))throw new Error("Invalid version: "+s);return s>=1&&s<10?i.ccBits[0]:s<27?i.ccBits[1]:i.ccBits[2]},e.getBestModeForData=function(i){return o.testNumeric(i)?e.NUMERIC:o.testAlphanumeric(i)?e.ALPHANUMERIC:o.testKanji(i)?e.KANJI:e.BYTE},e.toString=function(i){if(i&&i.id)return i.id;throw new Error("Invalid mode")},e.isValid=function(i){return i&&i.bit&&i.ccBits};function r(n){if(typeof n!="string")throw new Error("Param is not a string");switch(n.toLowerCase()){case"numeric":return e.NUMERIC;case"alphanumeric":return e.ALPHANUMERIC;case"kanji":return e.KANJI;case"byte":return e.BYTE;default:throw new Error("Unknown mode: "+n)}}e.from=function(i,s){if(e.isValid(i))return i;try{return r(i)}catch{return s}}})(P);(function(e){const t=N,o=G,r=J,n=P,i=at,s=7973,c=t.getBCHDigit(s);function a(C,d,w){for(let f=1;f<=40;f++)if(d<=e.getCapacity(f,w,C))return f}function l(C,d){return n.getCharCountIndicator(C,d)+4}function u(C,d){let w=0;return C.forEach(function(f){const T=l(f.mode,d);w+=T+f.getBitsLength()}),w}function p(C,d){for(let w=1;w<=40;w++)if(u(C,w)<=e.getCapacity(w,d,n.MIXED))return w}e.from=function(d,w){return i.isValid(d)?parseInt(d,10):w},e.getCapacity=function(d,w,f){if(!i.isValid(d))throw new Error("Invalid QR Code version");typeof f>"u"&&(f=n.BYTE);const T=t.getSymbolTotalCodewords(d),m=o.getTotalCodewordsCount(d,w),E=(T-m)*8;if(f===n.MIXED)return E;const g=E-l(f,d);switch(f){case n.NUMERIC:return Math.floor(g/10*3);case n.ALPHANUMERIC:return Math.floor(g/11*2);case n.KANJI:return Math.floor(g/13);case n.BYTE:default:return Math.floor(g/8)}},e.getBestVersionForData=function(d,w){let f;const T=r.from(w,r.M);if(Array.isArray(d)){if(d.length>1)return p(d,T);if(d.length===0)return 1;f=d[0]}else f=d;return a(f.mode,f.getLength(),T)},e.getEncodedBits=function(d){if(!i.isValid(d)||d<7)throw new Error("Invalid QR Code version");let w=d<<12;for(;t.getBCHDigit(w)-c>=0;)w^=s<<t.getBCHDigit(w)-c;return d<<12|w}})(Mt);var Bt={};const et=N,St=1335,jt=21522,mt=et.getBCHDigit(St);Bt.getEncodedBits=function(t,o){const r=t.bit<<3|o;let n=r<<10;for(;et.getBCHDigit(n)-mt>=0;)n^=St<<et.getBCHDigit(n)-mt;return(r<<10|n)^jt};var bt={};const Qt=P;function D(e){this.mode=Qt.NUMERIC,this.data=e.toString()}D.getBitsLength=function(t){return 10*Math.floor(t/3)+(t%3?t%3*3+1:0)};D.prototype.getLength=function(){return this.data.length};D.prototype.getBitsLength=function(){return D.getBitsLength(this.data.length)};D.prototype.write=function(t){let o,r,n;for(o=0;o+3<=this.data.length;o+=3)r=this.data.substr(o,3),n=parseInt(r,10),t.put(n,10);const i=this.data.length-o;i>0&&(r=this.data.substr(o),n=parseInt(r,10),t.put(n,i*3+1))};var qt=D;const Xt=P,X=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function L(e){this.mode=Xt.ALPHANUMERIC,this.data=e}L.getBitsLength=function(t){return 11*Math.floor(t/2)+6*(t%2)};L.prototype.getLength=function(){return this.data.length};L.prototype.getBitsLength=function(){return L.getBitsLength(this.data.length)};L.prototype.write=function(t){let o;for(o=0;o+2<=this.data.length;o+=2){let r=X.indexOf(this.data[o])*45;r+=X.indexOf(this.data[o+1]),t.put(r,11)}this.data.length%2&&t.put(X.indexOf(this.data[o]),6)};var Zt=L;const Wt=P;function U(e){this.mode=Wt.BYTE,typeof e=="string"?this.data=new TextEncoder().encode(e):this.data=new Uint8Array(e)}U.getBitsLength=function(t){return t*8};U.prototype.getLength=function(){return this.data.length};U.prototype.getBitsLength=function(){return U.getBitsLength(this.data.length)};U.prototype.write=function(e){for(let t=0,o=this.data.length;t<o;t++)e.put(this.data[t],8)};var xt=U;const te=P,ee=N;function F(e){this.mode=te.KANJI,this.data=e}F.getBitsLength=function(t){return t*13};F.prototype.getLength=function(){return this.data.length};F.prototype.getBitsLength=function(){return F.getBitsLength(this.data.length)};F.prototype.write=function(e){let t;for(t=0;t<this.data.length;t++){let o=ee.toSJIS(this.data[t]);if(o>=33088&&o<=40956)o-=33088;else if(o>=57408&&o<=60351)o-=49472;else throw new Error("Invalid SJIS character: "+this.data[t]+`
Make sure your charset is UTF-8`);o=(o>>>8&255)*192+(o&255),e.put(o,13)}};var ne=F,_t={exports:{}};(function(e){var t={single_source_shortest_paths:function(o,r,n){var i={},s={};s[r]=0;var c=t.PriorityQueue.make();c.push(r,0);for(var a,l,u,p,C,d,w,f,T;!c.empty();){a=c.pop(),l=a.value,p=a.cost,C=o[l]||{};for(u in C)C.hasOwnProperty(u)&&(d=C[u],w=p+d,f=s[u],T=typeof s[u]>"u",(T||f>w)&&(s[u]=w,c.push(u,w),i[u]=l))}if(typeof n<"u"&&typeof s[n]>"u"){var m=["Could not find a path from ",r," to ",n,"."].join("");throw new Error(m)}return i},extract_shortest_path_from_predecessor_list:function(o,r){for(var n=[],i=r;i;)n.push(i),o[i],i=o[i];return n.reverse(),n},find_path:function(o,r,n){var i=t.single_source_shortest_paths(o,r,n);return t.extract_shortest_path_from_predecessor_list(i,n)},PriorityQueue:{make:function(o){var r=t.PriorityQueue,n={},i;o=o||{};for(i in r)r.hasOwnProperty(i)&&(n[i]=r[i]);return n.queue=[],n.sorter=o.sorter||r.default_sorter,n},default_sorter:function(o,r){return o.cost-r.cost},push:function(o,r){var n={value:o,cost:r};this.queue.push(n),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return this.queue.length===0}}};e.exports=t})(_t);var re=_t.exports;(function(e){const t=P,o=qt,r=Zt,n=xt,i=ne,s=B,c=N,a=re;function l(m){return unescape(encodeURIComponent(m)).length}function u(m,E,g){const h=[];let y;for(;(y=m.exec(g))!==null;)h.push({data:y[0],index:y.index,mode:E,length:y[0].length});return h}function p(m){const E=u(s.NUMERIC,t.NUMERIC,m),g=u(s.ALPHANUMERIC,t.ALPHANUMERIC,m);let h,y;return c.isKanjiModeEnabled()?(h=u(s.BYTE,t.BYTE,m),y=u(s.KANJI,t.KANJI,m)):(h=u(s.BYTE_KANJI,t.BYTE,m),y=[]),E.concat(g,h,y).sort(function(I,M){return I.index-M.index}).map(function(I){return{data:I.data,mode:I.mode,length:I.length}})}function C(m,E){switch(E){case t.NUMERIC:return o.getBitsLength(m);case t.ALPHANUMERIC:return r.getBitsLength(m);case t.KANJI:return i.getBitsLength(m);case t.BYTE:return n.getBitsLength(m)}}function d(m){return m.reduce(function(E,g){const h=E.length-1>=0?E[E.length-1]:null;return h&&h.mode===g.mode?(E[E.length-1].data+=g.data,E):(E.push(g),E)},[])}function w(m){const E=[];for(let g=0;g<m.length;g++){const h=m[g];switch(h.mode){case t.NUMERIC:E.push([h,{data:h.data,mode:t.ALPHANUMERIC,length:h.length},{data:h.data,mode:t.BYTE,length:h.length}]);break;case t.ALPHANUMERIC:E.push([h,{data:h.data,mode:t.BYTE,length:h.length}]);break;case t.KANJI:E.push([h,{data:h.data,mode:t.BYTE,length:l(h.data)}]);break;case t.BYTE:E.push([{data:h.data,mode:t.BYTE,length:l(h.data)}])}}return E}function f(m,E){const g={},h={start:{}};let y=["start"];for(let A=0;A<m.length;A++){const I=m[A],M=[];for(let b=0;b<I.length;b++){const R=I[b],$=""+A+b;M.push($),g[$]={node:R,lastCount:0},h[$]={};for(let q=0;q<y.length;q++){const S=y[q];g[S]&&g[S].node.mode===R.mode?(h[S][$]=C(g[S].lastCount+R.length,R.mode)-C(g[S].lastCount,R.mode),g[S].lastCount+=R.length):(g[S]&&(g[S].lastCount=R.length),h[S][$]=C(R.length,R.mode)+4+t.getCharCountIndicator(R.mode,E))}}y=M}for(let A=0;A<y.length;A++)h[y[A]].end=0;return{map:h,table:g}}function T(m,E){let g;const h=t.getBestModeForData(m);if(g=t.from(E,h),g!==t.BYTE&&g.bit<h.bit)throw new Error('"'+m+'" cannot be encoded with mode '+t.toString(g)+`.
 Suggested mode is: `+t.toString(h));switch(g===t.KANJI&&!c.isKanjiModeEnabled()&&(g=t.BYTE),g){case t.NUMERIC:return new o(m);case t.ALPHANUMERIC:return new r(m);case t.KANJI:return new i(m);case t.BYTE:return new n(m)}}e.fromArray=function(E){return E.reduce(function(g,h){return typeof h=="string"?g.push(T(h,null)):h.data&&g.push(T(h.data,h.mode)),g},[])},e.fromString=function(E,g){const h=p(E,c.isKanjiModeEnabled()),y=w(h),A=f(y,g),I=a.find_path(A.map,"start","end"),M=[];for(let b=1;b<I.length-1;b++)M.push(A.table[I[b]].node);return e.fromArray(d(M))},e.rawSplit=function(E){return e.fromArray(p(E,c.isKanjiModeEnabled()))}})(bt);const Q=N,Z=J,oe=kt,ie=vt,se=yt,ae=At,nt=Tt,rt=G,ce=zt,K=Mt,le=Bt,ue=P,W=bt;function fe(e,t){const o=e.size,r=ae.getPositions(t);for(let n=0;n<r.length;n++){const i=r[n][0],s=r[n][1];for(let c=-1;c<=7;c++)if(!(i+c<=-1||o<=i+c))for(let a=-1;a<=7;a++)s+a<=-1||o<=s+a||(c>=0&&c<=6&&(a===0||a===6)||a>=0&&a<=6&&(c===0||c===6)||c>=2&&c<=4&&a>=2&&a<=4?e.set(i+c,s+a,!0,!0):e.set(i+c,s+a,!1,!0))}}function de(e){const t=e.size;for(let o=8;o<t-8;o++){const r=o%2===0;e.set(o,6,r,!0),e.set(6,o,r,!0)}}function ge(e,t){const o=se.getPositions(t);for(let r=0;r<o.length;r++){const n=o[r][0],i=o[r][1];for(let s=-2;s<=2;s++)for(let c=-2;c<=2;c++)s===-2||s===2||c===-2||c===2||s===0&&c===0?e.set(n+s,i+c,!0,!0):e.set(n+s,i+c,!1,!0)}}function he(e,t){const o=e.size,r=K.getEncodedBits(t);let n,i,s;for(let c=0;c<18;c++)n=Math.floor(c/3),i=c%3+o-8-3,s=(r>>c&1)===1,e.set(n,i,s,!0),e.set(i,n,s,!0)}function x(e,t,o){const r=e.size,n=le.getEncodedBits(t,o);let i,s;for(i=0;i<15;i++)s=(n>>i&1)===1,i<6?e.set(i,8,s,!0):i<8?e.set(i+1,8,s,!0):e.set(r-15+i,8,s,!0),i<8?e.set(8,r-i-1,s,!0):i<9?e.set(8,15-i-1+1,s,!0):e.set(8,15-i-1,s,!0);e.set(r-8,8,1,!0)}function Ce(e,t){const o=e.size;let r=-1,n=o-1,i=7,s=0;for(let c=o-1;c>0;c-=2)for(c===6&&c--;;){for(let a=0;a<2;a++)if(!e.isReserved(n,c-a)){let l=!1;s<t.length&&(l=(t[s]>>>i&1)===1),e.set(n,c-a,l),i--,i===-1&&(s++,i=7)}if(n+=r,n<0||o<=n){n-=r,r=-r;break}}}function me(e,t,o){const r=new oe;o.forEach(function(a){r.put(a.mode.bit,4),r.put(a.getLength(),ue.getCharCountIndicator(a.mode,e)),a.write(r)});const n=Q.getSymbolTotalCodewords(e),i=rt.getTotalCodewordsCount(e,t),s=(n-i)*8;for(r.getLengthInBits()+4<=s&&r.put(0,4);r.getLengthInBits()%8!==0;)r.putBit(0);const c=(s-r.getLengthInBits())/8;for(let a=0;a<c;a++)r.put(a%2?17:236,8);return we(r,e,t)}function we(e,t,o){const r=Q.getSymbolTotalCodewords(t),n=rt.getTotalCodewordsCount(t,o),i=r-n,s=rt.getBlocksCount(t,o),c=r%s,a=s-c,l=Math.floor(r/s),u=Math.floor(i/s),p=u+1,C=l-u,d=new ce(C);let w=0;const f=new Array(s),T=new Array(s);let m=0;const E=new Uint8Array(e.buffer);for(let I=0;I<s;I++){const M=I<a?u:p;f[I]=E.slice(w,w+M),T[I]=d.encode(f[I]),w+=M,m=Math.max(m,M)}const g=new Uint8Array(r);let h=0,y,A;for(y=0;y<m;y++)for(A=0;A<s;A++)y<f[A].length&&(g[h++]=f[A][y]);for(y=0;y<C;y++)for(A=0;A<s;A++)g[h++]=T[A][y];return g}function Ee(e,t,o,r){let n;if(Array.isArray(e))n=W.fromArray(e);else if(typeof e=="string"){let l=t;if(!l){const u=W.rawSplit(e);l=K.getBestVersionForData(u,o)}n=W.fromString(e,l||40)}else throw new Error("Invalid data");const i=K.getBestVersionForData(n,o);if(!i)throw new Error("The amount of data is too big to be stored in a QR Code");if(!t)t=i;else if(t<i)throw new Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+i+`.
`);const s=me(t,o,n),c=Q.getSymbolSize(t),a=new ie(c);return fe(a,t),de(a),ge(a,t),x(a,o,0),t>=7&&he(a,t),Ce(a,s),isNaN(r)&&(r=nt.getBestMask(a,x.bind(null,a,o))),nt.applyMask(r,a),x(a,o,r),{modules:a,version:t,errorCorrectionLevel:o,maskPattern:r,segments:n}}Et.create=function(t,o){if(typeof t>"u"||t==="")throw new Error("No input text");let r=Z.M,n,i;return typeof o<"u"&&(r=Z.from(o.errorCorrectionLevel,Z.M),n=K.from(o.version),i=nt.from(o.maskPattern),o.toSJISFunc&&Q.setToSJISFunction(o.toSJISFunc)),Ee(t,n,r,i)};var Pt={},ct={};(function(e){function t(o){if(typeof o=="number"&&(o=o.toString()),typeof o!="string")throw new Error("Color should be defined as hex string");let r=o.slice().replace("#","").split("");if(r.length<3||r.length===5||r.length>8)throw new Error("Invalid hex color: "+o);(r.length===3||r.length===4)&&(r=Array.prototype.concat.apply([],r.map(function(i){return[i,i]}))),r.length===6&&r.push("F","F");const n=parseInt(r.join(""),16);return{r:n>>24&255,g:n>>16&255,b:n>>8&255,a:n&255,hex:"#"+r.slice(0,6).join("")}}e.getOptions=function(r){r||(r={}),r.color||(r.color={});const n=typeof r.margin>"u"||r.margin===null||r.margin<0?4:r.margin,i=r.width&&r.width>=21?r.width:void 0,s=r.scale||4;return{width:i,scale:i?4:s,margin:n,color:{dark:t(r.color.dark||"#000000ff"),light:t(r.color.light||"#ffffffff")},type:r.type,rendererOpts:r.rendererOpts||{}}},e.getScale=function(r,n){return n.width&&n.width>=r+n.margin*2?n.width/(r+n.margin*2):n.scale},e.getImageWidth=function(r,n){const i=e.getScale(r,n);return Math.floor((r+n.margin*2)*i)},e.qrToImageData=function(r,n,i){const s=n.modules.size,c=n.modules.data,a=e.getScale(s,i),l=Math.floor((s+i.margin*2)*a),u=i.margin*a,p=[i.color.light,i.color.dark];for(let C=0;C<l;C++)for(let d=0;d<l;d++){let w=(C*l+d)*4,f=i.color.light;if(C>=u&&d>=u&&C<l-u&&d<l-u){const T=Math.floor((C-u)/a),m=Math.floor((d-u)/a);f=p[c[T*s+m]?1:0]}r[w++]=f.r,r[w++]=f.g,r[w++]=f.b,r[w]=f.a}}})(ct);(function(e){const t=ct;function o(n,i,s){n.clearRect(0,0,i.width,i.height),i.style||(i.style={}),i.height=s,i.width=s,i.style.height=s+"px",i.style.width=s+"px"}function r(){try{return document.createElement("canvas")}catch{throw new Error("You need to specify a canvas element")}}e.render=function(i,s,c){let a=c,l=s;typeof a>"u"&&(!s||!s.getContext)&&(a=s,s=void 0),s||(l=r()),a=t.getOptions(a);const u=t.getImageWidth(i.modules.size,a),p=l.getContext("2d"),C=p.createImageData(u,u);return t.qrToImageData(C.data,i,a),o(p,l,u),p.putImageData(C,0,0),l},e.renderToDataURL=function(i,s,c){let a=c;typeof a>"u"&&(!s||!s.getContext)&&(a=s,s=void 0),a||(a={});const l=e.render(i,s,a),u=a.type||"image/png",p=a.rendererOpts||{};return l.toDataURL(u,p.quality)}})(Pt);var Dt={};const pe=ct;function wt(e,t){const o=e.a/255,r=t+'="'+e.hex+'"';return o<1?r+" "+t+'-opacity="'+o.toFixed(2).slice(1)+'"':r}function tt(e,t,o){let r=e+t;return typeof o<"u"&&(r+=" "+o),r}function ye(e,t,o){let r="",n=0,i=!1,s=0;for(let c=0;c<e.length;c++){const a=Math.floor(c%t),l=Math.floor(c/t);!a&&!i&&(i=!0),e[c]?(s++,c>0&&a>0&&e[c-1]||(r+=i?tt("M",a+o,.5+l+o):tt("m",n,0),n=0,i=!1),a+1<t&&e[c+1]||(r+=tt("h",s),s=0)):n++}return r}Dt.render=function(t,o,r){const n=pe.getOptions(o),i=t.modules.size,s=t.modules.data,c=i+n.margin*2,a=n.color.light.a?"<path "+wt(n.color.light,"fill")+' d="M0 0h'+c+"v"+c+'H0z"/>':"",l="<path "+wt(n.color.dark,"stroke")+' d="'+ye(s,i,n.margin)+'"/>',u='viewBox="0 0 '+c+" "+c+'"',C='<svg xmlns="http://www.w3.org/2000/svg" '+(n.width?'width="'+n.width+'" height="'+n.width+'" ':"")+u+' shape-rendering="crispEdges">'+a+l+`</svg>
`;return typeof r=="function"&&r(null,C),C};const Ae=Ot,ot=Et,Lt=Pt,Te=Dt;function lt(e,t,o,r,n){const i=[].slice.call(arguments,1),s=i.length,c=typeof i[s-1]=="function";if(!c&&!Ae())throw new Error("Callback required as last argument");if(c){if(s<2)throw new Error("Too few arguments provided");s===2?(n=o,o=t,t=r=void 0):s===3&&(t.getContext&&typeof n>"u"?(n=r,r=void 0):(n=r,r=o,o=t,t=void 0))}else{if(s<1)throw new Error("Too few arguments provided");return s===1?(o=t,t=r=void 0):s===2&&!t.getContext&&(r=o,o=t,t=void 0),new Promise(function(a,l){try{const u=ot.create(o,r);a(e(u,t,r))}catch(u){l(u)}})}try{const a=ot.create(o,r);n(null,e(a,t,r))}catch(a){n(a)}}O.create=ot.create;O.toCanvas=lt.bind(null,Lt.render);O.toDataURL=lt.bind(null,Lt.renderToDataURL);O.toString=lt.bind(null,function(e,t,o){return Te.render(e,o)});var ut={},ft={};Object.defineProperty(ft,"__esModule",{value:!0});class Ie{constructor(t,o="00",r="26",n="00",i="01",s="52",c="53",a="54",l="58",u="59",p="60",C="62",d="05",w="63"){this.data=t,this.PAYLOAD_FORMAT_INDICATOR=o,this.MERCHANT_ACCOUNT_INFORMATION=r,this.MERCHANT_ACCOUNT_INFORMATION_GUI=n,this.MERCHANT_ACCOUNT_INFORMATION_KEY=i,this.MERCHANT_CATEGORY_CODE=s,this.TRANSACTION_CURRENCY=c,this.TRANSACTION_AMOUNT=a,this.COUNTRY_CODE=l,this.MERCHANT_NAME=u,this.MERCHANT_CITY=p,this.ADDITIONAL_DATA_FIELD=C,this.ADDITIONAL_DATA_FIELD_TXTID=d,this.CRC16=w}EVM(t,o){if(o.length>99)throw new Error("Content of EVM not over 99 chars!");return this.padder(t)+this.padder(o.length)+o.toString()}calcCRC16CCITT(t){let o=65535;if(t.length>0)for(let r=0;r<t.length;r++){o^=t.charCodeAt(r)<<8;for(let n=0;n<8;n++)(o<<=1)&65536&&(o^=4129),o&=65535}return o.toString(16).toUpperCase()}padder(t){return t.toString().padStart(2,"0")}getPayloadFormatIndicator(){return this.EVM(this.PAYLOAD_FORMAT_INDICATOR,"01")}getMerchantAccountInformation(){if(!this.data.key)throw new Error("Pix key is mandatory!");const t=this.EVM(this.MERCHANT_ACCOUNT_INFORMATION_GUI,"BR.GOV.BCB.PIX"),o=this.EVM(this.MERCHANT_ACCOUNT_INFORMATION_KEY,this.data.key);return this.EVM(this.MERCHANT_ACCOUNT_INFORMATION,`${t}${o}`)}getMerchantCategoryCode(){return this.EVM(this.MERCHANT_CATEGORY_CODE,"0000")}getTransactionCurrency(){return this.EVM(this.TRANSACTION_CURRENCY,"986")}getTransactionAmount(){if(this.data.amount!==void 0){const t=Number(this.data.amount).toFixed(2).toString();return this.EVM(this.TRANSACTION_AMOUNT,t)}return""}getCountryCode(){return this.EVM(this.COUNTRY_CODE,"BR")}getMerchantName(){if(!this.data.name)throw new Error("Name is mandatory!");return this.EVM(this.MERCHANT_NAME,this.data.name)}getMerchantCity(){if(!this.data.city)throw new Error("Citi is mandatory!");return this.EVM(this.MERCHANT_CITY,this.data.city)}getTransactionId(){if(this.data.transactionId!==void 0){const t=this.EVM(this.ADDITIONAL_DATA_FIELD_TXTID,this.data.transactionId);return this.EVM(this.ADDITIONAL_DATA_FIELD,t)}return""}getCRC16(t){const o=this.calcCRC16CCITT(`${t}6304`);return this.EVM(this.CRC16,o)}get(){const t=this.getPayloadFormatIndicator()+this.getMerchantAccountInformation()+this.getMerchantCategoryCode()+this.getTransactionCurrency()+this.getTransactionAmount()+this.getCountryCode()+this.getMerchantName()+this.getMerchantCity()+this.getTransactionId();return`${t}${this.getCRC16(t)}`}}ft.default=Ie;var Ne=gt&&gt.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(ut,"__esModule",{value:!0});var Ut=ut.payload=void 0;const Me=Ne(ft);function Re(e){return new Me.default(e).get()}Ut=ut.payload=Re;function dt(e){const t=e.replace(/[^a-zA-Z0-9@.]/g,"");return t.includes("@")?"email":/^\d{11}$/.test(t)?"cpf":/^\d{14}$/.test(t)?"cnpj":/^\d{10,11}$/.test(t)?"phone":(/^[a-zA-Z0-9]{32,36}$/.test(t),"random")}function Pe(e){if(e.includes("@"))return e;const t=e.replace(/[^a-zA-Z0-9@]/g,"");switch(dt(t)){case"cpf":return t.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4");case"cnpj":return t.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,"$1.$2.$3/$4-$5");case"phone":return t.length===11?t.replace(/(\d{2})(\d{5})(\d{4})/,"($1) $2-$3"):t.replace(/(\d{2})(\d{4})(\d{4})/,"($1) $2-$3");default:return t}}function Ft(e,t){let o=e.replace(/\D/g,"");switch(t.toLowerCase()){case"cpf":break;case"cnpj":break;case"email":o=e.toLowerCase();break;case"phone":o=e.replace(/\D/g,""),e.startsWith("+")||(o=`+55${o}`);break;case"random":o=e.replace(/[^a-zA-Z0-9]/g,"");break;default:o=e.replace(/[^a-zA-Z0-9]/g,"")}return o}const De=async(e,t,o,r,n="SAO PAULO",i,s)=>{try{console.log("Gerando QR code PIX com os seguintes dados:"),console.log("Chave PIX:",e),console.log("Valor:",t),console.log("ID da transação:",o),console.log("Nome do beneficiário:",r),console.log("Cidade:",n),console.log("Descrição:",i),console.log("Data de expiração:",s||"Não definida");const c=dt(e);console.log("Tipo de chave identificado:",c);const a=Ft(e,c);console.log("Chave PIX formatada para BR Code:",a);const l=r.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^\w\s]/gi,"").toUpperCase().substring(0,25),u=n.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^\w\s]/gi,"").toUpperCase().substring(0,15),p=String(o).replace(/\D/g,"").substring(0,7),d=Math.round(t*100).toString(),w={key:a,name:l,city:u,amount:t,transactionId:p};try{const f=Ut(w);return console.log("BR Code gerado pela biblioteca pix-payload:",f),await O.toDataURL(f,{errorCorrectionLevel:"M",margin:1,scale:5,width:300,color:{dark:"#000000",light:"#FFFFFF"}})}catch(f){throw console.error("Erro ao usar biblioteca pix-payload:",f),f}}catch(c){console.error("Erro ao gerar QR code PIX:",c);try{return console.log("Tentando método alternativo para gerar QR code PIX..."),Be(e,t,o,r,n,i,s)}catch(a){throw console.error("Erro também no método alternativo:",a),c}}};async function Be(e,t,o,r,n="SAO PAULO",i,s){const c=dt(e),a=Ft(e,c),l=r.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^\w\s]/gi,"").toUpperCase().substring(0,25),u=n.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^\w\s]/gi,"").toUpperCase().substring(0,15);let p="";if(s){const g=new Date(s),y=ht(new Date,30);g>y&&g.setTime(y.getTime());const A=new Date("2000-01-01T00:00:00Z"),I=Math.abs(g.getTime()-A.getTime());p=Math.floor(I/1e3).toString()}else{const g=ht(new Date,30),h=new Date("2000-01-01T00:00:00Z"),y=Math.abs(g.getTime()-h.getTime());p=Math.floor(y/1e3).toString()}const d=Math.round(t*100).toString(),w=String(o).replace(/\D/g,"").substring(0,7);let f="00020101",T="0014br.gov.bcb.pix";if(T+=`01${a.length.toString().padStart(2,"0")}${a}`,i&&i.trim().length>0){const g=i.substring(0,50);T+=`02${g.length.toString().padStart(2,"0")}${g}`}f+=`26${T.length.toString().padStart(2,"0")}${T}`,f+="52040000",f+="5303986",f+=`54${d.length.toString().padStart(2,"0")}${d}`,f+="5802BR",f+=`59${l.length.toString().padStart(2,"0")}${l}`,f+=`60${u.length.toString().padStart(2,"0")}${u}`;let m=`05${w.length.toString().padStart(2,"0")}${w}`;f+=`62${m.length.toString().padStart(2,"0")}${m}`,p&&(f+=`80${p.length.toString().padStart(2,"0")}${p}`),f+="6304";const E=Se(f);return f=f.substring(0,f.length-4)+E,console.log("BR Code gerado manualmente (método alternativo):",f),await O.toDataURL(f,{errorCorrectionLevel:"M",margin:1,scale:5,width:300,color:{dark:"#000000",light:"#FFFFFF"}})}function Se(e){let t=65535;for(let r=0;r<e.length;r++){t^=e.charCodeAt(r)<<8;for(let n=0;n<8;n++)t&32768?t=(t<<1^4129)&65535:t=t<<1&65535}return t.toString(16).toUpperCase().padStart(4,"0")}export{Se as calculateCRC16,Pe as formatPixKey,Ft as formatPixKeyForBRCode,De as generatePixQRCode,dt as identifyPixKeyType};
