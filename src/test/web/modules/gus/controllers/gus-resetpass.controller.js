(function () {
    'use strict';

    angular.module('gux.toolbox')


    .controller('ResetPassController', ['$scope',
            function ($scope) {

            $scope.cpf = '220.905.000-99';
            $scope.valorUser = '';
            $scope.valorPsw = '1234567890';
            $scope.valorPsw2 = '1234567890';           
            $scope.pessoa = {
                cpf: null,
                valorUser: null,
                valorPsw: null,
                valorPsw2: null
            };
            //                
            $scope.isCpfValido = function () {
                return !!$scope.pessoa.cpf && $scope.pessoa.cpf.length > 10;
            };

      }
    ])
    .controller('ResetPassLinkController', ['$scope',
            function ($scope) {

            $scope.cpf = '220.905.000-99';
            $scope.valorUser = 'jferracini';
            $scope.valorEmail = 'jferracini@yahoo.com.br';
            $scope.valorPsw = '';
            $scope.valorPsw2 = '';
             
            $scope.pessoa = {
                cpf: null,
                valorUser: null,
                valorPsw: null,
                valorPsw2: null
            };
            //                
            $scope.isCpfValido = function () {
                return !!$scope.pessoa.cpf && $scope.pessoa.cpf.length > 10;
            };

      }
    ])



;


}());
