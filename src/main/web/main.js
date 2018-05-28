(function(angular) {

    'use strict';

    var guxToolboxDependencies = [
        'gux.tooltip',
        'gux.app',
        'gux.panel',
        'gux.form',
        'gux.formGroup',
        'gux.fieldset',
        'gux.formButton',
        'gux.flatfull',
        'bw.paging',
        'gux.cockpit',
        'gux.sidenav',
        'ngMaterial',
        'multiStepForm',
        'as.sortable',
        'angular-progress-button-styles'
    ];

    angular.module('gux.toolbox', guxToolboxDependencies);

}(window.angular));