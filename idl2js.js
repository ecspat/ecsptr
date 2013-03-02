// ad-hoc WebIDL processor that turns a WebIDL specification into a JavaScript stub file to be used by the pointer analysis
var WebIDL2 = require('webidl2'),
    fs = require('fs');

var spec = "";
for(var i=2;i<process.argv.length;++i)
    spec += fs.readFileSync(process.argv[i], 'utf-8');

var ast = WebIDL2.parse(spec);

var inheritance = {};
var subtypes = {};
var members = {};

function addSubtype(sup, sub) {
    if(!subtypes[sup])
	subtypes[sup] = [sup];
    subtypes[sup].push(sub);
    if(inheritance[sup])
	addSubtype(inheritance[sup], sub);
}

function noteInheritance(sub, sup) {
    if(!subtypes[sub])
	subtypes[sub] = [sub];
    inheritance[sub] = sup;
    if(sup)
	addSubtype(sup, sub);
}

function hasAttribute(def, attr_name) {
    return def.extAttrs.some(function(attr) {
	return attr.name === attr_name;
    });
}

function typestub(tp) {
    var res;

    if(typeof tp === 'string')
	tp = { idlType: tp };

    if(tp.union) {
	res = tp.idlType.map(typestub).join(" || ");
    } else if(tp.sequence) {
	res = "[" + typestub(tp.idlType) + "]";
    } else {
	switch(tp.idlType) {
	case 'boolean':
	    res = "$$BOOLEAN$$";
	    break;
	case 'void':
	    res = "$$UNDEFINED$$";
	    break;
	case 'byte':
	case 'octet':
	case 'short':
	case 'unsigned short':
	case 'long':
	case 'unsigned long':
	case 'long long':
	case 'unsigned long long':
	case 'float':
	case 'unrestricted float':
	case 'double':
	case 'unrestricted double':
	case 'DOMTimeStamp':
	    res = "$$NUMBER$$";
	    break;
	case 'DOMString':
	    res = "$$STRING$$";
	    break;
	case 'object':
	    res = "{}";
	    break;
	case 'any':
	    res = "$$ANY$$";
	    break;
	default:
	    if(tp.idlType[0].toUpperCase() !== tp.idlType[0])
		console.warn("Interpreting " + tp.idlType + " as a type name");
	    res = (subtypes[tp.idlType] || [tp.idlType]).map(function(tp) {
		return "new " + tp + "()";
	    }).join(" || ");
	}
    }

    if(tp.array) {
	for(var i=0;i<tp.array;++i) {
	    res = "[" + res + "]";
	    if(tp.nullableArray && tp.nullableArray[i])
		res += " || null";
	}
	if(!tp.nullableArray && tp.nullable)
	    res += " || null";
    } else if(tp.nullable) {
	res += " || null";
    }
    return res;
}

// set up subtype relation
ast.forEach(function(def) {
    if(def.type === 'interface' || def.type === 'dictionary') {
	if(!hasAttribute(def, 'NoInterfaceObject') && !hasAttribute(def, 'Callback'))
	    noteInheritance(def.name, def.inheritance);
	members[def.name] = def.members;
    } else if(def.type !== 'implements') {
	console.warn("Don't know what to do with definition of type " + def.type);
    }
});

// Flatten out implements declarations
ast.forEach(function(decl) {
    if(decl.type === "implements") {
	var targetMembers = members[decl.target],
	    sourceMembers = members[decl["implements"]];

        if(!targetMembers || !sourceMembers)
            console.warn("Skipping " + decl.target + " implements " + decl["implements"]);
        else
	    JSON.parse(JSON.stringify(sourceMembers)).forEach(function(member) { targetMembers.push(member); });
    }
});

// emit stubs
for(var tp in inheritance) {
    console.log(tp + " = function(){};");
    if(inheritance[tp])
	console.log(tp + ".prototype = new " + inheritance[tp] + "();");
    members[tp].forEach(function(member) {
	switch(member.type) {
	case 'attribute':
	case 'const':
	case 'field':
	    console.log(tp + ".prototype." + member.name + " = " + typestub(member.idlType) + ";");
	    break;
	case 'operation':
	    if(member.getter) {
		console.log(tp + ".prototype[" + typestub(member.arguments[0].idlType) + "] = " + typestub(member.idlType) + ";");
	    } else {
		console.log(tp + ".prototype." + member.name + " = function() { return " + typestub(member.idlType) + "; };");
	    }
	    break;
	default:
	    console.warn("Ignoring member of type " + member.type);
	}
    });
}