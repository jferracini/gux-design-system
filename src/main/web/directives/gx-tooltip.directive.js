(function (angular, $) {
	'use strict';

	angular.module('gux.tooltip', [])
		.directive('gxTooltip', ['$timeout',
			function (timeout, parse) {

				function GXTooltipLink(scope, element, attributes, controller) {
					attributes.$observe('gxTooltip', function (title) {
						timeout(function () {
							$(element)
								.tooltip({
									'placement': attributes.gxTooltipPlacement ? attributes.gxTooltipPlacement : 'top'
								})
								.attr('data-original-title', attributes.gxTooltip);
						});
					});
				}

				return {
					restrict: 'A',
					link: GXTooltipLink
				};

			}]);

} (window.angular, window.$));
