'use strict';
angular.module('tink.popOver', ['tink.tooltip'])
.directive( 'tinkPopover', ['$q','$templateCache','$http','$compile','$timeout',function ($q,$templateCache,$http,$compile,$timeout) {
  return {
    restrict:'EA',
    compile: function compile( tElement, attrs ) {
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
      if(attrs.tinkPopoverTemplate){
        theTemplate = haalTemplateOp(attrs.tinkPopoverTemplate);
      }

      return {
          pre: function preLink( scope, element, attributes ) {

          },
          post: function postLink( scope, element, attributes ) {
            scope.arrowPlacement = 'arrow-bottom-left';

            element.bind('click',function(){
              scope.$apply(function(){
                var placement = 'top';
                if(theTemplate !== null){
                  theTemplate.then(function(data){
                    var el = $($compile(data)(scope));

                    el.css('position','absolute');
                      el.css('z-index','9999');
                      el.css('visibility','hidden');

                      if(placement === 'top'){
                        el.insertBefore(element);
                      }else{
                        el.insertAfter(element);
                      }

                    $timeout(function(){

                    var arrow = el.find('span.arrow');

                      if(placement === 'bottom' || placement === 'top'){
                        if(placement === 'top'){
                          var top = el.offset().top - el.height()-5;
                           el.css('top',top);
                        }
                        var left = element.offset().left + (element.width()/2)-arrow[0].offsetLeft;
                        el.css('left',left)
                        el.css('visibility','visible');
                      }

                    },1);

                  })
                }
              })
            })

          }
      };
    },
    link:function(scope,element){
      var div  = '<div style="background:red;height:200px;width:200px">ue</div>';
      var el = angular.element(div);
      $( el ).insertAfter(element);
    }
  }

}]);