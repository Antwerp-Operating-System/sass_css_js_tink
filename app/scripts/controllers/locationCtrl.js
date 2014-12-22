'use strict';

/**
 * @ngdoc function
 * @name tinkApp.controller:DocsCtrl
 * @description
 * # DocsCtrl
 * Controller of the tinkApp
 */
 angular.module('tinkFramework.controllers')
 .controller('LocationCtrl',['$scope','$routeParams',function ($scope, $routeParams) {

  // --- Define Controller Variables. ----------------- //
  var page = '';
  var subpage = '';

  // --- Define Scope Variables. ---------------------- //
  $scope.subview = '';

  // --- Bind To Scope Events. ------------------------ //

  // --- Define Controller Methods. ------------------- //
  function initialize() {

    // Check for subpage
    if ($routeParams.subpage !== undefined) {
      subpage = $routeParams.subpage;
      page = $routeParams.page;

      // Check for subsubpage
      if ($routeParams.subpage !== undefined) {
        subpage = $routeParams.subpage;console.log("d")
        $scope.subview = 'views/' + page + '-' + subpage + '.html';
      } else {
        $scope.subview = 'views/main.html';console.log("dd")
      }
    }
  }

  // --- Define Scope Methods. ------------------------ //

  // --- Initialize. ---------------------------------- //
  initialize();

 }]);
