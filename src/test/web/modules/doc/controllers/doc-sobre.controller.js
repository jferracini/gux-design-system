(function(angular) {
    'use strict';

    function sobreController($scope, filmService) {

        var self = this;

    }

    angular.module('gux.test.doc')
        .controller('SobreController', [
            '$scope',
            'filmService',
            sobreController
        ]);

}(window.angular));