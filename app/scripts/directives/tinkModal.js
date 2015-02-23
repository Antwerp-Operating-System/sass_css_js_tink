'use strict';
angular.module('tink.modal', [])
  .directive('tinkModal',['$modal',function($modal){
    var modal = $modal();
  }])
  .provider('$modal', function() {
    var defaults = this.defaults = {
      template:'templates/tinkModal.html'
    };

     this.$get = function($http,$templateCache,$compile,$rootScope) {
      function ModalFactory(config){
        var $modal = {};
        var options = $modal.$options = angular.extend({}, defaults, config);
        var modalLinker;
        var scope = $modal.$scope = options.scope && options.scope.$new() || $rootScope.$new();
        //for fetching the template that exist
        var fetchPromises = {};
        function fetchTemplate(template) {
          if(fetchPromises[template]) return fetchPromises[template];
          return (fetchPromises[template] = $http.get(template, {cache: $templateCache}).then(function(res) {
            return res.data;
          }));
        }

        $modal.$promise = fetchTemplate(options.template);

        //when the templated is loaded start everyting
        $modal.$promise.then(function(template) {
          console.log(template.data);
          modalLinker = $compile(template);
          $modal.$element = modalLinker(scope, function(clonedElement, scope) {});
        });
        return $modal;
      }
      return ModalFactory;
     }
  });