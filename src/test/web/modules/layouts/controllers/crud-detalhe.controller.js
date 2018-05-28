(function (angular) {

	'use strict';

	function crudDetalheController($scope, $state, $stateParams, filmService) {

		var self = this;

		var mode = {
			create: false,
			view: false,
			edit: false
		}

		$scope.isCreateMode = function () {
			return mode.create;
		};

		$scope.isViewMode = function () {
			return mode.view;
		};

		$scope.isEditMode = function () {
			return mode.edit;
		};

		$scope.film = null;

		$scope.validate = function (film, modelValue, viewValue) {
			return false;
		};

		$scope.isForceValidation = function (film, modelValue, viewValue) {
			return true;
		};

		$scope.getfeedbackMessage = function (film, modelValue, viewValue) {
			return $scope.film.name + " feedback message";
		};

		$scope.save = function () {
			if (mode.create) {
				console.log("Criar novo filme");
			} else if (mode.edit) {
				console.log("Atualizar filme");
			}
			return $scope.film;
		};

		$scope.back = function () {
			$scope.refresh();
		};

		self.$onInit = function () {

			mode.create = $state.current.url && $state.current.url === '/novo';
			if (!mode.create) {
				mode.edit = $state.current.url && $state.current.url.indexOf('/editar') > -1
			} else {
				mode.view = true;
			}

			if (mode.create) {
				$scope.film = {
					"ranking": null,
					"year": null,
					"name": null,
					"company": null,
					"synopsis": null,
					"amount": null,
					"successFormula": null,
					"favorite": "no",
					"like": false,
					"dislike": false
				}
			} else if (mode.view || mode.edit) {
				filmService
					.get($stateParams.codigo)
					.then(function (retorno) {
						$scope.filme = retorno;
					});
			}
		}
		
		$scope.$watch('film', function (newValue) {
			$scope.selectedFilmJson = JSON.stringify(newValue, undefined, 2);
		}, true);
	}

	angular.module('gux.test.layouts')
		.controller('CrudDetalheController', [
			'$scope',
			'$state',
			'$stateParams',
			'filmService',
			crudDetalheController
		]);

} (window.angular));
