'use strict';

/**
 * @ngdoc function
 * @name frameworkApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the frameworkApp
 */
angular.module('frameworkApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
