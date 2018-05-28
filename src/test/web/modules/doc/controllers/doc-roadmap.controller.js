(function(angular) {
    'use strict';

    function roadmapController($scope, filmService) {

        var self = this;

    }

    angular.module('gux.test.doc')
        .controller('RoadmapController', [
            '$scope',
            'filmService',
            roadmapController
        ]);

}(window.angular));