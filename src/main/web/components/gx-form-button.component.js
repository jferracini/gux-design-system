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