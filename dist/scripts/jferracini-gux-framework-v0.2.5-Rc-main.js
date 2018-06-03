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
        template:'<form name="{{$ctrl.gxName}}" ng-submit="$ctrl.submit()" ng-transclude novalidate></form>',
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
(function($, angular) {

    'use strict';

    var elementIndex = 1;

    function isForce($parse, $scope, validatorDefinition, modelValue, viewValue) {
        var result = false;
        if (!!validatorDefinition.force) {
            if (validatorDefinition.force === 'false' || validatorDefinition.force === false) {
                result = false;
            } else if (validatorDefinition.force === 'true' || validatorDefinition.force === true) {
                result = true;
            } else {
                try {
                    result = $parse(validatorDefinition.force)($scope.$parent, { modelValue: modelValue, viewValue: viewValue });
                } catch (error) {
                    throw new Error("Unable to parse gx-form-group-validator gx-force function: " + validatorDefinition.force);
                }
            }
        }
        return result;
    }

    function getMessage($parse, $scope, validatorDefinition, modelValue, viewValue) {
        var result = undefined;
        if (!!validatorDefinition.message) {
            try {
                result = $parse(validatorDefinition.message)($scope.$parent, { modelValue: modelValue, viewValue: viewValue });
            } catch (error) {
                result = validatorDefinition.message;
            }
            if (!result) {
                result = 'Menssagem de feedback não definida para o validador: ' + key;
            }
        }
        return result;
    }

    function getTimeout($parse, $scope, validatorDefinition, modelValue, viewValue) {
        var result = undefined;
        if (!!validatorDefinition.timeout) {
            try {
                result = $parse(validatorDefinition.timeout)($scope.$parent, { modelValue: modelValue, viewValue: viewValue });
            } catch (error) {
                result = validatorDefinition.timeout;
            }
        }
        return result;
    }

    function getFeedbackMessages($parse, $scope, validatorsDefinitions, modelValue, viewValue) {
        var feedbackMessages = [];
        for (var i = 0; validatorsDefinitions.length > i; i++) {
            var validatorDefinition = $scope.$ctrl.validatorsDefinitions[validatorsDefinitions[i].type][validatorsDefinitions[i].key];
            feedbackMessages.push({
                text: getMessage($parse, $scope, validatorDefinition, modelValue, viewValue),
                timeout: getTimeout($parse, $scope, validatorDefinition, modelValue, viewValue)
            });
        }
        return feedbackMessages;
    }

    // TRUE it is valid
    // FALSE it is invalid
    function validate($parse, $scope, gxFormService, feedbackType, ngModelController, modelValue, viewValue) {
        var result = true;
        var invalidValidators = [];
        gxFormService.resetValidators($scope.$ctrl.formName);
        for (var validatorKey in $scope.$ctrl.validatorsDefinitions[feedbackType]) {
            var validatorDefinition = $scope.$ctrl.validatorsDefinitions[feedbackType][validatorKey];
            if (isForce($parse, $scope, validatorDefinition, modelValue, viewValue) || gxFormService.isValidable($scope.$ctrl.formName, ngModelController)) {
                if (feedbackType != gxFormService.ERROR_FEEDBACK_TYPE &&
                    !!validatorDefinition.validatorFunction &&
                    !$parse(validatorDefinition.validatorFunction)($scope.$parent, { modelValue: modelValue, viewValue: viewValue })) {
                    gxFormService.setValidatorInvalid($scope.$ctrl.formName, feedbackType, validatorKey, ngModelController, validatorDefinition.timeout);
                }
                if (!gxFormService.isValid($scope.$ctrl.formName, feedbackType, validatorKey, ngModelController)) {
                    invalidValidators.push(validatorDefinition);
                }
            }
        }
        if (!!invalidValidators && invalidValidators.length > 0) {
            $scope.$ctrl.feedbackType = feedbackType;
            $scope.$ctrl.feedbackMessages = getFeedbackMessages($parse, $scope, invalidValidators, modelValue, viewValue);
            result = false;
        } else {
            $scope.$ctrl.feedbackType = gxFormService.DEFAULT_FEEDBACK_TYPE;
        }
        return result;
    };

    function nameNotFoundException(parentElement, childElement) {
        this.message = 'Element name not found';
        this.parentElement = parentElement.html();
        this.childElement = childElement.html();
    }

    function ngModelControllerNotFoundException(parentElement, childElement) {
        this.message = 'ngModelController not found';
        this.parentElement = parentElement.html();
        this.childElement = childElement.html();
    }

    function gxFormGroupController($timeout, $parse, $element, $scope, gxFormService, $log) {

        var self = this;

        var inputElementName = null;
        if (!!self.name) {
            inputElementName = self.name;
        } else {
            inputElementName = 'gx-form-group-' + elementIndex++;
        }
        self.elementName = inputElementName;

        if (self.stereotype === 'number') {
            self.isInputNumber = true;
        } else if (self.stereotype === 'currency') {
            self.isCurrency = true;
        } else if (self.stereotype === 'text' ||
            self.stereotype === 'email' ||
            self.stereotype === 'password' ||
            self.stereotype === 'url') {
            self.isInput = true;
        } else if (self.stereotype === 'textarea') {
            self.isTextarea = true;
        } else if (self.stereotype === 'date-time' ||
            self.stereotype === 'date' ||
            self.stereotype === 'date-month' ||
            self.stereotype === 'date-year') {
            self.isCalendar = true;
        } else if (self.stereotype === 'select') {
            self.isSelect = true;
        } else if (self.stereotype === 'dropdown') {
            self.isDropdown = true;
        } else if (self.stereotype === 'autocomplete') {
            self.isAutocomplete = true;
        } else if (self.stereotype === 'switch') {
            self.isSwitch = true;
        } else if (self.stereotype === 'equation') {
            self.isEquation = true;
        } else if (!self.stereotype) {
            self.isCustom = true;
        }

        self.feedbackType = gxFormService.DEFAULT_FEEDBACK_TYPE;

        self.hasError = function() {
            return self.feedbackType === gxFormService.ERROR_FEEDBACK_TYPE;
        };

        self.hasWarning = function() {
            return self.feedbackType === gxFormService.WARNING_FEEDBACK_TYPE;
        };

        self.hasSuccess = function() {
            return self.feedbackType === gxFormService.SUCCESS_FEEDBACK_TYPE;
        };

        self.feedbackMessages = [];

        self.validatorsDefinitions = {}
        self.validatorsDefinitions[gxFormService.ERROR_FEEDBACK_TYPE] = {
            text: { type: "$error", key: "text", message: "Texto inválido" },
            number: { type: "$error", key: "number", message: "Numero inválido" },
            url: { type: "$error", key: "url", message: "URL Inválida" },
            email: { type: "$error", key: "email", message: "Email inválido" },
            date: { type: "$error", key: "date", message: "Data inválida" },
            radio: { type: "$error", key: "radio", message: "Radio inválido" },
            checkbox: { type: "$error", key: "checkbox", message: "Checkbox inválido" },
            required: { type: "$error", key: "required", message: "Campo obrigatório" },
            pattern: { type: "$error", key: "pattern", message: "O texto não segue o padrão definido" },
            minlength: { type: "$error", key: "minlength", message: "O texto não possui o tamanho mínimo de caracteres" },
            maxlength: { type: "$error", key: "maxlength", message: "O texto ultrapassa o tamanho máximo de caracteres" },
            min: { type: "$error", key: "min", message: "Numero inferior ao valor mínimo requerido" },
            max: { type: "$error", key: "max", message: "Numero superior ao valor mínimo requerido" }
        };
        self.validatorsDefinitions[gxFormService.WARNING_FEEDBACK_TYPE] = {};
        self.validatorsDefinitions[gxFormService.SUCCESS_FEEDBACK_TYPE] = {};
        self.validatorsDefinitions[gxFormService.INFO_FEEDBACK_TYPE] = {};

        self.registerValidator = function(feedbackType, validatorKey, forceValidation, validatorFunction, validatorMessage, validatorTimeout) {
            var validatorDefinition = {
                type: feedbackType,
                key: validatorKey,
                validatorFunction: validatorFunction,
                force: forceValidation,
                message: validatorMessage,
                timeout: validatorTimeout
            }
            self.validatorsDefinitions[feedbackType][validatorKey] = validatorDefinition;
        };

        self.setModel = function(model, force) {
            //var modelGetter = $parse($element.attr('model'));
            //var modelSetter = modelGetter.assign;
            //modelSetter($scope.$parent, model);
            self.model = model;
            if (!!force && force === true) {
                $scope.$apply();
            }
        };

        self.getBadgeValue = function(item) {
            var badgePathArray = self.modelOptionAttributeBadge.split('.');
            var result = item;
            for (var i = 0; i < badgePathArray.length; i++) {
                result = result[badgePathArray[i]];
            }
            return result;
        };

        function validator(ngModelController, validatorDefinition) {
            var me = this;
            me.ngModelController = ngModelController;
            me.validatorDefinition = validatorDefinition;
            me.validate = function(modelValue, viewValue) {
                var func = $parse(me.validatorDefinition.validatorFunction);
                return func($scope.$parent, { modelValue: modelValue, viewValue: viewValue, ngModelController: me.ngModelController });
            }
        }

        $timeout(function() {

            self.formName = $element.closest('form').attr('name');
            var ngFormController = gxFormService.getNgFormController(self.formName);

            var elements = $element.find('[ng-model]');

            if (elements.length > 0) {

                for (var i = 0; i < elements.length; i++) {

                    var currentElement = $(elements[i]);
                    var currentElementName = currentElement.attr("name");

                    if (!currentElementName) {
                        throw new nameNotFoundException($element, currentElement);
                    }

                    var ngModelController = ngFormController[currentElementName];

                    if (!ngModelController) {
                        throw new ngModelControllerNotFoundException($element, currentElement);
                    }

                    var errorValidatorsDefinitions = self.validatorsDefinitions[gxFormService.ERROR_FEEDBACK_TYPE];
                    for (var errorValidatorKey in errorValidatorsDefinitions) {
                        var errorValidatorDefinition = errorValidatorsDefinitions[errorValidatorKey];
                        if (!!errorValidatorDefinition.validatorFunction) {
                            var val = new validator(ngModelController, errorValidatorDefinition);
                            ngModelController.$validators[errorValidatorKey] = val.validate;
                        }
                    }

                    ngModelController.$validators.gxFormGroup = function(modelValue, viewValue) {
                        self.feedbackMessages = [];
                        var result = validate($parse, $scope, gxFormService, gxFormService.ERROR_FEEDBACK_TYPE, ngModelController, modelValue, viewValue) &&
                            validate($parse, $scope, gxFormService, gxFormService.WARNING_FEEDBACK_TYPE, ngModelController, modelValue, viewValue) &&
                            validate($parse, $scope, gxFormService, gxFormService.SUCCESS_FEEDBACK_TYPE, ngModelController, modelValue, viewValue) &&
                            validate($parse, $scope, gxFormService, gxFormService.INFO_FEEDBACK_TYPE, ngModelController, modelValue, viewValue);
                        return true;
                    };

                    for (var feedbakType in self.validatorsDefinitions) {
                        for (var validatorKey in self.validatorsDefinitions[feedbakType]) {
                            var validatorDefinition = self.validatorsDefinitions[feedbakType][validatorKey];
                            if (isForce($parse, $scope, validatorDefinition, ngModelController.$modelValue, ngModelController.$viewValue)) {
                                validate($parse, $scope, gxFormService, gxFormService.WARNING_FEEDBACK_TYPE, ngModelController, ngModelController.$modelValue, ngModelController.$viewValue)
                            }
                        }
                    }

                    currentElement.on('blur', function() {
                        for (var i = 0; i < self.feedbackMessages.length; i++) {
                            var feedbackMessage = self.feedbackMessages[i];
                            if (!!feedbackMessage.timeout) {
                                $timeout(function() {
                                    var index = self.feedbackMessages.indexOf(feedbackMessage); // <-- Not supported in <IE9
                                    if (index !== -1) {
                                        self.feedbackMessages.splice(index, 1);
                                    }
                                    if (self.feedbackMessages.length == 0) {
                                        self.feedbackType = gxFormService.DEFAULT_FEEDBACK_TYPE;
                                    }
                                }, feedbackMessage.timeout);
                            }
                        }
                    });
                }

            } else {
                $log.warn("No ng-model found for element: " + $element.html());
            }
        });
    };

    var gxFormGroupDependencies = [
        'gux.tooltip',
        'ui.select',
        'ui.mask',
        'gux.formGroupInput',
        'gux.FormGroupInputNumber',
        'gux.FormGroupInputCurrency',
        'gux.formGroupTextarea',
        'gux.formGroupCalendar',
        'gux.formGroupSelect',
        'gux.formGroupDropdown',
        'gux.formGroupAutocomplete',
        'gux.formGroupSwitch',
        'gux.formGroupEquation',
        'gux.formGroupValidator'
    ];

    var gxFormGroupComponent = {
        template:'<div class="form-group gx-form-group" ng-class="{\'has-success\': $ctrl.hasSuccess(), \'has-warning\': $ctrl.hasWarning(), \'has-error\': $ctrl.hasError()}"><div><label ng-if="::$ctrl.label" ng-attr-gx-tooltip="{{$ctrl.description}}" class="control-label">{{::$ctrl.label}} <span ng-if="$ctrl.required" class="required">*</span> <small ng-if="$ctrl.description">&nbsp;<i class="fa fa-info-circle"></i></small></label></div><gx-form-group-input-number ng-if="::$ctrl.isInputNumber"></gx-form-group-input-number><gx-form-group-input-currency ng-if="::$ctrl.isCurrency"></gx-form-group-input-currency><gx-form-group-input ng-if="::$ctrl.isInput"></gx-form-group-input><gx-form-group-textarea ng-if="::$ctrl.isTextarea"></gx-form-group-textarea><gx-form-group-calendar ng-if="::$ctrl.isCalendar"></gx-form-group-calendar><gx-form-group-select ng-if="::$ctrl.isSelect"></gx-form-group-select><gx-form-group-dropdown ng-if="::$ctrl.isDropdown"></gx-form-group-dropdown><gx-form-group-autocomplete ng-if="::$ctrl.isAutocomplete"></gx-form-group-autocomplete><gx-form-group-switch ng-if="::$ctrl.isSwitch"></gx-form-group-switch><gx-form-group-equation ng-if="::$ctrl.isEquation"></gx-form-group-equation><div ng-if="::$ctrl.isCustom"><ng-transclude></ng-transclude></div><span ng-repeat="feedbackMessage in $ctrl.feedbackMessages" class="help-block"><span>{{feedbackMessage.text}}</span></span><ng-transclude ng-transclude-slot="gxFormGroupValidator" class="hide"></ng-transclude></div>',
        transclude: {
            'gxFormGroupValidator': '?gxFormGroupValidator'
        },
        require: {
            gxFormController: '^gxForm'
        },
        bindings: {
            name: '@', // change to gxName
            stereotype: '@', // change to gxStereotype
            label: '@', // change to gxLabel
            offLabel: '@', // change to gxFalseLabel
            onLabel: '@', // change to gxTrueLabel
            description: '@', // change to gxDescription
            example: '@', // change to gxExample
            mask: '@', // change to gxMask
            model: '=', // change to gxModel
            gxModelOptions: '=',
            modelOffValue: '@', // change to gxFalseValue
            modelOnValue: '@', // change to gxTrueValue
            modelOptions: '=', // change to gxOptions
            modelOptionAttributeKey: '@', // change to gxOptionKey
            modelOptionAttributeValue: '@', // change to gxOptionValue
            modelOptionAttributeBadge: '@', // change to gxOptionBadge
            gxRows: '@',
            gxCols: '@',
            gxMinlength: '@',
            gxMaxlength: '@',
            gxMin: '@',
            gxMax: '@',
            gxPattern: '@',
            gxTabindex: '@',
            required: '=',
            readonly: '@',
            disabled: '=',
            gxIgnoreTimezone: '@',
            gxCalPlacement: '@',
            gxOnSearch: '&',
            gxOnCreate: '&',
            gxOnUpdate: '&',
            gxOnDelete: '&',
            gxAttributeValueMatch: '@'
        },
        controller: [
            '$timeout',
            '$parse',
            '$element',
            '$scope',
            'gxFormService',
            '$log',
            gxFormGroupController
        ]
    };

    function gxFormGroupRun(uiMaskConfig) {
        uiMaskConfig.clearOnBlur = false;
    }

    angular
        .module('gux.formGroup', gxFormGroupDependencies)
        .component('gxFormGroup', gxFormGroupComponent)
        .run(['uiMaskConfig', gxFormGroupRun]);

}(window.$, window.angular));
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
(function(angular) {

    'use strict';

    function gxFormGroupTextareaController() {

    }

    var gxFormGroupTextareaDependencies = [];

    var gxFormGroupTextareaComponent = {
        template:'<textarea name="{{::$ctrl.parent.elementName}}" ng-required="$ctrl.parent.required" ng-attr-placeholder="{{::$ctrl.parent.example}}" ng-model="$ctrl.parent.model" ng-model-options="!!$ctrl.parent.gxModelOptions ? $ctrl.parent.gxModelOptions : {updateOn: \'default\'}" ng-attr-rows="{{::$ctrl.parent.gxRows}}" ng-attr-cols="{{::$ctrl.parent.gxCols}}" ng-maxlength="::$ctrl.parent.gxMaxlength" ng-attr-tabindex="{{$ctrl.parent.gxTabindex}}" ng-readonly="{{::$ctrl.parent.readonly}}" ng-disabled="$ctrl.parent.disabled" class="form-control" autocomplete="off">\n</textarea>',
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
(function (angular) {

	'use strict';

	function gxFormGroupSwitchController() {

		var self = this;

		self.$onInit = function () {

			self.isOn = function () {
				return !!self.parent
					&& !!self.parent.model
					&& (self.parent.model === true
						|| (!!self.parent.modelOnValue
							&& self.parent.model.toUpperCase() === self.parent.modelOnValue.toUpperCase()));
			}
		};
	}

	var gxFormGroupSwitchDependencies = [
	];

	var gxFormGroupSwitchComponent = {
		template:'<div class="input-group gx-form-group-switch"><label ng-if="!!$ctrl.parent.offLabel">{{$ctrl.parent.offLabel}}</label> <label><input type="checkbox" name="{{::$ctrl.parent.elementName}}" ng-attr-ng-required="$ctrl.parent.required" ng-model="$ctrl.parent.model" ng-attr-ng-true-value="\'{{::$ctrl.parent.modelOnValue}}\'" ng-attr-ng-false-value="\'{{::$ctrl.parent.modelOffValue}}\'" ng-attr-tabindex="{{::$ctrl.parent.gxTabindex}}" ng-attr-ng-readonly="{{::$ctrl.parent.readonly}}" ng-attr-ng-disabled="$ctrl.parent.disabled" ng-class="{\'gx-form-group-switch-on\': $ctrl.isOn()}" autocomplete="off"> <span></span></label> <label ng-if="!!$ctrl.parent.onLabel">{{$ctrl.parent.onLabel}}</label></div>',
		require: {
			parent: '^gxFormGroup'
		},
		controller: [
			gxFormGroupSwitchController
		]
	};

	angular
		.module('gux.formGroupSwitch', gxFormGroupSwitchDependencies)
		.component('gxFormGroupSwitch', gxFormGroupSwitchComponent);

} (window.angular));

(function(angular) {

    'use strict';

    function gxFormGroupSelectController($scope) {

    }

    var gxFormGroupSelectDependencies = [];

    var gxFormGroupSelectComponent = {
        template:'<select name="{{::$ctrl.parent.elementName}}" ng-attr-ng-required="$ctrl.parent.required" ng-options="modelOption[$ctrl.parent.modelOptionAttributeValue] for modelOption in $ctrl.parent.modelOptions track by modelOption[$ctrl.parent.modelOptionAttributeKey]" ng-model="$ctrl.parent.model" ng-attr-tabindex="{{$ctrl.parent.gxTabindex}}" ng-attr-ng-readonly="{{::$ctrl.parent.readonly}}" ng-attr-ng-disabled="$ctrl.parent.disabled" class="form-control"><option value>Selecione...</option></select>',
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
(function(angular) {

    'use strict';

    function gxFormGroupInputController() {

    }

    var gxFormGroupInputDependencies = [];

    var gxFormGroupInputComponent = {
        template:'<input type="{{::$ctrl.parent.stereotype}}" name="{{::$ctrl.parent.elementName}}" ng-required="$ctrl.parent.required" ng-attr-placeholder="{{::$ctrl.parent.example}}" ng-attr-ui-mask="{{::$ctrl.parent.mask}}" ng-attr-ui-mask-placeholder="{{::$ctrl.parent.example || $ctrl.parent.mask ? \'\' : undefined}}" ng-model="$ctrl.parent.model" ng-model-options="!!$ctrl.parent.gxModelOptions ? $ctrl.parent.gxModelOptions : {updateOn: \'default\'}" ng-minlength="::$ctrl.parent.gxMinlength" ng-maxlength="::$ctrl.parent.gxMaxlength" ng-pattern="::$ctrl.parent.gxPattern" ng-attr-tabindex="{{$ctrl.parent.gxTabindex}}" ng-readonly="{{::$ctrl.parent.readonly}}" ng-disabled="$ctrl.parent.disabled" class="form-control" autocomplete="off">',
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
(function (angular) {

	'use strict';

	function gxFormGroupInputNumberController() {

	}

	var gxFormGroupInputNumberDependencies = [
	];

	var gxFormGroupInputNumberComponent = {
		template:'<input type="{{::$ctrl.parent.stereotype}}" name="{{::$ctrl.parent.elementName}}" ng-required="$ctrl.parent.required" ng-attr-placeholder="{{::$ctrl.parent.example}}" ng-attr-ui-mask="{{::$ctrl.parent.mask}}" ng-attr-ui-mask-placeholder="{{::$ctrl.parent.example || $ctrl.parent.mask ? \'\' : undefined}}" ng-model="$ctrl.parent.model" ng-model-options="!!$ctrl.parent.gxModelOptions ? $ctrl.parent.gxModelOptions : {updateOn: \'default\'}" ng-attr-min="{{::$ctrl.parent.gxMin}}" ng-attr-max="{{::$ctrl.parent.gxMax}}" ng-attr-tabindex="{{$ctrl.parent.gxTabindex}}" ng-readonly="{{::$ctrl.parent.readonly}}" ng-disabled="$ctrl.parent.disabled" class="form-control" autocomplete="off">',
		require: {
			parent: '^gxFormGroup'
		},
		controller: [
			gxFormGroupInputNumberController
		]
	};

	angular
		.module('gux.FormGroupInputNumber', gxFormGroupInputNumberDependencies)
		.component('gxFormGroupInputNumber', gxFormGroupInputNumberComponent);

} (window.angular));

(function (angular) {

	'use strict';

	function gxFormGroupInputCurrencyController(parent, ngModelController) {
		console.log(ngModelController);
	}

	var gxFormGroupInputCurrencyDependencies = [
	];

	var gxFormGroupInputCurrencyComponent = {
		template:'<input type="number" name="{{::$ctrl.parent.elementName}}" ng-required="$ctrl.parent.required" ng-attr-placeholder="{{::$ctrl.parent.example}}" ng-attr-ui-mask="{{::$ctrl.parent.mask}}" ng-attr-ui-mask-placeholder="{{::$ctrl.parent.example || $ctrl.parent.mask ? \'\' : undefined}}" ng-model="$ctrl.parent.model" ng-model-options="!!$ctrl.parent.gxModelOptions ? $ctrl.parent.gxModelOptions : {updateOn: \'default\'}" ng-attr-min="{{::$ctrl.parent.gxMin}}" ng-attr-max="{{::$ctrl.parent.gxMax}}" ng-attr-tabindex="{{$ctrl.parent.gxTabindex}}" ng-readonly="{{::$ctrl.parent.readonly}}" ng-disabled="$ctrl.parent.disabled" class="form-control" autocomplete="off">',
		require: {
			parent: '^gxFormGroup',
			ngModelController: '?ngModel'
		},
		controller: [
			gxFormGroupInputCurrencyController
		]
	};

	angular
		.module('gux.FormGroupInputCurrency', gxFormGroupInputCurrencyDependencies)
		.component('gxFormGroupInputCurrency', gxFormGroupInputCurrencyComponent);

} (window.angular));

(function (MathQuill, angular) {

	'use strict';

	function gxFormGroupEquationController($element, $attrs, $parse, $scope) {
		
		var self = this;

		self.$onInit = function() {
			var mathFieldElement = $($element).find('.form-control')[0];
			var MQ = MathQuill.getInterface(2);
			var mathField = MQ.MathField(mathFieldElement, {
				spaceBehavesLikeTab: true,
				handlers: {
					edit: function () {
						self.parent.setModel(mathField.latex());
					}
				}
			});
			if (!!self.parent.model) {
				mathField.latex(self.parent.model);
			}
		};
	}

	var gxFormGroupEquationDependencies = [];

	var gxFormGroupEquationComponent = {
		template:'<div><input type="hidden" name="{{::$ctrl.parent.elementName}}" ng-model="$ctrl.parent.model" ng-attr-ng-required="$ctrl.parent.required"><div class="form-control"></div></div>',
		require: {
			parent: '^gxFormGroup'
		},
		controller: [
			'$element',
			'$attrs',
			'$parse',
			'$scope',
			gxFormGroupEquationController
		]
	};

	angular
		.module('gux.formGroupEquation', gxFormGroupEquationDependencies)
		.component('gxFormGroupEquation', gxFormGroupEquationComponent);

} (window.MathQuill, window.angular));

(function(angular) {

    'use strict';

    function gxFormGroupDropdownController($scope, $element) {

        var self = this;

        self.showBadge = function() {
            return !!self.parent &&
                !!self.parent.model &&
                !!self.parent.modelOptionAttributeBadge;
        };
    }

    var gxFormGroupDropdownDependencies = [];

    var gxFormGroupDropdownComponent = {
        template:'<div class="dropdown gx-form-group-dropdown"><input type="hidden" name="{{::$ctrl.parent.elementName}}" ng-model="$ctrl.parent.model" ng-attr-ng-required="$ctrl.parent.required"> <button type="button" ng-attr-tabindex="{{::$ctrl.parent.gxTabindex}}" ng-attr-ng-readonly="{{::$ctrl.parent.readonly}}" ng-attr-ng-disabled="$ctrl.parent.disabled" data-toggle="dropdown" class="btn btn-default dropdown-toggle form-control" ng-class="{\'disabled\': $ctrl.parent.disabled}">{{$ctrl.parent.model[$ctrl.parent.modelOptionAttributeValue]}} <span ng-if="$ctrl.showBadge()" class="badge input-badge">{{$ctrl.parent.getBadgeValue($ctrl.parent.model)}}</span></button> <span class="form-control-feedback"><i class="fa fa-caret-down fa-lg"></i></span><ul ng-if="::!$ctrl.parent.readonly" class="form-control dropdown-menu"><li ng-repeat="modelOption in $ctrl.parent.modelOptions track by $index"><a href="javascript:void(0)" ng-click="$ctrl.parent.setModel(modelOption)">{{modelOption[$ctrl.parent.modelOptionAttributeValue]}} <span ng-if="::!!$ctrl.parent.modelOptionAttributeBadge" class="badge pull-right m-r-xs" style="margin-top: 1px">{{$ctrl.parent.getBadgeValue(modelOption)}}</span></a></li></ul></div>',
        require: {
            parent: '^gxFormGroup'
        },
        controller: [
            '$scope',
            '$element',
            gxFormGroupDropdownController
        ]
    };

    angular
        .module('gux.formGroupDropdown', gxFormGroupDropdownDependencies)
        .component('gxFormGroupDropdown', gxFormGroupDropdownComponent);

}(window.angular));
(function(moment, jstz, angular) {

    'use strict';

    function gxFormGroupCalendarController($element, $scope, GX_FORM_GROUP_CONFIG) {

        var self = this;

        var ignoreTimezone = !!GX_FORM_GROUP_CONFIG.date.ignoreTimezone;

        self.$onInit = function() {

            var datepickerElement = $element.find('.input-group.date');
            var viewMode = null;
            var format = null;
            var language = navigator.language || navigator.userLanguage;

            if (self.parent.stereotype === 'date-time') {
                viewMode = 'days';
                self.parent.mask = '?99/99/9999 99:99';
                format = 'DD/MM/YYYY HH:mm';
            } else if (self.parent.stereotype === 'date') {
                viewMode = 'days';
                self.parent.mask = '?99/99/9999';
                format = 'DD/MM/YYYY';
            } else if (self.parent.stereotype === 'date-month') {
                viewMode = 'months';
                self.parent.mask = '?99/9999';
                format = 'MM/YYYY';
            } else if (self.parent.stereotype === 'date-year') {
                viewMode = 'years';
                self.parent.mask = '?9999';
                format = 'YYYY';
            }

            self.formattedDate = null;

            $scope.$watch('$ctrl.parent.model', function(value) {
                if (!!value) {
                    var modelValue = null;
                    var viewValue = null;
                    if (ignoreTimezone) {
                        modelValue = moment.utc(value);
                        viewValue = moment.utc(self.formattedDate, format);
                    } else {
                        modelValue = moment(value);
                        viewValue = moment(self.formattedDate, format);
                    }
                    if (!modelValue.isSame(viewValue)) {
                        self.formattedDate = modelValue.format(format);
                    }
                } else {
                    self.formattedDate = null;
                }
            });

            $scope.$watch('$ctrl.formattedDate', function(value) {
                if (!!value) {
                    var viewValue = null;
                    var modelValue = null;
                    if (ignoreTimezone) {
                        viewValue = moment.utc(value, format);
                        modelValue = moment.utc(self.parent.model);
                    } else {
                        viewValue = moment(value, format);
                        modelValue = moment(self.parent.model);
                    }
                    if (!modelValue.isSame(viewValue)) {
                        if (ignoreTimezone) {
                            self.parent.model = viewValue.format('YYYY-MM-DDTHH:mm:ss');
                        } else {
                            self.parent.model = viewValue.toISOString();
                        }
                    }
                } else {
                    self.parent.model = null;
                }
            });

            var datepicker = datepickerElement
                .datetimepicker({
                    locale: language,
                    viewMode: viewMode,
                    format: format,
                    useStrict: true,
                    useCurrent: false,
                    allowInputToggle: true,
                    showTodayButton: true,
                    showClear: true,
                    icons: {
                        "clear": "glyphicon glyphicon-trash",
                        "close": "glyphicon glyphicon-remove",
                        "date": "fa fa-calendar",
                        "down": "glyphicon glyphicon-chevron-down",
                        "next": "glyphicon glyphicon-chevron-right",
                        "previous": "glyphicon glyphicon-chevron-left",
                        "time": "glyphicon glyphicon-time",
                        "today": "glyphicon glyphicon-screenshot",
                        "up": "glyphicon glyphicon-chevron-up",
                    },
                    tooltips: {
                        today: 'Hoje',
                        clear: 'Limpar',
                        close: 'Fechar',
                        selectMonth: 'Mês',
                        prevMonth: 'Mês anterior',
                        nextMonth: 'Próximo mês',
                        selectYear: 'Ano',
                        prevYear: 'Ano anterior',
                        nextYear: 'Próximo ano',
                        selectDecade: 'Década',
                        prevDecade: 'Década anterior',
                        nextDecade: 'Próxima década',
                        prevCentury: 'Século anterior',
                        nextCentury: 'Próximo século'
                    }
                })
                .data('DateTimePicker');

            datepicker.parseInputDate(function(value) {
                var result = undefined;
                if (!!value) {
                    result = moment.utc(value, format);
                }
                return result;
            });

            datepickerElement.on('dp.change', function(event) {
                if (!!event.date) {
                    var viewValue = event.date;
                    var modelValue = null;
                    if (ignoreTimezone) {
                        modelValue = moment.utc(self.parent.model);
                    } else {
                        modelValue = moment(self.parent.model);
                    }
                    if (!modelValue.isSame(viewValue)) {
                        if (ignoreTimezone) {
                            self.parent.model = viewValue.format('YYYY-MM-DDTHH:mm:ss');
                        } else {
                            self.parent.model = viewValue.toISOString();
                        }
                        self.formattedDate = viewValue.format(format);
                    }
                } else {
                    self.parent.model = null;
                }
            });
        }
    }

    var gxFormGroupCalendarDependencies = [];

    var gxFormGroupCalendarComponent = {
        template:'<div class="input-group date"><input type="text" name="{{::$ctrl.parent.elementName}}" ng-attr-ng-required="$ctrl.parent.required" ng-attr-placeholder="{{::$ctrl.parent.example}}" ui-mask="{{::$ctrl.parent.mask}}" ui-mask-placeholder ng-model="$ctrl.formattedDate" ng-model-options="{ updateOn: \'blur\' }" ng-attr-tabindex="{{$ctrl.parent.gxTabindex}}" ng-attr-ng-readonly="{{::$ctrl.parent.readonly}}" ng-attr-ng-disabled="$ctrl.parent.disabled" class="form-control" autocomplete="off"> <span class="input-group-addon"><span class="fa fa-calendar"></span></span></div>',
        require: {
            parent: '^gxFormGroup'
        },
        controller: [
            '$element',
            '$scope',
            'GX_FORM_GROUP_CONFIG',
            gxFormGroupCalendarController
        ]
    };

    function gxFormGroupCalendarModelDirective() {
        return {
            restrict: 'A',
            scope: false,
            require: ['^gxFormGroup', 'ngModel'],
            link: gxFormGroupCalendarModelDirectiveLink
        }
    }

    angular
        .module('gux.formGroupCalendar', gxFormGroupCalendarDependencies)
        .component('gxFormGroupCalendar', gxFormGroupCalendarComponent);

}(window.moment, window.jstz, window.angular));
(function($, _, angular) {

    'use strict';

    function hideDropdownMenu($element) {
        // $element.find('.dropdown-menu').dropdown('toggle');
        $element.find('.dropdown-menu');
        //$element.find('.dropdown-menu').css('display', 'none');
    };

    function setViewMode(self) {
        self.viewMode = true;
        self.editMode = false;
    }

    function setEditMode(self) {
        self.viewMode = false;
        self.editMode = true;
    }

    function refresh(self, newValue) {

        if (newValue) {

            if (self.isSearchable) {
                self.modelFilteredOptions = self.parent.modelOptions.slice();
            } else {
                var fullMatch = [];
                var initialMatch = [];
                var parcialMatch = [];
                for (var i = 0; i < self.parent.modelOptions.length; i++) {
                    var modelOption = self.parent.modelOptions[i];
                    var modelOptionString = String(modelOption[self.parent.modelOptionAttributeValue]).toUpperCase();
                    var modelAutocompleteString = !!self.modelAutocomplete ? self.modelAutocomplete.toUpperCase() : null;
                    if (modelOptionString === modelAutocompleteString) {
                        fullMatch.push(modelOption);
                    } else if (modelOptionString.indexOf(modelAutocompleteString) == 0) {
                        initialMatch.push(modelOption);
                    } else if (modelOptionString.indexOf(modelAutocompleteString) > -1) {
                        parcialMatch.push(modelOption);
                    }
                }
                self.modelFilteredOptions = fullMatch.concat(initialMatch).concat(parcialMatch);
            }
            // Performance problem in very large arrays
            if (self.modelFilteredOptions.length > 50) {
                self.modelFilteredOptions = self.modelFilteredOptions.slice(0, 50);
            }
        } else if (self.parent.modelOptions && self.parent.modelOptions.length > 0) {
            // Performance problem in very large arrays
            // self.modelFilteredOptions = angular.copy(self.parent.modelOptions);
            self.modelFilteredOptions = self.parent.modelOptions.slice(0, 50);
        } else {
            self.modelFilteredOptions = [];
        }

        if (self.modelFilteredOptions.length === 0) {
            self.noDataFound = true;
            self.itemFound = false;
        } else if (self.modelFilteredOptions.length === 1 &&
            !!newValue &&
            self.modelFilteredOptions[0][self.parent.modelOptionAttributeValue].toUpperCase() === self.modelAutocomplete.toUpperCase()) {
            self.noDataFound = false;
            self.itemFound = true;
        } else {
            self.noDataFound = false;
            var itemFoundArray = [];
            if (newValue) {
                itemFoundArray = _.filter(self.modelFilteredOptions, function(modelOption) {
                    return String(modelOption[self.parent.modelOptionAttributeValue]).toUpperCase() === newValue.toUpperCase();
                });
            }
            if (itemFoundArray.length === 1) {
                self.itemFound = true;
            } else {
                self.itemFound = false;
            }
        }
    }

    function syncModelAutocomplete(self) {
        if (self.parent.model) {
            self.modelAutocomplete = self.parent.model[self.parent.modelOptionAttributeValue];
        } else {
            self.modelAutocomplete = null;
        }
    }

    function handleCreateSuccess(self, createdObject) {
        self.parent.setModel(createdObject);
        self.parent.modelOptions.push(createdObject);
        refresh(self, createdObject[self.parent.modelOptionAttributeValue]);
        hideDropdownMenu(self.$element)
        setViewMode(self);
        self.feedbackMessage = "item criado";
        //self.addSuccess('create', 'Novo item criado com sucesso', TEMPORARY_MESSAGE_TIMEOUT);
    }

    function handleCreateError(self) {
        syncModelAutocomplete(self);
        //controller.addError('update', 'Erro ao criar novo item.', TEMPORARY_MESSAGE_TIMEOUT);
    }

    function handleUpdateSucess(self, updatedObject) {
        self.parent.setModel(updatedObject);
        refresh(self, updatedObject[self.parent.modelOptionAttributeValue]);
        setViewMode(self);
        //self.addSuccess('update', 'Item atualizado com sucesso', TEMPORARY_MESSAGE_TIMEOUT);
    }

    function handleUpdateError(self, oldValue) {
        self.parent.model[self.parent.modelOptionAttributeValue] = oldValue;
        syncModelAutocomplete(self);
        //self.parent.addError('update', 'Erro ao atualizar item selecionado.', TEMPORARY_MESSAGE_TIMEOUT);
    }

    function handleDeleteSuccess(self, deletedObject) {
        var index = self.parent.modelOptions.indexOf(deletedObject);
        if (index > -1) {
            self.parent.modelOptions.splice(index, 1);
        }
        if (!self.parent.model) {
            syncModelAutocomplete(self);
            refresh(self, null);
        } else if (self.parent.model == deletedObject) {
            self.parent.setModel(null);
            syncModelAutocomplete(self);
            refresh(self, null);
        } else {
            refresh(self, self.parent.model[self.parent.modelOptionAttributeValue]);
        }
        setViewMode(self);
        //self.addSuccess('update', 'Item removido com sucesso', TEMPORARY_MESSAGE_TIMEOUT);
    }

    function handleDeleteError(self) {
        //syncModelAutocomplete(self);
        //controller.addError('update', 'Erro ao remover item.', TEMPORARY_MESSAGE_TIMEOUT);
    }

    function gxFormGroupAutocompleteController($scope, $element, gxFormService) {

        var defaultGxModelOptions = {
            updateOn: 'default blur',
            debounce: {
                'default': 0,
                'blur': 0
            }
        }

        var searchableGxModelOptions = {
            updateOn: 'default blur',
            debounce: {
                'default': 500,
                'blur': 0
            }
        };

        var self = this;
        self.$element = $element;
        self.inputElement = self.$element.find('input');
        self.viewMode = true;
        self.editMode = false;
        self.isSearchable = false;
        self.isCreatable = false;
        self.isUpdateable = false;
        self.isDeletable = false;
        self.gxModelOptions = defaultGxModelOptions;
        self.modelAutocomplete = null;
        self.modelFilteredOptions = null;
        self.isLoading = false;
        self.noDataFound = false;
        self.itemFound = false;
        self.feedbackMessage = undefined;

        self.showBadge = function() {
            return !!self.parent &&
                !!self.parent.model &&
                !!self.parent.modelOptionAttributeBadge &&
                !!self.modelAutocomplete &&
                self.modelAutocomplete === self.parent.model[self.parent.modelOptionAttributeValue];
        };

        self.selectOption = function(modelOption) {
            self.parent.setModel(modelOption);
            hideDropdownMenu($element);
        };

        self.inputElement.on('focus', function(event) {
            $element.find('.dropdown-menu').dropdown('toggle');
        });

        self.inputElement.on('keydown', function(event) {
            if (event.keyCode === 40) { // down arrow
                event.preventDefault();
                $element.find('li:first a:first').focus();
            }
        });

        self.inputElement.on('blur', function(event) {
            if (!$.contains($element[0], event.relatedTarget)) {
                syncModelAutocomplete(self);
                hideDropdownMenu($element);
            }
        });

        self.create = function(event) {
            var result = self.parent.gxOnCreate()(self.modelAutocomplete)
            if (!!result) {
                if (!!result.then) {
                    result
                        .then(function(result) {
                            handleCreateSuccess(self, result);
                        }).catch(function(error) {
                            handleCreateError(self);
                        });
                } else {
                    handleCreateSuccess(self, result);
                }
            } else {
                handleCreateError(self);
            }
        };

        self.isEditDisabled = function() {
            return self.parent.disabled ||
                !(!!self.parent &&
                    !!self.parent.model);
            /*&& !!self.parent.modelOptionAttributeBadge
            && !! self.modelAutocomplete
            && self.modelAutocomplete === self.parent.model[self.parent.modelOptionAttributeValue];*/
        };

        self.edit = function() {
            setEditMode(self);
            //controller.removeSuccess('create');
            //controller.removeSuccess('update');
            //controller.removeWarning('edit');
            //controller.removeError('error');
            //controller.addInfo('edit', 'Após a edição, cancele ou confirme a operação');
            self.inputElement.focus();
        };

        self.isUpdateDisabled = function() {
            return !!self.parent &&
                !!self.parent.model &&
                !!self.parent.modelOptionAttributeBadge &&
                !!self.modelAutocomplete &&
                self.modelAutocomplete === self.parent.model[self.parent.modelOptionAttributeValue];
        };

        self.update = function(event) {
            //controller.removeInfo('edit');
            //controller.removeWarning('edit');
            var oldValue = self.parent.model[self.parent.modelOptionAttributeValue];
            self.parent.model[self.parent.modelOptionAttributeValue] = self.modelAutocomplete;
            var result = self.parent.gxOnUpdate()(self.parent.model)
            if (result) {
                if (!!result.then) {
                    result
                        .then(function(result) {
                            handleUpdateSucess(self, result);
                        })
                        .catch(function(error) {
                            handleUpdateError(self, oldValue);
                        });
                } else {
                    handleUpdateSucess(self, result);
                }
            } else {
                handleUpdateError(self, oldValue);
            }
        };

        self.cancel = function() {
            //controller.removeInfo('edit');
            syncModelAutocomplete(self);
            setViewMode(self);
        };

        self.delete = function(selectedOption, event) {
            //controller.removeInfo('edit');
            //controller.removeWarning('edit');
            try {
                var result = self.parent.gxOnDelete()(selectedOption)
                if (!!result && !!result.then) {
                    result
                        .then(function(result) {
                            handleDeleteSuccess(self, selectedOption);
                        })
                        .catch(function(error) {
                            handleDeleteError(self);
                        });
                } else {
                    handleDeleteSuccess(self, selectedOption);
                }
            } catch (error) {
                handleDeleteError(self);
            }
        };

        self.showBeginSerach = function() {
            var result = self.isSearchable && !self.modelAutocomplete;
            if (result) {
                self.noDataFound = false;
            }
            return result;
        };

        self.showNoDataFound = function() {
            return !self.isCreatable && self.noDataFound;
        };

        self.$onInit = function() {

            self.isSearchable = !self.parent.modelOptions && !!self.parent.gxOnSearch();
            self.isCreatable = !!self.parent.gxOnCreate();
            self.isUpdateable = !!self.parent.gxOnUpdate();
            self.isDeletable = !!self.parent.gxOnDelete();

            if (self.isSearchable) {
                self.gxModelOptions = searchableGxModelOptions;
                self.parent.modelOptions = [];
                //self.parent.registerValidator(gxFormService.INFO_FEEDBACK_TYPE);
            } else {
                $scope.$watch('$ctrl.parent.modelOptions', function(newValue, oldValue) {
                    if (self.parent.model) {
                        refresh(self, self.parent.model[self.parent.modelOptionAttributeValue]);
                    } else {
                        refresh(self, null);
                    }
                });
            }

            /*self.registerValidator = function (feedbackType, validatorKey, forceValidation, validatorFunction, validatorMessage, validatorTimeout) {
			var validatorDefinition = {
				type: feedbackType,
				key: validatorKey,
				validatorFunction: validatorFunction,
				force: forceValidation,
				message: validatorMessage,
				timeout: validatorTimeout
			}
			self.validatorsDefinitions[feedbackType][validatorKey] = validatorDefinition;
		};*/
            function isMessage() {
                return !!self.feedbackMessage;
            }

            self.parent.registerValidator(gxFormService.WARNING_FEEDBACK_TYPE, 'autocomplete', isMessage, false, self.feedbackMessage);

            $scope.$watch('$ctrl.parent.model.' + self.parent.modelOptionAttributeValue, function(newValue, oldValue) {
                syncModelAutocomplete(self);
            });

            $scope.$watch('$ctrl.modelAutocomplete', function(newValue, oldValue) {
                if (self.viewMode) {
                    if (newValue) {
                        if (self.isSearchable) {
                            self.isLoading = true;
                            self.parent.gxOnSearch()(newValue)
                                .then(function(modelOptions) {
                                    self.parent.modelOptions = modelOptions;
                                    refresh(self, newValue);
                                    self.isLoading = false;
                                });
                        } else {
                            self.isLoading = true;
                            refresh(self, newValue);
                            self.isLoading = false;
                        }
                    } else {
                        self.parent.setModel(null);
                        if (self.isSearchable) {
                            self.modelFilteredOptions = [];
                        } else {
                            refresh(self, newValue);
                        }
                    }
                }
            });
        };
    }

    var gxFormGroupAutocompleteDependencies = [];

    var gxFormGroupAutocompleteComponent = {
        template:'<div class="dropdown gx-form-group-autocomplete"><div ng-class="{\'input-group\': $ctrl.isUpdateable}"><div style="position: relative"><span ng-if="$ctrl.isSearchable && $ctrl.isLoading" class="form-control-feedback"><i class="fa fa-spinner fa-pulse"></i></span> <span ng-if="!$ctrl.isLoading && $ctrl.showBadge()" class="badge input-badge">{{$ctrl.parent.getBadgeValue($ctrl.parent.model)}}</span> <input type="text" name="{{::$ctrl.parent.elementName}}" ng-attr-ng-required="$ctrl.parent.required" ng-attr-placeholder="{{::$ctrl.parent.example}}" ng-attr-ui-mask="{{::$ctrl.parent.mask}}" ng-attr-ui-mask-placeholder="{{::$ctrl.parent.example || $ctrl.parent.mask ? \'\' : undefined}}" ng-model="$ctrl.modelAutocomplete" ng-model-options="$ctrl.gxModelOptions" ng-attr-minlength="{{::$ctrl.parent.gxMinlength}}" ng-attr-maxlength="{{::$ctrl.parent.gxMaxlength}}" ng-attr-min="{{::$ctrl.parent.gxMin}}" ng-attr-max="{{::$ctrl.parent.gxMax}}" ng-attr-tabindex="{{::$ctrl.parent.gxTabindex}}" ng-attr-ng-readonly="{{::$ctrl.parent.readonly}}" ng-attr-ng-disabled="$ctrl.parent.disabled" class="form-control" autocomplete="off"></div><div class="input-group-btn" ng-if="$ctrl.isUpdateable"><button type="button" ng-if="$ctrl.viewMode" ng-click="$ctrl.edit($event)" ng-disabled="$ctrl.isEditDisabled()" gx-tooltip="Editar item selecionado" class="btn btn-default"><i class="fa fa-pencil"></i></button> <button type="button" ng-if="$ctrl.editMode" ng-click="$ctrl.cancel($event)" gx-tooltip="Cancelar edição" class="btn btn-default"><i class="fa fa-ban"></i></button> <button type="button" ng-if="$ctrl.editMode" ng-click="$ctrl.update($event)" ng-disabled="$ctrl.isUpdateDisabled()" gx-tooltip="{{$ctrl.isUpdateDisabled() ? \'Altere o valor para habilitar a gravação\' : \'Gravar item editado\'}}" class="btn btn-default"><i class="fa fa-save"></i></button></div></div><ul ng-if="$ctrl.viewMode" class="form-control dropdown-menu" role="menu" data-toggle="dropdown"><li ng-repeat="modelOption in $ctrl.modelFilteredOptions"><a href="javascript:void(0)" ng-click="$ctrl.selectOption(modelOption)">{{modelOption[$ctrl.parent.modelOptionAttributeValue]}} <span ng-if="$ctrl.isDeletable" ng-click="$ctrl.delete(modelOption, $event); $event.stopPropagation();" class="pull-right"><i class="fa fa-remove"></i></span> <span ng-if="!!$ctrl.parent.modelOptionAttributeBadge" class="badge pull-right m-r-xs" style="margin-top: 1px">{{$ctrl.parent.getBadgeValue(modelOption)}}</span></a></li><li ng-if="$ctrl.showBeginSerach()"><a>Digite para pesquisar.</a></li><li ng-if="$ctrl.showNoDataFound()"><a>Nenhum item encontrado.</a></li><li ng-if="$ctrl.isCreatable && !$ctrl.itemFound && !!$ctrl.modelAutocomplete"><a href="javascript:void(0)" ng-click="$ctrl.create($event)" gx-tooltip="Criar novo item"><i class="fa fa-plus"></i>&nbsp;&nbsp; <strong>{{$ctrl.modelAutocomplete}}</strong>&nbsp;&nbsp; <span class="text-muted">(Novo)</span></a></li></ul></div>',
        require: {
            parent: '^gxFormGroup'
        },
        controller: [
            '$scope',
            '$element',
            'gxFormService',
            gxFormGroupAutocompleteController
        ]
    };

    angular
        .module('gux.formGroupAutocomplete', gxFormGroupAutocompleteDependencies)
        .component('gxFormGroupAutocomplete', gxFormGroupAutocompleteComponent);

}(window.$, window._, window.angular));
(function(angular) {

    'use strict';

    function gxFormButtonController($parse, $state, $element, $scope, gxAppService, gxFormService) {

        var self = this;
        self.type = undefined;
        self.buttonClass = undefined;
        self.iconClass = undefined;
        self.label = undefined;

        if (self.stereotype === 'post') {
            self.type = "submit";
            self.buttonClass = "btn-success";
            self.iconClass = "fa-save";
            self.label = "Gravar";
        } else if (self.stereotype === 'put') {
            self.type = "submit";
            self.buttonClass = "btn-success";
            self.iconClass = "fa-save";
            self.label = "Atualizar";
        } else if (self.stereotype === 'get') {
            self.type = "submit";
            self.buttonClass = "btn-primary";
            self.iconClass = "fa-search";
            self.label = "Pesquisar";
        } else if (self.stereotype === 'clean') {
            self.type = "reset";
            self.buttonClass = "btn-default";
            self.iconClass = "fa-eraser";
            self.label = "Limpar";
        } else if (self.stereotype === 'cancel') {
            self.type = "button";
            self.buttonClass = "";
            self.iconClass = "fa-ban";
            self.label = "Cancelar";
        } else if (self.stereotype === 'back') {
            self.type = "button";
            self.buttonClass = "btn-default";
            self.iconClass = "fa-long-arrow-left";
            self.label = "Voltar";
        }

        self.show = function() {

            var result = true;

            var formName = $element.closest('form').attr('name');
            if (formName == '{{$ctrl.gxName}}') {
                return result;
            }

            try {
                if (self.stereotype === 'cancel' && gxFormService.isPristine(formName)) {
                    result = false;
                } else if (self.stereotype === 'back' && !gxFormService.isPristine(formName)) {
                    result = false;
                }
            } catch (exception) {
                if (exception.constructor.name != 'ngFormControllerNotLoaded') {
                    throw exception;
                }
            }

            return result;
        }

        self.disabled = function() {

            var result = false;

            var lastState = gxAppService.getLastState();
            if (self.stereotype === 'cancel' ||
                self.stereotype === 'back') {
                if (!lastState || !lastState.name) {
                    result = true;
                }
            }

            return result;
        }

        self.click = function() {

            var result = undefined;

            var lastState = gxAppService.getLastState();
            if (self.stereotype === 'cancel' ||
                self.stereotype === 'back') {
                if (!self.go && !!lastState && !!lastState.name) {
                    self.go = lastState.name;
                }
            }

            if (self.stereotype === 'cancel' ||
                self.stereotype === 'back') {
                if (!!self.go) {
                    if (!result) {
                        return $state.go(self.go);
                    } else {
                        return $state.go(self.go);
                    }
                }
            }

            var formName = $element.closest('form').attr('name');
            if (formName == '{{$ctrl.gxName}}') {
                return result;
            }

            if (!gxFormService.isForce(formName) && !gxFormService.isValid(formName)) {
                return result;
            }

            if (!!self.onClick) {
                result = $parse(self.onClick)($scope.$parent);
            }

            if (!!self.go) {
                if (!result) {
                    result = $state.go(self.go);
                } else {
                    $state.go(self.go);
                }
            }

            if (self.stereotype === 'clean') {
                gxFormService.setPristine(formName);
            }

            return result;
        };
    };

    var gxFormButtonDependencies = [
        'ui.router'
    ];

    var gxFormButtonComponent = {
        template: '<div><button ng-attr-type="{{::$ctrl.type}}" ng-if="$ctrl.show()" ng-disabled="$ctrl.disabled()" ng-click="$ctrl.click($event)" class="btn btn-addon {{::$ctrl.buttonClass}}"><i class="fa {{::$ctrl.iconClass}}"></i>{{::$ctrl.label}}</button></div>',
        bindings: {
            stereotype: '@',
            go: '@',
            onClick: '='
        },
        controller: [
            '$parse',
            '$state',
            '$element',
            '$scope',
            'gxAppService',
            'gxFormService',
            gxFormButtonController
        ]
    };

    angular
        .module('gux.formButton', gxFormButtonDependencies)
        .component('gxFormButton', gxFormButtonComponent);

}(window.angular));
(function($, angular) {

    'use strict';

    function showMessage(scope, message) {
        scope.$broadcast("gxApp.feedback", message);
    }

    function showInfo(scope, message, title) {
        showMessage(scope, {
            type: 'info',
            title: !title ? 'Informação' : title,
            body: message
        });
    }

    function showSuccess(scope, message, title) {
        showMessage(scope, {
            type: 'success',
            title: !title ? 'Sucesso' : title,
            body: message
        });
    }

    function showWarning(scope, message, title) {
        showMessage(scope, {
            type: 'warning',
            title: !title ? 'Atenção' : title,
            body: message
        });
    }

    function showError(scope, message, title) {
        showMessage(scope, {
            type: 'error',
            title: !title ? 'Erro' : title,
            body: message
        });
    };

    function gxAppConfig($provide, cfpLoadingBarProvider, locationProvider, GX_STATE_CONFIG, stateHelperProvider, $mdThemingProvider) {

        var isIE = !!navigator.userAgent.match(/MSIE/i);
        locationProvider.html5Mode(!isIE);
        stateHelperProvider.state(GX_STATE_CONFIG);
        cfpLoadingBarProvider.includeSpinner = true;
        cfpLoadingBarProvider.spinnerTemplate = '<div class="loading"><img class="loading-image" src="images/gx-app-loading.gif" alt="Carrengando..." /></div>';

        $provide.decorator("$exceptionHandler", ['$injector', '$log', '$delegate', function($injector, $log, $delegate) {
            return function(exception, cause) {
                var $rootScope = $injector.get("$rootScope");
                if (exception.type === 'error') {
                    showError($rootScope, exception.message, exception.title);
                } else if (exception.type === 'warning') {
                    showWarning($rootScope, exception.message, exception.title);
                } else {
                    $delegate(exception, cause);
                }
            };
        }]);

        $mdThemingProvider.theme('default')
            .primaryPalette('blue', {
                'default': '400', // by default use shade 400 from the pink palette for primary intentions
                'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
                'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
                'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
            })
            // If you specify less than all of the keys, it will inherit from the
            // default shades
            .accentPalette('blue-grey', {
                'default': '200' // use shade 200 for default, and keep all other shades the same
            });

    }

    function initState($state, state) {
        if (state.abstract === true) {
            if (!state.data) {
                state.data = {}
            }
            if (!state.data.expanded) {
                state.data.expanded = $state.includes(state.name);
            }
        }
    }

    function getLink(state) {
        var link = undefined;
        if (!!state.data && !!state.data.tab) {
            link = state.name;
        } else if (!!state.data && !!state.data.menu && !!state.data.menu.link) {
            link = state.data.menu.link;
        } else if (!(state.abstract === true)) {
            link = state.name;
        }
        return link;
    }

    function isToDisplayMenu(state) {
        return !state.data || !state.data.menu || state.data.menu.display == undefined || state.data.menu.display === true;
    }

    function getMenuIconClass(state) {
        var iconClass = undefined;
        if (!!state.data && !!state.data.menu && !!state.data.menu.iconClass) {
            iconClass = state.data.menu.iconClass;
        }
        return iconClass;
    }

    function getMenuTitle(state) {
        var title = 'unknown';
        if (!!state.data) {
            if (!!state.data.tab && !!state.data.tab.title) {
                title = state.data.tab.title;
            } else if (!!state.data.menu && !!state.data.menu.title) {
                title = state.data.menu.title;
            } else if (!!state.data.masthead && !!state.data.masthead.title) {
                title = state.data.masthead.title;
            }
        }
        return title;
    }

    function getMenuDescription(state) {
        var description = undefined;
        if (!!state.data) {
            if (!!state.data.tab && !!state.data.tab.description) {
                description = state.data.tab.description;
            } else if (!!state.data.menu && !!state.data.menu.description) {
                description = state.data.menu.description;
            } else if (!!state.data.masthead && !!state.data.masthead.description) {
                description = state.data.masthead.description;
            }
        }
        return description;
    }

    /*function isStateActive($state, state) {
    	return $state.includes(state.name);
    }*/

    function onMenuClick(state) {
        if (state.abstract === true) {
            state.data.expanded = !state.data.expanded;
        }
    }

    function isToDisplayMasthead($state) {
        return !!$state.current.data && !!$state.current.data.masthead;
    }

    function setStateRoute(stateRoute, state) {
        stateRoute.push(state);
        if (!!state.parent) {
            setStateRoute(stateRoute, state.parent);
        }
    }

    function getBreadcrumbItems(state) {
        var breadcrumbItems = []
        var states = [];
        setStateRoute(states, state);
        states = states.reverse();
        for (var i = 0; i < states.length; i++) {
            if (i == states.length - 1 &&
                !!states[i].data &&
                !!states[i].data.masthead &&
                !!states[i].data.masthead.actions &&
                states[i].data.masthead.actions.length > 0) {
                continue;
            }
            breadcrumbItems.push({
                link: getLink(states[i]),
                title: getMenuTitle(states[i])
            });
        }
        return breadcrumbItems;
    }

    function getMastheadTitle(state) {
        var title = 'unknown';
        if (!!state.data) {
            if (!!state.data.masthead && !!state.data.masthead.title) {
                title = state.data.masthead.title;
            } else if (!!state.data.menu && !!state.data.menu.title) {
                title = state.data.menu.title;
            } else if (!!state.data.tab && !!state.data.tab.title) {
                title = state.data.tab.title;
            }
        }
        return title;
    }

    function getMastheadDescription(state) {
        var description = undefined;
        if (!!state.data) {
            if (!!state.data.tab && !!state.data.tab.description) {
                description = state.data.tab.description;
            } else if (!!state.data.masthead && !!state.data.masthead.description) {
                description = state.data.masthead.description;
            } else if (!!state.data.menu && !!state.data.menu.description) {
                description = state.data.menu.description;
            }
        }
        return description;
    }

    function getMastheadActions(state) {
        var mastheadActions = undefined;
        if (!!state.data &&
            state.data.masthead &&
            state.data.masthead.hasOwnProperty('actions') &&
            state.data.masthead.actions.length > 0) {
            mastheadActions = state.data.masthead.actions;
        }
        return mastheadActions;
    }

    function getTabs(state) {
        var tabs = undefined;
        if (state.data && state.data.tab && state.parent) {
            tabs = [];
            for (var i = 0; i < state.parent.children.length; i++) {
                var brother = state.parent.children[i];
                if (!!brother.data && !!brother.data.tab) {
                    tabs.push({
                        id: brother.data.tab.id,
                        link: getLink(brother),
                        title: getMenuTitle(brother)
                    });
                }
            }
        }
        return tabs;
    }

    var tabDisabedArray = [];

    function isTabDisabled(tabId) {
        var result = false;
        var index = tabDisabedArray.indexOf(tabId);
        if (index > -1) {
            result = true;
        }
        return result;
    }

    function disableTab(tabId) {
        var index = tabDisabedArray.indexOf(tabId);
        if (index == -1) {
            tabDisabedArray.push(tabId);
        }
    }

    function enableTab(tabId) {
        var index = tabDisabedArray.indexOf(tabId);
        if (index > -1) {
            tabDisabedArray.splice(index, 1);
        }
    }

    function resetTabs() {
        tabDisabedArray = [];
    }

    function isTabActive($state, tab) {
        return !isTabDisabled(tab.id) &&
            !!tab &&
            !!tab.link &&
            $state.current.name === tab.link;
    }

    function debounce(func, wait, context, $scope, $timeout) {
        var timer;
        return function debounced() {
            var context = $scope,
                args = Array.prototype.slice.call(arguments);
            $timeout.cancel(timer);
            timer = $timeout(function() {
                timer = undefined;
                func.apply(context, args);
            }, wait || 10);
        };
    }

    function buildDelayedToggler(navID, $scope, $log, $timeout, $mdSidenav) {
        return debounce(function() {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav(navID)
                .toggle()
                .then(function() {
                    $log.debug("toggle " + navID + " is done");
                });
        }, 200, null, $scope, $timeout);
    }

    function buildToggler(navID, $log) {
        return function() {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav(navID)
                .toggle()
                .then(function() {
                    $log.debug("toggle " + navID + " is done");
                });
        }
    }

    function gxAppController(GX_STATE_CONFIG, rootScope, $scope, $http, $state, toaster, smoothScroll, $element, $timeout, $mdSidenav, $log) {

        var self = this;

        self.toggleLeft = buildDelayedToggler('left', $scope, $log, $timeout, $mdSidenav);
        self.toggleRight = buildToggler('right', $log);
        self.isOpenRight = function() {
            return $mdSidenav('right').isOpen();
        };

        self.close = function() {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav('left').close()
                .then(function() {
                    $log.debug("close LEFT is done");
                });
        }

        self.config = {
            asideFolded: false, // menu lateral aparece recolhido
            showNav: true, // mostrar barra de navegação
            headerFixed: false, // header fixo ao rolar
            asideFixed: false, // menu lateral fixo no scroll
            asideDock: false, // menu laterial aparece em formato horizontal
            container: false // conteúdo boxed
        }

        self.rootState = GX_STATE_CONFIG;

        self.intro = null;

        self.initState = function(state) {
            initState($state, state);
        };

        self.getLink = getLink;

        self.isToDisplayMenu = isToDisplayMenu;

        self.getMenuIconClass = getMenuIconClass;

        self.getMenuTitle = getMenuTitle;

        self.getMenuDescription = getMenuDescription;

        /*self.isStateActive = function(state) {
        	isStateActive($state, state);
        };*/

        self.onMenuClick = onMenuClick;

        self.isToDisplayMasthead = function() {
            return isToDisplayMasthead($state);
        }

        self.breadcrumbItems = null;

        self.mastheadTitle = null;

        self.mastheadDescription = null;

        self.mastheadActions = null;

        self.tabs = null;

        self.isTabDisabled = function(tab) {
            return isTabDisabled(tab.id);
        };

        self.isTabActive = function(tab) {
            return isTabActive($state, tab);
        };

        $scope.CurrentDate = new Date();

        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

            if (!rootScope.session) {
                rootScope.session = {};
            }

            rootScope.session.lastState = fromState;
            $scope.$ctrl.breadcrumbItems = getBreadcrumbItems(toState)
            $scope.$ctrl.mastheadTitle = getMastheadTitle(toState);
            $scope.$ctrl.mastheadDescription = getMastheadDescription(toState);
            $scope.$ctrl.mastheadActions = getMastheadActions(toState);
            $scope.$ctrl.tabs = getTabs(toState);

            if (!!toState.data && !!toState.data.intro && !!toState.data.intro.url) {
                $http.get(toState.data.intro.url)
                    .then(function(response) {
                        $scope.$ctrl.intro = window.introJs();
                        var introOptions = response.data;
                        introOptions.nextLabel = '<strong>Próximo</strong>';
                        introOptions.prevLabel = '<strong>Anterior</strong>';
                        introOptions.skipLabel = '<strong>Entendi!</strong>';
                        introOptions.doneLabel = '<strong>Concluir</strong>';
                        $scope.$ctrl.intro.setOptions(introOptions);
                    });
            } else {
                $scope.$ctrl.intro = null;
            }

            $scope.startIntro = function() {
                if (!!self.intro) {
                    self.intro.start();
                }
            };



            if (!!toState.data.aside &&
                (toState.data.aside.display === "false" || toState.data.aside.display == false)) {
                $scope.$ctrl.displayAside = false;
            } else {
                $scope.$ctrl.displayAside = true;
            }

            if (!!toState.data.footer &&
                (toState.data.footer.display === "false" || toState.data.footer.display == false)) {
                $scope.$ctrl.displayFooter = false;
            } else {
                $scope.$ctrl.displayFooter = true;
            }

            if (!!toState.data.navbar &&
                (toState.data.navbar.display === "false" || toState.data.navbar.display == false)) {
                $scope.$ctrl.displayNavbar = false;
            } else {
                $scope.$ctrl.displayNavbar = true;
            }


            if (!!toState.data.cockpit &&
                (toState.data.cockpit.display === "false" || toState.data.cockpit.display == false)) {
                $scope.$ctrl.displayCockpit = false;
            } else {
                $scope.$ctrl.displayCockpit = true;
            }

        });

        $scope.$on('gxApp.feedback', function(event, message) {
            var toaterMessage = {};
            toaterMessage.type = !message.type ? 'info' : message.type;
            toaterMessage.title = !message.title ? 'Mensagem do sistema' : message.title;
            toaterMessage.body = message.body;
            toaster.pop(toaterMessage);
        })

        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            smoothScroll($element[0]);
        });

        $scope.$on('gxApp.disableTab', function(event, id) {
            disableTab(id);
        });

        $scope.$on('gxApp.enableTab', function(event, id) {
            enableTab(id);
        });

        $scope.$on('gxApp.resetTabs', function(event) {
            resetTabs();
        });

        self.$onInit = function() {
            $('body').find('gx-app').removeClass('hide');
            $('body').find('.gx-app-init').addClass('hide');
        }
    }

    function gxAppService($rootScope) {

        var service = {};

        service.showMessage = function(message) {
            showMessage($rootScope, message);
        };

        service.showInfo = function(message, title) {
            showInfo($rootScope, message, title);
        };

        service.showSuccess = function(message, title) {
            showSuccess($rootScope, message, title)
        };

        service.showWarning = function(message, title) {
            showWarning($rootScope, message, title)
        };

        service.showError = function(message, title) {
            showError($rootScope, message, title)
        };

        service.disableTab = function(id) {
            $rootScope.$broadcast("gxApp.disableTab", id);
        };

        service.enableTab = function(id) {
            $rootScope.$broadcast("gxApp.enableTab", id);
        };

        service.resetTabs = function() {
            $rootScope.$broadcast("gxApp.resetTabs");
        };

        service.getLastState = function() {
            return $rootScope.session.lastState;
        };

        return service;
    }

    function gxAppRun(state, stateParams) {

    }

    var gxAppDependencies = [
        'gux.config',
        'ui.router',
        'ui.router.stateHelper',
        'angular-intro',
        'angular-loading-bar',
        'gux.tooltip',
        'toaster',
        'ngMaterial',
        'angularScreenfull',
        'smoothScroll'
    ];

    var gxAppComponent = {
        template:'<span ng-if="$ctrl.displayCockpit"><gx-cockpit></gx-cockpit></span><style ng-if="$ctrl.displayCockpit || false">\n    .app {\n        position: absolute;\n        margin-top: 64px;\n    }\n    \n    .off-screen {\n        position: static;\n    }\n</style><gx-sidenav></gx-sidenav><div class="app animated fadeIn" ng-class="{\'app-aside-folded\': $ctrl.config.asideFolded, \'app-header-fixed\':$ctrl.config.headerFixed, \'app-aside-fixed\':$ctrl.config.asideFixed, \'app-aside-dock\':$ctrl.config.asideDock, \'container\':$ctrl.config.container}"><toaster-container toaster-options="{\'time-out\': 9000, \'close-button\':true, \'animation-class\': \'toast-right-center\'}"></toaster-container><div class="app-header navbar" ng-if="$ctrl.displayNavbar"><div class="navbar-header bg-light b-r lter lt"><button class="pull-right visible-xs" ui-toggle-class="off-screen" data-target=".app-aside"><i class="fa fa-bars"></i></button><a ui-sref="{{$ctrl.rootState.name}}" class="text-lt hvr-rotate"><span class="hidden-folded hidden-xs m-l-xs center-block brand-sm"><img src="images/app-logo.svg" class style="height: 60px; padding: 4px; width: 93%;"></span><span class="visible-folded hidden-xs center-block brand-icon"><img src="images/logo-folded.png" class></span><span class="hidden-lg hidden-md hidden-sm m-l-xs center-block brand-xs" style="width:70%; margin-top: 8px;"><img src="images/app-logo.svg" class style="width: 40%; padding: 4px;"></span></a></div><div class="collapse pos-rlt navbar-collapse bg-white"><ul ng-transclude="navbarRight" class="nav navbar-nav navbar-right"></ul><ul ng-if="!!$ctrl.intro" class="nav navbar-nav navbar-right"><li class="hidden-xs b-r b-light"><a ng-click="startIntro()" gx-tooltip="Tour guiado" gx-tooltip-placement="bottom"><i class="fa fa-question-circle"></i></a></li></ul></div></div><aside id="aside" class="app-aside hidden-xs bg-light b-r lter" ng-if="$ctrl.displayAside" ng-class="{\'app-aside-folded\': $ctrl.config.asideFolded}"><div class="aside-wrap"><div class="navi-wrap"><nav ui-nav class="navi clearfix"><ul class="nav"><li class="padder m-t m-b-sm text-muted text-xs"><span>Menu</span></li><li ng-if="::$ctrl.isToDisplayMenu(state)" ng-init="$ctrl.initState(state)" ng-repeat="state in $ctrl.rootState.children" ng-model="navPrincipal" ng-class="{\'active\': state.data.expanded}"><a md-ink-ripple ng-if="::(!state.data.menu.link && state.abstract)" class="auto"><span class="pull-right text-muted"><i class="ion-ios-arrow-right rotate fa fa-rotate-normal"></i><md-tooltip md-direction="right">abrir</md-tooltip></span> <i ng-if="::!!$ctrl.getMenuIconClass(state)" class="{{::$ctrl.getMenuIconClass(state)}}"></i> <span>{{::$ctrl.getMenuTitle(state)}}</span></a><ul ng-if="::!state.data.menu.link && !!state.children && state.children.length > 0" class="nav nav-sub bg-white"><li ng-if="::$ctrl.isToDisplayMenu(state)" ng-repeat="state in state.children" class="b-b b-light"><a md-ink-ripple ng-click="$event.stopPropagation()" ui-sref="{{state.data.menu.link ? state.data.menu.link : state.name}}" data-target="#aside" ui-toggle-class="off-screen" class="sub-a"><i ng-if="::!!$ctrl.getMenuIconClass(state)" class="{{::$ctrl.getMenuIconClass(state)}}"></i> <span>{{::$ctrl.getMenuTitle(state)}}</span></a></li></ul><a md-ink-ripple ng-if="::(!!state.data.menu.link || !state.abstract)" ui-sref="{{state.data.menu.link ? state.data.menu.link : state.name}}" class="auto"><span class="pull-right text-muted"></span> <i ng-if="::!!$ctrl.getMenuIconClass(state)" class="{{::$ctrl.getMenuIconClass(state)}}"></i> <span>{{::$ctrl.getMenuTitle(state)}}</span></a></li></ul><div class="hidden-xs"><div class="aside-settings mt-lg w-full"><a href class="pull-left md-raised btn-fw m-b-sm md-fab md-button md-default-theme md-mini" ng-click="$ctrl.config.asideFolded = !$ctrl.config.asideFolded"><i class="fa {{$ctrl.config.asideFolded ? \'fa-angle-double-right\' : \'fa-angle-double-left\'}} fa-fw text-dark"></i><md-tooltip md-direction="right" class="w-auto-folded">Expandir / Recolher menu</md-tooltip></a><a href scroll-to="app" class="pull-right md-raised btn-fw m-b-sm md-fab md-button md-default-theme md-mini"><i class="ion-ios-arrow-thin-up fa-fw text-dark"></i><md-tooltip md-direction="left" class="w-auto-folded">Ir ao topo</md-tooltip></a></div></div></nav><div class="wrapper hidden-folded m-t"><img src="images/logo-whatermark.png" class="center-block"></div></div></div></aside><div ng-class="{\'app-content\': $ctrl.displayAside === true, \'app-content-screen\': $ctrl.displayAside === false}"><a href class="off-screen-toggle hide active" ui-toggle-class="off-screen" data-target=".app-aside"></a><div class="app-content-body"><div class="bg-light lter b-b b-t wrapper-md" ng-if="$ctrl.isToDisplayMasthead()"><div ng-if="!!$ctrl.mastheadActions" class="dropdown pull-right"><button type="button" data-toggle="dropdown" class="btn btn-default dropdown-toggle btn-lg">Ações&nbsp;<span class="caret"></span></button><ul class="dropdown-menu"><li ng-repeat="action in $ctrl.mastheadActions"><a ui-sref="{{action.link}}"><i class="{{action.iconClass}}"></i>&nbsp;{{action.title}}</a></li></ul></div><ol class="breadcrumb hidden-xs">Você está em:&nbsp;<li ng-repeat="breadcrumbItem in $ctrl.breadcrumbItems"><span ng-if="::breadcrumbItem.link === undefined">{{breadcrumbItem.title}}</span> <a ng-if="::breadcrumbItem.link != undefined" ui-sref="{{breadcrumbItem.link}}">{{breadcrumbItem.title}}</a></li></ol><h3 class="text-black font-thin m-t-sm m-b-xxs">{{$ctrl.mastheadTitle}}</h3><small class="text-muted">{{$ctrl.mastheadDescription}}</small></div><div ng-if="!!$ctrl.tabs" class="nav-tabs-alt"><ul class="nav nav-tabs"><li ng-repeat="tab in $ctrl.tabs" ng-class="{\'active\': $ctrl.isTabActive(tab), \'disabled\': $ctrl.isTabDisabled(tab)}" class="m-l-lg"><a ui-sref="{{$ctrl.isTabDisabled(tab) ? \'.\' : tab.link}}" ng-class="{\'disabled\': $ctrl.isTabDisabled(tab)}">{{tab.title}}</a></li></ul></div><div ui-view></div></div></div><span ng-if="$ctrl.displayFooter"><div class="app-footer wrapper b-t bg-light"><span class="pull-right">{{$ctrl.name}}-{{$ctrl.version}} <a href scroll-to="app" class="m-l-sm text-muted"><i class="fa fa-long-arrow-up"></i></a></span> &copy;2016 Todos os direitos reservados.</div></span></div><div class="app-footer navbar navbar-fixed-bottom blue-grey-50 b-t visible-xs" style="z-index: 1;"><div class="row m-t-xs"><div class="col-sm-8"><div class="w-xl w-auto-xs center-block"><div class="btn-group btn-group-justified text-center text-sm"><div class="btn-group b-r"><a class="wrapper-xs block hvr-back-pulse r r-2x" scroll-to="app"><i class="block text-md m-t-xs fa fa-user"></i> <span class="text-sm">perfil</span></a></div><div class="btn-group b-r"><a href="/" class="wrapper-xs block hvr-back-pulse r r-2x"><i class="block text-md m-t-xs fa fa-home"></i> <span class="text-sm">Home</span></a></div><div class="btn-group"><a class="wrapper-xs block hvr-back-pulse r r-2x"><i class="block text-md m-t-xs fa fa-share"></i> <span class="text-sm">compartilhar</span></a></div></div></div></div></div></div>',
        transclude: {
            'navbarRight': '?li'
        },
        bindings: {
            name: '@',
            gxVersion: '@',
            showAside: '@',
            showFooter: '@',
            showHeader: '@'
        },
        controller: [
            'GX_STATE_CONFIG',
            '$rootScope',
            '$scope',
            '$http',
            '$state',
            'toaster',
            'smoothScroll',
            '$element',
            '$timeout',
            '$mdSidenav',
            '$log',
            gxAppController
        ]
    };

    angular
        .module('gux.app', gxAppDependencies)
        .config(['$provide', 'cfpLoadingBarProvider', '$locationProvider', 'GX_STATE_CONFIG', 'stateHelperProvider', '$mdThemingProvider', gxAppConfig])
        .factory('gxAppService', ['$rootScope', gxAppService])
        .component('gxApp', gxAppComponent)
        .run(['$state', '$stateParams', gxAppRun]);

}(window.$, window.angular));
(function(angular) {
    'use strict';

    angular.module('gux.flatfull', [])
        .directive('setNgAnimate', ['$animate', function($animate) {
            return {
                link: function($scope, $element, $attrs) {
                    $scope.$watch(function() {
                        return $scope.$eval($attrs.setNgAnimate, $scope);
                    }, function(valnew, valold) {
                        $animate.enabled(!!valnew, $element);
                    });
                }
            };
        }])
        .directive('uiNav', ['$timeout', function($timeout) {
            return {
                restrict: 'AC',
                link: function(scope, el, attr) {
                    var _window = $(window),
                        _mb = 768,
                        wrap = $('.app-aside'),
                        next,
                        backdrop = '.dropdown-backdrop';
                    // unfolded
                    el.on('click', 'a', function(e) {
                        next && next.trigger('mouseleave.nav');
                        var _this = $(this);
                        _this.parent().siblings(".active").toggleClass('active');
                        _this.next().is('ul') && _this.parent().toggleClass('active') && e.preventDefault();
                        // mobile
                        _this.next().is('ul') || ((_window.width() < _mb) && $('.app-aside').removeClass('show off-screen'));
                    });

                    // folded & fixed
                    el.on('mouseenter', 'a', function(e) {
                        next && next.trigger('mouseleave.nav');
                        $('> .nav', wrap).remove();
                        if (!$('.app-aside-fixed.app-aside-folded').length || (_window.width() < _mb) || $('.app-aside-dock').length) return;
                        var _this = $(e.target),
                            top, w_h = $(window).height(),
                            offset = 50,
                            min = 150;

                        !_this.is('a') && (_this = _this.closest('a'));
                        if (_this.next().is('ul')) {
                            next = _this.next();
                        } else {
                            return;
                        }

                        _this.parent().addClass('active');
                        top = _this.parent().position().top + offset;
                        next.css('top', top);
                        if (top + next.height() > w_h) {
                            next.css('bottom', 0);
                        }
                        if (top + min > w_h) {
                            next.css('bottom', w_h - top - offset).css('top', 'auto');
                        }
                        next.appendTo(wrap);

                        next.on('mouseleave.nav', function(e) {
                            $(backdrop).remove();
                            next.appendTo(_this.parent());
                            next.off('mouseleave.nav').css('top', 'auto').css('bottom', 'auto');
                            _this.parent().removeClass('active');
                        });

                        $('.smart').length && $('<div class="dropdown-backdrop"/>').insertAfter('.app-aside').on('click', function(next) {
                            next && next.trigger('mouseleave.nav');
                        });

                    });

                    wrap.on('mouseleave', function(e) {
                        next && next.trigger('mouseleave.nav');
                        $('> .nav', wrap).remove();
                    });
                }
            };
        }])
        .directive('uiToggleClass', ['$timeout', '$document', function($timeout, $document) {
            return {
                restrict: 'AC',
                link: function(scope, el, attr) {
                    el.on('click', function(e) {
                        e.preventDefault();
                        var classes = attr.uiToggleClass.split(','),
                            targets = (attr.target && attr.target.split(',')) || Array(el),
                            key = 0;
                        angular.forEach(classes, function(_class) {
                            var target = targets[(targets.length && key)];
                            (_class.indexOf('*') !== -1) && magic(_class, target);
                            $(target).toggleClass(_class);
                            key++;
                        });
                        $(el).toggleClass('active');

                        function magic(_class, target) {
                            var patt = new RegExp('\\s' +
                                _class.replace(/\*/g, '[A-Za-z0-9-_]+').split(' ').join('\\s|\\s') +
                                '\\s', 'g');
                            var cn = ' ' + $(target)[0].className + ' ';
                            while (patt.test(cn)) {
                                cn = cn.replace(patt, ' ');
                            }
                            $(target)[0].className = $.trim(cn);
                        }
                    });
                }
            };
        }])
        .directive('uiScrollTo', ['$location', '$anchorScroll', function($location, $anchorScroll) {
            return {
                restrict: 'AC',
                link: function(scope, el, attr) {
                    el.on('click', function(e) {
                        $location.hash(attr.uiScrollTo);
                        $anchorScroll();
                    });
                }
            };
        }]);

}(window.angular));
(function (angular, $) {
	'use strict';

	angular.module('gux.tooltip', [])
		.directive('gxTooltip', ['$timeout',
			function (timeout, parse) {

				function GXTooltipLink(scope, element, attributes, controller) {
					attributes.$observe('gxTooltip', function (title) {
						timeout(function () {
							$(element)
								.tooltip({
									'placement': attributes.gxTooltipPlacement ? attributes.gxTooltipPlacement : 'top'
								})
								.attr('data-original-title', attributes.gxTooltip);
						});
					});
				}

				return {
					restrict: 'A',
					link: GXTooltipLink
				};

			}]);

} (window.angular, window.$));

(function(angular, $) {
    'use strict';

    angular.module('gux.sidenav', [])
        .directive('gxSidenav', [
            function() {

                function GXSidenavController() {

                }

                return {
                    restrict: 'E',
                    replace: true,
                    template:'<section><md-sidenav class="md-sidenav-left bg-black-opacity" md-component-id="left" md-disable-backdrop md-whiteframe="4"><div class="md-navbar bg-black md-whiteframe-z1 gx-cockpit-nav"><ul class="nav navbar-nav w-full"><li class="pull-left m-l"><h3>Menu de contexto</h3></li><li class="pull-right"><a href ng-click="$ctrl.close()"><i class="fa fa-arrow-left" aria-hidden="true"></i></a></li></ul></div><md-content><div flex class="aside-wrap"><div class="navi-wrap"><div ng-cloak><md-content><md-tabs class="blue-grey-50" md-no-select-click md-dynamic-height md-center-tabs md-swipe-content md-align-tabs="top" md-stretch-tabs="always"><md-tab label="Por assunto"><md-content class="bg-black-opacity"><h1>Assuntos</h1></md-content></md-tab><md-tab label="Por sistema"><md-content class="bg-black-opacity"><h1>Sistemas</h1></md-content></md-tab></md-tabs></md-content></div></div></div></md-content></md-sidenav></section>', // dentro dele o sidenav app
                    transclude: true,
                    controller: GXSidenavController,
                    controllerAs: 'controller',
                    scope: false
                };
            }
        ]);

}(window.angular, window.$));
(function (angular) {
	'use strict';

	angular.module('gux.panel', ['gux.panelHeader', 'gux.panelBody', 'gux.panelFooter'])
		.directive('gxPanel', [
			function () {

				return {
					restrict: 'E',
					replace: true,
					template:'<div><div ng-transclude ngsf-fullscreen class="panel panel-default no-border"></div></div>',
					transclude: true,
					scope: false
				};
			}]);

} (window.angular));

(function (angular) {
	'use strict';

	angular.module('gux.panelHeader', ['angularScreenfull'])
		.directive('gxPanelHeader', [
			function () {

				function GXPanelHeaderController() {

				}

				return {
					restrict: 'E',
					replace: true,
					template:'<div class="panel-heading font-bold"><a ngsf-toggle-fullscreen class="text-muted text-lg pull-right"><i class="fa fa-expand"></i></a> <span class="h4">{{controller.title}}</span></div>',
					scope: false,
					controller: GXPanelHeaderController,
					controllerAs: 'controller',
					bindToController: {
						title: '@',
					}
				};
			}]);

} (window.angular));

(function (angular) {
	'use strict';

	angular.module('gux.panelFooter', [])
		.directive('gxPanelFooter', [
			function () {

				return {
					restrict: 'E',
					replace: true,
					template:'<div ng-transclude class="panel-footer text-right bg-light lter"></div>',
					transclude: true,
					scope: false
				};
			}]);

} (window.angular));

(function (angular) {
	'use strict';

	angular.module('gux.panelBody', [])
		.directive('gxPanelBody', [
			function () {

				return {
					restrict: 'E',
					replace: true,
					template:'<div ng-transclude class="panel-body"></div>',
					transclude: true,
					scope: false
				};
			}]);

} (window.angular));

(function (angular) {
	'use strict';

	angular.module('gux.fieldset', [])
		.directive('gxFieldset', [
			function () {

				function GXFieldsetController($scope) {

					if ($scope.controller.collapsed == undefined) {

						$scope.controller.collapsible = false;

					} else {

						$scope.controller.collapsible = true;

						if ($scope.controller.collapsed === null
							|| $scope.controller.collapsed === 'false'
							|| $scope.controller.collapsed === false) {
							$scope.controller.collapsed = false;
						} else {
							$scope.controller.collapsed = true;
						}
					}
				}

				return {
					restrict: 'E',
					replace: true,
					template:'<fieldset><legend><span ng-if="controller.collapsible" ng-click="controller.collapsed = !controller.collapsed"><i ng-class="{\'fa-chevron-right\': controller.collapsed, \'fa-chevron-down\': !controller.collapsed}" class="fa fa-fw" style="font-size: 0.6em; vertical-align: middle;"></i></span> {{controller.title}}</legend><span ng-transclude ng-class="{\'collapse\': controller.collapsible && controller.collapsed === true}"></span></fieldset>',
					transclude: true,
					scope: true,
					controller: ['$scope', GXFieldsetController],
					controllerAs: 'controller',
					bindToController: {
						title: '@',
						collapsed: '='
					}
				};
			}]);

} (window.angular));

(function(angular, $) {
    'use strict';

    angular.module('gux.cockpit', [])
        .directive('gxCockpit', [
            function() {

                function GXCockpitController() {

                }

                return {
                    restrict: 'E',
                    replace: true,
                    template:'<div class="md-navbar blue-900 md-whiteframe-z1 gx-cockpit-nav header-fixed" ng-cloak><ul class="nav navbar-nav navbar-left"><li class><a href ng-click="$ctrl.toggleLeft(\'cockpit-menu\')" class="pull-left"><i class="ion ion-grid text-white m-l-xs font-bold" style="font-size: 22px;"></i></a> <span class="pull-right m-r-n-xxl hidden-lg hidden-md hidden-sm"><a class="gx-cockpit-brand no-padder" href="/"><img src="images/logo-app-cockpit.png"></a></span></li><li class="hide-xs hide-sm m-l-xs"><a class="gx-cockpit-brand no-padder" href="/"><img src="images/logo-app-cockpit.png"></a></li><li class="dropdown m-l-sm pos-stc" dropdown><a href class="dropdown-toggle dker hvr-underline-from-center" data-toggle="dropdown" aria-expanded="true"><i class="fa fa-bookmark fa-fw text-warning"></i> <span class="text-white">apps favoritos</span></a><div class="dropdown-menu w-full bg-white animated fadeIn"><div class="panel"><div class="panel-heading b-light bg-light"><strong>Favoritos</strong></div><div class="list-group"><span href class="list-group-item blue-grey-10"><span class="pull-left m-r thumb-sm"></span> <span class="clear block m-b-none text-light"><strong>Olá!</strong><br><span>Estes são seus favoritos. Tenha sempre acesso rápido!</span></span></span> <span class="row list-group-item blue-grey-300"><div class="col-md-2 col-xs-12"><md-card><md-card-header><md-card-avatar><img src="images/bookmark.png"></md-card-avatar><md-card-header-text><span class="h5">Nome app <a href class="pull-right"><i class="ion-ios-close-outline pull-right"></i><md-tooltip md-direction="right" class="w-auto-folded">remover</md-tooltip></a></span><p class="text-muted text-xs">Sistema de contabilização e Liquidação</p></md-card-header-text></md-card-header><md-card-actions layout="row" layout-align="start left"><a ui-sref="home" class="btn btn-block btn-default btn-xs">entrar</a></md-card-actions></md-card></div><div class="col-md-2 col-xs-12"><md-card><md-card-header><md-card-avatar><img src="images/bookmark.png"></md-card-avatar><md-card-header-text><span class="h5">Nome app <a href class="pull-right"><i class="ion-ios-close-outline pull-right"></i><md-tooltip md-direction="right" class="w-auto-folded">remover</md-tooltip></a></span><p class="text-muted text-xs">Sistema integrado de gestão de ativos</p></md-card-header-text></md-card-header><md-card-actions layout="row" layout-align="start left"><a ui-sref="home" class="btn btn-block btn-default btn-xs">entrar</a></md-card-actions></md-card></div><div class="col-md-2 col-xs-12"><md-card><md-card-header><md-card-avatar><img src="images/bookmark.png"></md-card-avatar><md-card-header-text><span class="h5">S.C.D.E. <a href class="pull-right"><i class="ion-ios-close-outline pull-right"></i><md-tooltip md-direction="right" class="w-auto-folded">remover</md-tooltip></a></span><p class="text-muted text-xs">Sistema de coleta de dados de energia</p></md-card-header-text></md-card-header><md-card-actions layout="row" layout-align="start left"><a ui-sref="home" class="btn btn-block btn-default btn-xs">entrar</a></md-card-actions></md-card></div></span> <a href class="list-group-item blue-grey-50 clear"><span class="pull-left m-r"><i class="fa fa-close text-danger" aria-hidden="true"></i></span> <span class="clear block m-b-none text-danger font-bold">fechar</span></a></div></div></div></li></ul><ul class="nav navbar-nav navbar-right m-r-xs gx-cockpit-link hidden-xs"><li class="dropdown" dropdown><a href class="dropdown-toggle hvr-underline-from-center" data-toggle="dropdown" aria-expanded="true"><i class="fa fa-user fa-fw text-white"></i> <span class="text-white">Julio Ferracini</span></a><div class="dropdown-menu w-xl animated fadeIn"><div class="panel bg-white"><div class="panel-heading b-light bg-light"><strong>Seu cadastro</strong></div><div class="list-group"><span href class="list-group-item blue-grey-10"><span class="pull-left m-r thumb-sm"></span> <span class="clear block m-b-none text-light"><strong>Julio</strong><br><span>Por aqui você administra seu cadastro.</span></span></span> <a ui-sref="home.prototipos.profile-mockup" class="list-group-item"><span class="pull-left m-r"><i class="fa fa-user fa-2x" aria-hidden="true"></i></span> <span class="clear block m-b-none">Configurações da sua conta<br><small class="text-muted">Dados cadastrais do usuário ativo, troca de senha e configuração do perfil (notificações e preferências gerais).</small></span></a> <a ui-sref="home.gus.minha-conta" class="list-group-item"><span class="pull-left m-r"><i class="fa fa-key fa-2x" aria-hidden="true"></i></span> <span class="clear block m-b-none">Troca de senha e e-mail pessoal<br><small class="text-muted">Alterar dados de acesso como senha e e-mail pessoal.</small></span></a> <a ui-sref="home.prototipos.profile-mockup" class="list-group-item"><span class="pull-left m-r"><i class="fa fa-lock fa-2x" aria-hidden="true"></i></span> <span class="clear block m-b-none">Atribuições e permissões de acesso<br><small class="text-muted">Visualizar e gerenciar preferências de acesso a sistemas.</small></span></a> <a href class="list-group-item text-warning"><span class="pull-left m-r text-warning"><i class="fa fa-gear fa-2x text-warning" aria-hidden="true"></i></span> <span class="clear block m-b-none">Administração do sistema de cadastro<br><small class="text-muted">Gerenciar preferências globais do sistema de cadastro.</small></span></a> <a href class="list-group-item blue-grey-50"><span class="pull-left m-r"><i class="fa fa-sign-out text-danger" aria-hidden="true"></i></span> <span class="clear block m-b-none text-danger font-bold">Sair do ambiente</span></a></div></div></div></li><li class="dropdown" dropdown gx-tooltip="Notificações gerais" gx-tooltip-placement="bottom"><a href class="dropdown-toggle hvr-underline-from-center" data-toggle="dropdown" aria-expanded="true"><i class="fa fa-bell fa-fw text-white"></i> <span class="badge badge-sm up bg-danger dk pull-right-xs md-whiteframe-z2">30</span></a><div class="dropdown-menu w-xl animated fadeIn"><div class="panel bg-white"><div class="panel-heading b-light bg-light"><strong>Você possui <span>30</span> notificações</strong></div><div class="list-group"><span href class="list-group-item bg-light dk"><span class="pull-left m-r thumb-sm"><img src="images/profile.jpg" alt="..." class="img-circle"></span> <span class="clear block m-b-none text-light"><i class="fa fa-user"></i> <strong>Julio Ferracini</strong><br><small class="text-muted">notificações referentes a este perfil</small></span></span> <a href class="list-group-item"><span class="pull-left m-r"><i class="fa fa-check text-info" aria-hidden="true"></i></span> <span class="clear block m-b-none">Cadastro <span class="badge blue-grey-200">20120</span> aprovado para sua avaliação.<br><small class="text-muted">1 hora atrás referente à</small> <small class="text-info">Renato Tegão</small></span></a> <a href class="list-group-item"><span class="pull-left m-r"><i class="fa fa-file-pdf-o text-danger" aria-hidden="true"></i></span> <span class="clear block m-b-none">Envio de documentos pendentes para o cadastro <span class="badge blue-grey-200">20120</span><br><small class="text-muted">2 hora atrás referente à</small> <small class="text-info">COMERCIAL XPT</small></span></a> <a href class="list-group-item"><span class="pull-left m-r"><i class="fa fa fa-refresh fa-spin text-light" aria-hidden="true"></i></span> <span class="clear block m-b-none">Julio, sua empresa possui solicitações de cadastro estão em análise. Fique atento às notificações.<br><small class="text-muted">2 hora atrás enviado pela</small> <small class="text-warning">Nome app</small></span></a> <a href class="list-group-item"><span class="pull-left m-r"><i class="fa fa fa-bullhorn text-warning" aria-hidden="true"></i></span> <span class="clear block m-b-none"><span class="badge amber">28</span> Novos comunicados recebidos.<br><small class="text-muted">4 hora atrás enviado pela</small> <small class="text-warning">Nome app</small></span></a></div><div class="panel-footer text-sm"><a href class="pull-right"><i class="fa fa-bell"></i></a> <a href="#notes" data-toggle="class:show animated fadeInRight">Todas as notificações do perfil ativo</a></div></div></div></li><li class="dropdown pos-stc" dropdown><a href class="dropdown-toggle hvr-underline-from-right" data-toggle="dropdown" aria-expanded="true"><i class="fa fa-tasks fa-fw text-white"></i> <span class="text-white hidden-sm hiddem-xs">Tarefas</span></a><div class="dropdown-menu bg-white animated fadeInRight md-whiteframe-z4"><div class="panel bg-white"><div class="panel-heading blue-grey-100 no-border"><h4 class="font-thin">Tarefas</h4></div><div class="list-group"><span href class="list-group-item blue-grey-10"><span class="pull-left m-r thumb-sm"></span> <span class="clear block m-b-none text-light"><strong>Julio</strong><br><span>Estas são atividades vinculadas ao seu perfil.</span></span></span><div class="list-group-item"><div class="row"><div class="col-md-12"><div class="center text-center"><i class="ion-coffee fa-5x fa-fw text-muted"></i><p>Você não possui nenhuma tarefa para realizar no momento.</p></div><div class="panel panel-default hide"><div class="panel-heading"><span class="label label-default pull-right m-t-sm wrapper-xs">4 recebidas hoje</span><h4 class="font-thin m-t-sm m-b text-muted"><i class="fa fa-tasks m-r" aria-hidden="true"></i> Tarefas</h4></div><div class="wrapper">Tarefas gerais do usuário.</div><ul><li>Links de atividades rotineiras</li><li>• Declaração de Sobras e Deficits (MCSD)</li><li>• Registro de contratos</li><li>• Etc.</li></ul></div></div></div></div><a href class="list-group-item blue-grey-50"><span class="pull-left m-r"><i class="fa fa-close text-danger" aria-hidden="true"></i></span> <span class="clear block m-b-none text-danger">fechar painel</span></a></div></div></div></li><li class="dropdown pos-stc" dropdown><a href class="dropdown-toggle hvr-underline-from-right" data-toggle="dropdown" aria-expanded="true"><i class="fa fa-calendar fa-fw text-white"></i> <span class="text-white hidden-sm hiddem-xs"></span></a><div class="dropdown-menu w-xxl bg-white animated fadeInRight b-l"><div class="panel bg-white"><div class="panel-heading blue-grey-100 no-border"><h4 class="font-thin">Calendário de operações</h4></div><div class="list-group"><span class="list-group-item bg-light"><span class="pull-left m-r thumb-sm"></span> <span class="clear block m-b-none text-light"><span class="pull-left"><strong>Julio</strong><br><span>Fique atento a estes prazos. Eles são importantes para a operação do Mercado e pode afetar o seu dia-a-dia.</span></span> <span class="pull-left"><span class="font-thin text-muted">Hoje</span> <small class="text-primary">{{CurrentDate | date: \'dd/MM/yyyy\'}}</small> <small class="text-muted">às</small> <small class="text-primary">{{CurrentDate | date: \'hh:mm\'}}</small></span></span></span><div class="list-group-item bg-light lter"><md-datepicker class="w-full" ng-model="valorDataDes" md-placeholder="Data"></md-datepicker></div><div class="list-group-item" style="overflow:auto; height:500px;"><div class="row"><div class="list-item col-md-12 no-border-xs"><a href class="text-muted pull-right text-lg"><i class="icon-arrow-right"></i></a><div class="panel-body no-padder"><div class="md-list md-whiteframe-z0 bg-white m-b"><div class="md-list-item"><div class="md-list-item-left img-circle orange"><span class="text-lg"><i class="ion-ios-flame text-white"></i></span></div><div class="md-list-item-content"><h3 class="text-sm">Data limite para Registro e Validação dos montantes de Cessão de Energia de Reserva para usinas de fonte eólica - 1° quadriênio correspondente ao 2° LER</h3><small class="font-thin">X+5du</small></div></div><div class="md-list-item"><div class="md-list-item-left img-circle blue-grey"><span class="text-lg"><i class="fa fa-line-chart text-white"></i></span></div><div class="md-list-item-content"><h3 class="text-sm">Divulgação dos resultados da liquidação financeira do MCSD - set/16</h3><small class="font-thin">X+2du</small></div></div><div class="md-list-item"><div class="md-list-item-left img-circle orange"><span class="text-lg"><i class="ion-ios-flame text-white"></i></span></div><div class="md-list-item-content"><h3 class="text-sm">Data limite para disponibilizar os Relatórios do Processamento da Contabilização - jul/16</h3><small class="font-thin">MS+21du</small></div></div><div class="md-list-item"><div class="md-list-item-left img-circle orange"><span class="text-lg"><i class="ion-ios-flame text-white"></i></span></div><div class="md-list-item-content"><h3 class="text-sm">Data limite para divulgar os relatórios de pré-liquidação de penalidades - ago/16</h3><small class="font-thin">MS+22du</small></div></div><div class="md-list-item"><div class="md-list-item-left img-circle orange"><span class="text-lg"><i class="ion-ios-flame text-white"></i></span></div><div class="md-list-item-content"><h3 class="text-sm">Data limite para disponibilizar os Relatórios do Processamento da Contabilização - jul/16</h3><small class="font-thin">MS+21du</small></div></div><div class="md-list-item"><div class="md-list-item-left img-circle orange"><span class="text-lg"><i class="ion-ios-flame text-white"></i></span></div><div class="md-list-item-content"><h3 class="text-sm">Data limite para divulgar os relatórios de pré-liquidação de penalidades - ago/16</h3><small class="font-thin">MS+22du</small></div></div></div></div></div></div></div><a href class="list-group-item blue-grey-50"><span class="pull-left m-r"><i class="fa fa-close text-danger" aria-hidden="true"></i></span> <span class="clear block m-b-none text-danger">fechar painel</span></a></div></div></div></li><li><a ng-click="startIntro()" gx-tooltip="Tour guiado" gx-tooltip-placement="bottom" class="hvr-underline-from-center"><i class="fa fa-question-circle fa-fw text-white"></i></a></li><li><a ngsf-toggle-fullscreen gx-tooltip="Tela cheia" gx-tooltip-placement="bottom"><i class="fa fa-expand fa-fw text-white"></i> <i class="fa fa-compress fa-fw text-active"></i></a></li></ul></div>',
                    transclude: true,
                    controller: GXCockpitController,
                    controllerAs: 'controller',
                    scope: false,
                    link: function(scope, element, attributes) {
                        element.addClass('customClass');
                    }
                };
            }
        ]);

}(window.angular, window.$));
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