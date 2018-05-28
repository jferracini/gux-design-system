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
        templateUrl: 'views/gx-form-group-calendar.html',
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