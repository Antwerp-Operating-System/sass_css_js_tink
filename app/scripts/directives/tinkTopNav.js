  'use strict';
  angular.module('tink.topNav', []);
  angular.module('tink.topNav')
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
       var navigationOptions = {};

      return {
        sideNavigation: {
          options:function(options){
            navigationOptions = options;
          },
          init: function(options){
            navigationOptions = options;
            $window.tinkApi.sideNavigation(navigationOptions);
          },
          toggleMenu: function(){
            $window.tinkApi.sideNavigation(navigationOptions).toggleMenu();
          }
        }
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
     
      toggle.bind("click", function(){
       tinkApi.sideNavigation.toggleMenu();
        return false;
      });

    changeHeight();
    angular.element($window).bind('resize',changeHeight);

  }
};
}]);