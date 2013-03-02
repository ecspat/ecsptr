/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Max Schaefer - initial API and implementation
 *******************************************************************************/

/*global require module*/

if(typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require, exports) {
    var ast = require('ecspat-util/ast');
    
    // some fundamental abstract values
    var UNDEFINED = exports.UNDEFINED = { pp_absval: function() { return 'UNDEFINED'; } },
        BOOLEAN = exports.BOOLEAN = { pp_absval: function() { return 'BOOLEAN'; } },
        NUMBER = exports.NUMBER = { pp_absval: function() { return 'NUMBER'; } },
        STRING = exports.STRING = { pp_absval: function() { return 'STRING'; } },
        REGEXP = exports.REGEXP = { pp_absval: function() { return 'REGEXP'; } },
	NULL = exports.NULL = { pp_absval: function() { return 'NULL'; } },
        GLOBAL = exports.GLOBAL = { pp_absval: function() { return 'GLOBAL'; } },
        ANY = exports.ANY = { pp_absval: function() { return 'ANY'; } },
        StdArray = exports.StdArray = new BuiltinFunction('Array'),
        StdFunction = exports.StdFunction = new BuiltinFunction('Function'),
        StdRegExp = exports.StdRegExp = new BuiltinFunction('RegExp'),
        StdString = exports.StdString = new BuiltinFunction('String'),
        StdObject = exports.StdObject = new BuiltinFunction('Object'),
        Array_prototype = exports.Array_prototype = new BuiltinFunction('Array.prototype'),
        Function_prototype = exports.Function_prototype = new BuiltinFunction('Function.prototype'),
	RegExp_prototype = exports.RegExp_prototype = new BuiltinFunction('RegExp.prototype'),
	String_prototype = exports.String_prototype = new BuiltinFunction('RegExp.prototype'),
        Object_prototype = exports.Object_prototype = new BuiltinFunction('Object.prototype');

    // built-in function
    function BuiltinFunction(name) {
	this.type = 'Builtin Function';
	this.name = name;
	this.params = [];
	this.attr = { isFunction: true };
    }
    BuiltinFunction.prototype.pp_absval = function() {
	return this.name;
    };

    // type of abstract instances
    function AbsInstance(fn) {
	this.type = 'abstract instance';
	this.fn = fn;
    }
    AbsInstance.prototype.pp_absval = function(mgr) {
	return "new " + mgr.pp_absval(this.fn);
    };
    
    // default prototype object for a function
    function DefaultProto(fn) {
	this.type = 'default proto';
	this.fn = fn;
    }
    DefaultProto.prototype.pp_absval = function(mgr) {
	return mgr.pp_absval(this.fn) + ":default proto"
    };

    // fake value assigned to local variables
    function FakeValue(nd) {
	this.type = 'fake value';
	this.node = nd;
	this.params = [];
	this.attr = { isFunction: true };
    }
    FakeValue.prototype.pp_absval = function() {
	return "<fake value>";
    };
    
    function Manager() {
	// map containing all abstract values
	this.absvals = [];

	// allocate well-known abstract values
	this.absval2idx(UNDEFINED);
	this.absval2idx(BOOLEAN);
	this.absval2idx(NUMBER);
	this.absval2idx(STRING);
	this.absval2idx(REGEXP);
	this.absval2idx(NULL);
	this.absval2idx(GLOBAL);
	this.absval2idx(ANY);
	this.absval2idx(StdArray);
	this.absval2idx(StdString);
	this.absval2idx(StdFunction);
	this.absval2idx(StdRegExp);
	this.absval2idx(StdObject);
	this.absval2idx(Array_prototype);
	this.absval2idx(String_prototype);
	this.absval2idx(Function_prototype);
	this.absval2idx(RegExp_prototype);
	this.absval2idx(Object_prototype);
    }

    // abstract a literal value
    Manager.prototype.fromValue = function(value) {
	switch(typeof value) {
	case 'undefined':
	    return UNDEFINED;
	case 'boolean':
	    return BOOLEAN;
	case 'number':
	    return NUMBER;
	case 'string':
	    return STRING;
	case 'object':
	    if(!value)
		return NULL;
   	    if(value instanceof RegExp)
		return REGEXP;
	    return ANY;
	default:
	    return ANY;
	}
    };

    // creates an abstract instance value for this function
    Manager.prototype.mkAbsInstance = function(fn) {
	return ast.getAttribute(fn, 'absinstance', new AbsInstance(fn));
    };
    
    // creates an abstract default prototype object for this function
    Manager.prototype.mkDefaultProto = function(fn) {
	return ast.getAttribute(fn, 'default_proto', new DefaultProto(fn));
    };

    Manager.prototype.mkFakeValue = function(nd) {
	return ast.getAttribute(nd, 'fakeval', new FakeValue(nd));
    };

    Manager.prototype.isFunction = function(absval) {
	return ast.getAttribute(absval, 'isFunction', 
				ast.isFunctionNode(absval));
    };
    
    // mapping between abstract values and their indices
    Manager.prototype.absval2idx = function absval2idx(absval) {
	var idx = ast.getAttribute(absval, 'absval_idx', -1);
	if(idx === -1) {
	    ast.setAttribute(absval, 'absval_idx', idx = this.absvals.length);
	    this.absvals[idx] = absval;
	}
	return idx;
    };

    Manager.prototype.idx2absval = function idx2absval(idx) {
	return this.absvals[idx];
    };

    Manager.prototype.pp_absval = function(absval) {
	if(typeof absval === 'number')
  	    absval = this.idx2absval(absval);

	if(absval.pp_absval)
	    return absval.pp_absval(this);

	switch(absval.type) {
	case 'FunctionExpression':
	case 'FunctionDeclaration':
	    return "function@" + ast.getPosition(absval).toString(true);
	case 'ObjectExpression':
	    return "object@" + ast.getPosition(absval).toString(true);
	case 'ArrayExpression':
	    return "array@" + ast.getPosition(absval).toString(true);
	default:
	    throw new Error("cannot handle abstract value of type " + absval.type);
	}
    };

    exports.Manager = Manager;
});