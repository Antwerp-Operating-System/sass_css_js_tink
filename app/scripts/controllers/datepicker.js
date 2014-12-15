'use strict';

/**
 * @ngdoc function
 * @name tinkApp.controller:DocsCtrl
 * @description
 * # DocsCtrl
 * Controller of the tinkApp
 */
angular.module('tink.controllers')
  .controller('DateCtrl',['$scope',function (scope) {
    scope.dates= {last:'',first:''};
    scope.clickF= function(){
      console.log(scope.dates);
    };
    scope.tmlTooltip = '<div>binde tis ds <p>fdf</p></div>';

  }]);
