(function(angular) {
    'use strict';

    function dashboardController($scope) {

        $scope.labels = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho"];
        $scope.series = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
        $scope.data = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90],
            [44, 66, 55, 99, 77, 66, 22],
            [99, 84, 34, 33, 36, 76, 22]
        ];
        $scope.onClick = function(points, evt) {
            console.log(points, evt);
        };
        $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
        $scope.options = {
            scales: {
                yAxes: [{
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'right'
                    },
                    {
                        id: 'y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'right'
                    }
                ]
            }
        };
    }

    angular.module('gux.test.layouts')
        .config(['ChartJsProvider', function(ChartJsProvider) {
            // Configure all charts
            ChartJsProvider.setOptions({
                colours: ['#08296C', '#BFD730', '#0073AE', '#00909E', '#333D42', '#949FB1', '#4D5360'],
                responsive: true
            });
            // Configure all line charts
            ChartJsProvider.setOptions('line', {
                datasetFill: true
            });
        }])
        .controller('DashboardController', [
            '$scope',
            dashboardController
        ]);

}(window.angular));