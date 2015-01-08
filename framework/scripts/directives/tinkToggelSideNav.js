'use strict';
 angular.module('tink.sideNav')
  .directive('tinkSidenavCollapse',['tinkApi',function(tinkApi){
   return {
    restrict:'A',
    link:function(scope,elem,attr){
      if(!tinkApi.sideNavigation || !tinkApi.sideNavToggle){
        return;
      }
    	elem.bind('click', function(){
        if(attr.tinkSidenavCollapse && attr.tinkSidenavCollapse.trim() !== ''){
          tinkApi.sideNavToggle.toggleById(attr.tinkSidenavCollapse);
          return false;
        }
      });
  	}
};
}]);