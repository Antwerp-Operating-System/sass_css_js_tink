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
  scope.selectedDate = '2014-12-01';
  scope.dates= {last:null,first:null};
scope.signup={};
  scope.go = function(){
    console.log(signup_form.name.$valid)
  	console.log(scope.dates,scope.signup);
  };

  scope.submitForm = function() {
console.log(scope.userForm.name)

    };
}]);
