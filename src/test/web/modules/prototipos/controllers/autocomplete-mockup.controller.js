(function () {
    'use strict';

    angular.module('gux.toolbox')

    .controller('AutocompleteCtrl', ['$scope', '$timeout', '$q', '$log',
    function ($scope, $timeout, $q, $log) {
            var self = this;
            self.simulateQuery = true;
            self.isDisabled = false;
            self.repos = loadAll();
            self.querySearch = querySearch;
            self.selectedItemChange = selectedItemChange;
            self.searchTextChange = searchTextChange;
            // ******************************
            // Internal methods
            // ******************************
            /**
             * Search for repos... use $timeout to simulate
             * remote dataservice call.
             */
            function querySearch(query) {
                var results = query ? self.repos.filter(createFilterFor(query)) : self.repos,
                    deferred;
                if (self.simulateQuery) {
                    deferred = $q.defer();
                    $timeout(function () {
                        deferred.resolve(results);
                    }, Math.random() * 500, false);
                    return deferred.promise;
                } else {
                    return results;
                }
            }

            function searchTextChange(text) {
                $log.info('Text alterado por ' + text);
            }

            function selectedItemChange(item) {
                $log.info('Item alterado por' + JSON.stringify(item));
            }
            /**
             * Build `components` list of key/value pairs
             */
            function loadAll() {
                var repos = [
                    {
                        'name': 'Julio Ferracini - ',
                        'url': 'https://github.com/angular/angular.js',
                        'watchers': 'Pessoas',
                        'forks': ' 001.999 ',
                        'receb': '01/04/2016',
        },
                    {
                        'name': 'Brad Pitt - ',
                        'url': 'https://github.com/angular/angular',
                        'watchers': 'Empresas',
                        'forks': ' 111.233 ',
                        'receb': '01/04/2016',
        },
                    {
                        'name': 'Angelina Jolie - ',
                        'url': 'https://github.com/angular/material',
                        'watchers': 'Pessoas',
                        'forks': ' 334.233 ',
                        'receb': '01/04/2016',
        },
                    {
                        'name': 'Mulitle Iron - ',
                        'url': 'https://github.com/angular/bower-material',
                        'watchers': 'Instituições do Setor',
                        'forks': ' 355.233 ',
                        'receb': '01/04/2016',
        },
                    {
                        'name': 'Global UX - ',
                        'url': 'https://github.com/angular/material-start',
                        'watchers': 'Agentes',
                        'forks': ' 989.233 ',
                        'receb': '01/04/2016',
        }
      ];
                return repos.map(function (repo) {
                    repo.value = repo.name.toLowerCase();
                    return repo;
                });
            }
            /**
             * Create filter function for a query string
             */
            function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);
                return function filterFn(item) {
                    return (item.value.indexOf(lowercaseQuery) === 0);
                };
            }
    }
])
})();