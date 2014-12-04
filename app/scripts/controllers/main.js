'use strict';

/**
 * @ngdoc function
 * @name tinkApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tinkApp
 */
 angular.module('tink.controllers')
 .controller('MainCtrl', function ($scope, $location, $anchorScroll) {

  $scope.$on('$locationChangeStart', function() {
    $scope.sidenav.open = false;
  });

  $scope.sidenav = {
    open: false
  };

  $scope.scrollTo = function scrollTo(id) {
    $location.hash(id);
    $anchorScroll();
  };

 });
