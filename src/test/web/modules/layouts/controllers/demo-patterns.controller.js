(function(angular) {
    'use strict';

    function uxPatternsController($scope, filmService) {

        var self = this;

    }

    angular.module('gux.test.layouts')
        .controller('UxPatternsController', [
            '$scope',
            'filmService',
            uxPatternsController
        ]);

}(window.angular));