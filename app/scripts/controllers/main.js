'use strict';

/**
 * @ngdoc function
 * @name tinkApp.controller:DocsCtrl
 * @description
 * # DocsCtrl
 * Controller of the tinkApp
 */
angular.module('tinkFramework.controllers')
  .controller('MainCtrl',['$scope','tinkUploadService',function (scope,tinkUploadService) {

  scope.dates= {last:new Date(2015,0,2),first:new Date()};
scope.signup={username:'11.11.11-111.1'};
scope.mindate = new Date(2014,1,27);
scope.maxdate = new Date(2014,2,20);
scope.rek='92012023338';
  scope.go = function(){
  	console.log(scope.dates);
  };
scope.file=null;
  scope.getDate = function(){
    console.log(scope.file);
    console.log(scope.userForm.single.$error);
    console.log(scope.userForm);
  };

tinkUploadService.addUrls('http://localhost:3000/upload');
//scope.valid={mimeTypes:['image/jpeg', 'image/png', 'image/pjpeg', 'image/gif'],extensions:['.jpg', '.png', '.gif']};
scope.extraOptions = {date:{isPrivate:true},formName:'lalaForm'};

  scope.submitForm = function() {
    console.log(scope.userForm.dubbel);
  };
}]);
