'use strict';
angular.module('tink.dropupload', ['ngLodash']);
angular.module('tink.dropupload')
.directive('tinkUpload', ['$window', 'safeApply','uploudFile','lodash', function($window, safeApply,uploudFile,_) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl:'templates/tinkUpload.html',
      scope:{
        ngModel:'=',
        fieldName: '@?',
        multiple: '=?',
        allowedTypes:'=?',
        maxFileSize:'@?',
        url:'@?'
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
              maxFileSize:'0',
              url:undefined
            }

            //Check the scope variable and change the config variable
            for(var key in config){
              if(scope[key] !== undefined){
                config[key] = scope[key];
              }
            }
            if(config.url){
              tinkUploadService.addUrls(config.url);
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

            function checkFileType(file){

              var mimeType = config.allowedTypes.mimeTypes;
              var extention = config.allowedTypes.extensions;

              var fileType = file.getFileMimeType();
              var fileEx = file.getFileExtension();

              if(!mimeType || !_.isArray(mimeType)) {
                  return true;
              }

              if(!extention || !_.isArray(extention)) {
                  return true;
              }

              if(_.indexOf(mimeType, fileType) > -1){
                if(_.indexOf(extention, fileEx) > -1){
                  return true;
                }else{
                  return true;
                }
              }else{
                return false;
              }


            }

            function checkFileSize(file){
              var fileSize = _.parseInt(file.getFileSize());

              if(!config.maxFileSize){
                return true;
              }
              if(typeof config.maxFileSize === 'number'){
                if(config.maxFileSize === 0 || !(fileSize > config.maxFileSize)){
                  return true;
                }else{
                  return false;
                }
              }else if(typeof config.maxFileSize === 'string'){
                var maxSize = _.parseInt(config.maxFileSize);
                if(maxSize === 0 || !(fileSize > maxSize)){
                  return true;
                }else{
                  return false;
                }
              }else{
                return true;
              }

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