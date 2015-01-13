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
      var obj = angular.extend({}, attrs.$attr);
      console.log(obj,attrs)
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
      onclick:'=?'
    },
    link: function(scope, element, attrs, accordionCtrl,transclude) {
      var states = {closed:1,open:2,loading:0};
      var state = states.closed;
      var onFunc = typeof scope.onclick === 'function';
      if(!onFunc){
        element.addClass("no-call-back");
      }
      accordionCtrl.addGroup(scope,element);
      scope.toggleOpen = function(){
        if(state === states.closed){
          if(onFunc){
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
        state = states.loading;
       scope.callback('loading',function(){
          if(state === states.loading){
            scope.stateOpen();
          }
        });
        accordionCtrl.openGroup(element,scope);
      }

      scope.stateOpen = function(){
        state = states.open;
        accordionCtrl.openGroup(element,scope);
        scope.callback('open');
      }

      scope.stateClose = function(){
        state = states.closed;
        accordionCtrl.closeGroup(element);
        scope.callback('closed');
      }

      scope.cancelTrans = function(){
        state = states.closed;
        accordionCtrl.closeGroup(element);
        scope.callback('canceld');
      }

      scope.callback = function(type,fn){
        if(onFunc){
          scope.onclick(type,fn);
        }
      }

    }
  };
})
.controller('TinkAccordionController', ['$scope', function (scope) {
  var self = this;

  this.groups = {};
  console.log("newnew")

  this.init = function(accordion,element,opts){
     self.$accordion = accordion;
     self.$accordion.init(element);
  }

  var currentOpen;
  this.addGroup = function(scope,elem){
    self.$accordion.addGroup(elem);
  }

  this.addLoader = function(elem){
    currentOpen = elem;
    self.$accordion.addLoader(elem);
  }

  this.openGroup = function(elem,scope){
    if(currentOpen && currentOpen !== scope){
      currentOpen.toggleOpen();
    }
    currentOpen = scope;
    self.$accordion.openGroup(elem);
  }

  this.closeGroup = function(elem){
    self.$accordion.closeGroup(elem);
    currentOpen = null;
    //this.toggleGroup(elem);
  }

  this.toggleGroup = function(elem){
    self.$accordion.handleAccordion(elem);
  }



}])