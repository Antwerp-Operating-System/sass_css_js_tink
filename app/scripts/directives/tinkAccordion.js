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
      accordionCtrl.init(accordionElem,element,{oneAtTime:true});
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
      isDisabled: '=?',
      load:'=',
      activated:'=?'
    },
    link: function(scope, element, attrs, accordionCtrl,transclude) {
      var states = {closed:1,open:2,loading:0};
      var state = states.closed;
      accordionCtrl.addGroup(scope,element);
      scope.toggleOpen = function(){
        if(state === states.closed){
          if(!scope.load){
            scope.stateLoad();
          }else{
            scope.stateOpen();
          }
        }else if(state === states.open){
          scope.stateClose();
        }else if(state === states.loading){
          scope.cancelTrans();
        }
      }

      scope.stateLoad = function(){
       scope.activated('loading',function(){
          accordionCtrl.loadinOpen(element);
          state = states.open;
        });
        accordionCtrl.addLoader(element);
        state = states.loading;
      }

      scope.stateOpen = function(){
        scope.activated('open');
        state = states.open;
        accordionCtrl.openGroup(element);
      }

      scope.stateClose = function(){
        accordionCtrl.closeGroup(element);
        state = states.closed;
        scope.activated('closed');
      }

      scope.cancelTrans = function(){
        accordionCtrl.closeGroup(element);
        state = states.closed;
        scope.activated('canceld');
      }

    }
  };
})
.controller('TinkAccordionController', ['$scope', function (scope) {
  var self = this;

  var groups = {};

  this.init = function(accordion,element,opts){
     self.$accordion = accordion;
     self.$accordion.init(element);
  }

  var currentOpen;

  this.addGroup = function(scope,elem){
    groups[elem] = scope;
    self.$accordion.addGroup(elem);
  }

  this.addLoader = function(elem){
    currentOpen = elem;
    self.$accordion.addLoader(elem);
  }

  this.openGroup = function(elem){
    if(currentOpen){
      this.closeGroup(elem);
      groups[elem].stateClose();
    }
    currentOpen = elem;
    self.$accordion.openGroup(elem);
  }

  this.loadinOpen = function(elem){
    currentOpen = elem;
    self.$accordion.loadinOpen(elem);
  }

  this.closeGroup = function(elem){
    self.$accordion.closeGroup(elem);
    //this.toggleGroup(elem);
  }

  this.toggleGroup = function(elem){
    self.$accordion.handleAccordion(elem);
  }



}])