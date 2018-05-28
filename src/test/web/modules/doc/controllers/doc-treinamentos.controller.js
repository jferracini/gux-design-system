(function(angular) {
    'use strict';

    function treinamentosController($scope, filmService) {

        var self = this;

    }

    angular.module('gux.test.doc')
        .controller('TreinamentosController', [
            '$scope',
            'filmService',
            treinamentosController
        ]);

}(window.angular));