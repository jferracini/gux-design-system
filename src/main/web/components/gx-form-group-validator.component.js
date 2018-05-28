(function($, angular) {

    'use strict';

    function gxFormGroupValidatorController($element, gxFormService) {

        var self = this;

        self.$onInit = function() {

            var feedbackType = !!self.gxType ? self.gxType : 'error';
            if (feedbackType.toUpperCase().indexOf('ERROR') > -1) {
                feedbackType = gxFormService.ERROR_FEEDBACK_TYPE;
            } else if (feedbackType.toUpperCase().indexOf('WARNING') > -1) {
                feedbackType = gxFormService.WARNING_FEEDBACK_TYPE;
            } else if (feedbackType.toUpperCase().indexOf('SUCCESS') > -1) {
                feedbackType = gxFormService.SUCCESS_FEEDBACK_TYPE;
            } else if (feedbackType.toUpperCase().indexOf('INFO') > -1) {
                feedbackType = gxFormService.INFO_FEEDBACK_TYPE;
            }

            var validatorKey = !!self.gxKey ? self.gxKey : 'default';

            if (feedbackType != gxFormService.ERROR_FEEDBACK_TYPE && !self.gxFunction) {
                throw new Error('You must define gx-function attribute for element ' + $('<span>').append($element).html());
            }

            if (!self.gxMessage) {
                throw new Error('You must define gx-message attribute for element ' + $('<span>').append($element).html());
            }

            self.gxFormGroupController.registerValidator(feedbackType, validatorKey, self.gxForce, self.gxFunction, self.gxMessage, self.gxTimeout);
        }
    }

    var gxFormGroupValidatorDependencies = [];

    var gxFormGroupValidatorComponent = {
        require: {
            gxFormGroupController: '^gxFormGroup'
        },
        bindings: {
            gxType: '@',
            gxKey: '@',
            gxForce: '@',
            gxFunction: '@',
            gxMessage: '@',
            gxTimeout: '@'
        },
        controller: [
            '$element',
            'gxFormService',
            gxFormGroupValidatorController
        ]
    };
    angular
        .module('gux.formGroupValidator', gxFormGroupValidatorDependencies)
        .component('gxFormGroupValidator', gxFormGroupValidatorComponent);

}(window.$, window.angular));