(function(angular, $) {
    'use strict';

    angular.module('gux.sidenav', [])
        .directive('gxSidenav', [
            function() {

                function GXSidenavController() {

                }

                return {
                    restrict: 'E',
                    replace: true,
                    templateUrl: 'views/gx-sidenav-main.html', // dentro dele o sidenav app
                    transclude: true,
                    controller: GXSidenavController,
                    controllerAs: 'controller',
                    scope: false
                };
            }
        ]);

}(window.angular, window.$));