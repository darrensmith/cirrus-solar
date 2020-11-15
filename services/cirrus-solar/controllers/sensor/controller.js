/*!
* controllers/sensor/controller.js
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
		var service = core.module("services").service("cirrus-solar");
		if(!req.query.q) { req.query.q = 0; }
		service.vars.set("voltage", req.query.q);
		res.send({"result": "success"});
		return;
	}

	/**
	 * (ENTRY POINT FOR EXECUTION)
	 */
	module.exports = ctrl;
}();