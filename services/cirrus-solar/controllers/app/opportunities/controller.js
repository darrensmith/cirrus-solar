/*!
* controllers/web/applications/controller.js
*
* Copyright (c) 2019 Darren Smith
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
		var oppModel = req.service.models.get("opportunities");
		var context = {};
		oppModel.list({}, function(oppListErr, oppList) {
			if(oppList) {
				context.opportunities = oppList.results;
			} else {
				req.log("error", oppListErr.message, { "code": oppListErr.code, "error": oppListErr.error, "msgId": req.msgId });
				res.redirect("/app?message=failure&code=" + oppListErr.code);
				return;
			}
			res.render("app/opportunities.mustache", context);
		});
	}


	/**
	 * (ENTRY POINT FOR EXECUTION)
	 */
	module.exports = ctrl;
	
}();