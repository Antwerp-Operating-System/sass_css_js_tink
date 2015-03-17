'use strict';
angular.module('tink.backtotop', [])
  .directive('tinkBackToTop', [function () {
    return {
      restrict: 'EA',
      scope: {
        offset: '@'
      },
      template: '<button class="back-to-top"><span>Terug naar boven</span></button>',
      replace: true,

      link: function(scope, element) {

      jQuery(document).ready(function($) {

        // Options: offset from which button is showed and duration of the scroll animation
        var offset = parseInt(scope.offset) || 300,
          scrollTopDuration = 200;

         // Hide or show the "back to top" link
        $(window).scroll(function () {
          if($(this).scrollTop() > offset) {
            element.addClass('is-visible');
          } else {
            element.removeClass('is-visible btn-fade-out');
          }
        });

        // Scroll to top when the button is clicked
        element.on('click', function(event) {
          event.preventDefault();
          $('body, html').animate({
            scrollTop: 0 ,
          }, scrollTopDuration);
        });
      });
      }
    };
  }]);
