(function(angular) {
    'use strict';

    function crudController($scope, filmService) {

        var self = this;

        var blankFilter = {
            filmName: null,
            filmCompany: null
        };

        $scope.filter = null;

        $scope.cleanFilter = function() {
            $scope.filter = angular.copy(blankFilter);
        };

        $scope.paginationInfo = {
            pageNumber: 1,
            pageSize: 10,
            totalItems: 0
        };

        $scope.films = null;

        $scope.refresh = function(eventName, pageNumber, pageSize, totalItems) {
            return filmService
                .list($scope.filter.filmName,
                    $scope.filter.nomeDistribuidor,
                    pageNumber,
                    pageSize)
                .then(function(retorno) {
                    $scope.films = retorno;
                });
        };

        self.$onInit = function() {
            $scope.cleanFilter();
        };
    }

    angular.module('gux.test.layouts')
        .controller('CrudController', [
            '$scope',
            'filmService',
            crudController
        ]);

}(window.angular));