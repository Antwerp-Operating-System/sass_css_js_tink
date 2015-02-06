'use strict';

/**
 * @ngdoc function
 * @name tinkApp.controller:DocsCtrl
 * @description
 * # DocsCtrl
 * Controller of the tinkApp
 */
angular.module('tinkFramework.controllers')
  .controller('MainCtrl',['$scope',function (scope) {

  scope.dates= {last:new Date(2015,0,2),first:new Date()};
scope.signup={username:'11.11.11-111.1'};
scope.mindate = new Date();
scope.maxdate = new Date(2016,2,20);
  scope.go = function(){
  	console.log(scope.dates);
  };

  scope.getDate = function(){
    console.log(scope.userForm.single.$error);
    console.log(scope.userForm);
  };

  scope.submitForm = function() {
    console.log(scope.userForm.dubbel);
  };
}]);
