'use strict';

/**
 * @ngdoc function
 * @name frameworkApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the frameworkApp
 */
angular.module('frameworkApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
