(function(angular) {

    'use strict';

    function gxFormGroupTextareaController() {

    }

    var gxFormGroupTextareaDependencies = [];

    var gxFormGroupTextareaComponent = {
        templateUrl: 'views/gx-form-group-textarea.html',
        require: {
            parent: '^gxFormGroup'
        },
        controller: [
            gxFormGroupTextareaController
        ]
    };

    angular
        .module('gux.formGroupTextarea', gxFormGroupTextareaDependencies)
        .component('gxFormGroupTextarea', gxFormGroupTextareaComponent);

}(window.angular));