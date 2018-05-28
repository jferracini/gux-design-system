/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

'use strict';

angular.module('gux.toolbox').controller('GridController', ['$scope', function ($scope) {

    var i;
    $scope.itemsList = {
        items1: [],
        items2: [],
        items3: [],
        items4: [],
        items5: [],
        items6: [],
        items7: [],
        items8: [],
        items9: [],
        items10: [],
        items11: [],
        items12: [],
        items13: [],
        items14: [],
        items15: [],
        items16: [],
        items17: [],
        items18: [],
        items19: []
    };

    for (i = 1; i <= 1; i += 1) {
        $scope.itemsList.items1.push({'Id': i, 'Label': 'Brad Pitt' + i});
    }

    for (i = 0; i <= 5; i += 1) {
        $scope.itemsList.items2.push({'Id': i, 'Label': 'João CCEE_' + i});
    }

    for (i = 0; i <= 5; i += 1) {
        $scope.itemsList.items3.push({'Id': i, 'Label': 'Murilo Finan_' + i});
    }

    for (i = 0; i <= 5; i += 1) {
        $scope.itemsList.items4.push({'Id': i, 'Label': 'Claudio Outro_' + i});
    }

    for (i = 0; i <= 2; i += 1) {
        $scope.itemsList.items5.push({'Id': i, 'Label': 'Maria Col_' + i});
    }
    
    for (i = 0; i <= 1; i += 1) {
        $scope.itemsList.items5.push({'Id': i, 'Label': 'Luciana Col_' + i});
    }
    
    for (i = 0; i <= 1; i += 1) {
        $scope.itemsList.items6.push({'Id': i, 'Label': 'Mario Col_' + i});
    }
    
    for (i = 0; i <= 1; i += 1) {
        $scope.itemsList.items7.push({'Id': i, 'Label': 'Marilia Col_' + i});
    }
    
    for (i = 0; i <= 8; i += 1) {
        $scope.itemsList.items6.push({'Id': i, 'Label': 'Claudio Col_' + i});
    }
    
    for (i = 0; i <= 1; i += 1) {
        $scope.itemsList.items9.push({'Id': i, 'Label': 'Mario Col_' + i});
    }
    
    for (i = 0; i <= 1; i += 1) {
        $scope.itemsList.items10.push({'Id': i, 'Label': 'Joana Col_' + i});
    }
    
    for (i = 0; i <= 1; i += 1) {
        $scope.itemsList.items11.push({'Id': i, 'Label': 'Juliana Col_' + i});
    }
    
    for (i = 0; i <= 1; i += 1) {
        $scope.itemsList.items12.push({'Id': i, 'Label': 'Fabrizio Col_' + i});
    }
    
    for (i = 0; i <= 1; i += 1) {
        $scope.itemsList.items13.push({'Id': i, 'Label': 'Cauê Col_' + i});
    }
    
    for (i = 0; i <= 1; i += 1) {
        $scope.itemsList.items14.push({'Id': i, 'Label': 'Elcio Col_' + i});
    }
    
    for (i = 0; i <= 1; i += 1) {
        $scope.itemsList.items15.push({'Id': i, 'Label': 'Bernadete Col_' + i});
    }
    
    for (i = 0; i <= 1; i += 1) {
        $scope.itemsList.items16.push({'Id': i, 'Label': 'Iracema Col_' + i});
    }
    
    for (i = 0; i <= 1; i += 1) {
        $scope.itemsList.items17.push({'Id': i, 'Label': 'Molina Col_' + i});
    }
    
    for (i = 0; i <= 1; i += 1) {
        $scope.itemsList.items18.push({'Id': i, 'Label': 'Fiameng Col_' + i});
    }
    
    for (i = 0; i <= 1; i += 1) {
        $scope.itemsList.items19.push({'Id': i, 'Label': 'Valdir Col_' + i});
    }

    $scope.sortableOptions = {
        containment: '#grid-container'
    };
}]);