(function(angular) {

    'use strict';

    function create(value) {
        console.log(value);
        return {
            "ranking": 1,
            "year": 2017,
            "name": value,
            "company": "GUX",
            "amount": "100"
        }
    }

    function update(value) {
        console.log(value);
        return value;
    }

    function deletee(value) {
        console.log(value);
    }

    function ComponentsController($state, $http, $scope, templateService, filmService, gxAppService) {

        self = this;

        self.def = 3;

        self.undef = undefined;

        self.htmlEditorOptions = {
            lineWrapping: true,
            lineNumbers: true,
            readOnly: 'nocursor',
            mode: 'htmlmixed'
        };

        self.sourceUrl = null;
        if ($state.$current.name === "home.components.text") {
            self.sourceUrl = '/modules/components/views/gx-form-group-input-text-demo.html';
        } else if ($state.$current.name === "home.components.textarea") {
            self.sourceUrl = '/modules/components/views/gx-form-group-textarea-demo.html';
        } else if ($state.$current.name === "home.components.button") {
            self.sourceUrl = '/modules/components/views/gx-form-group-button-demo.html';
        } else if ($state.$current.name === "home.components.number") {
            self.sourceUrl = '/modules/components/views/gx-form-group-input-number-demo.html';
        } else if ($state.$current.name === "home.components.currency") {
            self.sourceUrl = '/modules/components/views/gx-form-group-input-currency-demo.html';
        } else if ($state.$current.name === "home.components.calendar") {
            self.sourceUrl = '/modules/components/views/gx-form-group-calendar-demo.html';
        } else if ($state.$current.name === "home.components.select") {
            self.sourceUrl = '/modules/components/views/gx-form-group-select-demo.html';
        } else if ($state.$current.name === "home.components.dropdown") {
            self.sourceUrl = '/modules/components/views/gx-form-group-dropdown-demo.html';
        } else if ($state.$current.name === "home.components.autocomplete.simple") {
            self.sourceUrl = '/modules/components/views/gx-form-group-autocomplete-simple-demo.html';
        } else if ($state.$current.name === "home.components.autocomplete.advanced") {
            self.sourceUrl = '/modules/components/views/gx-form-group-autocomplete-advanced-demo.html';
        } else if ($state.$current.name === "home.components.autocomplete.creatable") {
            self.sourceUrl = '/modules/components/views/gx-form-group-autocomplete-creatable-demo.html';
        } else if ($state.$current.name === "home.components.autocomplete.updatable") {
            self.sourceUrl = '/modules/components/views/gx-form-group-autocomplete-updatable-demo.html';
        } else if ($state.$current.name === "home.components.autocomplete.deletable") {
            self.sourceUrl = '/modules/components/views/gx-form-group-autocomplete-deletable-demo.html';
        } else if ($state.$current.name === "home.components.autocomplete.full") {
            self.sourceUrl = '/modules/components/views/gx-form-group-autocomplete-full-demo.html';
        } else if ($state.$current.name === "home.components.switch") {
            self.sourceUrl = '/modules/components/views/gx-form-group-switch-demo.html';
        } else if ($state.$current.name === "home.components.equation") {
            self.sourceUrl = '/modules/components/views/gx-form-group-equation-demo.html';
        }

        self.source = null;
        self.sourceCode = null;

        self.disableBasicTab = function() {
            gxAppService.disableTab('t1');
        };

        self.enableBasicTab = function() {
            gxAppService.enableTab('t1');
        };

        self.resetTabs = function() {
            gxAppService.resetTabs();
        };

        self.filmPointer = 0;
        self.films = null;
        self.selectedFilm = null;
        self.selectedFilmJson = null;

        self.label = "Label from controller"
        self.description = "Description from controller"
        self.example = "Example from controller"
        self.feedback = "Feedback from controller"

        self.required = true;

        self.isRequired = function() {
            return self.required;
        };

        self.toggleRequired = function() {
            self.required = !self.required;
        };

        self.disabled = false;

        self.isDisabled = function() {
            return self.disabled;
        };

        self.toggleDisabled = function() {
            self.disabled = !self.disabled;
        };

        self.setFirstFilm = function() {
            self.filmPointer = 0;
            self.selectedFilm = self.films[self.filmPointer];
        };

        self.disableNextFilm = function() {
            var result = true;
            if (!!self.films && self.filmPointer < self.films.length - 1) {
                result = false;
            }
            return result;
        }

        self.setNextFilm = function() {
            if (!self.disableNextFilm()) {
                self.filmPointer++;
                self.selectedFilm = self.films[self.filmPointer];
            }
        };

        self.disablePreviousFilm = function() {
            return self.filmPointer == 0;
        }

        self.setPreviousFilm = function() {
            if (!self.disablePreviousFilm()) {
                self.filmPointer--;
                self.selectedFilm = self.films[self.filmPointer];
            }
        };

        self.setNull = function() {
            self.selectedFilm = null;
        };

        self.search = function search(name) {
            return filmService
                .list(name)
                .then(function(response) {
                    self.films = response;
                    return response;
                });
        };

        self.create = create;

        self.update = update

        self.delete = deletee;

        self.favoriteOffValue = 'No';

        self.favoriteOnValue = 'Yes';

        self.submit = function() {
            return "ok";
        };

        self.$onInit = function() {

            templateService
                .get(self.sourceUrl)
                .then(function(response) {
                    self.source = response;
                });

            self.search()
                .then(function() {
                    self.selectedFilm = self.films[self.filmPointer];
                });

            $scope.$watch('$ctrl.selectedFilm', function(newValue) {
                self.selectedFilmJson = JSON.stringify(newValue, undefined, 2);
            }, true);
        };
    }

    angular.module('gux.test.components')
        .controller('ComponentsController', [
            '$state',
            '$http',
            '$scope',
            'templateService',
            'filmService',
            'gxAppService',
            ComponentsController
        ]);

}(window.angular));