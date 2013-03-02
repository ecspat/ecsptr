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

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define(function(require, exports) {
	var ast = require('ecspat-util/ast'),
		decls = require('ecspat-util/decls'),
		sets = require('ecspat-util/sets'),
		absvars = require('./absvars'),
		absvals = require('./absvals');

	function Solver() {
		// delegates for handling abstract variables and values
		this.var_manager = new absvars.Manager(this);
		this.val_manager = new absvals.Manager();

		// data structures used by analysis
		this.outgoing_constraints = [];
		this.points_to = [];
		this.hooks = [];
		this.inherit_cache = [];

		// worklist; actually a set
		this.worklist = sets.empty;

		// set up some well-known points-to facts
		this.addValue(this.var_manager.mkAbsField(absvals.GLOBAL, "Object", true), absvals.StdObject);
		this.addValue(this.var_manager.mkAbsField(absvals.GLOBAL, "Function", true), absvals.StdFunction);
		this.addValue(this.var_manager.mkAbsField(absvals.GLOBAL, "RegExp", true), absvals.StdRegExp);
		this.addValue(this.var_manager.mkAbsField(absvals.GLOBAL, "Array", true), absvals.StdArray);
		this.addValue(this.var_manager.mkAbsField(absvals.GLOBAL, "String", true), absvals.StdString);
		this.addValue(this.var_manager.mkAbsField(absvals.StdObject, '$$proto$$'), absvals.Function_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.StdObject, 'prototype', true), absvals.Object_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.StdArray, '$$proto$$'), absvals.Function_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.StdArray, 'prototype', true), absvals.Array_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.StdFunction, '$$proto$$'), absvals.Function_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.StdFunction, 'prototype', true), absvals.Function_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.StdRegExp, '$$proto$$'), absvals.Function_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.StdRegExp, 'prototype', true), absvals.RegExp_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.StdString, '$$proto$$'), absvals.Function_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.StdString, 'prototype', true), absvals.String_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.Object_prototype, '$$proto$$'), absvals.NULL);
		this.addValue(this.var_manager.mkAbsField(absvals.Array_prototype, '$$proto$$'), absvals.Object_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.String_prototype, '$$proto$$'), absvals.Object_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.Function_prototype, '$$proto$$'), absvals.Object_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.RegExp_prototype, '$$proto$$'), absvals.Object_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.REGEXP, '$$proto$$'), absvals.RegExp_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.STRING, '$$proto$$'), absvals.String_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.GLOBAL, '$$proto$$'), absvals.Object_prototype);
		this.addValue(this.var_manager.mkAbsField(absvals.STRING, 'length', true), absvals.NUMBER);
		this.addValue(this.var_manager.mkAbsField(absvals.REGEXP, 'source', true), absvals.STRING);
		this.addValue(this.var_manager.mkAbsField(absvals.REGEXP, 'global', true), absvals.BOOLEAN);
		this.addValue(this.var_manager.mkAbsField(absvals.REGEXP, 'ignoreCase', true), absvals.BOOLEAN);
		this.addValue(this.var_manager.mkAbsField(absvals.REGEXP, 'multiline', true), absvals.BOOLEAN);
		this.addValue(this.var_manager.mkAbsField(absvals.REGEXP, 'lastIndex', true), absvals.NUMBER);
	}

	// call back used by the abstract variable manager to inform the solver that a new variable was created
	Solver.prototype.newAbsVar = function(idx) {
		this.hooks[idx] = [],
		this.outgoing_constraints[idx] = [],
		this.points_to[idx] = void(0);
	};

	// add absval to points-to set of absvar; if absvar didn't previously point to absval, it is put onto the
	// worklist and all its hooks are triggered
	Solver.prototype.addValue = function(absvar, absval) {
		var absvar_idx = this.var_manager.absvar2idx(absvar),
			absval_idx = this.val_manager.absval2idx(absval);
		var prev = this.points_to[absvar_idx];
		if (!sets.contains(prev, absval_idx)) {
			this.points_to[absvar_idx] = sets.add(prev, absval_idx);
			this.worklist = sets.add(this.worklist, absvar_idx);
			this.hooks[absvar_idx].forEach(function(hook) {
				hook(absval);
			});
		}
	};

	// add a new inclusion constraint to the system; left hand side is put onto the worklist
	Solver.prototype.addConstraint = function(lhs, rhs) {
		var lhs_idx = this.var_manager.absvar2idx(lhs),
			rhs_idx = this.var_manager.absvar2idx(rhs);
		//console.log(this.var_manager.pp_absvar(lhs) + "(" + lhs_idx + ")" + " C= " + this.var_manager.pp_absvar(rhs) + "(" + rhs_idx + ")");
		this.outgoing_constraints[lhs_idx].push(rhs_idx);
		this.worklist = sets.add(this.worklist, lhs_idx);
	};

	// add a new hook to given variable, which is immediately invoked on any abstract value it currently points to
	Solver.prototype.addHook = function(absvar, hook) {
		var absvar_idx = this.var_manager.absvar2idx(absvar),
			valMgr = this.val_manager;
		this.hooks[absvar_idx].push(hook);
		sets.forEach(this.points_to[absvar_idx], function(absval) {
			hook(valMgr.idx2absval(absval));
		});
	};

	// iteratively solve the constraint system
	Solver.prototype.solve = function() {
		var self = this;

		function flowInto(absvals, absvar) {
			if (typeof absvar !== 'number') throw new Error("absvar should be number, but is " + typeof absvar);
			var old_vals = self.points_to[absvar],
				new_vals = old_vals,
				hks = self.hooks[absvar],
				changed = false;

			sets.forEach(absvals, function(absval) {
				if (typeof absval !== 'number') throw new Error("absval should be number, but is " + typeof absvar);
				if (!sets.contains(old_vals, absval)) {
					changed = true;
					new_vals = sets.add(new_vals, absval);
					hks.forEach(function(hook) {
						hook(self.val_manager.idx2absval(absval));
					});
				}
			});

			if (changed) {
				self.points_to[absvar] = new_vals;
				self.worklist = sets.add(self.worklist, absvar);
			}
		}

		while (!sets.isEmpty(self.worklist)) {
			sets.choose(self.worklist, function(absvar, rest) {
				self.worklist = rest;
				var absvals = self.points_to[absvar];
				self.outgoing_constraints[absvar].forEach(function(rhs) {
					flowInto(absvals, rhs);
				});
			});
		}
	};

	Solver.prototype.printSolution = function() {
		var self = this;
		self.var_manager.forEachVariable(function(absvar, absvar_idx) {
			var absvals = self.points_to[absvar_idx];
			if (absvals != sets.empty && (absvar.pp_absvar || absvar.id || ast.getAttribute(absvar, 'isParam'))) console.log(self.var_manager.pp_absvar(absvar_idx) + " -> " + sets.pp(absvals, self.val_manager.pp_absval, self.val_manager));
		});
	};

	exports.Solver = Solver;
});