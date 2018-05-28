(function (angular) {

	'use strict';

	function gxFormGroupInputNumberController() {

	}

	var gxFormGroupInputNumberDependencies = [
	];

	var gxFormGroupInputNumberComponent = {
		templateUrl: 'views/gx-form-group-input-number.html',
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
