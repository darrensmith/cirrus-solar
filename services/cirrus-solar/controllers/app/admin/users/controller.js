/*!
* controllers/app/admin/users/controller.js
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
			var userModel = req.service.models.get("users");
			if(req.query.page) { var pageNumber = parseInt(req.query.page); }
			else { var pageNumber = 1; }
			if(req.query.size) { var pageSize = parseInt(req.query.size); }
			else { var pageSize = 10; }
			var inputObject = { pageSize: pageSize, pageNumber: pageNumber }
			userModel.list(inputObject, function(userListErr, userList) {
				if(userList) {
					context.users = userList.results;
					userList.pageSize = pageSize;
					context = req.service.vars.get("pageBar")(userList, context);
				} else {
					req.log("error", userListErr.message, { "code": userListErr.code, "error": userListErr.error, "msgId": req.msgId });
					res.redirect("/app/admin?message=failure&code=" + userListErr.code);
					return;
				}
				res.render("app/admin/users/users.mustache", context);
			});
		});
	}

	/**
	 * (ENTRY POINT FOR EXECUTION)
	 */
	module.exports = ctrl;
	
}();