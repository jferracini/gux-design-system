(function() {
    'use strict';

    angular.module('gux.toolbox')

    .directive('backButton', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.on('click', function() {
                    history.back();
                    scope.$apply();
                });
            }
        };
    })

    .controller('ProfileMockupController', ['$scope', '$mdDialog', '$mdToast', '$timeout', '$document', function($scope, $mdDialog, $mdToast, $timeout, $document, PerfilCtrl, querySearch) {

        // exemplo add perfil em Novo Contato

        function PerfilCtrl($q, $timeout) {
            var self = this;
            var pendingSearch, cancelSearch = angular.noop;
            var cachedQuery, lastSearch;

            self.allContacts = loadContacts();
            self.contacts = [self.allContacts[0]];
            self.asyncContacts = [];
            self.filterSelected = true;

            self.querySearch = querySearch;
            self.delayedQuerySearch = delayedQuerySearch;
            /**
             * Search for contacts; use a random delay to simulate a remote call
             */
            function querySearch(criteria) {
                cachedQuery = cachedQuery || criteria;
                return cachedQuery ? self.allContacts.filter(createFilterFor(cachedQuery)) : [];
            }

            /**
             * Async search for contacts
             * Also debounce the queries; since the md-contact-chips does not support this
             */
            function delayedQuerySearch(criteria) {
                cachedQuery = criteria;
                if (!pendingSearch || !debounceSearch()) {
                    cancelSearch();

                    return pendingSearch = $q(function(resolve, reject) {
                        // Simulate async search... (after debouncing)
                        cancelSearch = reject;
                        $timeout(function() {

                            resolve(self.querySearch());

                            refreshDebounce();
                        }, Math.random() * 500, true)
                    });
                }

                return pendingSearch;
            }

            function refreshDebounce() {
                lastSearch = 0;
                pendingSearch = null;
                cancelSearch = angular.noop;
            }

            /**
             * Debounce if querying faster than 300ms
             */
            function debounceSearch() {
                var now = new Date().getMilliseconds();
                lastSearch = lastSearch || now;

                return ((now - lastSearch) < 300);
            }

            /**
             * Create filter function for a query string
             */
            function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);

                return function filterFn(contact) {
                    return (contact._lowername.indexOf(lowercaseQuery) != -1);;
                };

            }

            function loadContacts() {
                var contacts = [
                    'Representante Legal',
                    'Representante',
                    'Representante Financeiro',
                    'Administrador',
                    'Procurador',
                    'Editor',
                    'XPTO',
                    'XPTO 123',
                    'XPTO ABC 123'
                ];

                return contacts.map(function(c, index) {
                    var cParts = c.split(' ');
                    var contact = {
                        name: c,
                        email: cParts[0][0].toLowerCase() + '.' + cParts[1].toLowerCase() + '@example.com',
                        image: 'http://lorempixel.com/50/50/people?' + index
                    };
                    contact._lowername = contact.name.toLowerCase();
                    return contact;
                });
            }
        }

        var isDlgOpen;

        angular.element($document).find('body').addClass('top-dialog')

        $scope.alert = '';

        // Toast exemplo

        $scope.showCustomToast = function() {
            $mdToast.show({
                hideDelay: 90000,
                position: 'top left',
                controller: 'ProfileMockupController',
                templateUrl: 'modules/prototipos/views/dialogs/msg-mockup.html'
            });
        };

        $scope.showCustomToastNewUser = function() {
            $mdToast.show({
                hideDelay: 900000,
                parent: document.querySelectorAll('#newuser'),
                position: 'top left',
                controller: 'ProfileMockupController',
                templateUrl: 'modules/prototipos/views/dialogs/msg-newuser-mockup.html'
            });
        };

        $scope.closeToast = function() {
            if (isDlgOpen) return;
            $mdToast
                .hide()
                .then(function() {
                    isDlgOpen = false;
                });
        };
        $scope.openMoreInfo = function(e) {
            if (isDlgOpen) return;
            isDlgOpen = true;
            $mdDialog
                .show($mdDialog
                    .alert()
                    .title('Mais informações')
                    .textContent('Seu cadastro completo foi atualizado.')
                    .ariaLabel('Saiba mais')
                    .ok('Entendi!')
                    .targetEvent(e)
                )
                .then(function() {
                    isDlgOpen = false;
                })
        };

        // Dialogos

        $scope.showNormal = function(ev) {
            $mdDialog.show(
                $mdDialog.alert()
                .title('Título de Alerta')
                .content('Descrição do Alerta.')
                .ariaLabel('Label do Alerta')
                .ok('Entendi!')
                .targetEvent(ev)
                .parent(angular.element(document.querySelector('html')))
                .clickOutsideToClose(true)
            );
        };

        $scope.adesaoMenu = function(ev) {
            var confirm = $mdDialog.confirm()
                .title('menu da Adesão')
                .content('...')
                .ariaLabel('Fim')
                .ok('ok!')
                .cancel('Cancelar')
                .targetEvent(ev);

            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'modules/prototipos/views/msg-menu-adesao.html',
            });

        };

        $scope.habTecnica = function(ev) {
            var confirm = $mdDialog.confirm()
                .title('Habilitação Ténica')
                .content('Pendências de Modelagem e Ponto de Medição')
                .ariaLabel('Fim')
                .ok('ok!')
                .cancel('Cancelar')
                .targetEvent(ev);

            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'modules/prototipos/views/msg-timeline.html',
            });
        };

        $scope.showMotivos = function(ev) {
            var confirm = $mdDialog.confirm()
                .title('Would you like to delete your debt?')
                .content('All of the banks have agreed to forgive you your debts.')
                .ariaLabel('Lucky day')
                .ok('Please do it!')
                .cancel('Sounds like a scam')
                .targetEvent(ev);

            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'modules/prototipos/views/msg-dialog.html',
            });

            //            $mdDialog.show(confirm).then(function () {
            //                $scope.alert = 'You decided to get rid of your debt.';
            //            }, function () {
            //                $scope.alert = 'You decided to keep your debt.';
            //            });
        };

        function DialogController($scope, $mdDialog) {
            $scope.hide = function() {
                $mdDialog.hide();
            };
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            $scope.answer = function(answer) {
                $mdDialog.hide(answer);
            };
        }

        DialogController.$inject = ["$scope", "$mdDialog"];

        var self = this;

        self.hidden = false;
        self.isOpen = false;
        self.hover = false;
        // On opening, add a delayed property which shows tooltips after the speed dial has opened
        // so that they have the proper position; if closing, immediately hide the tooltips
        $scope.$watch('actions.isOpen', function(isOpen) {
            if (isOpen) {
                $timeout(function() {
                    $scope.tooltipVisible = self.isOpen;
                }, 600);
            } else {
                $scope.tooltipVisible = self.isOpen;
            }
        });
        self.items = [{
                name: "Salvar todas as alterações",
                icon: "fa fa-check text-success dker",
                direction: "top",
                class: "md-fab md-raised md-ink-ripple md-mini"
            },

            {
                name: "Voltar à consulta",
                icon: "fa fa-arrow-left text-muted",
                direction: "top",
                class: "md-fab md-raised md-mini"
            },
            {
                name: "Dashboard",
                icon: "fa fa-tachometer text-muted",
                direction: "left",
                class: "md-fab md-raised md-mini"
            }
        ];

        $scope.btnend = function() {
            $mdDialog.show({
                templateUrl: 'modules/prototipos/views/msg-close.html',
                querySelector: 'html',
                contentElement: '#myAction',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            })
            $scope.hide = function() {
                $mdDialog.hide();
            };
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            $scope.answer = function(answer) {
                $mdDialog.hide(answer);
            };
        };


        // Mock mensagens

        // Mock / model / Pessoa Juridica
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
        $scope.cnae = '0101010192';
        $scope.valorTipo = 'PRIVADA';
        $scope.valorWww = 'www.enemix.com.br';
        $scope.valorWww2 = 'www.vargolina.com.br';
        $scope.valorEmail3 = 'contato@enemix.com.br';
        $scope.valorEmail3 = 'contato@vargolina.com.br';
        $scope.valorRca1 = '223993-2002';
        $scope.valorDataLig = new Date();
        $scope.minDate = new Date(
            $scope.valorDataLig.getFullYear(),
            $scope.valorDataLig.getMonth() - 2,
            $scope.valorDataLig.getDate());
        $scope.maxDate = new Date(
            $scope.valorDataLig.getFullYear(),
            $scope.valorDataLig.getMonth() + 2,
            $scope.valorDataLig.getDate());
        $scope.onlyWeekendsPredicate = function(date) {
            var day = date.getDay();
            return day === 0 || day === 6;
        };


        // mock / model / Pessoa Fisica
        $scope.cpf = '220.999.222-88';
        $scope.fullName = 'João Pereira';
        $scope.valorName = 'William';
        $scope.valorName2 = 'Bradley Pitt';
        $scope.valorUser = 'BradPitt0606';
        $scope.valorEmail = 'brad@comercializadorasa.com';
        $scope.valorEmail2 = 'iLoveLaraCroft@gmail.com';
        $scope.valorPhone1 = '11 99594-6740';
        $scope.valorPhone2 = '11 3175-6432';
        $scope.valorRua = 'Rua Francisco da Cunha';
        $scope.valorNum = '178';
        $scope.valorCidade = 'Recife';
        $scope.valorBairro = 'Boa Viagem';
        $scope.valorEstado = 'Pernambuco';
        $scope.valorExp = 'SSP-PE';
        $scope.valorPais = 'Brasil';
        $scope.valorComplemento = 'AP4 - próximo a torre de celular';
        $scope.valorPsw = '1234567';
        $scope.valorPsw2 = '1234567';
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



    }]);

}());