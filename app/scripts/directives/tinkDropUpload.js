'use strict';
angular.module('tink.dropupload', []);
angular.module('tink.dropupload')
.directive('tinkUpload', ['$window', 'safeApply', function($window, safeApply) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl:'templates/tinkUpload.html',
      compile: function(template) {
        return {
          pre: function() {
          },
          post: function(scope, elem, attr, ctrl) {

            function addLisener(){
              elem.addEventListener("dragenter", dragenter, false);
              elem.addEventListener("dragover", dragover, false);
              elem.addEventListener("drop", drop, false);
            }

          }
        }
      }
    }
  }]);