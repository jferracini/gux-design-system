(function (angular) {

	'use strict';

	function gxFormGroupInputCurrencyController(parent, ngModelController) {
		console.log(ngModelController);
	}

	var gxFormGroupInputCurrencyDependencies = [
	];

	var gxFormGroupInputCurrencyComponent = {
		templateUrl: 'views/gx-form-group-input-currency.html',
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
