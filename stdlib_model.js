// 15.1.1
var NaN = $$NUMBER$$;
var Infinity = $$NUMBER$$;
var undefined = $$UNDEFINED$$;

// 15.1.2
function eval() { return $$ANY$$; }

function parseInt() { return $$NUMBER$$; }

function parseFloat() { return $$NUMBER$$; }

function isNaN() { return $$BOOLEAN$$; }

function isFinite() { return $$BOOLEAN$$; }


// 15.1.3
function decodeURI() { return $$STRING$$; }

function decodeURIComponent() { return $$STRING$$; }

function encodeURI() { return $$STRING$$; }

function encodeURIComponent() { return $$STRING$$; }

// 15.1.4; Object, Function, RegExp, String and Array are built-in
function Boolean() {}

function Number() {}

function Date() { return $$STRING$$; }

function Error() {}

function EvalError() {}

function RangeError() {}

function ReferenceError() {}

function SyntaxError() {}

function TypeError() {}

function URIError() {}

// 15.1.5
var Math = {};

var JSON = {};

// 15.2
Object.getPrototypeOf = function() { return {}; };
Object.getOwnPropertyDescriptor = function() { return {}; };
Object.getOwnPropertyNames = function() { return [$$STRING$$]; };
Object.create = function() { return {}; };
Object.defineProperty = function(o) { return o; };
Object.defineProperties = function(o) { return o; };
Object.seal = function(o) { return o; };
Object.freeze = function(o) { return o; };
Object.preventExtensions = function(o) { return o; };
Object.isSealed = function() { return $$BOOLEAN$$; };
Object.isFrozen = function() { return $$BOOLEAN$$; };
Object.isExtensible = function() { return $$BOOLEAN$$; };
Object.keys = function() { return [$$STRING$$]; };

Object.prototype.constructor = Object;
Object.prototype.toString = function() { return $$STRING$$; };
Object.prototype.toLocaleString = function() { return $$STRING$$; };
Object.prototype.valueOf = function(o) { return Object(o); };
Object.prototype.hasOwnProperty = function() { return $$BOOLEAN$$; };
Object.prototype.isPrototypeOf = function() { return $$BOOLEAN$$; };
Object.prototype.propertyIsEnumerable = function() { return $$BOOLEAN$$; };

// 15.3
Function.length = 1;

Function.prototype.constructor = Function;
Function.prototype.toString = function() { return $$STRING$$; };
Function.prototype.apply = function() { return $$ANY$$; };
Function.prototype.call = function() { return $$ANY$$; };
Function.prototype.bind = function() { return {}; };

// 15.4
Array.isArray = function() { return $$BOOLEAN$$; };

Array.prototype.constructor = Array;
Array.prototype.toString = function() { return $$STRING$$; };
Array.prototype.toLocaleString = function() { return $$STRING$$; };
Array.prototype.concat = function() { return [this[$$NUMBER$$]]; };
Array.prototype.join = function() { return $$STRING$$; };
Array.prototype.pop = function() { return $$ANY$$; };
Array.prototype.push = function() { return $$NUMBER$$; };
Array.prototype.reverse = function(a) { return a; };
Array.prototype.shift = function() { return $$ANY$$; };
Array.prototype.slice = function() { return [this[$$NUMBER$$]]; };
Array.prototype.sort = function() { return [this[$$NUMBER$$]]; };
Array.prototype.splice = function() { return [this[$$NUMBER$$]]; };
Array.prototype.unshift = function() { return $$NUMBER$$; };
Array.prototype.indexOf = function() { return $$NUMBER$$; };
Array.prototype.lastIndexOf = function() { return $$NUMBER$$; };
Array.prototype.every = function() { return $$BOOLEAN$$; };
Array.prototype.some = function() { return $$BOOLEAN$$; };
Array.prototype.forEach = function() { return; };
Array.prototype.map = function() { return [$$ANY$$]; };
Array.prototype.filter = function() { return [this[$$NUMBER$$]]; };
Array.prototype.reduce = function() { return $$ANY$$; };
Array.prototype.reduceRight = function() { return $$ANY$$; };

// 15.5
String.fromCharCode = function() { return $$STRING$$; };

String.prototype.constructor = String;
String.prototype.toString = function() { return this; };
String.prototype.valueOf = function() { return this; };
String.prototype.charAt = function() { return $$STRING$$; };
String.prototype.concat = function() { return $$STRING$$; };
String.prototype.indexOf = function() { return $$NUMBER$$; };
String.prototype.lastIndexOf = function() { return $$NUMBER$$; };
String.prototype.localeCompare = function() { return $$NUMBER$$; };
String.prototype.match = function() { return $$ANY$$; };
String.prototype.replace = function() { return $$STRING$$; };
String.prototype.search = function() { return $$NUMBER$$; };
String.prototype.slice = function() { return $$STRING$$; };
String.prototype.split = function() { return [$$STRING$$]; };
String.prototype.substring = function() { return $$STRING$$; };
String.prototype.toLowerCase = function() { return $$STRING$$; };
String.prototype.toLocaleLowerCase = function() { return $$STRING$$; };
String.prototype.toUpperCase = function() { return $$STRING$$; };
String.prototype.toLocaleUpperCase = function() { return $$STRING$$; };
String.prototype.trim = function() { return $$STRING$$; };

// 15.6
Boolean.prototype.constructor = Boolean;
Boolean.prototype.toString = function() { return $$STRING$$; };
Boolean.prototype.valueOf = function() { return $$BOOLEAN$$; };

// 15.7
Number.MAX_VALUE = $$NUMBER$$;
Number.MIN_VALUE = $$NUMBER$$;
Number.NaN = $$NUMBER$$;
Number.NEGATIVE_INFINITY = $$NUMBER$$;
Number.POSITIVE_INFINITY = $$NUMBER$$;

Number.prototype.constructor = Number;
Number.prototype.toString = function() { return $$STRING$$; };
Number.prototype.toLocaleString = function() { return $$STRING$$; };
Number.prototype.valueOf = function() { return $$NUMBER$$; };
Number.prototype.toFixed = function() { return $$NUMBER$$; };
Number.prototype.toExponential = function() { return $$NUMBER$$; };
Number.prototype.toPrecision = function() { return $$NUMBER$$; };

// 15.8
Math.E = $$NUMBER$$;
Math.LN10 = $$NUMBER$$;
Math.LN2 = $$NUMBER$$;
Math.LOG2E = $$NUMBER$$;
Math.LOG10E = $$NUMBER$$;
Math.PI = $$NUMBER$$;
Math.SQRT1_2 = $$NUMBER$$;
Math.SQRT2 = $$NUMBER$$;

Math.abs = function() { return $$NUMBER$$; };
Math.acos = function() { return $$NUMBER$$; };
Math.asin = function() { return $$NUMBER$$; };
Math.atan = function() { return $$NUMBER$$; };
Math.atan2 = function() { return $$NUMBER$$; };
Math.ceil = function() { return $$NUMBER$$; };
Math.cos = function() { return $$NUMBER$$; };
Math.exp = function() { return $$NUMBER$$; };
Math.floor = function() { return $$NUMBER$$; };
Math.log = function() { return $$NUMBER$$; };
Math.max = function() { return $$NUMBER$$; };
Math.min = function() { return $$NUMBER$$; };
Math.pow = function() { return $$NUMBER$$; };
Math.random = function() { return $$NUMBER$$; };
Math.round = function() { return $$NUMBER$$; };
Math.sin = function() { return $$NUMBER$$; };
Math.sqrt = function() { return $$NUMBER$$; };
Math.tan = function() { return $$NUMBER$$; };

// 15.9
Date.parse = function() { return $$NUMBER$$; };
Date.UTC = function() { return $$NUMBER$$; };
Date.now = function() { return $$NUMBER$$; };

Date.prototype.constructor = Date;
Date.prototype.toString = function() { return $$STRING$$; };
Date.prototype.toDateString = function() { return $$STRING$$; };
Date.prototype.toTimeString = function() { return $$STRING$$; };
Date.prototype.toLocaleString =function() { return $$STRING$$; };
Date.prototype.toLocaleDateString = function() { return $$STRING$$; };
Date.prototype.toLocaleTimeString = function() { return $$STRING$$; };
Date.prototype.valueOf = function() { return $$NUMBER$$; };
Date.prototype.getTime = function() { return $$NUMBER$$; };
Date.prototype.getFullYear = function() { return $$NUMBER$$; };
Date.prototype.getUTCFullYear = function() { return $$NUMBER$$; };
Date.prototype.getMonth = function() { return $$NUMBER$$; };
Date.prototype.getUTCMonth = function() { return $$NUMBER$$; };
Date.prototype.getDate = function() { return $$NUMBER$$; };
Date.prototype.getUTCDate = function() { return $$NUMBER$$; };
Date.prototype.getDay = function() { return $$NUMBER$$; };
Date.prototype.getUTCDay = function() { return $$NUMBER$$; };
Date.prototype.getHours = function() { return $$NUMBER$$; };
Date.prototype.getUTCHours = function() { return $$NUMBER$$; };
Date.prototype.getMinutes = function() { return $$NUMBER$$; };
Date.prototype.getUTCMinutes = function() { return $$NUMBER$$; };
Date.prototype.getSeconds = function() { return $$NUMBER$$; };
Date.prototype.getUTCSeconds = function() { return $$NUMBER$$; };
Date.prototype.getMilliseconds = function() { return $$NUMBER$$; };
Date.prototype.getUTCMilliseconds = function() { return $$NUMBER$$; };
Date.prototype.getTimezoneOffset = function() { return $$NUMBER$$; };
Date.prototype.setTime = function() { return $$NUMBER$$; };
Date.prototype.setFullYear = function() { return $$NUMBER$$; };
Date.prototype.setUTCFullYear = function() { return $$NUMBER$$; };
Date.prototype.setMonth = function() { return $$NUMBER$$; };
Date.prototype.setUTCMonth = function() { return $$NUMBER$$; };
Date.prototype.setDate = function() { return $$NUMBER$$; };
Date.prototype.setUTCDate = function() { return $$NUMBER$$; };
Date.prototype.setHours = function() { return $$NUMBER$$; };
Date.prototype.setUTCHours = function() { return $$NUMBER$$; };
Date.prototype.setMinutes = function() { return $$NUMBER$$; };
Date.prototype.setUTCMinutes = function() { return $$NUMBER$$; };
Date.prototype.setSeconds = function() { return $$NUMBER$$; };
Date.prototype.setUTCSeconds = function() { return $$NUMBER$$; };
Date.prototype.setMilliseconds = function() { return $$NUMBER$$; };
Date.prototype.setUTCMilliseconds = function() { return $$NUMBER$$; };
Date.prototype.toUTCString = function() { return $$STRING$$; };
Date.prototype.toISOString = function() { return $$STRING$$; };
Date.prototype.toJSON = function() { return $$STRING$$; };

// 15.10
RegExp.prototype.constructor = RegExp;
RegExp.prototype.exec = function() { return [$$STRING$$] || null; };
RegExp.prototype.test = function() { return $$BOOLEAN$$; };
RegExp.prototype.toString = function() { return $$STRING$$; };

// 15.11
Error.prototype.constructor = Error;
Error.prototype.name = "Error";
Error.prototype.message = "";
Error.prototype.toString = function() { return $$STRING$$; };

// 15.12
JSON.parse = function() { return {}; };
JSON.stringify = function() { return $$STRING$$; };
