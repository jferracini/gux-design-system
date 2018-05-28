(function(angular) {
    'use strict';

    function mobileController($scope, filmService) {

        var self = this;

        $scope.searchResults = [{ label: "BBC", _infoLink: "http://www.bbc.co.uk/" }, { label: "CNN", _infoLink: "http://edition.cnn.com/" }];

        $scope.itemDetail = function(link) {
            $scope.detailFrame = link;
        };

    }

    angular.module('gux.test.layouts')
        .controller('MobileController', [
            '$scope',
            'filmService',
            mobileController
        ]);

}(window.angular));