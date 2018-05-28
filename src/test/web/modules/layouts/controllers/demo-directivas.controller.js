(function(angular) {
    'use strict';

    function diretivasController($scope, filmService) {

        var self = this;

    }

    angular.module('gux.test.layouts')
        .controller('DiretivasController', [
            '$scope',
            'filmService',
            diretivasController
        ]);

}(window.angular));