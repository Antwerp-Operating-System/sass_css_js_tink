'use strict';
angular.module('tink.backtotop', [])
  .directive('tinkBackToTop',[function(){
    return{
      restrict:'EA',
      scope:{},
      link:function(scope,element,attrs){

      jQuery(document).ready(function($){ //browser window scroll (in pixels) after which the "back to top" link is shown
        var offset = 300, //browser window scroll (in pixels) after which the "back to top" link opacity is reduced
          offset_opacity = 1200,
          scroll_top_duration = 200, //duration of the top scrolling animation (in ms)
          $back_to_top = element; //grab the "back to top" link

        $(window).scroll(function(){ //hide or show the "back to top" link
          ( $(this).scrollTop() > offset ) ? $back_to_top.addClass('btn-is-visible') : $back_to_top.removeClass('btn-is-visible btn-fade-out');
          // disabled this function because we're going to use an animation instead
          // if( $(this).scrollTop() > offset_opacity ) {
          //   $back_to_top.addClass('btn-fade-out');
          // }
        });

        $back_to_top.on('click', function(event){ //smooth scroll to top
          event.preventDefault();
          $('body,html').animate({
            scrollTop: 0 , //the top = 0
            }, scroll_top_duration
          );
        });
      })
      }
    }
  }]);
