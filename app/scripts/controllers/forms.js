'use strict';

/**
 * @ngdoc function
 * @name tinkApp.controller:DocsCtrl
 * @description
 * # DocsCtrl
 * Controller of the tinkApp
 */
angular.module('tinkFramework.controllers')
  .controller('FormsCtrl',['$scope',function (scope) {

  scope.nationalnumber='92012023338';

  // Not so clean code, but hey…
  var checkbox = document.getElementById('checkbox2');
  checkbox.indeterminate = true;
  console.log(checkbox.indeterminate);

}]);
