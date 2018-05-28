(function(angular, $) {
    'use strict';

    angular.module('gux.cockpit', [])
        .directive('gxCockpit', [
            function() {

                function GXCockpitController() {

                }

                return {
                    restrict: 'E',
                    replace: true,
                    templateUrl: 'views/gx-menu-cockpit.html',
                    transclude: true,
                    controller: GXCockpitController,
                    controllerAs: 'controller',
                    scope: false,
                    link: function(scope, element, attributes) {
                        element.addClass('customClass');
                    }
                };
            }
        ]);

}(window.angular, window.$));