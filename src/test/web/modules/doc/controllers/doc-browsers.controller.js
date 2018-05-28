(function(angular) {
    'use strict';

    function browsersController($scope) {

        $scope.labels = ["Google Chrome", "Firefox", "Internet Explorer", "Outros"];
        $scope.data2017 = [77, 11, 6, 6];
        $scope.data2016 = [64, 23, 7, 6];

        $scope.labelsRadar = ['2015', '2016', '2017'];
        $scope.seriesRadar = ['Windows', 'Linux', 'MacOS', 'Outros'];
        $scope.dataRadar = [
            [80, 82, 79, 87],
            [10, 5, 3, 3],
            [12, 2, 3, 20],
            [11, 30, 10, 12]
        ];

    }

    angular.module('gux.test.doc')
        .config(['ChartJsProvider', function(ChartJsProvider) {
            // Configure all charts
            ChartJsProvider.setOptions({
                chartColors: ['#ead872', '#eaaa72', '#72c2ea', '#a0bcb5'],
                responsive: true,
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        fontColor: 'rgb(33, 33, 33)'
                    }
                }
            });
            // Configure all line charts
            ChartJsProvider.setOptions('doughnut', {
                showLines: true
            });
        }])
        .controller('BrowsersController', [
            '$scope',
            browsersController,
        ]);

}(window.angular));