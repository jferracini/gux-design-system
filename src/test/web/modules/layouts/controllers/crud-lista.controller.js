(function (angular) {

	'use strict';

	function crudListaController($scope) {

		var self = this;

		$scope.search = function () {
			$scope.paginationInfo.pageNumber = 1;
			return $scope.refresh();
		};

		$scope.solicitarExclusao = function (film) {
			film.$excluir = true;
		};

		$scope.cancelarExclusao = function (film) {
			delete film.$excluir;
		};

		$scope.excluir = function (film) {
			return delete film.$excluir;
		};
	}

	angular.module('gux.test.layouts')
		.controller('CrudListaController', [
			'$scope',
			crudListaController
		]);

} (window.angular));
