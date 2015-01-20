'use strict';

/**
 * @ngdoc function
 * @name tinkApp.controller:DocsCtrl
 * @description
 * # DocsCtrl
 * Controller of the tinkApp
 */
angular.module('tinkFramework.controllers')
  .controller('MainCtrl',['$scope','$timeout',function (scope,$timeout) {
  scope.selectedDate = '2014-12-01';
  scope.dates= {last:null,first:new Date(2014, 0, 31)};
  scope.time = null;
  scope.group1 = false;
  scope.group2 = true;
  scope.startopen = false;
  scope.togle= {group1:false};

  var timeout;
  scope.group1go = function(action,actie){
    console.log(action,timeout);
    if(action ==='loading'){
      timeout = $timeout(actie,3000);
    }else if(action === 'canceld'){
      $timeout.cancel(timeout);
    }
  };

  scope.call = function(){
    scope.togle.group1 = !scope.togle.group1;
    scope.startopen = !scope.startopen;
  };

  scope.group2go = function(action){
    console.log(action);
  };

  scope.group3go = function(action){
    console.log(action);
  };

  scope.group4go = function(action){
    console.log(action);
  };

  scope.go = function(){
  	console.log(scope.time);
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
