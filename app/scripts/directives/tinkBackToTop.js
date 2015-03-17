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
        var offset = 300,
          scrollTopDuration = 200;

        // var offset = (scope.offset !== undefined || parseInt(scope.offset) !== isNaN()) ? parseInt(scope.offset) : 300;
        if(scope.offset !== undefined || parseInt(scope.offset) !== isNaN()) {
          offset = parseInt(scope.offset);
        }

        // Hide or show the "back to top" link
        function checkVisibility(checkThis) {
          if(checkThis.scrollTop() >= offset) {
            element.addClass('is-visible');
          } else {
            element.removeClass('is-visible');
          }
        }

        // Do this on load
        function initialize() {
          checkVisibility($(element));
        }

        // Re-evaluate whether button should be shown or not
        $(window).scroll(function () {
          if(offset !== 0) {
            checkVisibility($(this));
          }
        });

        // Scroll to top when the button is clicked
        element.on('click', function(event) {
          event.preventDefault();
          $('body, html').animate({
            scrollTop: 0 ,
          }, scrollTopDuration);
        });

        initialize();
      });
      }
    };
  }]);
