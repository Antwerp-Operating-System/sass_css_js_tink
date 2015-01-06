 'use strict';
 angular.module('tink.sideNav', []);
 angular.module('tink.sideNav')
  .directive('tinkNavAside',['tinkApi',function(tinkApi){
   return {
    restrict:'AE',
    link:function(scope,elem,attr){
      if(!tinkApi.sideNavigation || !tinkApi.sideNavToggle){
        return;
      }

      var opts= {};
      if(attr.tinkAccordion){
        opts.accordion = (attr.tinkAccordion === 'true');
      }
      if(attr.tinkAccordionFirst){
        opts.gotoPage = (attr.tinkAccordionFirst === 'true');
      }
      var sideNav = tinkApi.sideNavigation(elem);
      sideNav.init(opts);
      if(attr.toggleId){
        tinkApi.sideNavToggle.register(attr.tinkToggleId,sideNav);
      }
    }
};
}]);