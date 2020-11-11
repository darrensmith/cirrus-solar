/*!
* models/users.js
*
* Copyright (c) 2020 Darren Smith
* Licensed under the LGPL license.
*/

;!function(undefined) {

	var model = {}, core, service, db;

	/**
	 * Initialises the model
	 * @param {object} coreObj - The parent core object
	 */
	model.init = function(coreObj){
		core = coreObj;
		service = core.module("services").service("learnalogy");
		db = service.vars.get("db");
		return model;
	}

	/**
	 * Fetch List of Users
	 * @param {object} inputObject - Input Object
	 * @param {function} cb - Callback Function
	 */
	model.list = function(inputObject, cb){
		var query = "";
		var query2 = "";
		if(inputObject.showAll) { var showAll = inputObject.showAll; }
		if(inputObject.showDeletedOnly) { var showDeletedOnly = inputObject.showDeletedOnly; }
		var pageSize = inputObject.pageSize;
		var pageNumber = inputObject.pageNumber;
		if(!pageNumber) { pageNumber = 1; }
		if(!pageSize) { pageSize = 1000000; }
		if(pageSize && pageNumber) { var limitSQL = "LIMIT " + ((pageNumber - 1) * pageSize) + ", " + pageSize; }
		var showDeletedOnlySQL = " WHERE u.isDeleted == 1 ";
		var showExcludingDeletedSQL = " WHERE (u.isDeleted <> 1 OR u.isDeleted is NULL) ";
		query += "SELECT COUNT(u.id) as userCount ";
		query += "FROM users u ";
		var params = [];
		if(showDeletedOnly) { query += showDeletedOnlySQL; } 
		else if (showAll) { null; } 
		else { query += showExcludingDeletedSQL; }
		db.query(
		  query, params,
		  function(err, results) {
		  	if(err || !results[0]) {
		  		cb({
		  			success: false,
		  			code: "ERROR_DETERMINING_USER_COUNT",
		  			message: "There was an error determining the total count of users",
		  			error: err
		  		}, null);
		  		return;
		  	} else {
		  		var totalCount = results[0].userCount;
				query2 += "SELECT u.* ";
				query2 += "FROM users u ";
				var params2 = [];
				if(showDeletedOnly) { query2 += showDeletedOnlySQL; } 
				else if (showAll) { null; } 
				else { query2 += showExcludingDeletedSQL; }
				if(limitSQL) { query2 += limitSQL; }
				db.query(
				  query2, params2,
				  function(err2, results2) {
				  	if(err2) {
				  		cb({
				  			success: false,
				  			code: "ERROR_RETRIEVING_USER_LIST",
				  			message: "There was an error retrieving the user list",
				  			error: err2
				  		}, null);
				  		return;
				  	} else {
				  		cb(null, {
				  			success: true,
				  			code: "USER_LIST_RETRIEVED",
				  			message: "User list retrieved successfully",
				  			results: results2,
				  			recordCount: totalCount,
				  			pageCount: Math.ceil(totalCount / pageSize),
				  			currentPage: pageNumber
				  		});
				  		return;	  		
					}
				  }
				);  		
			}
		  }
		);
		return;
	}

	/**
	 * Fetch Details of a User (even if deleted)
	 * @param {object} inputObject - Input Object
	 * @param {function} cb - Callback Function
	 */
	model.details = function(inputObject, cb){
		var userId = inputObject.userId;
		var email = inputObject.email;
		if(userId && !email) { var field = "id"; var param = userId; } 
		else if (email && !userId) { var field = "email"; var param = email; }
		var query = "";
		query += "SELECT * ";
		query += "FROM users ";
		query += "WHERE " + field + " = ?"
		var params = [param];
		db.query(
		  query, params,
		  function(err, results) {
		  	if(err || !results[0]) {
				cb({
					success: false,
					code: "CANNOT_FETCH_USER_DETAILS",
					message: "Unable to fetch details for the specified user",
					error: err
				}, null);
				return;
		  	} else {
				cb(null, {
					success: true,
					code: "USER_DETAILS_RETURNED",
					message: "User details returned successfully",
					result: results[0]
				});  		
		  	}
		  }
		);
		return;
	}

	/**
	 * Fetch Details of a User That is Associated With a Specified Organisation
	 * @param {object} inputObject - Input Object
	 * @param {function} cb - Callback Function
	 */
	model.orgUserDetails = function(inputObject, cb){
		var userId = inputObject.userId;
		var email = inputObject.email;
		var orgId = inputObject.orgId;
		if(!orgId) {
			cb({
				success: false,
				code: "ORGANISATION_NOT_SPECIFIED",
				message: "Organisation not specified but is required."
			}, null);
			return;
		}
		if(!userId && !email) {
			cb({
				success: false,
				code: "USER_NOT_SPECIFIED",
				message: "User ID or Email not specified but at least one of these is required."
			}, null);
			return;
		}		
		if(userId && !email) { var field = "u.id"; var param = userId; } 
		else if (email && !userId) { var field = "u.email"; var param = email; }
		var query = "";
		query += "SELECT u.* ";
		query += "FROM users u ";
		query += "JOIN organisationUsers ou ON (ou.ownerUserId=u.id) ";
		query += "WHERE " + field + " = ? AND ou.orgId = ? AND (u.isDeleted <> ? OR u.isDeleted is NULL) AND (ou.isDeleted <> ? OR ou.isDeleted is NULL)"
		var params = [param, orgId, 1, 1];
		db.query(
		  query, params,
		  function(err, results) {
		  	if(err || !results[0]) {
				cb({
					success: false,
					code: "USER_CANNOT_BE_FOUND",
					message: "The specified user cannot be found for the defined organisation.",
					error: err
				}, null);
		  		return;
		  	} else {
				cb(null, {
					success: true,
					result: results[0],
					code: "USER_FOUND",
					message: "The specified user was found successfully."
				});
			  	return;		  		
		  	}

		  }
		);
		return;
	}

	/**
	 * Create a New User
	 * @param {object} inputObject - OInput Object
	 * @param {function} cb - Callback Function
	 */
	model.create = function(inputObject, cb){
		var uniqueIdentifiers = service.vars.get("uniqueIdentifiers");
		var sourceDate = new Date();
		var currentDate = sourceDate.toISOString().slice(0, 19).replace('T', ' ');
		if(!inputObject.password) {
			cb({
				success: false,
				code: "PASSWORD_NOT_DEFINED",
				message: "No password was defined but it is required"
			}, null);
			return;
		}
		if(inputObject.password != inputObject.confirmPassword) {
			cb({
				success: false,
				code: "PASSWORDS_DONT_MATCH",
				message: "The passwords provided do not match"
			}, null);
			return;
		}
		if(!inputObject.firstName) {
			cb({
				success: false,
				code: "FIRST_NAME_NOT_PROVIDED",
				message: "First Name was not Provided but is Required"
			}, null);
			return;			
		}
		if(!inputObject.email) {
			cb({
				success: false,
				code: "EMAIL_NOT_PROVIDED",
				message: "Email Address was not Provided but is Required"
			}, null);
			return;			
		}
		var firstName = inputObject.firstName;
		var lastName = inputObject.lastName;
		var email = inputObject.email;
		var dateOfBirth = inputObject.dateOfBirth;
		var userId = inputObject.userId;
		var isActive = inputObject.active;
		var superAdmin = inputObject.superAdmin;
		var orgId = inputObject.orgId;
		var bcrypt = core.module("services").service("identity").vars.get("bcrypt");
		var passwordHash = bcrypt.hashSync(inputObject.password, 2);
  		uniqueIdentifiers({core: core, entity: "users", attr: "uuid", type: "uuid"}, function(userIdErr, userUuid){
  			var userQuery = "";
  			userQuery += "INSERT INTO users ";
  			userQuery += "(firstName, lastName, email, passwordHash, isActive, dateCreated, dateLastModified, authorId, lastModifiedById, uuid, superAdmin, isDeleted) ";
  			userQuery += "VALUES ";
  			userQuery += "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  			var userParams = [firstName, lastName, email, passwordHash, isActive, currentDate, currentDate, userId, userId, userUuid, superAdmin, 0];
			db.query(
			  userQuery, userParams,
			  function(err1, results1) {
			  	if(err1) {
					cb({
						success: false,
						code: "DB_INSERT_ERROR_1",
						message: "Error inserting record in to database",
						error: err1
					}, null);
			  		return;
			  	} else {
			  		var newUserId = results1.insertId;
			  		uniqueIdentifiers({core: core, entity: "users", attr: "uuid", type: "uuid"}, function(orgUserIdErr, orgUserUuid){
						var orgUserQuery = "";
						orgUserQuery += "INSERT INTO organisationUsers ";
						orgUserQuery += "(orgId, ownerUserId, isActive, dateCreated, dateLastModified, authorId, lastModifiedById, uuid, primaryOrg, lastActiveOrg, isDeleted) ";
						orgUserQuery += "VALUES ";
						orgUserQuery += "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
						var orgUserParams = [orgId, newUserId, isActive, currentDate, currentDate, userId, userId, orgUserUuid, 1, 1, 0];
						db.query(
						  orgUserQuery, orgUserParams,
						  function(err2, results2) {
						  	if(err2) {
								cb({
									success: false,
									code: "DB_INSERT_ERROR_2",
									message: "Error inserting record in to database",
									error: err2
								}, null);
						  		return;
						  	} else {
								cb(null, {
									result: true,
									code: "USER_CREATED",
									message: "User Created Successfully"
								});
							  	return;		  		
						  	}
						  }
						);	
					});  		
			  	}
			  }
			);
		});
		return;
	}

	/**
	 * Delete an Existing User
	 * @param {object} inputObject - Input Object
	 * @param {function} cb - Callback Function
	 */
	model.delete = function(inputObject, cb){
		var userId = inputObject.userId;
		db.query(
		  'UPDATE users SET isDeleted = ? WHERE id = ?',
		  [1, userId],
		  function(err, results) {
		  	if(err) {
				cb({
					success: false,
					code: "USER_DELETE_ERROR",
					message: "Error updating records to deleted within database",
					error: err
				}, null);
				return;
		  	} else {
		  		var totalCount = 4;
		  		var counter = 0;
		  		var interval = setInterval(function(){ if(counter >= totalCount) { 
		  			cb(null, { 
		  				success: true, 
		  				code: "USER_DELETE_SUCCESS",
		  				message: "User Updated to Deleted State Successfully" 
		  			}); 
		  			clearInterval(interval); return; 
		  		} }, 100);
				db.query('UPDATE clientUserRoles SET isDeleted = ? WHERE ownerUserId=?', [1, userId], function(err2, results2) { counter++; });
				db.query('UPDATE clientUsers SET isDeleted = ? WHERE ownerUserId=?', [1, userId], function(err3, results3) { counter++; });
				db.query('UPDATE organisationUsers SET isDeleted = ? WHERE ownerUserId=?', [1, userId], function(err4, results4) { counter++; });
				db.query('UPDATE activity SET isDeleted = ? WHERE ownerUserId=?', [1, userId], function(err7, results7) { counter++; });
			  	return;		  		
		  	}
		  }
		);
		return;
	}

	/**
	 * Destroy an Existing User And All Associated Data (via Cascade Rule in DB)
	 * @param {object} inputObject - Input Object
	 * @param {function} cb - Callback Function
	 */
	model.destroy = function(inputObject, cb){
		var userId = inputObject.userId;
		var query = "";
		query += "DELETE FROM users ";
		query += "WHERE id = ?";
		var params = [userId];
		db.query(
		  query, params,
		  function(err, results) {
		  	if(err) {
				cb({
					success: false,
					code: "USER_DESTROY_ERROR",
					message: "Error destroying user and associated data",
					error: err
				}, null);
				return;
		  	} else {
				cb(null, {
					success: true,
					code: "USER_DESTROY_SUCCESS",
					message: "User and associated data destroyed successfully"
				});
				return;	  		
		  	}
		  }
		);
		return;
	}

	/**
	 * Update an Existing User
	 * @param {object} inputObject - Input Object
	 * @param {function} cb - Callback Function
	 */
	model.update = function(inputObject, cb){
		var sourceDate = new Date();
		var currentDate = sourceDate.toISOString().slice(0, 19).replace('T', ' ');
		var userId = inputObject.userId;
		var firstName = inputObject.firstName;
		var lastName = inputObject.lastName;
		var email = inputObject.email;
		var authorId = inputObject.userId;
		var isActive = inputObject.active;
		var query = "";
		query += "UPDATE users ";
		query += "SET ";
		query += "firstName=?, lastName=?, email=?, isActive=?, dateLastModified=?, lastModifiedById=? ";
		query += "WHERE id = ? AND (isDeleted <> ? OR isDeleted is NULL)";
		var params = [firstName, lastName, email, isActive, currentDate, authorId, userId, 1];
		db.query(
		  query, params,
		  function(err, results) {
		  	if(err) {
				cb({
					success: false,
					code: "USER_UPDATE_ERROR",
					message: "Error updating record in database",
					error: err
				}, null);
		  		return;
		  	} else {
				cb(null, {
					success: true,
					code: "USER_UPDATED_SUCCESSFULLY",
					message: "User Updated Successfully"
				});
			  	return;		  		
		  	}

		  }
		);
		return;
	}

	/**
	 * Change User Password
	 * @param {object} inputObject - Input Object
	 * @param {function} cb - Callback Function
	 */
	model.changePassword = function(inputObject, cb){
		var bcrypt = service.vars.get("bcrypt");
		var sourceDate = new Date();
		var currentDate = sourceDate.toISOString().slice(0, 19).replace('T', ' ');
		var token = inputObject.token;
		var userId = inputObject.userId;
		var clientId = inputObject.clientId;
		var oldPassword = inputObject.oldPassword;
		var newPassword = inputObject.newPassword;
		var confirmNewPassword = inputObject.confirmNewPassword;
		var authorId = inputObject.authorId;
		var oldPasswordHash = null;
		var type = null;

		var validations = function() {
			if(token) {
				type = "token";
			} else if (userId) {
				type = "direct";
			} else {
				cb({
					success: false,
					code: "INSUFFICIENT_DETAILS_TO_CHANGE_PASSWORD",
					message: "There was an insufficient level of the details required to change a password (must include 'token' OR 'userId + clientId'"
				}, null);
		  		return;
			}
			if (!newPassword || !confirmNewPassword) {
				cb({
					success: false,
					code: "AT_LEAST_ONE_PASSWORD_NOT_SET",
					message: "Either one of newPassword or confirmNewPassword - or both - are empty"
				}, null);
		  		return;
			} else if (newPassword != confirmNewPassword) {
				cb({
					success: false,
					code: "PASSWORDS_DO_NOT_MATCH",
					message: "The passwords that were entered do not match"
				}, null);
		  		return;
			}
			if(type == "direct" && !oldPassword) {
				cb({
					success: false,
					code: "OLD_PASSWORD_NOT_SET",
					message: "You must define your old password when utilising the direct flow"
				}, null);
		  		return;
			} else if(type == "direct" && oldPassword) {
				validateOldPassword();
				return;
			} else {
				updatePassword();
			}
		}

		var validateOldPassword = function() {
			var query2 = "";
			query2 += "SELECT u.passwordHash ";
			query2 += "FROM users u ";
			query2 += "WHERE u.id = ? AND (u.isDeleted <> 1 OR u.isDeleted is NULL)";
			var params2 = [userId];
			db.query(
			  query2, params2,
			  function(err2, results2) {
			  	if(err2) {
					cb({
						success: false,
						code: "ERROR_FETCHING_OLD_PASSWORD_HASH",
						message: "There was an error fetching the old password hash for the specified user profile",
						error: err2
					}, null);
			  		return;
			  	} else {
					oldPasswordHash = results2[0].passwordHash;	  
					if(!bcrypt.compareSync(oldPassword, oldPasswordHash)) {
						cb({
							success: false,
							code: "OLD_PASSWORD_INVALID",
							message: "Cannot change password as old password that was specified is invalid"
						}, null);
						return;
					} else {
						updatePassword();
						return;
					}
			  	}
			  }
			);
			return;
		}

		var deleteFprToken = function() {
			var query3 = "";
			query3 += "UPDATE forgotPasswordRequests f ";
			query3 += "SET ";
			query3 += "f.isActive = 1, f.isDeleted = 1 ";
			query3 += "WHERE f.ownerUserId = ? AND f.clientId = ?";
			var params3 = [userId, clientId];
			db.query(
			  query3, params3,
			  function(err3, results3) {
			  	if(err3) {
					cb({
						success: false,
						code: "ERROR_DELETING_FPR",
						message: "There was an error deleting the user's forgot password request",
						error: err3
					}, null);
			  		return;
			  	} else {
					cb(null, {
						success: true,
						code: "PASSWORD_UPDATED",
						message: "The user's password was updated successfully"
					});
			  		return;
			  	}
			  }
			);
			return;
		}

		var updatePassword = function() {
			var passwordHash = bcrypt.hashSync(newPassword, 2);
			var query4 = "";
			query4 += "UPDATE users u ";
			query4 += "SET ";
			query4 += "u.passwordHash = ? ";
			query4 += "WHERE u.id = ? AND (u.isDeleted <> 1 OR u.isDeleted is NULL)";
			var params4 = [passwordHash, userId];
			db.query(
			  query4, params4,
			  function(err4, results4) {
			  	if(err4) {
					cb({
						success: false,
						code: "ERROR_UPDATING_PASSWORD",
						message: "There was an error updating the user's password",
						error: err4
					}, null);
			  		return;
			  	} else {
			  		if(token) {
			  			deleteFprToken();
			  			return;
			  		} else {
						cb(null, {
							success: true,
							code: "PASSWORD_UPDATED",
							message: "The user's password was updated successfully"
						});
				  		return;
				  	}
			  	}
			  }
			);
			return;
		}

		if(token) {
			var query1 = "";
			query1 += "SELECT f.* ";
			query1 += "FROM forgotPasswordRequests f ";
			query1 += "WHERE f.token = ? AND (f.isDeleted <> 1 OR f.isDeleted is NULL)";
			var params1 = [token];
			db.query(
			  query1, params1,
			  function(err1, results1) {
			  	if(err1 || !results1[0]) {
					cb({
						success: false,
						code: "ERROR_FETCHING_FPR_TOKEN_DETAILS",
						message: "There was an error fetching the details for the specified Forgot Password Request token",
						error: err1
					}, null);
			  		return;
			  	} else {		
			  		userId = results1[0].ownerUserId;
			  		clientId = results1[0].clientId;
			  		validations();
			  	}
			  }
			);
			return;
		} else if (userId) {
			validations();
		} else {
			cb({
				success: false,
				code: "INSUFFICIENT_DETAILS_TO_CHANGE_PASSWORD",
				message: "There was an insufficient level of the details required to change a password (must include 'token' OR 'userId + clientId'"
			}, null);
	  		return;
		}
	}

	/**
	 * Add Existing User to an Organisation
	 * @param {object} inputObject - Input Object
	 * @param {function} cb - Callback Function
	 */
	model.addExistingUser = function(inputObject, cb){
		var uniqueIdentifiers = service.vars.get("uniqueIdentifiers");
		var authorId = inputObject.authorId;
		var orgId = inputObject.orgId;
		var email = inputObject.email;
		var sourceDate = new Date();
		var currentDate = sourceDate.toISOString().slice(0, 19).replace('T', ' ');
		var query1 = "";
		query1 += "SELECT * ";
		query1 += "FROM users ";
		query1 += "WHERE email = ? AND (isDeleted <> ? OR isDeleted is NULL)";
		var params1 = [email, 1];
		db.query(
		  query1, params1,
		  function(err, results) {
		  	if(err || !results[0]) {
				cb({
					success: false,
					code: "USER_DOES_NOT_EXIST",
					message: "The requested user does not exist",
					error: err
				}, null);
		  	} else {
		  		var userId = results[0].id;
		  		var query2 = "";
		  		query2 += "SELECT * ";
		  		query2 += "FROM organisationUsers ";
		  		query2 += "WHERE orgId = ? AND ownerUserId = ? AND (isDeleted <> ? OR isDeleted is NULL)";
		  		var params2 = [orgId, userId, 1];
		  		uniqueIdentifiers({core: core, entity: "organisationUsers", attr: "uuid", type: "uuid"}, function(orgUserIdErr, orgUserUuid){
					db.query(
					  query2, params2,
					  function(err2, results2) {
					  	if(err2 || !results2[0]) {
					  		var query3 = "";
					  		query3 += "INSERT INTO organisationUsers ";
					  		query3 += "(orgId, ownerUserId, isActive, dateCreated, dateLastModified, authorId, lastModifiedById, uuid, primaryOrg, lastActiveOrg, isDeleted) ";
					  		query3 += "VALUES ";
					  		query3 += "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
					  		var params3 = [orgId, userId, 1, currentDate, currentDate, authorId, authorId, orgUserUuid, 0, 0, 0];
							db.query(
							  query3, params3,
							  function(err3, results3) {
							  	if(err3) {
									cb({
										success: false,
										code: "USER_FAILED_TO_ADD_TO_ORG",
										message: "Error inserting record in to database",
										error: err3
									}, null);
									return;
							  	} else {
									cb(null, {
										success: true,
										code: "USER_ADDED_TO_ORG",
										message: "User Added to Organisation Successfully"
									});
									return; 		
							  	}
							  }
							);
					  	} else {
							cb({
								success: false,
								code: "USER_EXISTS_IN_ORG",
								message: "The defined user already exists in the organisation specified"
							}, null);
					  		return;	  		
					  	}

					  }
					);
				});
			}
		  }
		);
		return;
	}

	/**
	 * List Organisation Associations for a Given User
	 * @param {object} inputObject - Input Object
	 * @param {function} cb - Callback Function
	 */
	model.listOrganisations = function(inputObject, cb){
		var userId = inputObject.userId;
		var query = "";
		var pageSize = inputObject.pageSize;
		var pageNumber = inputObject.pageNumber;
		if(!pageNumber) { pageNumber = 1; }
		if(!pageSize) { pageSize = 1000000; }
		if(pageSize && pageNumber) { var limitSQL = "LIMIT " + ((pageNumber - 1) * pageSize) + ", " + pageSize; }
		query += "SELECT COUNT(o.id) as orgCount ";
		query += "FROM users u ";
		query += "JOIN organisationUsers ou ON (u.id = ou.ownerUserId) ";
		query += "JOIN organisations o ON (ou.orgId = o.id) ";
		query += "WHERE u.id = ? AND (u.isDeleted <> ? OR u.isDeleted is NULL) AND (ou.isDeleted <> ? OR ou.isDeleted is NULL) AND (o.isDeleted <> ? OR o.isDeleted is NULL)";
		var params = [userId, 1, 1, 1];
		db.query(
		  query, params,
		  function(err, results) {
		  	if(err) {
				cb({
					success: false,
					code: "FAILED_TO_GET_ORG_COUNT",
					message: "Failed to get count of organisations for defined user",
					error: err
				}, null);
		  	} else {
 				var totalCount = results[0].orgCount;
				var query2 = "";
				var params2 = [];
				query2 += "SELECT o.* ";
				query2 += "FROM users u ";
				query2 += "JOIN organisationUsers ou ON (u.id = ou.ownerUserId) ";
				query2 += "JOIN organisations o ON (ou.orgId = o.id) ";
				query2 += "WHERE u.id = ? AND (u.isDeleted <> ? OR u.isDeleted is NULL) AND (ou.isDeleted <> ? OR ou.isDeleted is NULL) AND (o.isDeleted <> ? OR o.isDeleted is NULL)";
				var params2 = [userId, 1, 1, 1];
				if(limitSQL)
					query2 += limitSQL;
				db.query(
				  query2, params2,
				  function(err2, results2) {
				  	if(err2) {
						cb({
							success: false,
							code: "FAILED_TO_GET_ORGANISATIONS",
							message: "Failed to get organisations for defined user",
							error: err2
						}, null);
				  	} else {
						cb(null, {
							success: true,
							results: results2,
							message: "Organisations fetched for defined user successfully",
				  			recordCount: totalCount,
				  			pageCount: Math.ceil(totalCount / pageSize),
				  			currentPage: pageNumber
						});
				  		return;	  		
				  	}

				  }
				);
				return;
		  	}

		  }
		);
		return;
	}

	/**
	 * Remove a defined user from an Organisation
	 * @param {object} inputObject - Input Object
	 * @param {function} orgId - User ID
	 * @param {function} cb - Callback Function
	 */
	model.removeUserFromOrganisation = function(inputObject, cb){
		var userId = parseInt(inputObject.userId, 10);
		var orgId = parseInt(inputObject.orgId, 10);
		var query1 = "";
		query1 += "SELECT o.* ";
		query1 += "FROM users u ";
		query1 += "JOIN organisationUsers ou ON (u.id = ou.ownerUserId) ";
		query1 += "JOIN organisations o ON (ou.orgId = o.id) ";
		query1 += "WHERE u.id = ? AND o.id = ? AND (u.isDeleted <> ? OR u.isDeleted is NULL) AND (ou.isDeleted <> ? OR ou.isDeleted is NULL) AND (o.isDeleted <> ? OR o.isDeleted is NULL)";
		var params1 = [userId, orgId, 1, 1, 1];
		db.query(
		  query1, params1,
		  function(err, results) {
		  	if(err || !results[0]) {
				cb({
					success: false,
					code: "USER_NOT_IN_ORGANISATION",
					message: "Failed to remove user from organisation as they are not part of it",
					error: err
				}, null);
		  	} else {
		  		var query2 = "";
		  		query2 += "UPDATE organisationUsers ";
		  		query2 += "SET isDeleted = ? "
		  		query2 += "WHERE ownerUserId = ? AND orgId = ?";
		  		var params2 = [1, userId, orgId];
				db.query(
				  query2, params2,
				  function(err2, results2) {
				  	if(err2) {
						cb({
							success: false,
							code: "FAILED_TO_REMOVE_USER_FROM_ORG",
							message: "Database error when removing user-organisation record",
							error: err2
						}, null);
				  	} else {
						cb(null, {
							success: true,
							code: "USER_REMOVED_FROM_ORG",
							message: "User removed from organisation successfully"
						});						 		
				  	}

				  }
				);
		  	}

		  }
		);
		return;
	}

	/**
	 * (ENTRY POINT FOR EXECUTION)
	 */
	module.exports = model.init;
}();