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
        templateUrl: 'views/gx-form-group-autocomplete.html',
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