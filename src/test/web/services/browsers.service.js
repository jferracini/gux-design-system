(function(angular) {

    'use strict';

    angular.module('gux.test.services')
        .factory('browserReportService', ['$http',
            function(http) {
                return {
                    list: function() {
                        return http
                            .get('/data/browser-report.json')
                            .then(function(response) {
                                return response.data;
                            });
                    }
                };
            }
        ]);

}(window.angular));