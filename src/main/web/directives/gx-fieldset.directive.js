(function (angular) {
	'use strict';

	angular.module('gux.fieldset', [])
		.directive('gxFieldset', [
			function () {

				function GXFieldsetController($scope) {

					if ($scope.controller.collapsed == undefined) {

						$scope.controller.collapsible = false;

					} else {

						$scope.controller.collapsible = true;

						if ($scope.controller.collapsed === null
							|| $scope.controller.collapsed === 'false'
							|| $scope.controller.collapsed === false) {
							$scope.controller.collapsed = false;
						} else {
							$scope.controller.collapsed = true;
						}
					}
				}

				return {
					restrict: 'E',
					replace: true,
					templateUrl: 'views/gx-fieldset.html',
					transclude: true,
					scope: true,
					controller: ['$scope', GXFieldsetController],
					controllerAs: 'controller',
					bindToController: {
						title: '@',
						collapsed: '='
					}
				};
			}]);

} (window.angular));
