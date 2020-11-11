/*!
* lib/uniqueIdentifiers.js
*
* Copyright (c) 2019 Darren Smith
* Licensed under the LGPL license.
*/

;!function(undefined) {

	/**
	 * Entry (Selector) Method
	 * @param {object} inputObject - Input Object
	 *		{
	 *			"core": core,
	 *			"entity": "sessions",
	 *			"attr": "uuid",
	 *			"type": "uuid" OR "random"
	 *			"length": 36
	 *		}
	 *		(Or an array of these objects - will return an array of unique identifiers)
	 * @param {function} cb - Callback Function
	 */
	var entry = function(inputObject, cb){
		if(inputObject && typeof inputObject === 'object' && inputObject !== null && !(inputObject instanceof Array)) {
			generator(inputObject, cb);
		} else if (inputObject instanceof Array) {
			var counter = 0;
			var total = inputObject.length;
			var results = [];
			var interval = setInterval(function(){
				if(counter >= total) {
					clearInterval(interval);
					cb(null, results);
					return;
				}
			}, 50);
			for (var i = 0; i <= inputObject.length - 1; i++) {
				inputObject[i].order = i;
				generator(inputObject[i], function(err, res) {
					if(err)
						results[err.order] = null;
					else
						results[res.order] = res.uniqueId;
					counter ++;
				});
			}
		} else {
			cb({ success: false, code: "INVALID_INPUT_OBJECT" }, null);
		}
		return;
	}

	/**
	 * Generator Method
	 * @param {object} inputObject - Input Object
	 * @param {function} cb - Callback Function
	 */
	var generator = function(inputObject, cb){
		var core = inputObject.core;
		var entity = inputObject.entity;
		var attr = inputObject.attr;
		var type = inputObject.type;
		var length = inputObject.length;
		if(!length) { length = 36; }
		var order = inputObject.order;
		var db = core.module("services").service("company").vars.get("db");
		switch(type) {
			case "uuid":
				var uniqueId = core.module("utilities").uuid4();
				break;
			default:
				var uniqueId = core.module("utilities").randomString(length);
				break;
		}
		db.query(
		  "SELECT " + attr + " FROM " + entity + " WHERE " + attr + " = ?", [uniqueId],
		  function(err, results) { 
		  	if(err) {
		  		var errObj = { success: false, code: "DB_ERROR", error: err };
		  		if(inputObject.order)
		  			errObj.order = inputObject.order;
		  		cb(errObj, null);
		  	} else if(!results || !results[0] || !results[0][uniqueId]) {
		  		if(order || order == 0){
		  			cb(null, { uniqueId: uniqueId, order: order });
		  		} else {
		  			cb(null, uniqueId);
		  		}
		  		return;
		  	} else {
		  		generator(inputObject, cb);
		  		return;
		  	}
		  }
		);
	}

	module.exports = entry;
}();