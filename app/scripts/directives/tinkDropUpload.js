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
              elem.bind("dragenter", dragenter);
              elem.bind("dragover", dragover);
              elem.bind("drop", drop);
              elem.bind("click",onClickElem)
            }

            function dragenter(e){
              e.stopPropagation();
              e.preventDefault();
            }

            function onClickElem(){

            }

            function dragover(e){
              e.stopPropagation();
              e.preventDefault();
            }

            function drop(e){
              e.stopPropagation();
              e.preventDefault();
              //get the event
              var dt = e.originalEvent.dataTransfer;
              var files = dt.files;

              for (var i = 0; i < files.length; i += 1) {
                var $file = files[i];
                var file_obj = {
                  name:$file.name,
                  size:$file.size,
                  type:$file.type,
                  lastModified:$file.date
                }
              }
            }

            scope.browseFiles = function(){
               var dropzone = elem.find('.fileInput');
              dropzone.click();
            }
            scope.onFileSelect = function(){
              console.log("fileselect")
            }

            addLisener();

          }
        }
      }
    }
  }]);