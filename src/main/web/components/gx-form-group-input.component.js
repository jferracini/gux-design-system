(function(angular) {

    'use strict';

    function gxFormGroupInputController() {

    }

    var gxFormGroupInputDependencies = [];

    var gxFormGroupInputComponent = {
        templateUrl: 'views/gx-form-group-input.html',
        require: {
            parent: '^gxFormGroup'
        },
        controller: [
            gxFormGroupInputController
        ]
    };

    angular
        .module('gux.formGroupInput', gxFormGroupInputDependencies)
        .component('gxFormGroupInput', gxFormGroupInputComponent);

}(window.angular));