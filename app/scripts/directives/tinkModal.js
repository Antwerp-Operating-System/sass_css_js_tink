'use strict';
angular.module('tink.modal', [])
  .directive('tinkModa',['$modal',function($modal){
    return{
      restrict:'EA',
      link:function(scope,element){
       // var modal = $modal({scope:scope,element:element});
        /*scope.$hide = function(){
          modal.hide();
        }*/
      }
    }
  }])
  .provider('$modal', function() {
    var defaults = this.defaults = {
      template:'templates/tinkModal.html',
      element:null,
    };

    var openInstance = null;

     this.$get = function($http,$q,$rootScope,$templateCache,$compile,$animate,$window,$controller) {
      var bodyElement = angular.element($window.document.body);

        var $modal = {};
        var options = $modal.$options = angular.extend({}, defaults);
        var linker;

        //for fetching the template that exist
        var fetchPromises = {};
        function fetchTemplate(template) {
          if(fetchPromises[template]) return fetchPromises[template];
          return (fetchPromises[template] = $http.get(template, {cache: $templateCache}).then(function(res) {
            return res.data;
          }));
        }

        function fetchResolvePromises(resolves) {
          var promisesArr = [];
          angular.forEach(resolves, function (value) {
            if (angular.isFunction(value) || angular.isArray(value)) {
              promisesArr.push($q.when($injector.invoke(value)));
            }
          });
          return promisesArr;
        }

        /*$modal.$promise = fetchTemplate(options.template);

        //when the templated is loaded start everyting
        $modal.$promise.then(function(template) {
          linker = $compile(template);
          //$modal.show()
        });*/

        $modal.show = function() {
          $modal.$element = linker(options.scope, function(clonedElement, scope) {});
          enterModal();
        };

        $modal.hide = function() {
          leaveModal();
        };

        $modal.open = function(config){

          //create the promises for opening and result
          var modalResultDeferred = $q.defer();
          var modalOpenedDeferred = $q.defer();

          //Create an instance for the modal
          var modalInstance = {
              result: modalResultDeferred.promise,
              opened: modalOpenedDeferred.promise,
              close: function (result) {
                leaveModal(null,result).then(function(){
                  modalResultDeferred.resolve(result);
                });
              },
              dismiss: function (reason) {
                modalResultDeferred.reject(reason);
              }
            };

            var scopeInstance = {};
            var resolveIter = 1;

            //config variable
            config = angular.extend({}, defaults, config);
            config.resolve = config.resolve || {};

            //Wacht op de template en de resloved variable
            var templateAndResolvePromise =
              $q.all([fetchTemplate(config.template)].concat(fetchResolvePromises(config.resolve)));

            templateAndResolvePromise.then(function success(tplAndVars){
              //Get the modal scope or create one
              var modalScope = (config.scope || $rootScope).$new();
              //add the close and dismiss to to the scope
              modalScope.$close = modalInstance.close;
              modalScope.$dismiss = modalInstance.dismiss;

              var ctrlInstance,ctrlConstant={};
              ctrlConstant.$scope = modalScope;
              ctrlConstant.$modalInstance = modalScope;
              angular.forEach(config.resolve, function (value, key) {
                  ctrlConstant[key] = tplAndVars[resolveIter++];
              });
              if (config.controller) {
                ctrlInstance = $controller(config.controller, ctrlConstant);
              }

              enterModal(modalInstance,{
                scope:modalScope,
                content: tplAndVars[0],
                windowTemplateUrl: config.template
              })
            })

              return modalInstance;
          }

        function enterModal(model,instance){

          function show(){
            var linker = $compile(instance.content);
            var content = linker(instance.scope, function(clonedElement, scope) {});
            model.$element = content;

            bodyElement.bind('keyup',function(){
              console.log("nice")
            })

            $animate.enter(content, bodyElement, null);
            openInstance = {element:content,scope:instance.scope};
          }

          if(openInstance !== null){
            leaveModal(openInstance).then(function(){
              show();
            })
          }else{
            show();
          }
        }

        function leaveModal(modal,instance){
          bodyElement.unbind('keyup')
          var q = $q.defer();
          if(modal === null){
            modal = openInstance;
          }
          $animate.leave(modal.element).then(function() {
            openInstance = null;
            q.resolve('ended');
          });
          return q.promise;
        }
        return $modal;
     }
  });