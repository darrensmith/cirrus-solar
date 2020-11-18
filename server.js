#!/usr/bin/env node

/*!
* Blackrock Application Server Entry Point
*
* Copyright (c) 2020 Darren Smith
*/

;!function(undefined) {


	/* Initialise Blackrock */
	var serviceName = "cirrus-solar";
	require('is-blackrock').init().then(function(core){



		/* Function to Connect to the Database */
		var dbConnect = function ServerDBConnect(){
			const { Client } = require('pg');
			const client = new Client({
			  connectionString: process.env.DATABASE_URL,
			  ssl: {
			    rejectUnauthorized: false
			  }
			});
			client.connect();
			service.vars.set("db", client);
		}


		/* Initialise Variables & Connect to Database */
		log = core.module("logger").log;
		service = core.module("services").service(serviceName);
		var libPath = core.fetchBasePath("services") + "/" + serviceName;
		dbConnect();


		/* Load Data Models */
		service.models.add("opportunities", require(libPath + "/models/opportunities.js")(core));


		/* Load Libraries */
		service.vars.set("uniqueIdentifiers", require(libPath + "/lib/uniqueIdentifiers.js"));
		service.vars.set("signedInMenuContext", require(libPath + "/lib/signedInMenuContext.js"));
		service.vars.set("pageBar", require(libPath + "/lib/pageBar.js"));


		/* Setup Authorization Middleware */
		service.use(function(req, res, next) {
			req.log = log;
			if(req.headers.authorization) {
				var authHeader = req.headers.authorization;
				authHeader = authHeader.split(" ");
				var inputObject = { accessToken: authHeader[1] };
			} else if (req.cookies.sessionToken) {
				var inputObject = { sessionToken: req.cookies.sessionToken };
			} else {
				var inputObject = {};
			}
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			inputObject.excludeDeleted = true;
			req.auth = {};
			req.auth.web = function(permArr, cb) {
				if(1) { cb(); }
				else { res.redirect("/web?message=failure&code=NOT_AUTHORISED"); }
			};
			req.auth.api = function(permArr, cb) {
				if(1) { cb(); }
				else { res.send({error: "Not Authorised"}); }
			};
			next();
			//});
		});



	}).catch(function(err) {
		console.log("ERROR: " + err.message);
	});

}();