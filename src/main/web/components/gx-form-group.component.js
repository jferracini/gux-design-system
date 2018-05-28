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
        templateUrl: 'views/gx-form-group.html',
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