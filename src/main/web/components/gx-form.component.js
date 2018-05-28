(function($, angular) {

    'use strict';

    function ngFormControllerNotLoaded() {
        this.message = "Angular FormController has not been loaded yet";
    }

    function isForce(gxformController) {
        var result = false;
        if (!!gxformController.gxForce &&
            (gxformController.gxForce === true ||
                gxformController.gxForce === "true")) {
            result = true;
        }
        return result;
    }

    function isNgFormControllerPristine(ngFormController) {
        return ngFormController.$pristine;
    }

    function isNgFormControllerValid(ngFormController) {
        return ngFormController.$valid || !ngFormController.$invalid;
    }

    function isGxFormControllerWarning(gxformController) {
        return !!gxformController.gxWarning || gxformController.gxSubmissionWarningCont <= 1;
    }

    function gxFormService() {

        var service = {};
        service.ERROR_FEEDBACK_TYPE = '$error';
        service.WARNING_FEEDBACK_TYPE = 'gxWarning';
        service.SUCCESS_FEEDBACK_TYPE = 'gxSuccess';
        service.INFO_FEEDBACK_TYPE = 'gxInfo';
        service.DEFAULT_FEEDBACK_TYPE = 'gxDefault';

        var self = this;
        self.formControllersMap = {};

        function getController(formName) {
            var controller = self.formControllersMap[formName];
            if (!controller) {
                self.formControllersMap[formName] = {};
                controller = self.formControllersMap[formName];
            }
            return controller;
        }

        function getGxFormController(formName) {
            return getController(formName).gxFormController;
        }

        service.setGxFormController = function(formName, gxFormController) {
            getController(formName).gxFormController = gxFormController;
        };

        service.getNgFormController = function(formName) {
            var ngFormController = getController(formName).ngFormController;
            if (!ngFormController) {
                throw new ngFormControllerNotLoaded();
            }
            return ngFormController;
        };

        service.setNgFormController = function(formName, ngFormController) {
            getController(formName).ngFormController = ngFormController;
        };

        service.isPristine = function(formName) {
            return isNgFormControllerPristine(service.getNgFormController(formName));
        };

        service.setPristine = function(formName) {
            return service.getNgFormController(formName).$setPristine();
        };

        service.isValidable = function(formName, ngModelController) {
            var result = false;
            var ngFormController = service.getNgFormController(formName);
            var gxFormController = getGxFormController(formName);
            result = gxFormController.gxSubmissionAttemptCount > 0 ||
                ngFormController[ngModelController.$name].$dirty;
            return result;
        };

        service.resetValidators = function(formName) {
            var gxFormController = getGxFormController(formName);
            gxFormController.gxWarning = {};
            gxFormController.gxSuccess = {};
            gxFormController.gxInfo = {};
        };

        service.isForce = function(formName) {
            var gxFormController = getGxFormController(formName);
            return isForce(gxFormController);
        };

        service.isValid = function(formName, feedbackType, validatorKey, ngModelController) {

            var ngFormController = service.getNgFormController(formName);

            if (!feedbackType) {
                return isNgFormControllerValid(ngFormController);
            }

            var result = true;
            var source = null;
            if (feedbackType === service.ERROR_FEEDBACK_TYPE) {
                source = ngFormController;
            } else {
                source = getGxFormController(formName);
            }

            var feedback = source[feedbackType];
            if (!validatorKey) {
                return !feedback || $.isEmptyObject(feedback);
            } else {
                var ngModelControllers = feedback[validatorKey];
                if (!!ngModelControllers) {
                    for (var i = 0; ngModelControllers.length > i; i++) {
                        if (ngModelController.$name === ngModelControllers[i].$name) {
                            result = false;
                            break;
                        }
                    }
                }
            }

            return result;
        };

        service.setValidatorInvalid = function(formName, feedbackType, validatorKey, ngModelController) {
            if (feedbackType != service.ERROR_FEEDBACK_TYPE) {
                if (!!ngModelController) {
                    var gxFormController = getGxFormController(formName);
                    if (!gxFormController[feedbackType][validatorKey]) {
                        gxFormController[feedbackType][validatorKey] = [];
                    }
                    gxFormController[feedbackType][validatorKey].push(ngModelController);
                }
            }
        };

        service.setValidatorValid = function(formName, feedbackType, validatorKey, ngModelController) {
            if (feedbackType != service.ERROR_FEEDBACK_TYPE) {
                if (!!ngModelController) {
                    var gxFormController = getGxFormController(formName);
                    var ngModelControllers = gxFormController[feedbackType][validatorKey];
                    if (!ngModelControllers) {
                        return;
                    }
                    for (var i = ngModelControllers.length - 1; i >= 0; i--) {
                        if (ngModelController.$name === ngModelControllers[i].$name) {
                            ngModelControllers.splice(i, 1);
                        }
                    }
                }
            }
        };

        service.resetFormController = function(formName) {
            getGxFormController(formName).gxSubmissionAttemptCount = 0;
            service.getNgFormController(formName).$setPristine();
        }

        return service;
    }

    function gxFormErrorException(message, title) {
        this.title = title;
        this.message = message;
        this.type = 'error';
    }

    function gxFormWarningException(message, title) {
        this.title = title;
        this.message = message;
        this.type = 'warning';
    }

    function validateFormGroups(ngFormController) {
        angular.forEach(ngFormController, function(value, key) {
            if (!!value && !!value.gxValidate) {
                value.gxValidate(null, null, function() {});
            }
        });
    }

    function validate($scope, ngFormController) {
        angular.forEach(ngFormController, function(attribute) {
            if (!!attribute && attribute instanceof Object && !!attribute.$validate) {
                attribute.$validate();
            }
        });
    }

    function submit($scope, $parse, gxFormService) {

        var gxFormController = $scope.$ctrl;
        var ngFormController = gxFormService.getNgFormController(gxFormController.gxName);
        $scope.$ctrl.gxSubmissionAttemptCount++;

        validate($scope, ngFormController);

        if (!isForce(gxFormController) && !isNgFormControllerValid(ngFormController)) {
            var message = 'Alguns campos do formulário requerem sua atenção, você deve obrigatoriamente corrigi-los antes de submeter o formulário';
            throw new gxFormErrorException(message, 'Ops!');
        }

        var result = $parse(gxFormController.gxSubmit)($scope.$parent);

        if (!!result && !!result.then) {
            result
                .then(function() {
                    gxFormService.resetFormController(gxFormController.gxName);
                });
        } else if (!!result) {
            gxFormService.resetFormController(gxFormController.gxName);
        }

        return result;
    }

    function gxFormController($parse, $element, $scope, gxFormService) {

        var self = this;

        if (!self.gxSubmit) {
            throw new Error('You must define gx-submit attribute for element ' + $('<span>').append($element).html());
        }

        self.gxSubmissionAttemptCount = 0;
        //self.gxSubmissionWarningCont = 0;
        //self.gxSubmissionErrorCont = 0;

        self.submit = function() {
            submit($scope, $parse, gxFormService);
        }

        gxFormService.setNgFormController(self.gxName, null);
        gxFormService.setGxFormController(self.gxName, self);

        $scope.$watch(self.gxName, function(ngFormController) {
            gxFormService.setNgFormController(self.gxName, ngFormController);
        });
    }

    var gxFormDependencies = [];

    var gxFormComponent = {
        templateUrl: 'views/gx-form.html',
        transclude: true,
        bindings: {
            gxName: '@',
            gxSubmit: '@',
            gxForce: '@'
        },
        controller: [
            '$parse',
            '$element',
            '$scope',
            'gxFormService',
            gxFormController
        ]
    };

    angular
        .module('gux.form', gxFormDependencies)
        .factory('gxFormService', gxFormService)
        .component('gxForm', gxFormComponent);

}(window.$, window.angular));