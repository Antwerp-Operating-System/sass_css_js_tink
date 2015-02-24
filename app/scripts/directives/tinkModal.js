'use strict';
angular.module('tink.modal', [])
  .directive('tinkModal',['$modal',function($modal){
    return{
      restrict:'EA',
      link:function(scope,element){
        var modal = $modal({scope:scope,element:element});
        scope.$hide = function(){
          modal.hide();
        }
      }
    }
  }])
  .provider('$modal', function() {
    var defaults = this.defaults = {
      template:'templates/tinkModal.html',
      element:null,
    };

     this.$get = function($http,$templateCache,$compile,$animate,$window) {
      var bodyElement = angular.element($window.document.body);
      function ModalFactory(config){
        var $modal = {};
        var options = $modal.$options = angular.extend({}, defaults, config);
        var linker;

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
          linker = $compile(template);
          $modal.show()
        });

        $modal.show = function() {
          $modal.$element = linker(options.scope, function(clonedElement, scope) {});
          enterModal();
        };

        $modal.hide = function() {
          leaveModal();
        };

        function enterModal(){
          $animate.enter($modal.$element, bodyElement, null);
        }
        function leaveModal(){
          $animate.leave($modal.$element, null);
        }
        return $modal;
      }
      return ModalFactory;
     }
  });