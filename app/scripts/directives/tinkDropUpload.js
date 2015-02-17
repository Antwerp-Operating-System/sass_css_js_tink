'use strict';
angular.module('tink.dropupload', []);
angular.module('tink.dropupload')
.directive('tinkUpload', ['$window', 'safeApply','uploudFile', function($window, safeApply,uploudFile) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl:'templates/tinkUpload.html',
      scope:{
        ngModel:'='
      },
      compile: function(template) {
        return {
          pre: function() {
          },
          post: function(scope, elem, attr, ctrl) {
            var config = {
              multiple:true,
              removeFromServer:true
            }

            function addLisener(){
              elem.bind("dragenter", dragenter);
              elem.bind("dragover", dragover);
              elem.bind("change", change);
              elem.bind("drop", drop);
              elem.bind("click",onClickElem)
            }

            function dragenter(e){
              e.stopPropagation();
              e.preventDefault();
            }

            function change(e){
              console.log(e)
            }

            function onClickElem(){

            }

            function dragover(e){
              e.stopPropagation();
              e.preventDefault();
            }

            //if(scope.ngModel !== undefined){

           // }else{
              if(config.multiple){
                scope.files = [];
              }else{
                scope.files = null;
              }
            //}

            function drop(e){
              var files;
              if(e.type && e.type === 'drop'){
                e.stopPropagation();
                e.preventDefault();
                //get the event
                var dt = e.originalEvent.dataTransfer;
                 files = dt.files;
              }else{
                files = e;
              }
              safeApply(scope,function(){
                for (var i = 0; i < files.length; i += 1) {
                  var file = new uploudFile(files[i]);
                  scope.files.push(file);

                  file.upload().then(function(greeting) {
                    console.log("success",greeting)
                    //file is uploaded
                  }, function(reason) {
                    console.log('fail',reason)
                    //file is not uploaded
                  }, function(update) {
                    console.log("update",update)
                    //Notification of upload
                  });

                }

              })
            }

            function remove(e){

            }

            scope.browseFiles = function(){
               var dropzone = elem.find('.fileInput');
              dropzone.click();
            }
            scope.onFileSelect = function(files){
              drop(files);
            }

            addLisener();

          }
        }
      }
    }
  }]);