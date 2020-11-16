/*!
* controllers/app/admin/controller.js
*
* Copyright (c) 2020 Darren Smith
* Licensed under the LGPL license.
*/

;!function(undefined) {

	var ctrl = {};

	/**
	 * INIT
	 * @param {object} req - Request object
	 * @param {object} res - Response object
	 */
	ctrl.init = function(core){
		var context = {};
		var httpClient = core.module("http", "interface").client;
		var service = core.module("services").service("cirrus-solar");
		setInterval(function(){
			httpClient.get("http://solar.home.darrensmith.com.au", function(httpErr, httpRes) {
				if(httpRes) {
					log("debug", "Cirrus Solar Application > Polled Solar Panel and Got Voltage of " + (httpRes.data.voltage / 100));
					context.voltage = service.vars.set("voltage", (httpRes.data.voltage / 100));
				} else {
					log("debug", "Cirrus Solar Application > Error Polling Solar Panel", httpErr);
				}
			});
		}, 1000);
	}

	/**
	 * GET
	 * @param {object} req - Request object
	 * @param {object} res - Response object
	 */
	ctrl.get = function(req, res){
		var service = req.core.module("services").service("cirrus-solar");
		var voltage = service.vars.get("voltage");
		res.send({"voltage": voltage});
	}

	/**
	 * (ENTRY POINT FOR EXECUTION)
	 */
	module.exports = ctrl;
	
}();