/*!
* controllers/app/admin/controller.js
*
* Copyright (c) 2020 Darren Smith
* Licensed under the LGPL license.
*/

;!function(undefined) {

	var ctrl = {};

	/**
	 * GET
	 * @param {object} req - Request object
	 * @param {object} res - Response object
	 */
	ctrl.get = function(req, res){
		req.auth.web([], function() {
			var context = {};
			var service = req.core.module("services").service("cirrus-solar");
			context.voltage = service.vars.get("voltage");
			res.render("app/admin/admin.mustache", context);
		});
	}

	/**
	 * (ENTRY POINT FOR EXECUTION)
	 */
	module.exports = ctrl;
	
}();