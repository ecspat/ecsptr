dom_model.js : idl/canvas.idl idl/domcore.idl idl/events.idl idl/htmlelts.idl idl/supplement.js idl/windowobjs.idl idl2js.js
	node idl2js.js idl/*.idl >dom_model.js; cat idl/supplement.js >>dom_model.js