'use strict';

/**
 * @ngdoc function
 * @name tinkApp.controller:NavCtrl
 * @description
 * # NavCtrl
 * Controller of the tinkApp
 */
angular.module('tink.controllers')
  .controller('NavCtrl', function ($scope, $location) {

    $scope.isActive = function(route) {
      return route === $location.path();
    };

  });
