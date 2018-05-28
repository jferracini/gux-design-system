(function (angular) {
	'use strict';

	angular.module('gux.panelFooter', [])
		.directive('gxPanelFooter', [
			function () {

				return {
					restrict: 'E',
					replace: true,
					templateUrl: 'views/gx-panel-footer.html',
					transclude: true,
					scope: false
				};
			}]);

} (window.angular));
