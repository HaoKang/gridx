//>>built
define("dojo/string",["./_base/kernel","./_base/lang"],function(h,e){var c={};e.setObject("dojo.string",c);c.rep=function(a,b){if(0>=b||!a)return"";for(var d=[];;){b&1&&d.push(a);if(!(b>>=1))break;a+=a}return d.join("")};c.pad=function(a,b,d,i){d||(d="0");a=""+a;b=c.rep(d,Math.ceil((b-a.length)/d.length));return i?a+b:b+a};c.substitute=function(a,b,d,c){c=c||h.global;d=d?e.hitch(c,d):function(a){return a};return a.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,function(a,f,g){a=e.getObject(f,!1,
b);g&&(a=e.getObject(g,!1,c).call(c,a,f));return d(a,f).toString()})};c.trim=String.prototype.trim?e.trim:function(a){for(var a=a.replace(/^\s+/,""),b=a.length-1;0<=b;b--)if(/\S/.test(a.charAt(b))){a=a.substring(0,b+1);break}return a};return c});