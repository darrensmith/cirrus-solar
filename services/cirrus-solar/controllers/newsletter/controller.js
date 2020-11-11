/*!
* controllers/newsletter/controller.js
*
* Copyright (c) 2020 Darren Smith
* Licensed under the LGPL license.
*/

;!function(undefined) {

	var ctrl = {};

	/**
	 * POST (Subscribe to Newsletter)
	 * @param {object} req - Request object
	 * @param {object} res - Response object
	 */
	ctrl.post = function(req, res){
		req.auth.web([], function() {
			var subscriberModel = req.service.models.get("newsletterSubscribers");
			var subscriberObject = { email: req.body.EMAIL };
			subscriberModel.create(subscriberObject, function(subscriberCreateErr, subscriberCreateResult) {
				if(subscriberCreateResult) {
					res.redirect("/?message=success&code=" + subscriberCreateResult.code);
				} else {
					res.redirect("/?message=failure&code=" + subscriberCreateErr.code);
				}
			});
		});
		
	}

	/**
	 * (ENTRY POINT FOR EXECUTION)
	 */
	module.exports = ctrl;
	
}();