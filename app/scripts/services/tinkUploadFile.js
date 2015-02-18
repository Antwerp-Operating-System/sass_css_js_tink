'use strict';
angular.module('tink.dropupload')
.factory('uploudFile',['$q','$upload',function($q,$upload) {
    var upload = null;
    // instantiate our initial object
    var uploudFile = function(data,uploaded) {
        if(!data instanceof File){
            throw "uploadFile was no file object!";
        }
        this.fileData = data;
        this.fileName = this.fileData.name;
        this.fileType = this.fileData.type;
        this.fileSize = this.fileData.size;
        console.log(this.fileData)

        if(uploaded){
            this.progress = 100;
        }else{
            this.progress = 0;
        }
    };


    uploudFile.prototype.getFileName = function() {
        return this.fileName;
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
    }


    uploudFile.prototype.upload = function(){
        var scope = this;
        var promise = $q.defer();
        upload = $upload.upload({
            url: 'http://localhost:3000/upload',
            fields: {'username':'vincent'},
            file: this.fileData
        }).progress(function (evt) {console.log(evt)
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            if(isNaN(progressPercentage)){
                progressPercentage = 0;
            }
            scope.progress = progressPercentage;
            promise.notify({progress:progressPercentage,object:scope});
            //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
        }).success(function (data, status, headers, config) {
            promise.resolve(scope);
        }).error(function(reject){
            promise.reject(scope);
        });
        return promise.promise;
    }

    return uploudFile;


}])