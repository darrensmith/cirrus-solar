/*!
* models/newsletter.js
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
		service = core.module("services").service("cirrus-solar");
		db = service.vars.get("db");
		return model;
	}

	/**
	 * Fetch List of Subscribers
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
		var showDeletedOnlySQL = " WHERE s.isDeleted == 1 ";
		var showExcludingDeletedSQL = " WHERE (s.isDeleted <> 1 OR s.isDeleted is NULL) ";
		query += "SELECT COUNT(s.id) as subscriberCount ";
		query += "FROM newsletterSubscribers s ";
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
		  			code: "ERROR_DETERMINING_SUBSCRIBER_COUNT",
		  			message: "There was an error determining the total count of subscribers",
		  			error: err
		  		}, null);
		  		return;
		  	} else {
		  		var totalCount = results[0].subscriberCount;
				query2 += "SELECT s.* ";
				query2 += "FROM newsletterSubscribers s ";
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
				  			code: "ERROR_RETRIEVING_SUBSCRIBER_LIST",
				  			message: "There was an error retrieving the subscriber list",
				  			error: err2
				  		}, null);
				  		return;
				  	} else {
				  		cb(null, {
				  			success: true,
				  			code: "SUBSCRIBER_LIST_RETRIEVED",
				  			message: "Subscriber list retrieved successfully",
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
	 * Create Subscriber
	 * @param {object} inputObject - The Input Object
	 * @param {function} cb - Callback Function
	 */
	model.create = function(inputObject, cb){
		var uniqueIdentifiers = service.vars.get("uniqueIdentifiers");
		var emailAddress = inputObject.email;
		var sourceDate = new Date();
		var currentDate = sourceDate.toISOString().slice(0, 19).replace('T', ' ');
		uniqueIdentifiers({ 
			core: core, 
			entity: "newsletterSubscribers", 
			attr: "uuid", 
			type: "uuid" 
		}, function(err, uuid) {
			var query = "";
			query += "INSERT INTO newsletterSubscribers "
			query += "(email, dateCreated, dateLastModified, authorId, lastModifiedById, uuid, isActive, isDeleted) ";
			query += "VALUES ";
			query += "(?, ?, ?, ?, ?, ?, ?, ?)";
			var params = [emailAddress, currentDate, currentDate, 1, 1, uuid, 1, 0];
			db.query(
			  query,
			  params,
			  function(err, results) {
			  	if(err || !results.insertId) {
			  		cb({
			  			success: false,
			  			code: "ERROR_SUBSCRIBING_EMAIL",
			  			message: "There was an error subscribing the provided email address to the newsletter"
			  		}, null);
			  		return;
			  	} else {
				  	cb(null, {
				  		success: true,
				  		code: "EMAIL_SUBSCRIBED",
				  		message: "The provided email address was subscribed successfully to the newsletter"
				  	});		  		
				}
			  	return;
			  }
			);
			return;
		});
	}

	/**
	 * (ENTRY POINT FOR EXECUTION)
	 */
	module.exports = model.init;
}();