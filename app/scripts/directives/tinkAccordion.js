'use strict';
angular.module('tink.accordion', []);
angular.module('tink.accordion')
.directive('tinkAccordionGroup',['tinkApi',function (tinkApi) {
  return {
    restrict:'EA',
    controller:'TinkAccordionController',
    transclude: true,
    replace: false,
    scope:{
      startOpen:'=',
      oneAtATime:'='
    },
    template: '<div class="panel-group" ng-transclude></div>',
    link:function(scope,element, attrs, accordionCtrl){
      var options = {};
      angular.forEach(['oneAtATime','startOpen'], function(key) {
        if(angular.isDefined(attrs[key])) {
          if(typeof scope[key] === 'boolean'){
            options[key] = scope[key];
          }else{
            options[key] = attrs[key] === 'true';
          }
        }
      });
      var accordionElem = tinkApi.accordion(element);
      accordionCtrl.init(accordionElem,element,options);
    }
  };
}])
.directive('tinkAccordion', function() {
  return {
    require:'^tinkAccordionGroup',         // We need this directive to be inside an accordion
    restrict:'EA',
    transclude:true,              // It transcludes the contents of the directive into the template
    replace: true,                // The element containing the directive will be replaced with the template
    templateUrl:'templates/tinkAccordionGroup.html',
    scope: {
      heading: '@',               // Interpolate the heading attribute onto this scope
      isOpen: '=?',
      isDisabled: '=?',
      onclick:'=?',
      isCollapsed:'='
    },
    link: function(scope, element, attrs, accordionCtrl) {
     var states = {closed:1,open:2,loading:0};
      var state = states.closed;
      var trackToggle;
      var onFunc = typeof scope.onclick === 'function';
      if(!onFunc){
        element.addClass('no-call-back');
      }

      scope.toggleOpen = function(){
        if(state === states.closed){
          if(onFunc){
            scope.loading();
          }else{
            scope.open();
          }
        }else if(state === states.open){
          scope.close();
        }else if(state === states.loading){
          scope.cancel();
        }
      };


      if(attrs.isCollapsed){
        if(attrs.isCollapsed === 'true' || attrs.isCollapsed === 'false'){
          trackToggle = false;
        }else{
          trackToggle = true;
        }
      }

      if(trackToggle){
        scope.$watch('isCollapsed',function(newVar){
          if(newVar === true){
            stateClose();
          }else if(newVar === false){
            stateOpen();
          }
        });
      }

      scope.open = function(){
        if(trackToggle){
          scope.isCollapsed = false;
        }else{
          stateOpen();
        }
      };

      scope.close = function(){
        if(trackToggle){
          scope.isCollapsed = true;
        }else{
          stateClose();
        }
      };

      scope.loading = function(){
        if(trackToggle){
          scope.isCollapsed = false;
        }else{
          stateLoad();
        }
      };

      scope.cancel = function(){
        if(trackToggle){
          scope.isCollapsed = true;
        }else{
          cancelTrans();
        }
      };

      var stateLoad = function(){
        state = states.loading;
        callback('loading',function(){
          if(state === states.loading){
            stateOpen();
          }
        });
        accordionCtrl.openGroup(element,scope);
      };

      var stateOpen = function(){
        if((!onFunc && state === states.closed)||(onFunc && state === states.loading)){
          state = states.open;
          accordionCtrl.openGroup(element,scope);
          callback('open');
        }else if(onFunc && state === states.closed){
          stateLoad();
        }
      };

      var stateClose = function(){
        if(state === states.open){
          state = states.closed;
          accordionCtrl.closeGroup(element);
          callback('closed');
        }else if(state === states.canceld){
          cancelTrans();
        }

      };

      var cancelTrans = function(){
        state = states.closed;
        accordionCtrl.closeGroup(element);
         callback('canceld');
      };

      var callback = function(type,fn){
        if(onFunc){
          scope.onclick(type,fn);
        }
      };
      accordionCtrl.addGroup(scope,element);
    }
  };
})
.controller('TinkAccordionController', [function () {
  var self = this;

  this.groups = {};

  this.init = function(accordion,element,opts){
   self.$accordion = accordion;
   self.$options = opts;
   self.$accordion.init(element);
 };

 var currentOpen;
 this.addGroup = function(scope,elem){
  self.$accordion.addGroup(elem);
  if(self.$options.startOpen && scope.isCollapsed !== true){
    scope.open();
  }else if(scope.isCollapsed === false){
    scope.open();
  }
};

this.addLoader = function(elem){
  currentOpen = elem;
  self.$accordion.addLoader(elem);
};

this.openGroup = function(elem,scope){
  if(self.$options.oneAtATime && currentOpen && currentOpen !== scope){
    currentOpen.toggleOpen();
  }
  currentOpen = scope;
  self.$accordion.openGroup(elem);
};

this.closeGroup = function(elem){
  self.$accordion.closeGroup(elem);
  currentOpen = null;
};

}]);
