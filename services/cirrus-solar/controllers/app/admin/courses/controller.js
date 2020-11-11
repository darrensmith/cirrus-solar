/*!
* controllers/app/admin/courses/controller.js
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
		res.render("app/admin/courses/courses.mustache", {});
	}

	/**
	 * (ENTRY POINT FOR EXECUTION)
	 */
	module.exports = ctrl;
	
}();