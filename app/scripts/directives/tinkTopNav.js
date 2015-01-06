  'use strict';
  angular.module('tink.topNav', []);
  angular.module('tink.topNav')
  .directive('navHeader',['$document','$window','tinkApi',function($document,$window,tinkApi){

   return {
    restrict:'AE',
    priority:99,
    link:function(scope,elem){
      if(!tinkApi.sideNavigation || !tinkApi.sideNavToggle){
        return;
      }

      tinkApi.topNavigation(elem).init();
  }
};
}]);