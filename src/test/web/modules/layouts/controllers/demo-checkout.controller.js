(function() {
    'use strict';

    angular.module('gux.toolbox')

    .controller('CheckoutController', ['$rootScope', '$scope', '$location', function(rootScope, $scope, $location) {

        $scope.items = ["width: 0%", "width: 20%", "width: 40%", "width: 60%", "width: 80%", "width: 100%"]



        $scope.valorName = 'Julio';
        $scope.valorLastName = 'Ferracini';
        $scope.valorDoc = '220.905.408-99';
        $scope.valorUser = 'jferracini';
        $scope.valorPass = '12345678';
        $scope.valorEmailPre = 'jferracini@yahoo.com.br';
        $scope.valorCel = '(+5511)99594-6740';
        $scope.valorTel2 = '(+5511) 3175-6432';
        $scope.valorEnd = 'Avenida Paulista, 2064 - Bela Vista - SP - SP';
        $scope.valorCep = '01310-200';
        $scope.valorRua = 'Avenida Paulista';
        $scope.valorNum = '2064';
        $scope.valorCidade = 'São Paulo';
        $scope.valorEstado = 'São Paulo';
        $scope.valorPais = 'Brasil';
        $scope.favoriteTopping = 'Novo Agente!';
        $scope.valorBanco = 'Bradesco';
        $scope.agenciaMcp = '895-6';
        $scope.contaMcp = '1008690-3';
        $scope.agenciaCotas = '895-6';
        $scope.contaCotas = '334434-3';
        $scope.agenciaExport = '895-6';
        $scope.contaExport = '44566-3';
        $scope.cnpj = '002.000.222/0001-88';
        $scope.valorRs = 'Comercializadora Lorem Ipsum S.A.';
        $scope.valorRs2 = 'Industria de Motocicletas do ABC S.A.';
        $scope.valorNf = 'ENERMIX';
        $scope.valorNf2 = 'VARGOLINA';
        $scope.valorRa = '';
        $scope.valorSa = 'ENEX';
        $scope.valorSa2 = 'VARGA';
        $scope.valorClasse = 'Classe';
        $scope.valorCat = 'Categoria';
        $scope.valorRamo = 'Serviços XXXXXX';
        $scope.cnae = '0101010192';
        $scope.valorTipo = 'PRIVADA';
        $scope.valorWww = 'www.enemix.com.br';
        $scope.valorWww2 = 'www.vargolina.com.br';
        $scope.valorEmail3 = 'contato@enemix.com.br';
        $scope.valorEmail3 = 'contato@vargolina.com.br';
        $scope.valorRca1 = '223993-2002';

        $scope.preSteps = [{
                templateUrl: 'modules/prototipos/views/wizard/pre-1.html',
                title: 'Criação de login e senha'
            },
            {
                templateUrl: 'modules/prototipos/views/wizard/pre-2.html',
                title: 'Cadastro de dados pessoais'
            },
            {
                templateUrl: 'modules/prototipos/views/wizard/pre-3.html',
                title: 'Cadastro de dados da empresa'
            },
            {
                templateUrl: 'modules/prototipos/views/wizard/pre-4.html',
                title: 'Verificação das informações'
            },
            {
                templateUrl: 'modules/prototipos/views/wizard/pre-5.html',
                title: 'Conclusão e envio do pré-cadastro'
            }
        ];

        $scope.status = [{
                templateUrl: 'modules/prototipos/views/wizard/pos-1.html',
                title: 'Criação de login e senha'
            },
            {
                templateUrl: 'modules/prototipos/views/wizard/pos-2.html',
                title: 'Cadastro de dados pessoais'
            },
            {
                templateUrl: 'modules/prototipos/views/wizard/pos-3.html',
                title: 'Cadastro de dados da empresa'
            },
            {
                templateUrl: 'modules/prototipos/views/wizard/pos-4.html',
                title: 'Verificação das informações'
            },
            {
                templateUrl: 'modules/prototipos/views/wizard/pos-5.html',
                title: 'Conclusão e envio do pré-cadastro'
            }
        ];

        $scope.adesao = [{
                templateUrl: 'modules/prototipos/views/wizard/adesao-1.html',
                title: 'Documentos'
            },
            {
                templateUrl: 'modules/prototipos/views/wizard/adesao-2.html',
                title: 'Dados do Candidato'
            },
            {
                templateUrl: 'modules/prototipos/views/wizard/adesao-3.html',
                title: 'Perfil do Agente'
            },
            {
                templateUrl: 'modules/prototipos/views/wizard/adesao-4.html',
                title: 'Dados Financeiros'
            },
            {
                templateUrl: 'modules/prototipos/views/wizard/adesao-5.html',
                title: 'Tipos de Contato'
            },
            {
                templateUrl: 'modules/prototipos/views/wizard/adesao-6.html',
                title: 'Envio'
            }
        ];


        $scope.naoAgente = [{
                templateUrl: 'wizard/naoagente-1.html',
                title: 'Sua identificação'
            },
            {
                templateUrl: 'wizard/naoagente-2.html',
                title: 'Dados cadastrais'
            }
        ];

    }]);

}());