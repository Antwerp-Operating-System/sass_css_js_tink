'use strict';
angular.module('tink.dropupload')
.provider('tinkUploadService',['lodash', function (_) {
  var urls = {};
  return {
    $get: function ($upload) {
      return {
        upload: function(file,options){
          if(file.getData() instanceof File){
            var fileMime = file.getFileMimeType();
            var sendUrl = '';
            if(urls[fileMime]){
              sendUrl = urls[fileMime];
            }else{
              if(!urls.all){
                throw 'no All url is set ! in uploadservice';
              }else{
                sendUrl = urls.all;
              }
            }

            var data = angular.extend({}, {url:sendUrl,file: file.getData()}, options);
            return $upload.upload(data);
          }else{
            throw 'No instanceof uploadfile';
          }
        },
        addUrls: function (url,type) {
          if(type === undefined || type === null || type === ''){
            type = 'all';
            urls[type] = url;
          }else{
            if(_.isArray(type)){
              for(var i = 0;i < type.length; i++){
                urls[type[i]] = url;
              }
            }else if(typeof type === 'string'){
              urls[type] = url;
            }
          }
        }
      };
    }
  };
}]);