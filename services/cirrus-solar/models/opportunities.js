/*!
* models/users.js
*
* Copyright (c) 2020 Darren Smith
* Licensed under the LGPL license.
*/

;!function(undefined) {

	var model = {}, core, service, db;

	/**
	 * Initialises the model
	 * @param {object} coreObj - The parent core object
	 */
	model.init = function(coreObj){
		core = coreObj;
		service = core.module("services").service("cirrus-solar");
		db = service.vars.get("db");
		return model;
	}

	/**
	 * Fetch List of Opportunities
	 * @param {object} inputObject - Input Object
	 * @param {function} cb - Callback Function
	 */
	model.list = function(inputObject, cb){
		db.query(
		  "SELECT * FROM salesforce.opportunities", [],
		  function(err, res) {
		  	if(err) {
		  		cb({
		  			success: false,
		  			code: "ERROR_GETTING_OPPORTUNITIES",
		  			message: "There was an error getting the list of opportunities",
		  			error: err
		  		}, null);
		  		return;
		  	} else {
		  		cb(null, {
		  			success: false,
		  			code: "GOT_OPPORTUNITIES",
		  			message: "Got opportunities successfully",
		  			results: res.rows;
		  		});
		  		return;
			}
		  }
		);
		return;
	}

	/**
	 * (ENTRY POINT FOR EXECUTION)
	 */
	module.exports = model.init;
}();