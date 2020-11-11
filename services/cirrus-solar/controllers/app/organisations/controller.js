/*!
* controllers/web/organisations/controller.js
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
			var context = req.service.vars.get.get("signedInMenuContext")(req.core, req.session, {});
			res.render("general/organisations.mustache", context);
			return;
		});
	}

	/**
	 * (ENTRY POINT FOR EXECUTION)
	 */
	module.exports = ctrl;
}();