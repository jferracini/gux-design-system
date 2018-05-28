(function(angular) {

    'use strict';

    function gxFormGroupSelectController($scope) {

    }

    var gxFormGroupSelectDependencies = [];

    var gxFormGroupSelectComponent = {
        templateUrl: 'views/gx-form-group-select.html',
        require: {
            parent: '^gxFormGroup'
        },
        controller: [
            '$scope',
            gxFormGroupSelectController
        ]
    };

    angular
        .module('gux.formGroupSelect', gxFormGroupSelectDependencies)
        .component('gxFormGroupSelect', gxFormGroupSelectComponent);

}(window.angular));