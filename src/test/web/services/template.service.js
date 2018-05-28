(function (angular) {

	'use strict';

	angular.module('gux.test.services')
		.factory('templateService', ['$http',
			function (http) {
				return {
					get: function (url) {
						return http
							.get(url)
							.then(function (response) {
								return response.data;
							});
					}
				};
			}]);

} (window.angular));