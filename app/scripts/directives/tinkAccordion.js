'use strict';
angular.module('tink.accordion', []);
angular.module('tink.accordion')
.directive('tinkAccordion',['tinkApi',function (tinkApi) {
  return {
    restrict:'EA',
    controller:'TinkAccordionController',
    transclude: true,
    replace: false,
    template: '<div class="panel-group" ng-transclude></div>',
    link:function(scope,element, attrs, accordionCtrl){
      var accordionElem = tinkApi.accordion(element);
      accordionCtrl.init(accordionElem,element);
    }
  };
}])
.directive('tinkAccordionGroup', function() {
  return {
    require:'^tinkAccordion',         // We need this directive to be inside an accordion
    restrict:'EA',
    transclude:true,              // It transcludes the contents of the directive into the template
    replace: true,                // The element containing the directive will be replaced with the template
    templateUrl:'templates/tinkAccordionGroup.html',
    scope: {
      heading: '@',               // Interpolate the heading attribute onto this scope
      isOpen: '=?',
      isDisabled: '=?'
    },
    link: function(scope, element, attrs, accordionCtrl) {
      accordionCtrl.addGroup(element);
      scope.toggleOpen = function(){
        accordionCtrl.toggleGroup(element);
      }
    }
  };
})
.controller('TinkAccordionController', ['$scope', function (scope) {
  var self = this;

  this.init = function(accordion,element){
     self.$accordion = accordion;
     self.$accordion.init(element);
  }

  this.addGroup = function(elem){
    self.$accordion.addGroup(elem);
  }

  this.openGroup = function(elem){
    self.$accordion.openGroup(elem);
  }

  this.closeGroup = function(elem){
    self.$accordion.closeGroup(elem);
  }

  this.toggleGroup = function(elem){
    self.$accordion.handleAccordion(elem);
  }



}])