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
    var ast = require('ecspat-util/ast'),
        decls = require('ecspat-util/decls');

    // type of abstract fields
    function AbsField(object, index, fromSource) {
	this.type = 'abstract field';
	this.object = object;
	this.index = index;
	this.fromSource = fromSource;
    }
    AbsField.prototype.pp_absvar = function(mgr) {
	return mgr.pp_absval(this.object) + "." + this.index;
    };
	
    // type of abstract receivers
    function AbsRecv(fn) {
	this.type = 'abstract receiver';
	this.fn = fn;
    }
    AbsRecv.prototype.pp_absvar = function(mgr) {
	return mgr.pp_absval(this.fn) + ":this";
    };
    
    // type of abstract return variables
    function AbsRetVar(fn) {
	this.type = 'abstract return';
	this.fn = fn;
    }
    AbsRetVar.prototype.pp_absvar = function(mgr) {
	return mgr.pp_absval(this.fn) + ":ret";
    };    

    function Manager(solver) {
	this.absvars = [];
	this.solver = solver;
    }

    // helper functions for converting between abstract variables and their indices
    Manager.prototype.absvar2idx = function absvar2idx(absvar) {
	if(typeof absvar === 'number')
	    throw new Error("Expected abstract variable, got number.");
	var idx = ast.getAttribute(absvar, 'absvar_idx', -1);
	if(idx === -1) {
	    ast.setAttribute(absvar, 'absvar_idx', idx = this.absvars.length);
	    this.absvars[idx] = absvar;
	    this.solver.newAbsVar(idx);
	}
	return idx;
    };
    
    Manager.prototype.idx2absvar = function idx2absvar(idx) {
	return this.absvars[idx];
    };

    // creates abstract variable corresponding to local variable 'name' in 'scope'
    Manager.prototype.mkAbsLocal = function(scope, name) {
	return scope.lookup(name);
    };
    
    // creates abstract field corresponding to field 'field' of abstract object 'obj'
    Manager.prototype.mkAbsField = function(obj, field, fromSource) {
	var absfields = ast.getAttribute(obj, 'absfields', {});
	var key = '$$' + field,
            cached = absfields[key];
	if(cached) {
	    if(fromSource)
		cached.fromSource = true;
	    return cached;
	} else {
	    return absfields[key] = new AbsField(obj, field, fromSource);
	}
    };

    Manager.prototype.allFields = function(obj) {
	var fields_info = [];
	var absfields = ast.getAttribute(obj, 'absfields', {});
	Object.keys(absfields).forEach(function(key) {
	    if(key.substring(0, 2) === '$$')
		fields_info.push([key.substring(2), absfields[key].fromSource]);
	});
	return fields_info;
    };
    
    // creates abstract 'this' variable for function 'fn'
    Manager.prototype.mkThisVar = function(fn) {
	return ast.getAttribute(fn, 'absrecv', new AbsRecv(fn));
    };
    
    // creates a return variable for this scope
    Manager.prototype.mkRetVar = function(scope) {
	var fn = scope.type ? scope : scope.enclosingFunction();
	return ast.getAttribute(fn, 'absretvar', new AbsRetVar(fn));
    };

    Manager.prototype.forEachVariable = function(cb) {
	this.absvars.forEach(cb);
    };

    Manager.prototype.pp_absvar = function(absvar) {
	if(typeof absvar === 'number')
	    absvar = this.idx2absvar(absvar);

	if(absvar.pp_absvar)
	    return absvar.pp_absvar(this.solver.val_manager);

	if(absvar.id)
	    return decls.getDeclName(absvar) + "@" + ast.getPosition(absvar).toString(true);
	else if(ast.getAttribute(absvar, 'isParam'))
	    return absvar.name + "@" + ast.getPosition(absvar).toString(true);
	else
	    return "expr@" + ast.getPosition(absvar).toString(true);
    };
    
    exports.Manager = Manager;
});