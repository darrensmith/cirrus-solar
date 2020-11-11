/*!
* lib/pageBar.js
*
* Copyright (c) 2020 Darren Smith
* Licensed under the LGPL license.
*/

;!function(undefined) {

	/**
	 * Main Method
	 * @param {object} response - Response Object
	 * @param {object} context - Context Object
	 */
	var output = function(response, context){
		context.currentPage = response.currentPage;
		var pageNumber = context.currentPage;
		context.pageSize = response.pageSize;
		if(response.pageCount != 1 && response.pageCount != 0) {
			context.showPagination = true;
			context.pageItems = [];
			if(response.currentPage == 1) { var previousDisabled = " disabled"; }
			else { var previousDisabled = null; }
			context.pageItems.push({ label: "Previous", disabled: previousDisabled, pageNumber: (pageNumber - 1) });
			var totalPages = response.pageCount;
			var buttons = 5;
			var currentPage = lowerLimit = upperLimit = Math.min(9, response.currentPage);
			for (var b = 1; b < buttons && b < totalPages;) {
			    if (lowerLimit > 1 ) { lowerLimit--; b++; }
			    if (b < buttons && upperLimit < totalPages) { upperLimit++; b++; }
			}
			for (var i = lowerLimit; i <= upperLimit; i++) {
				if(i == response.currentPage) { var active = " active"; }
				else { var active = ""; }
				context.pageItems.push({ label: i, active: active, pageNumber: i });
			}
			if(response.currentPage == response.pageCount) { var nextDisabled = " disabled"; }
			else { var nextDisabled = null; }
			context.pageItems.push({ label: "Next", disabled: nextDisabled, pageNumber: (pageNumber + 1) });
		}
		return context;
	}

	module.exports = output;
}();