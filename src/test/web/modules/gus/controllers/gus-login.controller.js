(function () {
    'use strict';

    angular.module('gux.toolbox')

    .controller('LoginController', ['$scope', function ($scope) {
                
        var errorCode = new RegExp('[\?&]p_error_code=([^&#]*)').exec(window.location.href);

        $scope.user =  "";
        $scope.password = "";
        
        if (errorCode != null && errorCode != undefined){
            if (errorCode[1] == "OAM-2"){
                $scope.errorMsg = "Usuário e/ou Senha inválidos.";    
            }else{
                $scope.errorMsg = "Houve um erro no processo de autenticação. Por favor, tente novamente.";
            }
            
        }
    }
])
    .controller('MotivoCtrl', ['$timeout','$scope', function($timeout, $scope) {
    $scope.neighborhoods = ['Chelsea', 'Financial District', 'Midtown', 'West Village', 'Williamsburg'];

      $scope.toppings = [
        { category: 'sagente', name: 'Novo Agente!' },
        { category: 'nagente', name: 'Faço parte de uma instituição do Setor' },
        { category: 'nagente', name: 'Quero alterar meu vínculo com uma empresa' },
        { category: 'nagente', name: 'Quero acessar o conteúdo exclusivo' }
        
      ];

  $scope.loadUsers = function() {
    // Use timeout to simulate a 650ms request.
    $scope.users = [];
    return $timeout(function() {
      $scope.users = [
        { id: 1, name: 'Scooby Doo' },
        { id: 2, name: 'Shaggy Rodgers' },
        { id: 3, name: 'Fred Jones' },
        { id: 4, name: 'Daphne Blake' },
        { id: 5, name: 'Velma Dinkley' },
      ];
    }, 650);
  };
}]);

    
    
    ;

}());