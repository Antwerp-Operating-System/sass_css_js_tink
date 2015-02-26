'use strict';
angular.module('tink.popOver', ['tink.tooltip'])
.directive( 'tinkPopover', ['$q','$templateCache','$http','$compile','$timeout','$window',function ($q,$templateCache,$http,$compile,$timeout,$window) {
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
                var placement = 'bottom';
                var align = 'left';
                var trigger = 'click';
                var spacing = 2;

                function arrowCal(placement,align){
                  var arrowCss = 'arrow-'
                  switch(placement){
                    case 'left':
                      arrowCss = arrowCss + 'right';
                      break;
                    case 'right':
                      arrowCss = arrowCss + 'left';
                      break;
                    case 'top':
                      arrowCss = arrowCss + 'bottom';
                      break;
                    case 'bottom':
                      arrowCss = arrowCss + 'top';
                      break;
                  }

                  switch(align){
                    case 'center':
                      break;
                    case 'top':
                    case 'bottom':
                      if(placement === 'right' || placement === 'left'){
                        arrowCss = arrowCss + '-' + align;
                      }
                      break;
                    case 'left':
                    case 'right':
                      if(placement === 'top' || placement === 'bottom'){
                        arrowCss = arrowCss + '-' + align;
                      }
                  }
                  scope.arrowPlacement = arrowCss;
                }

                var isOpen = null;
                if(trigger === 'click'){
                  element.bind('click',function(){
                    scope.$apply(function(){
                      if(isOpen === null){
                        show();
                      }else{
                        hide();
                      }

                    })
                  })
                }else if(trigger === 'hover'){
                   element.bind('mouseenter',function(){
                    show();
                   });
                   element.bind('mouseleave',function(){
                    hide();
                   });
                }



              function show (){
                if(theTemplate !== null){
                  theTemplate.then(function(data){
                    if(isOpen === null){
                      var el = $($compile(data)(scope));
                      el.css('position','absolute');
                      el.css('visibility','hidden');
                      if(placement === 'top'){
                        el.insertBefore(element);
                      }else{
                        el.insertAfter(element);
                      }
                      setPos(el,placement,align,spacing);

                      isOpen = el;
                    }
                  })
                }
              }

              var timeoutResize = null;
              angular.element($window).bind('resize', function() {
                if(isOpen!== null){
                  $timeout.cancel( timeoutResize);
                  timeoutResize = $timeout(function(){
                    setPos(isOpen,placement,align,spacing);
                    resizeBuzzy = 0;
                  },100);
                }
              });

              function hide(){
                if(isOpen !== null){
                  isOpen.remove();
                  isOpen = null;
                }
              }
              function inViewPort(el,top,left){
                var win = $(window);
                var viewport = {
                  top : win.scrollTop(),
                  left : win.scrollLeft()
                };
                viewport.right = viewport.left + win.width();
                viewport.bottom = viewport.top + win.height();

                var bounds = el.offset();
                  bounds.right = left + el.outerWidth();
                  bounds.bottom = top + el.outerHeight();

                  return (viewport.right > bounds.right && left  > 0);
              }
              arrowCal(placement,align);
            //The function that will be called to position the tooltip;
            function setPos(el,placement,align,spacing){console.log('setpos')
              $timeout(function(){
                var arrow = el.find('span.arrow');

                var alignLeft = 0;
                if(align === 'center'){
                  alignLeft = (el.outerWidth(true) / 2)-(element.outerWidth(true)/2);
                }

                var left = element.offset().left - alignLeft;
                var top = null;
                  if(placement === 'top'){
                    top = element.offset().top - el.outerHeight(true)-arrow[0].offsetHeight - spacing;
                  }else if(placement === 'bottom'){
                    top = element.offset().top + element.outerHeight() + spacing;
                  }else if(placement === 'right'){
                    left = element.offset().left + element.outerWidth(true) + spacing;
                  }else if(placement === 'left'){
                    left = element.offset().left - el.outerWidth(true)- arrow.outerWidth(true) - spacing;
                  }

                  if(placement === 'right' || placement === 'left'){
                    top = element.offset().top - (arrow.offset().top - el.offset().top) - (arrow[0].offsetHeight/2) + (element.outerHeight()/2) ;
                  }

                  if(false && !inViewPort(el,top,left)){
                    arrowCal('bottom','center');
                    setPos(el,'bottom','center',spacing);
                  }else{
                    el.css('top',top);
                    el.css('left',left);
                    el.css('visibility','visible');
                  }
              },50);
            }

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