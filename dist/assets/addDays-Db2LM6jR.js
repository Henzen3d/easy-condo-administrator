function n(t){const e=Object.prototype.toString.call(t);return t instanceof Date||typeof t=="object"&&e==="[object Date]"?new t.constructor(+t):typeof t=="number"||e==="[object Number]"||typeof t=="string"||e==="[object String]"?new Date(t):new Date(NaN)}function o(t,e){return t instanceof Date?new t.constructor(e):new Date(e)}function c(t,e){const r=n(t);return isNaN(e)?o(t,NaN):(e&&r.setDate(r.getDate()+e),r)}export{c as a,o as c,n as t};
