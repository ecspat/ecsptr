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

/* Simple Andersen-style pointer analysis for JavaScript. Main entry point
 * is exports.analyse defined below. */

/*global require module console*/

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define(function(require, exports) {
	var visitor = require('ecspat-util/scoped_visitor'),
 	    ast = require('ecspat-util/ast'),
	    scope = require('ecspat-util/scope'),
	    sets = require('ecspat-util/sets'),
	    Solver = require('./solver').Solver,
            absvals = require('./absvals'),
            parsing = require('ecspat-util/parsing');

	var Object_prototype = absvals.Object_prototype,
		Function_prototype = absvals.Function_prototype,
		Array_prototype = absvals.Array_prototype,
		NULL = absvals.NULL,
		BOOLEAN = absvals.BOOLEAN,
		NUMBER = absvals.NUMBER,
		STRING = absvals.STRING,
		GLOBAL = absvals.GLOBAL;

	// convert from (simple) Closure type annotations to an expression
	// that our analysis understands
	function type2expr(tp) {
		switch (tp) {
		case 'Number':
			return {
				type: 'Identifier',
				name: '$$NUMBER$$'
			};
		case 'Boolean':
			return {
				type: 'Identifier',
				name: '$$BOOLEAN$$'
			};
		case 'String':
			return {
				type: 'Identifier',
				name: '$$STRING$$'
			};
		default:
			return {
				type: 'NewExpression',
				callee: {
					type: 'Identifier',
					name: tp
				},
				"arguments": []
			};
		}
	}

	// visit subtree and generate constraints
	function visit(nd, ctxt, inh) {
		function inherit(obj, p, abs_field) {
			var field_idx = varMgr.absvar2idx(abs_field);
			if (!solver.inherit_cache[field_idx]) {
				solver.inherit_cache[field_idx] = true;
				solver.addHook(varMgr.mkAbsField(obj, "$$proto$$"),

				function(proto) {
					var proto_p = varMgr.mkAbsField(proto, p);
					solver.addConstraint(proto_p, abs_field);
					inherit(proto, p, proto_p);
				});
			}
		}

		function addRefConstraint(nd, fn) {
			switch (nd.type) {
			case 'Identifier':
				// check for special variables
				var n = nd.name.length;
				if (nd.name.length > 4 && nd.name.substring(0, 2) === '$$' && nd.name.substring(n - 2) === '$$') {
					var special_name = nd.name.substring(2, n - 2);
					if (special_name in absvals) {
						solver.addValue(nd, absvals[special_name]);
						break;
					}
					console.warn("unrecognised special variable " + nd.name);
				}

				if (scope.isGlobal(nd.name)) {
					fn(varMgr.mkAbsField(GLOBAL, nd.name, true));
				} else {
					fn(scope.lookup(nd.name), nd);
				}
				break;
			case 'MemberExpression':
				var field_name = nd.computed ? "$$$$" : nd.property.name;
				if (field_name === '__proto__') field_name = '$$proto$$';
				solver.addHook(nd.object, function(new_object) {
					var abs_field = varMgr.mkAbsField(new_object, field_name, true);
					fn(abs_field);
					if (inh) inherit(new_object, field_name, abs_field);
				});
				break;
			default:
				throw new Error("invalid left hand side of type " + nd.type);
			}
		}

		function mkFakeValue(nd) {
			// TODO: make fake value inherit from Object.prototype
			return valMgr.mkFakeValue(nd);
		}

		if (!nd) return;

		// TODO: this is for debugging only
		if (ast.isFunctionNode(nd)) nd.params.forEach(function(param) {
			ast.setAttribute(param, 'isParam', true);
		});

		var scope = ctxt.scope,
			options = ctxt.options,
			solver = ctxt.solver,
			valMgr = solver.val_manager,
			varMgr = solver.var_manager;
		switch (nd.type) {
		case 'Program':
			// initialise comment map
			ctxt.comments = [];
			if (nd.comments) nd.comments.forEach(function(comment) {
				ctxt.comments[comment.loc.end.line] = comment.value;
			});
			break;
		case 'Literal':
			solver.addValue(nd, valMgr.fromValue(nd.value));
			break;
		case 'Identifier':
		case 'MemberExpression':
			// only add constraint if we aren't the LHS of an assignment
			if (!(ctxt.parent && ctxt.parent.type === 'AssignmentExpression' && ctxt.parent.operator === '=' && ctxt.childIndex === 0)) addRefConstraint(nd, function(absvar) {
				solver.addConstraint(absvar, nd);
			}, true);
			break;
		case 'FunctionExpression':
			solver.addValue(nd, nd);
			var default_proto = valMgr.mkDefaultProto(nd);
			solver.addValue(varMgr.mkAbsField(nd, 'prototype', true), default_proto);
			solver.addValue(varMgr.mkAbsField(nd, 'length', true), NUMBER);
			solver.addValue(varMgr.mkAbsField(nd, '$$proto$$'), Function_prototype);
			solver.addValue(varMgr.mkAbsField(default_proto, '$$proto$$'), Object_prototype);
			if (options.fake_values !== false) {
				solver.addValue(varMgr.mkThisVar(nd), mkFakeValue(nd));
				nd.params.forEach(function(param) {
					solver.addValue(param, mkFakeValue(param));
				});
			}
			break;
		case 'ArrayExpression':
			solver.addValue(nd, nd);
			solver.addValue(varMgr.mkAbsField(nd, 'length', true), NUMBER);
			solver.addValue(varMgr.mkAbsField(nd, '$$proto$$'), Array_prototype);
			nd.elements.forEach(function(elt, idx) {
				if (elt) {
					solver.addConstraint(elt, varMgr.mkAbsField(nd, '$$$$'));
				} else {
					solver.addValue(varMgr.mkAbsField(nd, '$$$$'), NULL);
				}
			});
			break;
		case 'ObjectExpression':
			solver.addValue(nd, nd);
			solver.addValue(varMgr.mkAbsField(nd, '$$proto$$'), Object_prototype);
		    nd.properties.forEach(function(prop) {
			if (prop.kind === 'init') {
			    if (prop.key.type === 'Literal') {
				solver.addConstraint(prop.value, varMgr.mkAbsField(nd, '$$$$', true));
			    } else if (prop.key.type === 'Identifier') {
				solver.addConstraint(prop.value, varMgr.mkAbsField(nd, prop.key.name, true));
			    }
			}
			if (options.implicit_receivers !== false) {
			    solver.addHook(prop.value, function(new_value) {
				if (valMgr.isFunction(new_value)) {
				    solver.addConstraint(nd, varMgr.mkThisVar(new_value));
				}
			    });
			}
		    });
		    break;
		case 'ThisExpression':
			if (!scope.enclosingFunction()) solver.addValue(nd, GLOBAL);
			else solver.addConstraint(varMgr.mkThisVar(scope.enclosingFunction()), nd);
			break;
		case 'AssignmentExpression':
			if (nd.operator === '=') {
				// check for type annotations
				var comment = ctxt.comments[nd.loc.start.line - 1],
					r;
				if (comment) {
					if ((r = comment.match(/@type (\w+)/))) {
						nd.right = type2expr(r[1]);
					} else if ((r = comment.match(/@return (\w+)/))) {
						if (nd.right.type === 'FunctionExpression') {
							nd.right.body.body.push({
								type: 'ReturnStatement',
								argument: type2expr(r[1])
							});
						}
					}
				}

				addRefConstraint(nd.left, function(absvar) {
					solver.addConstraint(nd.right, absvar);
				}, false);
			} else {
				addRefConstraint(nd.left, function(absvar) {
					solver.addValue(absvar, NUMBER);
					if (nd.operator === '+=') solver.addValue(absvar, STRING);
				}, false);
			}
			solver.addConstraint(nd.right, nd);
			break;
		case 'CallExpression':
		case 'NewExpression':
			var args = nd["arguments"],
				nargs = nd["arguments"].length;
			solver.addHook(nd.callee, function(new_function) {
				if (valMgr.isFunction(new_function)) {
					for (var j = 0; j < new_function.params.length && j < nargs; ++j)
					solver.addConstraint(args[j], new_function.params[j]);
					if (nd.type === 'NewExpression') {
						var new_instance = valMgr.mkAbsInstance(new_function);
						solver.addValue(varMgr.mkThisVar(new_function), new_instance);
						solver.addConstraint(varMgr.mkAbsField(new_function, 'prototype', true),
						varMgr.mkAbsField(new_instance, '$$proto$$'));
						solver.addValue(nd, new_instance);
					} else if (nd.callee.type === 'MemberExpression') {
						solver.addConstraint(nd.callee.object, varMgr.mkThisVar(new_function));
					} else {
						solver.addValue(varMgr.mkThisVar(new_function), GLOBAL);
					}
					solver.addConstraint(varMgr.mkRetVar(new_function), nd);
				}
			});
			break;
		case 'SequenceExpression':
			solver.addConstraint(nd.expressions[nd.expressions.length - 1], nd);
			break;
		case 'LogicalExpression':
		case 'BinaryExpression':
			switch (nd.operator) {
			case '+':
				solver.addValue(nd, NUMBER);
				solver.addValue(nd, STRING);
				break;
			case '-':
			case '/':
			case '*':
			case '%':
			case '&':
			case '|':
			case '^':
			case '<<':
			case '>>':
			case '>>>':
				solver.addValue(nd, NUMBER);
				break;
			case '&&':
			case '||':
				solver.addConstraint(nd.left, nd);
				solver.addConstraint(nd.right, nd);
				break;
			case '!==':
			case '!=':
			case '===':
			case '==':
			case '<':
			case '<=':
			case '>':
			case '>=':
			case 'in':
			case 'instanceof':
				solver.addValue(nd, BOOLEAN);
				break;
			default:
				throw new Error("unknown binary operator " + nd.operator);
			}
			break;
		case 'ConditionalExpression':
			solver.addConstraint(nd.consequent, nd);
			solver.addConstraint(nd.alternate, nd);
			break;
		case 'UpdateExpression':
			addRefConstraint(nd.argument, function(absvar) {
				solver.addValue(absvar, NUMBER);
			}, false);
			break;
		case 'UnaryExpression':
			switch (nd.operator) {
			case '!':
			case 'delete':
				solver.addValue(nd, BOOLEAN);
				break;
			case 'typeof':
				solver.addValue(nd, STRING);
				break;
			default:
				solver.addValue(nd, NUMBER);
				break;
			}
			break;
		case 'VariableDeclarator':
			if (nd.init) {
				addRefConstraint(nd.id, function(absvar) {
					solver.addConstraint(nd.init, absvar);
				}, false);
			}
			if (options.fake_values !== false) {
				addRefConstraint(nd.id, function(absvar) {
					solver.addValue(absvar, mkFakeValue(nd));
				}, false);
			}
			break;
		case 'FunctionDeclaration':
			solver.addValue(nd, nd);
			var default_proto = valMgr.mkDefaultProto(nd);
			solver.addValue(varMgr.mkAbsField(nd, 'prototype', true), default_proto);
			solver.addValue(varMgr.mkAbsField(nd, 'length', true), NUMBER);
			solver.addValue(varMgr.mkAbsField(nd, '$$proto$$'), Function_prototype);
			solver.addValue(varMgr.mkAbsField(default_proto, '$$proto$$'), Object_prototype);
			addRefConstraint(nd.id, function(absvar) {
				solver.addValue(absvar, nd);
			}, false);
			if (options.fake_values !== false) {
				solver.addValue(varMgr.mkThisVar(nd), mkFakeValue(nd));
				nd.params.forEach(function(param) {
					solver.addValue(param, mkFakeValue(param));
				});
			}
			break;
		case 'ForInStatement':
			var lhs;
			if (nd.left.type === 'VariableDeclaration') lhs = nd.left.declarations[0].id;
			else lhs = nd.left;
			addRefConstraint(lhs, function(absvar) {
				solver.addValue(absvar, STRING);
			}, false);
			break;
		case 'ReturnStatement':
			if (nd.argument) solver.addConstraint(nd.argument, varMgr.mkRetVar(scope));
			break;
		}
		return true;
	}

        /** Analyse given files. Options include "no_stdlib" and "no_dom" to
         * exclude standard library and DOM models, respectively, and
         * "fake_values" and "implicit_receivers" to enable usage-based inference
         * (on by default). */
	function analyse(files, options) {
	    options = options || {};

	    if(!Array.isArray(files))
		files = [files];
	    if(!options.no_stdlib) 
		files.push(__dirname + '/stdlib_model.js');
	    if(!options.no_dom)
		files.push(__dirname + '/dom_model.js');

	    var program = parsing.parseFiles(files);
	    var start = +new Date();
	    var solver = new Solver();
	    visitor.visitWithScope(program, {
		solver: solver,
		options: options
	    }, visit);
	    solver.time_building_constraints = +new Date() - start;
	    start = +new Date();
	    solver.solve();
	    solver.time_solving_constraints = +new Date() - start;
	    solver.program = program;
	    return solver;
	}

	exports.analyse = analyse;
});