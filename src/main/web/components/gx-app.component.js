(function($, angular) {

    'use strict';

    function showMessage(scope, message) {
        scope.$broadcast("gxApp.feedback", message);
    }

    function showInfo(scope, message, title) {
        showMessage(scope, {
            type: 'info',
            title: !title ? 'Informação' : title,
            body: message
        });
    }

    function showSuccess(scope, message, title) {
        showMessage(scope, {
            type: 'success',
            title: !title ? 'Sucesso' : title,
            body: message
        });
    }

    function showWarning(scope, message, title) {
        showMessage(scope, {
            type: 'warning',
            title: !title ? 'Atenção' : title,
            body: message
        });
    }

    function showError(scope, message, title) {
        showMessage(scope, {
            type: 'error',
            title: !title ? 'Erro' : title,
            body: message
        });
    };

    function gxAppConfig($provide, cfpLoadingBarProvider, locationProvider, GX_STATE_CONFIG, stateHelperProvider, $mdThemingProvider) {

        var isIE = !!navigator.userAgent.match(/MSIE/i);
        locationProvider.html5Mode(!isIE);
        stateHelperProvider.state(GX_STATE_CONFIG);
        cfpLoadingBarProvider.includeSpinner = true;
        cfpLoadingBarProvider.spinnerTemplate = '<div class="loading"><img class="loading-image" src="images/gx-app-loading.gif" alt="Carrengando..." /></div>';

        $provide.decorator("$exceptionHandler", ['$injector', '$log', '$delegate', function($injector, $log, $delegate) {
            return function(exception, cause) {
                var $rootScope = $injector.get("$rootScope");
                if (exception.type === 'error') {
                    showError($rootScope, exception.message, exception.title);
                } else if (exception.type === 'warning') {
                    showWarning($rootScope, exception.message, exception.title);
                } else {
                    $delegate(exception, cause);
                }
            };
        }]);

        $mdThemingProvider.theme('default')
            .primaryPalette('blue', {
                'default': '400', // by default use shade 400 from the pink palette for primary intentions
                'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
                'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
                'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
            })
            // If you specify less than all of the keys, it will inherit from the
            // default shades
            .accentPalette('blue-grey', {
                'default': '200' // use shade 200 for default, and keep all other shades the same
            });

    }

    function initState($state, state) {
        if (state.abstract === true) {
            if (!state.data) {
                state.data = {}
            }
            if (!state.data.expanded) {
                state.data.expanded = $state.includes(state.name);
            }
        }
    }

    function getLink(state) {
        var link = undefined;
        if (!!state.data && !!state.data.tab) {
            link = state.name;
        } else if (!!state.data && !!state.data.menu && !!state.data.menu.link) {
            link = state.data.menu.link;
        } else if (!(state.abstract === true)) {
            link = state.name;
        }
        return link;
    }

    function isToDisplayMenu(state) {
        return !state.data || !state.data.menu || state.data.menu.display == undefined || state.data.menu.display === true;
    }

    function getMenuIconClass(state) {
        var iconClass = undefined;
        if (!!state.data && !!state.data.menu && !!state.data.menu.iconClass) {
            iconClass = state.data.menu.iconClass;
        }
        return iconClass;
    }

    function getMenuTitle(state) {
        var title = 'unknown';
        if (!!state.data) {
            if (!!state.data.tab && !!state.data.tab.title) {
                title = state.data.tab.title;
            } else if (!!state.data.menu && !!state.data.menu.title) {
                title = state.data.menu.title;
            } else if (!!state.data.masthead && !!state.data.masthead.title) {
                title = state.data.masthead.title;
            }
        }
        return title;
    }

    function getMenuDescription(state) {
        var description = undefined;
        if (!!state.data) {
            if (!!state.data.tab && !!state.data.tab.description) {
                description = state.data.tab.description;
            } else if (!!state.data.menu && !!state.data.menu.description) {
                description = state.data.menu.description;
            } else if (!!state.data.masthead && !!state.data.masthead.description) {
                description = state.data.masthead.description;
            }
        }
        return description;
    }

    /*function isStateActive($state, state) {
    	return $state.includes(state.name);
    }*/

    function onMenuClick(state) {
        if (state.abstract === true) {
            state.data.expanded = !state.data.expanded;
        }
    }

    function isToDisplayMasthead($state) {
        return !!$state.current.data && !!$state.current.data.masthead;
    }

    function setStateRoute(stateRoute, state) {
        stateRoute.push(state);
        if (!!state.parent) {
            setStateRoute(stateRoute, state.parent);
        }
    }

    function getBreadcrumbItems(state) {
        var breadcrumbItems = []
        var states = [];
        setStateRoute(states, state);
        states = states.reverse();
        for (var i = 0; i < states.length; i++) {
            if (i == states.length - 1 &&
                !!states[i].data &&
                !!states[i].data.masthead &&
                !!states[i].data.masthead.actions &&
                states[i].data.masthead.actions.length > 0) {
                continue;
            }
            breadcrumbItems.push({
                link: getLink(states[i]),
                title: getMenuTitle(states[i])
            });
        }
        return breadcrumbItems;
    }

    function getMastheadTitle(state) {
        var title = 'unknown';
        if (!!state.data) {
            if (!!state.data.masthead && !!state.data.masthead.title) {
                title = state.data.masthead.title;
            } else if (!!state.data.menu && !!state.data.menu.title) {
                title = state.data.menu.title;
            } else if (!!state.data.tab && !!state.data.tab.title) {
                title = state.data.tab.title;
            }
        }
        return title;
    }

    function getMastheadDescription(state) {
        var description = undefined;
        if (!!state.data) {
            if (!!state.data.tab && !!state.data.tab.description) {
                description = state.data.tab.description;
            } else if (!!state.data.masthead && !!state.data.masthead.description) {
                description = state.data.masthead.description;
            } else if (!!state.data.menu && !!state.data.menu.description) {
                description = state.data.menu.description;
            }
        }
        return description;
    }

    function getMastheadActions(state) {
        var mastheadActions = undefined;
        if (!!state.data &&
            state.data.masthead &&
            state.data.masthead.hasOwnProperty('actions') &&
            state.data.masthead.actions.length > 0) {
            mastheadActions = state.data.masthead.actions;
        }
        return mastheadActions;
    }

    function getTabs(state) {
        var tabs = undefined;
        if (state.data && state.data.tab && state.parent) {
            tabs = [];
            for (var i = 0; i < state.parent.children.length; i++) {
                var brother = state.parent.children[i];
                if (!!brother.data && !!brother.data.tab) {
                    tabs.push({
                        id: brother.data.tab.id,
                        link: getLink(brother),
                        title: getMenuTitle(brother)
                    });
                }
            }
        }
        return tabs;
    }

    var tabDisabedArray = [];

    function isTabDisabled(tabId) {
        var result = false;
        var index = tabDisabedArray.indexOf(tabId);
        if (index > -1) {
            result = true;
        }
        return result;
    }

    function disableTab(tabId) {
        var index = tabDisabedArray.indexOf(tabId);
        if (index == -1) {
            tabDisabedArray.push(tabId);
        }
    }

    function enableTab(tabId) {
        var index = tabDisabedArray.indexOf(tabId);
        if (index > -1) {
            tabDisabedArray.splice(index, 1);
        }
    }

    function resetTabs() {
        tabDisabedArray = [];
    }

    function isTabActive($state, tab) {
        return !isTabDisabled(tab.id) &&
            !!tab &&
            !!tab.link &&
            $state.current.name === tab.link;
    }

    function debounce(func, wait, context, $scope, $timeout) {
        var timer;
        return function debounced() {
            var context = $scope,
                args = Array.prototype.slice.call(arguments);
            $timeout.cancel(timer);
            timer = $timeout(function() {
                timer = undefined;
                func.apply(context, args);
            }, wait || 10);
        };
    }

    function buildDelayedToggler(navID, $scope, $log, $timeout, $mdSidenav) {
        return debounce(function() {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav(navID)
                .toggle()
                .then(function() {
                    $log.debug("toggle " + navID + " is done");
                });
        }, 200, null, $scope, $timeout);
    }

    function buildToggler(navID, $log) {
        return function() {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav(navID)
                .toggle()
                .then(function() {
                    $log.debug("toggle " + navID + " is done");
                });
        }
    }

    function gxAppController(GX_STATE_CONFIG, rootScope, $scope, $http, $state, toaster, smoothScroll, $element, $timeout, $mdSidenav, $log) {

        var self = this;

        self.toggleLeft = buildDelayedToggler('left', $scope, $log, $timeout, $mdSidenav);
        self.toggleRight = buildToggler('right', $log);
        self.isOpenRight = function() {
            return $mdSidenav('right').isOpen();
        };

        self.close = function() {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav('left').close()
                .then(function() {
                    $log.debug("close LEFT is done");
                });
        }

        self.config = {
            asideFolded: false, // menu lateral aparece recolhido
            showNav: true, // mostrar barra de navegação
            headerFixed: false, // header fixo ao rolar
            asideFixed: false, // menu lateral fixo no scroll
            asideDock: false, // menu laterial aparece em formato horizontal
            container: false // conteúdo boxed
        }

        self.rootState = GX_STATE_CONFIG;

        self.intro = null;

        self.initState = function(state) {
            initState($state, state);
        };

        self.getLink = getLink;

        self.isToDisplayMenu = isToDisplayMenu;

        self.getMenuIconClass = getMenuIconClass;

        self.getMenuTitle = getMenuTitle;

        self.getMenuDescription = getMenuDescription;

        /*self.isStateActive = function(state) {
        	isStateActive($state, state);
        };*/

        self.onMenuClick = onMenuClick;

        self.isToDisplayMasthead = function() {
            return isToDisplayMasthead($state);
        }

        self.breadcrumbItems = null;

        self.mastheadTitle = null;

        self.mastheadDescription = null;

        self.mastheadActions = null;

        self.tabs = null;

        self.isTabDisabled = function(tab) {
            return isTabDisabled(tab.id);
        };

        self.isTabActive = function(tab) {
            return isTabActive($state, tab);
        };

        $scope.CurrentDate = new Date();

        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

            if (!rootScope.session) {
                rootScope.session = {};
            }

            rootScope.session.lastState = fromState;
            $scope.$ctrl.breadcrumbItems = getBreadcrumbItems(toState)
            $scope.$ctrl.mastheadTitle = getMastheadTitle(toState);
            $scope.$ctrl.mastheadDescription = getMastheadDescription(toState);
            $scope.$ctrl.mastheadActions = getMastheadActions(toState);
            $scope.$ctrl.tabs = getTabs(toState);

            if (!!toState.data && !!toState.data.intro && !!toState.data.intro.url) {
                $http.get(toState.data.intro.url)
                    .then(function(response) {
                        $scope.$ctrl.intro = window.introJs();
                        var introOptions = response.data;
                        introOptions.nextLabel = '<strong>Próximo</strong>';
                        introOptions.prevLabel = '<strong>Anterior</strong>';
                        introOptions.skipLabel = '<strong>Entendi!</strong>';
                        introOptions.doneLabel = '<strong>Concluir</strong>';
                        $scope.$ctrl.intro.setOptions(introOptions);
                    });
            } else {
                $scope.$ctrl.intro = null;
            }

            $scope.startIntro = function() {
                if (!!self.intro) {
                    self.intro.start();
                }
            };



            if (!!toState.data.aside &&
                (toState.data.aside.display === "false" || toState.data.aside.display == false)) {
                $scope.$ctrl.displayAside = false;
            } else {
                $scope.$ctrl.displayAside = true;
            }

            if (!!toState.data.footer &&
                (toState.data.footer.display === "false" || toState.data.footer.display == false)) {
                $scope.$ctrl.displayFooter = false;
            } else {
                $scope.$ctrl.displayFooter = true;
            }

            if (!!toState.data.navbar &&
                (toState.data.navbar.display === "false" || toState.data.navbar.display == false)) {
                $scope.$ctrl.displayNavbar = false;
            } else {
                $scope.$ctrl.displayNavbar = true;
            }


            if (!!toState.data.cockpit &&
                (toState.data.cockpit.display === "false" || toState.data.cockpit.display == false)) {
                $scope.$ctrl.displayCockpit = false;
            } else {
                $scope.$ctrl.displayCockpit = true;
            }

        });

        $scope.$on('gxApp.feedback', function(event, message) {
            var toaterMessage = {};
            toaterMessage.type = !message.type ? 'info' : message.type;
            toaterMessage.title = !message.title ? 'Mensagem do sistema' : message.title;
            toaterMessage.body = message.body;
            toaster.pop(toaterMessage);
        })

        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            smoothScroll($element[0]);
        });

        $scope.$on('gxApp.disableTab', function(event, id) {
            disableTab(id);
        });

        $scope.$on('gxApp.enableTab', function(event, id) {
            enableTab(id);
        });

        $scope.$on('gxApp.resetTabs', function(event) {
            resetTabs();
        });

        self.$onInit = function() {
            $('body').find('gx-app').removeClass('hide');
            $('body').find('.gx-app-init').addClass('hide');
        }
    }

    function gxAppService($rootScope) {

        var service = {};

        service.showMessage = function(message) {
            showMessage($rootScope, message);
        };

        service.showInfo = function(message, title) {
            showInfo($rootScope, message, title);
        };

        service.showSuccess = function(message, title) {
            showSuccess($rootScope, message, title)
        };

        service.showWarning = function(message, title) {
            showWarning($rootScope, message, title)
        };

        service.showError = function(message, title) {
            showError($rootScope, message, title)
        };

        service.disableTab = function(id) {
            $rootScope.$broadcast("gxApp.disableTab", id);
        };

        service.enableTab = function(id) {
            $rootScope.$broadcast("gxApp.enableTab", id);
        };

        service.resetTabs = function() {
            $rootScope.$broadcast("gxApp.resetTabs");
        };

        service.getLastState = function() {
            return $rootScope.session.lastState;
        };

        return service;
    }

    function gxAppRun(state, stateParams) {

    }

    var gxAppDependencies = [
        'gux.config',
        'ui.router',
        'ui.router.stateHelper',
        'angular-intro',
        'angular-loading-bar',
        'gux.tooltip',
        'toaster',
        'ngMaterial',
        'angularScreenfull',
        'smoothScroll'
    ];

    var gxAppComponent = {
        templateUrl: 'views/gx-app.html',
        transclude: {
            'navbarRight': '?li'
        },
        bindings: {
            name: '@',
            gxVersion: '@',
            showAside: '@',
            showFooter: '@',
            showHeader: '@'
        },
        controller: [
            'GX_STATE_CONFIG',
            '$rootScope',
            '$scope',
            '$http',
            '$state',
            'toaster',
            'smoothScroll',
            '$element',
            '$timeout',
            '$mdSidenav',
            '$log',
            gxAppController
        ]
    };

    angular
        .module('gux.app', gxAppDependencies)
        .config(['$provide', 'cfpLoadingBarProvider', '$locationProvider', 'GX_STATE_CONFIG', 'stateHelperProvider', '$mdThemingProvider', gxAppConfig])
        .factory('gxAppService', ['$rootScope', gxAppService])
        .component('gxApp', gxAppComponent)
        .run(['$state', '$stateParams', gxAppRun]);

}(window.$, window.angular));