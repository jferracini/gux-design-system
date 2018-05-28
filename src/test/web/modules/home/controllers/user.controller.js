(function () {
	'use strict';

	angular.module('gux.test.home')
		.controller('UserController', ['$rootScope', function (rootScope) {

			var self = this;

			self.user = 'Thiago Assis';

		}]);

} ());
