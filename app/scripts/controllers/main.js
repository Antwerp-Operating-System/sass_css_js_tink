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
scope.mindate = new Date(2014,1,27);
scope.maxdate = new Date(2014,2,20);
scope.rek='92012023338';
  scope.go = function(){
  	console.log(scope.dates);
  };
scope.file=null;
  scope.getDate = function(){
    console.log(scope.file)
    console.log(scope.userForm.single.$error);
    console.log(scope.userForm);
  };

  scope.submitForm = function() {
    console.log(scope.userForm.dubbel);
  };
}]);
