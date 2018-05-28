(function(angular) {
    'use strict';

    function containersController($scope, filmService) {

        var self = this;

    }

    angular.module('gux.test.layouts')
        .controller('ContainersController', [
            '$scope',
            'filmService',
            containersController
        ]);

}(window.angular));