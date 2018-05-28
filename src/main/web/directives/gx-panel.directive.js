(function (angular) {
	'use strict';

	angular.module('gux.panel', ['gux.panelHeader', 'gux.panelBody', 'gux.panelFooter'])
		.directive('gxPanel', [
			function () {

				return {
					restrict: 'E',
					replace: true,
					templateUrl: 'views/gx-panel.html',
					transclude: true,
					scope: false
				};
			}]);

} (window.angular));
