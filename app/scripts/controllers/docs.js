'use strict';

/**
 * @ngdoc function
 * @name tinkApp.controller:DocsCtrl
 * @description
 * # DocsCtrl
 * Controller of the tinkApp
 */
 angular.module('tink.controllers')
 .controller('DocsCtrl', function ($scope, $routeParams) {

  // --- Define Controller Variables. ----------------- //
  var subpage = '';
  var subsubpage = '';

  // --- Define Scope Variables. ---------------------- //
  $scope.subview = '';

  // --- Bind To Scope Events. ------------------------ //

  // --- Define Controller Methods. ------------------- //
  function initialize() {

    // Check for subpage
    if ($routeParams.subpage !== undefined) {
      subpage = $routeParams.subpage;

      // Check for subsubpage
      if ($routeParams.subsubpage !== undefined) {
        subsubpage = $routeParams.subsubpage;
        $scope.subview = 'views/docs-' + subpage + '-' + subsubpage + '.html';
      } else {
        $scope.subview = 'views/docs-' + subpage + '.html';
      }
    }
  }

  // --- Define Scope Methods. ------------------------ //

  // --- Initialize. ---------------------------------- //
  initialize();

 });
