(function (angular) {
	'use strict';

	angular.module('gux.panelBody', [])
		.directive('gxPanelBody', [
			function () {

				return {
					restrict: 'E',
					replace: true,
					templateUrl: 'views/gx-panel-body.html',
					transclude: true,
					scope: false
				};
			}]);

} (window.angular));
