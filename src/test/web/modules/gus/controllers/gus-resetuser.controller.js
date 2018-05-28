(function () {
    'use strict';

    angular.module('gux.toolbox')

    .controller('ResetUserController', ['$scope',
            function ($scope) {
                
                $scope.cpf = '220.905.000-99';
                $scope.valorUser = '';
                $scope.valorPsw = '1234567890';
                $scope.valorPsw2 = '1234567890';
//                $scope.validator = function() {
//                    
//                    return true;
//                    
//                }
//                
                $scope.pessoa = {
                    cpf: null,
                    valorUser: null,
                    valorPsw: null,
                    valorPsw2: null
                };
//                
                $scope.isCpfValido = function() {
                    return !!$scope.pessoa.cpf && $scope.pessoa.cpf.length > 10;
                };

      }
    ]);

}());