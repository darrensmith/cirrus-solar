/*!
* lib/identity.js
*
* Identity Platform Connector
*
* Copyright (c) 2020 Darren Smith
* Licensed under the LGPL license.
*/

;!function(undefined) {

	var connector = {}, core, service, settings;

	/**
	 * Initialises the connector
	 * @param {string} serviceName - Name of the Service
	 * @param {object} inputObject - Input Object
	 */
	var init = function(coreObj, serviceName){
		core = coreObj;
		service = core.module("services").service(serviceName);
		settings = service.vars.get("settings");
		return connector;
	}

	/**
	 * Check Status of Identity Service
	 * @param {object} inputObject - The Input Object
	 * @param {function} cb - Callback Function
	 */
	connector.status = function(inputObject, cb){
		var httpClient = core.module("http", "interface").client;
		if(!settings["IDENTITY_BASE_URI"]) {
			cb({
				success: false,
				code: "STATUS_MISSING_SETTINGS",
				message: "Unable to retrieve the Identity Provider's Base URI."
			}, null);
			return;
		}
		httpClient.get(settings["IDENTITY_BASE_URI"] + "/api/v1/status", function(httpErr, httpRes) {
			if(!httpRes || !httpRes.data.success) {
				cb({
					success: false,
					code: "IDENTITY_SERVICE_DOWN",
					message: "The identity service is currently down."
				}, null);
				return;						
			} else {
				cb(null, {
					success: true,
					code: "IDENTITY_SERVICE_UP",
					message: "The identity service is currently up."
				});
				return;							
			}
		});
	}

	/**
	 * Build Identity Authorize URI
	 * @param {object} inputObject - The Input Object
	 * @param {function} cb - Callback Function
	 */
	connector.buildAuthorizeUri = function(inputObject, cb){
		var scope = inputObject.scope;
		scope = encodeURIComponent(scope);
		var responseType = "code";
		var state = core.module("utilities").randomString(18);
		if(!settings["IDENTITY_BASE_URI"] || !settings["IDENTITY_CLIENT_ID"] || !settings["IDENTITY_REDIRECT_URI"]) {
			cb({
				success: false,
				code: "BUILDAUTH_MISSING_SETTINGS",
				message: "Unable to retrieve the Identity Provider's Base URI, Client ID or this application's redirect URI."
			}, null);
			return;					
		}
		var identityRedirectUri = encodeURIComponent(settings["IDENTITY_REDIRECT_URI"]);
		var authUri = "";
		authUri += settings["IDENTITY_BASE_URI"] + "/web/authorize?";
		authUri += "client_id=" + settings["IDENTITY_CLIENT_ID"] + "&";
		authUri += "response_type=" + responseType + "&";
		authUri += "redirect_uri=" + identityRedirectUri + "&";
		authUri += "scope=" + scope + "&";
		authUri += "state=" + state;
		var headers = {"Content-Type": "application/x-www-form-urlencoded"};
		cb(null, {
			success: true,
			code: "AUTH_URI_GENERATED",
			message: "Authentication URI Generated Successfully.",
			result: {
				uri: authUri,
				clientId: settings["IDENTITY_CLIENT_ID"],
				responseType: responseType,
				redirectUriEncoded: identityRedirectUri,
				scopeEncoded: scope,
				state: state
			}
		});
		return;
	}

	/**
	 * Get Access & Refresh Tokens for a Session (on Sign-In)
	 * @param {object} inputObject - The Input Object
	 * @param {function} cb - Callback Function
	 */
	connector.getTokens = function(inputObject, cb){
		var code = inputObject.code;
		var grantType = "authorization_code";
		if(!code) {
			cb({
				success: false,
				code: "AUTH_CODE_NOT_FOUND",
				message: "No authorization code has been provided - this is required."
			}, null);
			return;
		}
		if(!settings["IDENTITY_BASE_URI"] || !settings["IDENTITY_CLIENT_ID"] || !settings["IDENTITY_CLIENT_SECRET"] || !settings["IDENTITY_API_VERSION"] || !settings["IDENTITY_REDIRECT_URI"]) {
			cb({
				success: false,
				code: "GETTOKENS_MISSING_SETTINGS",
				message: "Unable to retrieve the Identity Provider's Base URI, API Version, Client ID, Client Secret or Redirect URI."
			}, null);
			return;					
		}
		var identityRedirectUri = encodeURIComponent(settings["IDENTITY_REDIRECT_URI"]);
		var tokenUri = settings["IDENTITY_BASE_URI"] + "/api/" + settings["IDENTITY_API_VERSION"] + "/oauth/token";
		var body = "";
		body += "grant_type=" + grantType + "&";
		body += "code=" + code + "&";
		body += "redirect_uri=" + identityRedirectUri + "&";
		body += "client_id=" + settings["IDENTITY_CLIENT_ID"] + "&";
		body += "client_secret=" + settings["IDENTITY_CLIENT_SECRET"];
		var headers = {"Content-Type": "application/x-www-form-urlencoded"};
		var httpClient = core.module("http", "interface").client;
		httpClient.post(tokenUri, body, null, function(httpErr, httpRes) {
			if(httpErr) {
				cb({
					success: false,
					code: "HTTP_REQUEST_ERROR",
					message: "There was an error with the HTTP token request."
				}, null);
				return;
			}
			if(httpRes.data.error) {
				cb({
					success: false,
					code: httpRes.data.code,
					message: httpRes.data.error
				}, null);
				return;						
			}
			cb(null, {
				success: true,
				code: "TOKEN_REQUEST_SUCCESSFUL",
				message: "The request for an access token was successful - refer to other fields on this response object",
				accessToken: httpRes.data["access_token"],
				tokenType: httpRes.data["token_type"],
				refreshToken: httpRes.data["refresh_token"],
				expiresIn: httpRes.data["expires_in"],
				scope: httpRes.data["scope"]
			});			
		});
	}

	/**
	 * Gets all session information/data for the specified user
	 * @param {object} inputObject - The Input Object
	 * @param {function} cb - Callback Function
	 */
	connector.getSession = function(inputObject, cb){
		if(!inputObject.accessToken) {
			cb({
				success: false,
				code: "ACCESS_TOKEN_NOT_FOUND",
				message: "No access token accompanied this request. This is required to get session information."
			}, null);
			return;
		}
		var accessToken = inputObject.accessToken;
		if(!settings["IDENTITY_BASE_URI"] || !settings["IDENTITY_API_VERSION"]) {
			cb({
				success: false,
				code: "GETSESSION_MISSING_SETTINGS",
				message: "Unable to retrieve the Identity Provider's Base URI or API Version."
			}, null);
			return;					
		}
		var sessionUri = settings["IDENTITY_BASE_URI"] + "/api/" + settings["IDENTITY_API_VERSION"] + "/user/session";
		var headers = {"Authorization": "bearer " + accessToken };
		var httpClient = core.module("http", "interface").client;
		httpClient.request({
			"url": sessionUri,
			"method": "GET",
			"headers": headers,
			"encoding": "utf8"
		}, function(httpErr, httpRes) {
			if(!httpRes || !httpRes.data.success) {
				cb({
					success: false,
					code: "SESSION_NOT_FOUND",
					message: "The specified user's session was not found."
				}, null);
				return;
			} else {
				cb(null, {
					success: true,
					code: "SESSION_FOUND",
					message: "The specified user's session was found.",
					sessionData: httpRes.data.sessionData,
					tokenExpires: httpRes.data.tokenExpires,
					requestedScopes: httpRes.data.requestedScopes,
					acceptedScopes: httpRes.data.acceptedScopes,
					appName: httpRes.data.appName
				});
				return;				
			}
		});
	}

	/**
	 * Revoke Access & Refresh Tokens for a Session (on Sign-Out)
	 * @param {object} inputObject - The Input Object
	 * @param {function} cb - Callback Function
	 */
	connector.revokeTokens = function(inputObject, cb){
		var token = inputObject.token;	// The Access Token
		if(!token) {
			cb({
				success: false,
				code: "ACCESS_TOKEN_NOT_FOUND",
				message: "No access token has been provided - this is required."
			}, null);
			return;
		}
		if(!settings["IDENTITY_BASE_URI"] || !settings["IDENTITY_CLIENT_ID"] || !settings["IDENTITY_CLIENT_SECRET"] || !settings["IDENTITY_API_VERSION"]) {
			cb({
				success: false,
				code: "REVOKETOKENS_MISSING_SETTINGS",
				message: "Unable to retrieve the Identity Provider's Base URI, API Version, Client ID or Client Secret."
			}, null);
			return;					
		}
		var revokeUri = settings["IDENTITY_BASE_URI"] + "/api/" + settings["IDENTITY_API_VERSION"] + "/oauth/revoke";
		var method = "POST";
		var body = "";
		body += "token=" + token + "&";
		body += "client_id=" + settings["IDENTITY_CLIENT_ID"] + "&";
		body += "client_secret=" + settings["IDENTITY_CLIENT_SECRET"];
		var headers = {"Content-Type": "application/x-www-form-urlencoded", "Authorization": "bearer " + token };
		var httpClient = core.module("http", "interface").client;
		httpClient.request({
			"url": revokeUri,
			"method": "POST",
			"headers": headers,
			"encoding": "utf8",
			"data": body
		}, function(httpErr, httpRes) {
			if(!httpRes || !httpRes.data.success) {
				cb({
					success: false,
					code: "INVALID_TOKEN",
					message: "The specified token is invalid."
				}, null);
				return;
			} else {
				cb(null, {
					success: true,
					code: "TOKEN_REVOKED",
					message: "The specified token was revoked."
				});
				return;				
			}
		});
		return;
	}

	/**
	 * Get Session Profile (roles, permissions, userId, userName, connected organisations,etc)
	 * @param {object} inputObject - The Input Object
	 * @param {function} cb - Callback Function
	 */
	connector.getSessionProfile = function(inputObject, cb){
		var settingsModel = service.models.get("settings");
		var token = inputObject.token;	// The Access Token
		if(!token) {
			cb({
				success: false,
				code: "ACCESS_TOKEN_NOT_FOUND",
				message: "No access token has been provided - this is required."
			}, null);
			return;
		}
		if(!settings["IDENTITY_BASE_URI"] || !settings["IDENTITY_CLIENT_ID"] || !settings["IDENTITY_CLIENT_SECRET"] || !settings["IDENTITY_API_VERSION"]) {
			cb({
				success: false,
				code: "GETSESSIONPROFILE_MISSING_SETTINGS",
				message: "Unable to retrieve the Identity Provider's Base URI, API Version, Client ID or Client Secret."
			}, null);
			return;					
		}
		var revokeUri = settings["IDENTITY_BASE_URI"] + "/api/" + settings["IDENTITY_API_VERSION"] + "/user/session";
		var method = "GET";
		var headers = {};
		return;
	}

	/**
	 * First-Party Login Flow
	 * @param {object} inputObject - The Input Object
	 * @param {function} cb - Callback Function
	 */
	connector.login = function(inputObject, cb){
		var settingsModel = service.models.get("settings");
		var username = inputObject.username;
		var password = inputObject.password;
		var grantType = "password";
		if(!username || !password) {
			cb({
				success: false,
				code: "USER_CREDENTIALS_NOT_FOUND",
				message: "Either a username or password was not found - these are both required."
			}, null);
			return;
		}
		if(!settings["IDENTITY_BASE_URI"] || !settings["IDENTITY_CLIENT_ID"] || !settings["IDENTITY_CLIENT_SECRET"] || !settings["IDENTITY_API_VERSION"]) {
			cb({
				success: false,
				code: "LOGIN_MISSING_SETTINGS",
				message: "Unable to retrieve the Identity Provider's Base URI, API Version, Client ID or Client Secret."
			}, null);
			return;					
		}
		var tokenUri = settings["IDENTITY_BASE_URI"] + "/api/" + settings["IDENTITY_API_VERSION"] + "/oauth/token";
		var method = "POST";
		var body = "";
		body += "grant_type=" + grantType + "&";
		body += "username=" + username + "&";
		body += "password=" + password + "&";
		body += "client_id=" + settings["IDENTITY_CLIENT_ID"] + "&";
		body += "client_secret" + settings["IDENTITY_CLIENT_SECRET"];
		var headers = {"Content-Type": "application/x-www-form-urlencoded"};
		return;
	}

	/**
	 * First-Party Logout Flow
	 * @param {object} inputObject - The Input Object
	 * @param {function} cb - Callback Function
	 */
	connector.logout = function(inputObject, cb){
	  	return;
	}

	module.exports = init;
}();