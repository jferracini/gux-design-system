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
		templateUrl: 'views/gx-form-group-switch.html',
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
