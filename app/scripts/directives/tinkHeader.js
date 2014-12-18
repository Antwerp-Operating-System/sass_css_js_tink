  'use strict';
  angular.module('tink.header', []);
  angular.module('tink.header')
  .provider('tinkApi', function () {
  var _options = {};

  return {
    setOptions: function (options) {
      angular.extend(_options, options);
    },
    getOptions: function () {
      return angular.copy(_options);
    },
    $get: ['$window', function ($window) {
      console.log($window)
      if($window.tinkApi){
        return $window.tinkApi;
      }
      
    }]
  };
}).directive('navHeader',['$document','$window','tinkApi',function($document,$window,tinkApi){

   return {
    restrict:'AE',
    priority:99,
    link:function(scope,elem){
     var changeHeight = function(){
      var height = elem[0].clientHeight;
      angular.element($document[0].body).css({ 'padding-top': height+'px' });
    };
    var toggle = angular.element(elem[0].querySelector('li.toggle'))
      angular.element(toggle[0].querySelector('a'))[0].href = 'javascript:void(0)';
     
      toggle.bind("click", function(){
        tinkApi.sideNavigation().toggleMenu();
        console.log("go go")
      });
    changeHeight();
    angular.element($window).bind('resize',changeHeight);

  }
};
}]);