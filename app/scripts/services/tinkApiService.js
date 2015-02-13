 'use strict';
 angular.module('tink.tinkApi', []);
 angular.module('tink.tinkApi')
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
       var sideToggle = {};

      return {
        sideNavigation: $window.tinkApi.sideNavigation,
        sideNavToggle:{
          register:function(id,sideElem){
            sideToggle[id]=sideElem;
          },
          toggleById:function(id){
            if(sideToggle[id]){
              sideToggle[id].toggleMenu();
            }
          },
          closeById:function(id){
            if(sideToggle[id]){
              sideToggle[id].closeMenu();
            }
          },
          openById:function(id){
            if(sideToggle[id]){
              sideToggle[id].openMenu();
            }
          }
        },
        topNavigation:$window.tinkApi.topNavigation,
        accordion:$window.tinkApi.accordion

      };

    }]
  };
});