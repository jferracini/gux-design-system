(function(angular) {

    'use strict';

    var APPLICATION_NAME = 'app';

    function logProviderConfig(logProvider) {
        logProvider.debugEnabled(true);
    }

    function applicationStatesResponseHandler(response) {
        angular.module('gux.config', [])
            .constant('GX_STATE_CONFIG', response.data)
            .constant('GX_FORM_GROUP_CONFIG', {
                date: {
                    ignoreTimezone: true
                }
            });
    }

    function applicationBootstrap() {
        angular.element(document).ready(function() {
            angular.bootstrap(document, [APPLICATION_NAME], {
                strictDi: true
            });
        });
    }

    angular.module(APPLICATION_NAME, ['gux.test.home', 'gux.test.components', 'gux.test.layouts', 'gux.test.testes', 'gux.test.doc'])
        .config(['$logProvider', logProviderConfig]);

    angular.injector(['ng'])
        .get('$http')
        //.get('http://bitbucketold/pages/GUX/ccee-gux-toolbox/master/browse/dist/data/test.states.json')
        .get('./data/test.states.json')
        .then(applicationStatesResponseHandler)
        .then(applicationBootstrap);

}(window.angular));