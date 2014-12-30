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
  scope.dates= {last:new Date(2014,12,30),first:null};

  scope.go = function(){
  	console.log(scope.dates);
  }
}]);
