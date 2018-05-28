(function () {
    'use strict';

    angular.module('gux.toolbox')

    .controller('CadastroController', ['$scope',
            function ($scope) {
                
                $scope.cpf = '';
                $scope.valorUser = '';
                $scope.valorEmail = 'brad@comercializadorasa.com.br';
                $scope.valorPsw = '';
                $scope.valorPsw2 = '';
                $scope.validator = function() {
                    
                    return true;
                    
                }
                
                $scope.pessoa = {
                    cpf: null,
                    valorUser: null,
                    valorPsw: null,
                    valorPsw2: null
                };
                
                $scope.isCpfValido = function() {
                    return !!$scope.pessoa.cpf && $scope.pessoa.cpf.length > 10;
                };

      }
    ]);

}());