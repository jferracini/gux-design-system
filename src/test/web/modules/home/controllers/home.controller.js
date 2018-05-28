(function () {
	'use strict';

	angular.module('gux.test.home')
		.controller('HomeController', ['$rootScope', function (rootScope) {

			rootScope.$broadcast("cceeAppMainInterfaceRegister", {
				title: "Início",
				description: "Bla bla bla bla"
			});
    }]);

}());
