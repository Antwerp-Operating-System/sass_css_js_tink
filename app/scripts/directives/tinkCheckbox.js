'use strict';
angular.module('tink.accordion', []);
angular.module('tink.accordion')
.directive('tinkCheckboxList',[function () {
  return {
    restrict:'AE',
    controller:'TinkAccordionController',
    transclude: true,
    replace: false,
    scope:{
      ngModel:'=',
      oneAtATime:'='
    },
    template: '<div class="accordion" ng-transclude></div>',
    link:function(scope,element, attrs, accordionCtrl){
      console.log(element);
    }
  };
}])
.controller('TinkCheckboxController', [function () {
  var self = this;

  this.groups = {};

  this.init = function(accordion,element,opts){
   self.$accordion = accordion;
   self.$options = opts;
   self.$accordion.init(element);
 };

}]);
