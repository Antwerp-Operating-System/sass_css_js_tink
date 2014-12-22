 'use strict';
 angular.module('tink.sideNav', []);
 angular.module('tink.sideNav')
  .directive('tinkNavAside',['tinkApi',function(tinkApi){
   return {
    restrict:'AE',
    link:function(scope,elem,attr){
    	
    	var opts= {};
    	if(attr.accordion){
    		opts.accordion = (attr.accordion === 'true');
    	}
    	if(attr.accordionFirst){
    		opts.gotoPage = (attr.accordionFirst === 'true');
    	}
    	console.log(opts)
    	tinkApi.sideNavigation.init(opts);
  	}
};
}]);