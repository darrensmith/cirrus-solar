/*!
* controllers/app/admin/newsletter/subscribers/controller.js
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
			var subscriberModel = req.service.models.get("newsletterSubscribers");
			if(req.query.page) { var pageNumber = parseInt(req.query.page); }
			else { var pageNumber = 1; }
			if(req.query.size) { var pageSize = parseInt(req.query.size); }
			else { var pageSize = 10; }
			var inputObject = { pageSize: pageSize, pageNumber: pageNumber }
			subscriberModel.list(inputObject, function(subscriberListErr, subscriberList) {
				if(subscriberList) {
					context.subscribers = subscriberList.results;
					subscriberList.pageSize = pageSize;
					context = req.service.vars.get("pageBar")(subscriberList, context);
				} else {
					req.log("error", subscriberListErr.message, { "code": subscriberListErr.code, "error": subscriberListErr.error, "msgId": req.msgId });
					res.redirect("/app/admin?message=failure&code=" + subscriberListErr.code);
					return;
				}
				res.render("app/admin/newsletter/subscribers.mustache", context);
			});
		});
	}

	/**
	 * (ENTRY POINT FOR EXECUTION)
	 */
	module.exports = ctrl;
	
}();