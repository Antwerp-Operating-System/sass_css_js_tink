'use strict';
angular.module('tink.datepicker', [])
.directive('tinkDatepicker',['$q','$templateCache','$http','$compile','dateCalculator','calView','safeApply',function($q,$templateCache,$http,$compile,dateCalculator,calView,safeApply) {
  return {
    restrict:'EA',
    require:['ngModel','?^form'],
    replace:true,
    scope:{
      ngModel:'='
    },
    template:'<div><tink-format-input ng-model="ngModel" placeholder="dd/mm/jjjj" format="00/00/0000"></tink-format-input></div>',
    link:function(scope,element,attr,ctrl){



    }
  };
}]);