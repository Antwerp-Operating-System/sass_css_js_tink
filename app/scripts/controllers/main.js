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
  scope.dates= {last:null,first:new Date(2014, 0, 31)};

  scope.go = function(){
  	console.log(scope.dates);
  };


 scope.mytime = new Date();

  scope.hstep = 1;
  scope.mstep = 15;

  scope.options = {
    hstep: [1, 2, 3],
    mstep: [1, 5, 10, 15, 25, 30]
  };

  scope.ismeridian = true;
  scope.toggleMode = function() {
    scope.ismeridian = ! scope.ismeridian;
  };

  scope.update = function() {
    var d = new Date();
    d.setHours( 14 );
    d.setMinutes( 0 );
    scope.mytime = d;
  };

  scope.changed = function () {
    console.log('Time changed to: ' + scope.mytime);
  };

  scope.clear = function() {
    scope.mytime = null;
  };

}]);
