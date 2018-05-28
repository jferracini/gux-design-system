(function (angular) {

	'use strict';

	angular.module('gux.test.services')
		.factory('gxPaginationService', ['$state', '$templateCache', function (state, templateCache) {

			return {

				getPageNumber: function (eventName, paginationInfo) {

					var pageNumber = null;

					if (!!eventName && eventName === 'paging') {
						paginationInfo.pageNumber = pageNumber;
						pageNumber = pageNumber - 1;
					} else {
						pageNumber = paginationInfo.pageNumber;
					}

					return pageNumber;
				}
			};

		}]);

} (window.angular));
