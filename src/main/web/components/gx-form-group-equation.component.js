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
		templateUrl: 'views/gx-form-group-equation.html',
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
