'use strict';
angular.module('tink.modal', [])
  .provider('$modal', function() {
    var defaults = this.defaults = {
      element:null,
    };

    var openInstance = null;

     this.$get = function($http,$q,$rootScope,$templateCache,$compile,$animate,$window,$controller,$injector) {
      var bodyElement = angular.element($window.document.body);
      var htmlElement = $('html');

        var $modal = {};
        var options = $modal.$options = angular.extend({}, defaults);
        var linker;

        //for fetching the template that exist
        var fetchPromises = {};
        function fetchTemplate(template) {
          if(fetchPromises[template]) {return fetchPromises[template];}
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
          $modal.$element = linker(options.scope, function() {});
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
                leaveModal(null).then(function(){
                  modalResultDeferred.resolve(result);
                });
              },
              dismiss: function (reason) {
                leaveModal(null).then(function(){
                  modalResultDeferred.reject(reason);
                });
              }
            };

            var resolveIter = 1;

            //config variable
            config = angular.extend({}, defaults, config);
            config.resolve = config.resolve || {};
            var templateAndResolvePromise;
            if(angular.isDefined(config.templateUrl)){
              templateAndResolvePromise = $q.all([fetchTemplate(config.templateUrl)].concat(fetchResolvePromises(config.resolve)));
            }else{
              templateAndResolvePromise = $q.all([config.template].concat(fetchResolvePromises(config.resolve)));
            }

            //Wacht op de template en de resloved variable


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
              });
            });

              return modalInstance;
          };

        function createModalWindow(content){
          var modelView = angular.element('<div class="modal" tabindex="-1" role="dialog">'+
            '<div class="modal-dialog">'+
              '<div class="modal-content">'+
              '</div>'+
            '</div>'+
          '</div>');
          modelView.find('.modal-content').html(content);
          return modelView;
        }

        function enterModal(model,instance){

          function show(){
            var linker = $compile(createModalWindow(instance.content));
            var content = linker(instance.scope, function() {});
            model.$element = content;
            $(htmlElement).addClass('has-open-modal');
            bodyElement.bind('keyup',function(e){
              instance.scope.$apply(function(){
                if(e.which === 27){
                  model.dismiss('esc');
                }
              });
            });

            model.$element.bind('click',function(e){
              var view = $(this);
              instance.scope.$apply(function(){
                if(e.target === view.get(0)){
                  model.dismiss('backdrop');
                }
              });
            });

            $animate.enter(content, bodyElement, null);
            openInstance = {element:content,scope:instance.scope};
          }

          if(openInstance !== null){
            leaveModal(openInstance).then(function(){
              show();
            });
          }else{
            show();
          }
        }

        function leaveModal(modal){
          bodyElement.unbind('keyup');
          var q = $q.defer();
          if(modal === null){
            modal = openInstance;
          }
          $(htmlElement).removeClass('has-open-modal');
          $animate.leave(modal.element).then(function() {
            openInstance = null;
            q.resolve('ended');
          });
          return q.promise;
        }
        return $modal;
     };
  })
  .directive('tinkModal',[function(){
    return{
      restrict:'A',
      scope:true;
      link:function(scope,attr,element){
        if(!attr.tinkModalTemplate){
          return;
        }

        element.bind('click',function(){
          scope.$apply(function(){
            openModal(attr.tinkModalTemplate);
          });
        });

        var fetchPromises = {};
        //to retrieve a template;
        function haalTemplateOp(template) {
          // --- if the template already is in our app cache return it. //
          if (fetchPromises[template]){
            return fetchPromises[template];
          }
          // --- If not get the template from templatecache or http. //
          return (fetchPromises[template] = $q.when($templateCache.get(template) || $http.get(template))
            .then(function (res) {
              // --- When the template is retrieved return it. //
              if (angular.isObject(res)) {
                $templateCache.put(template, res.data);
                return res.data;
              }
              return res;
            }));
        }

        var theTemplate = null;
        function openModal(){
          theTemplate = haalTemplateOp(attrs.tinkPopoverTemplate);
        }


      }
    };
  }])