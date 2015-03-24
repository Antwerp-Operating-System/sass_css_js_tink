'use strict';
angular.module('tink.dropupload', ['ngLodash']);
angular.module('tink.dropupload')
.directive('tinkUpload', ['$window', 'safeApply','UploadFile','lodash','tinkUploadService', function($window, safeApply,UploadFile,_,tinkUploadService) {
    return {
      restrict: 'A',
      replace: true,
      transclude: true,
      templateUrl:'templates/tinkUpload.html',
      scope:{
        ngModel:'=',
        fieldName: '@?',
        multiple: '=?',
        allowedTypes:'=?',
        maxFileSize:'@?',
        url:'@?',
        sendOptions:'=?'
      },
      compile: function() {
        return {
          pre: function() {
          },
          post: function(scope, elem) {
            //Config object with default values
            var config = {
              multiple:true,
              removeFromServer:true,
              allowedTypes:{mimeTypes:[],extensions:[]},
              maxFileSize:'0',
              url:undefined,
              options:{}
            };
            //To let the view know we have a message.
            scope.message = {};
            var holding = null;
            //Check the scope variable and change the config variable
            for(var key in config){
              if(scope[key] !== undefined){
                config[key] = scope[key];
              }
            }
            if(config.url){
              tinkUploadService.addUrls(config.url);
            }

            scope.$watchCollection('ngModel',function(newVa){
              var removed = _.difference(scope.files, newVa);
              var added = _.difference(newVa,scope.files);

              angular.forEach(removed,function(value){
                if(value instanceof UploadFile){
                  if(_.indexOf(scope.files, value)!==-1){
                    _.pull(scope.files, value);
                  }
                }
              });

              angular.forEach(added,function(value){
                if(value instanceof UploadFile){
                  if(config.multiple){
                    if(_.indexOf(scope.files, value)===-1){
                      scope.files.unshift(value);
                    }
                  }else{
                    scope.files.length = 0;
                    scope.files.unshift(value);
                  }
                }
              });
              /*if(newVa instanceof Array){
                if(newVa !== ol && newVa.length > ol.length){
                  angular.forEach(newVa,function(value){
                    if(_.indexOf(scope.files, value)===-1){
                      if(value instanceof UploadFile){
                        scope.files.push(value)
                      }else{
                        _.pull(scope.ngModel, value);
                      }
                    }
                  })
                }else if(newVa !== ol && newVa.length < ol.length){
                  angular.forEach(newVa,function(value){
                      if(value instanceof UploadFile){
                        if(_.indexOf(scope.files, value)!==-1){
                           _.pull(scope.files, value);
                        }
                      }
                  })
                }
              }else if(newVa instanceof UploadFile){
                if(_.indexOf(scope.files, newVa)===-1){
                  scope.files = [];
                  scope.files.push(newVa);
                }
              }*/
            },true);

            //function to add the liseners
            function addLisener(){
              elem.bind('dragenter', dragenter);
              elem.bind('dragleave', dragleave);
              elem.bind('dragover', dragover);
              elem.bind('drop', drop);
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
              elem.addClass('dragenter');
            }

            scope.undo = function(){
              if(scope.files[0]){
                scope.files[0].cancel();
                scope.files[0].remove();
                _.pull(scope.ngModel, scope.files[0]);
                //_.pull(scope.files, scope.files[0]);
              }

              holding.hold = false;
              scope.message = {};
              scope.ngModel.length = 0;
              //scope.files.length = 0;
              //scope.files.push(holding);
              scope.ngModel.push(holding);
              holding = null;
            };

            //if the ngModel is not defined we define it for you
            if(scope.ngModel !== undefined){
                scope.ngModel = [];
            }
            //create internal files object for use to handle the view
              scope.files = [];
            //}

            //The file is droped or selected ! same code !
            function drop(e){
              safeApply(scope,function(){
                elem.removeClass('dragenter');
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

                  for (var i = 0; i < files.length; i += 1) {
                    var file = new UploadFile(files[i]);

                    if(!config.multiple){
                      //if there is a file present remove this one from the server !
                      if(scope.files[0] !== null && scope.files[0] instanceof UploadFile){
                        if(!scope.files[0].error){
                          if(holding instanceof UploadFile){
                            holding.cancel();
                            holding.remove();
                            _.pull(scope.ngModel, holding);
                          }
                          scope.message.hold = true;
                          holding = scope.files[0];
                          holding.hold = true;
                        }

                        /*if(config.multiple){
                          scope.ngModel.push(holding);
                        }else{
                          scope.ngModel = holding;
                        }*/
                        //_.pull(scope.files, scope.files[0]);
                      }
                    }
                    if(config.multiple){
                      if(!(scope.ngModel instanceof Array)){
                        scope.ngModel = [];
                      }
                      scope.ngModel.unshift(file);
                    }else{
                      scope.ngModel.length = 0;
                      scope.ngModel.push(file);
                    }

                    //check if the type and size is oke.
                    var typeCheck = checkFileType(file);
                    var sizeCheck = checkFileSize(file);

                    if(typeCheck && sizeCheck){
                      file.upload(scope.sendOptions).then(function() {
                        //file is uploaded
                        //add the uploaded file to the ngModel
                      }, function error(file) {
                          //file is not uploaded
                          if(!file.error){
                            file.error = {};
                          }
                          file.error.fail = true;
                      }, function update() {
                        //Notification of upload
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

              });
            }

            /*function remove(){

            }*/

            scope.del = function(index){
              scope.files[index].cancel();
              scope.files[index].remove();

              if(config.multiple){
                //_.pull(scope.ngModel, scope.files[index]);
              }else{
                scope.ngModel.length = 0;
              }
                _.pull(scope.ngModel, scope.files[index]);
            };

            function checkFileType(file){

              var mimeType = config.allowedTypes.mimeTypes;
              var extention = config.allowedTypes.extensions;

              var fileType = file.getFileMimeType();
              var fileEx = file.getFileExtension();

              if(!mimeType || mimeType.length === 0 || !_.isArray(mimeType)) {
                  return true;
              }

              if(!extention || extention.length === 0 || !_.isArray(extention)) {
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
                if(config.maxFileSize === 0 || fileSize <= config.maxFileSize){
                  return true;
                }else{
                  return false;
                }
              }else if(typeof config.maxFileSize === 'string'){
                var maxSize = _.parseInt(config.maxFileSize);
                if(maxSize === 0 || fileSize <= maxSize){
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
            };
            scope.onFileSelect = function(files){
              drop(files);
            };

            addLisener();

          }
        };
      }
    };
  }]);