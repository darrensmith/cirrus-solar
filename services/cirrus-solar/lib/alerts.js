/*!
* lib/alerts.js
*
* Copyright (c) 2020 Darren Smith
* Licensed under the LGPL license.
*/

;!function(undefined) {

	/**
	 * Main Method
	 * @param {object} req - Request Object
	 * @param {object} context - Context Object
	 */
	var output = function(req, context){
		switch(req.query.code) {



			// User List Screens:
			case "USER_DOES_NOT_EXIST":
				context.alert = "Warning! Cannot add this user as they do not exist.";
				break;
			case "PASSWORD_NOT_DEFINED":
				context.alert = "Warning! Cannot create this user as you have not defined a password.";
				break;
			case "PASSWORDS_DONT_MATCH":
				context.alert = "Warning! Cannot create this user as the passwords that you entered do not match.";
				break;
			case "DB_INSERT_ERROR":
				context.alert = "Warning! There was a database error creating your new user.";
				break;
			case "NEW_USER_CREATED":
				context.success = "New User Created Successfully.";
				break;
			case "USER_DELETED":
				context.success = "User Deleted Successfully.";
				break;
			case "USER_UPDATED":
				context.success = "User Updated Successfully.";
				break;
			case "EXISTING_USER_ADDED":
				context.success = "Existing User Added Successfully.";
				break;



			// Organisations List Screens:
			case "ERROR_CREATING_ORG":
				context.alert = "There was an error creating the new organisation";
				break;
			case "ERROR_CREATING_USER_ORG":
				context.alert = "There was an error creating the user-organisation connection";
				break;	
			case "ORG_CREATED_SUCCESSFULLY":
				context.success = "The organisation was created successfully";
				break;	
			case "ORG_DELETED":
				context.success = "The organisation was deleted successfully";
				break;	
			case "ORG_DESTROYED":
				context.success = "The organisation was destroyed successfully";
				break;	
			case "ERROR_UPDATING_ORG":
				context.alert = "There was an error updating the organisation";
				break;	
			case "ORG_UPDATED":
				context.success = "The organisation was updated successfully";
				break;	



			// Applications List Screen:
			case "ERROR_FETCHING_APP_LIST":
				context.alert = "There was a database error retrieving the application list";
				break;
			case "ERROR_CREATING_APP":
				context.alert = "There was an error creating the application";
				break;
			case "APP_CREATED_1":
				context.alert = "The application was created but could not create clients (1)";
				break;
			case "APP_CREATED_2":
				context.alert = "The application was created but could not create clients (2)";
				break;
			case "APP_CREATED_3":
				context.alert = "The application was created but could not create clients (3)";
				break;
			case "APP_CREATED":
				context.success = "The application was created successfully";
				break;
			case "ERROR_DELETING_APP":
				context.alert = "There was an error deleting the application";
				break;
			case "APP_DELETED":
				context.success = "The application was deleted";
				break;
			case "ERROR_DESTROYING_APP":
				context.alert = "There was an error destroying the application";
				break;
			case "APP_DESTROYED":
				context.success = "The application was destroyed";
				break;
			case "ERROR_UPDATING_APP":
				context.alert = "There was an error updating the application";
				break;
			case "APP_UPDATED":
				context.success = "The application was updated";
				break;




			// Client List Screen:
			case "ERROR_FETCHING_CLIENT_LIST":
				context.alert = "There was an error retrieving the client list";
				break;
			case "INVALID_APPLICATION":
				context.alert = "There was an error creating the new client as the application specified is invalid";
				break;
			case "ERROR_CREATING_CLIENT":
				context.alert = "There was an error creating the new client";
				break;
			case "CLIENT_CREATED":
				context.success = "The client was created successfully";
				break;
			case "ERROR_DELETING_CLIENT":
				context.alert = "There was an error deleting the client";
				break;
			case "CLIENT_DELETED":
				context.success = "Client deleted successfully";
				break;
			case "ERROR_DESTROYING_CLIENT":
				context.alert = "There was an error destroying the client";
				break;
			case "CLIENT_DESTROYED":
				context.success = "Client destroyed successfully";
				break;




			// Web Screen (Homepage):
			case "UNKNOWN_USER":
				context.alert = "Warning! Cannot sign you in as the email address you entered is unknown.";
				break;
			case "PASSWORD_INCORRECT":
				context.alert = "Warning! Cannot sign you in as the password that you entered is incorrect.";
				break;
			case "REGISTRATION_UNSUPPORTED":
				context.alert = "Warning! Registration is not yet supported within IndustrySwarm Identity.";
				break;
			case "NOT_AUTHORISED":
				context.alert = "Warning! You are not authorised to access the requested resource.";
				break;
			case "FORGOT_PASSWORD_LINK_SENT":
				context.alert = "You have been emailed a link to reset your password.";
				break;





			default:
				break;




		}
		return context;
	}

	module.exports = output;
}();