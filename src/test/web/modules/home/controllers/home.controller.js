(function () {
	'use strict';

	angular.module('gux.test.home')
		.controller('HomeController', ['$rootScope', function (rootScope) {

			rootScope.$broadcast("GUXAppMainInterfaceRegister", {
				title: "Início",
				description: "Bla bla bla bla"
			});
    }]);

}());
