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

      var options = {};
      angular.forEach(['autoSelect'], function(key) {
        if(angular.isDefined(attr[key])) {
          if(typeof scope[key] === 'boolean'){
            options[key] = scope[key];
          }else{
            options[key] = attr[key] === 'true';
          }
        }
      });

      var sideNav = tinkApi.sideNavigation(elem);
      sideNav.init(options);
      if(attr.toggleId){
        tinkApi.sideNavToggle.register(attr.toggleId,sideNav);
      }
    }
};
}]);