'use strict';
angular.module('tink.accordion', []);
angular.module('tink.accordion')
.directive('tinkAccordion',['tinkApi',function (tinkApi) {
  return {
    scope:{

    },
    template: '<div class="panel-group" ng-transclude></div>',


  // browser window scroll (in pixels) after which the "back to top" link is shown
  var offset = 300,
    //browser window scroll (in pixels) after which the "back to top" link opacity is reduced
    offset_opacity = 1200,
    //duration of the top scrolling animation (in ms)
    scroll_top_duration = 700,
    //grab the "back to top" link
    $back_to_top = $('.back-to-top');

  //hide or show the "back to top" link
  $(window).scroll(function(){
    ( $(this).scrollTop() > offset ) ? $back_to_top.addClass('btn-is-visible') : $back_to_top.removeClass('btn-is-visible btn-fade-out');
    if( $(this).scrollTop() > offset_opacity ) {
      $back_to_top.addClass('btn-fade-out');
    }
  });

  //smooth scroll to top
  $back_to_top.on('click', function(event){
    event.preventDefault();
    $('body,html').animate({
      scrollTop: 0 ,
      }, scroll_top_duration
    );
  });




    }
  };
}])

// Original js code:
// 'use strict';
// angular.module('tink.accordion', []);
// angular.module('tink.accordion')
// .directive('tinkAccordion',['tinkApi',function (tinkApi) {
//   return {
//     restrict:'EA',
//     controller:'TinkAccordionController',
//     transclude: true,
//     replace: false,
//     scope:{
//       startOpen:'=',
//       oneAtATime:'='
//     },
//     template: '<div class="panel-group" ng-transclude></div>',
//     link:function(scope,element, attrs, accordionCtrl){
//       var options = {};
//       angular.forEach(['oneAtATime','startOpen'], function(key) {
//         if(angular.isDefined(attrs[key])) {
//           if(typeof scope[key] === 'boolean'){
//             options[key] = scope[key];
//           }else{
//             options[key] = attrs[key] === 'true';
//           }
//         }
//       });
//       var accordionElem = tinkApi.accordion(element);
//       accordionCtrl.init(accordionElem,element,options);
//     }
//   };
// }])
