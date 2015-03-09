'use strict';
angular.module('tink.dropupload')
.factory('UploadFile',['$q','tinkUploadService',function($q,tinkUploadService) {
    var upload = null;
    // instantiate our initial object
    var uploudFile = function(data,uploaded) {
        if(!data instanceof window.File){
            throw 'uploadFile was no file object!';
        }
        this.fileData = data;
        if(this.fileData){
            this.fileName = this.fileData.name;
            this.fileType = this.fileData.type;
            this.fileSize = this.fileData.size;
        }


        if(uploaded){
            this.progress = 100;
        }else{
            this.progress = 0;
        }
    };


    uploudFile.prototype.getFileName = function() {
        return this.fileName;
    };

    uploudFile.prototype.getData = function() {
        return this.fileData;
    };

    uploudFile.prototype.getProgress = function() {
        return this.progress;
    };

    uploudFile.prototype.getFileSize = function() {
        return this.fileSize;
    };

    uploudFile.prototype.getFileExtension = function() {
        var posLastDot = this.getFileName().lastIndexOf('.');
        return this.getFileName().substring(posLastDot, this.getFileName().length);
    };

    uploudFile.prototype.getFileMimeType = function() {
        return this.fileType;
    };

    uploudFile.prototype.cancel = function(){
        if(upload !== null){
            upload.abort();
        }
    };


    uploudFile.prototype.upload = function(options){
        var scope = this;
        var promise = $q.defer();
        upload = tinkUploadService.upload(this,options);
        upload.then(
            function success() {
                scope.progress=100;
                promise.resolve(scope);
            },
            function fail(){
                scope.progress=0;
                promise.reject(scope);
            },
            function notify(evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                if(isNaN(progressPercentage)){
                    progressPercentage = 0;
                }
                scope.progress = progressPercentage;
                promise.notify({progress:progressPercentage,object:scope});
            });
        return promise.promise;
    };

     uploudFile.prototype.remove = function(){
        tinkUploadService.remove(this);
     };

    return uploudFile;


}]);