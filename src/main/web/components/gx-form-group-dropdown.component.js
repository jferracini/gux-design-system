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
        templateUrl: 'views/gx-form-group-dropdown.html',
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