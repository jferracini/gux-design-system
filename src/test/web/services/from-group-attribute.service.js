(function (angular) {

	'use strict';

	angular.module('gux.test.services')
		.factory('formGroupAttributeService', ['$http',
			function (http) {
				return {
					list: function () {
						return http
							.get('/data/form-group-attribute.json')
							.then(function (response) {
								return response.data;
							});
					}
				};
			}]);

} (window.angular));