(function (angular) {
	'use strict';

	angular.module('gux.panelHeader', ['angularScreenfull'])
		.directive('gxPanelHeader', [
			function () {

				function GXPanelHeaderController() {

				}

				return {
					restrict: 'E',
					replace: true,
					templateUrl: 'views/gx-panel-header.html',
					scope: false,
					controller: GXPanelHeaderController,
					controllerAs: 'controller',
					bindToController: {
						title: '@',
					}
				};
			}]);

} (window.angular));
