'use strict';
angular.module('tink.dropupload', []);
angular.module('tink.dropupload')
.directive('tinkUpload', ['$window', 'safeApply','uploudFile', function($window, safeApply,uploudFile) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl:'templates/tinkUpload.html',
      scope:{
        ngModel:'=',
        fieldName: '@?',
        multiple: '=?',
        allowedTypes:'=?'
      },
      compile: function(template) {
        return {
          pre: function() {
          },
          post: function(scope, elem, attr, ctrl) {
            var config = {
              multiple:true,
              removeFromServer:true,
              allowedTypes:{mimeTypes:[],extensions:[]},
            }

            //Check the scope variable and change the config variable
            for(var key in config){
              if(scope[key] !== undefined){
                config[key] = scope[key];
              }
            }

            //function to add the liseners
            function addLisener(){
              elem.bind("dragenter", dragenter);
              elem.bind("dragleave", dragleave);
              elem.bind("dragover", dragover);
              elem.bind("drop", drop);
            }
            //Drag enter to add a class
            function dragenter(e){
              e.stopPropagation();
              e.preventDefault();
              elem.addClass('dragenter');
            }
            //Leave drag area to remove the class
            function dragleave(){
              elem.removeClass('dragenter');
            }

            //Drag over prevent default because we do not need it.
            function dragover(e){
              e.stopPropagation();
              e.preventDefault();
            }

              if(scope.ngModel !== undefined){
                scope.ngModel = [];
              }
              if(config.multiple){
                scope.files = [];
              }else{
                scope.files = null;
              }
            //}

            //The file is droped or selected ! same code !
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

                  var typeCheck = checkFileType(file);
                  var sizeCheck = checkFileSize(file);

                  if(typeCheck && sizeCheck){
                    file.upload().then(function(file) {
                      //file is uploaded
                      console.log("success",file)
                      scope.ngModel.push(file);
                    }, function(reason) {
                      //file is not uploaded
                      console.log('fail',reason)
                      if(!file.error){
                        file.error = {};
                      }
                      file.error.fail = true;
                    }, function(update) {
                      //Notification of upload
                      console.log("update",update)
                    });
                  }else{
                    if(!file.error){
                      file.error = {};
                    }
                    if(!typeCheck){
                      file.error.type = true;
                    }
                    if(!sizeCheck){
                      file.error.size = true;
                    }
                  }

                }

              })
            }

            function remove(e){

            }

            function checkFileType(){

            }

            function checkFileSize(){

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