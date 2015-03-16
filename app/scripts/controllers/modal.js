'use strict';

/**
 * @ngdoc function
 * @name tinkApp.controller:DocsCtrl
 * @description
 * # DocsCtrl
 * Controller of the tinkApp
 */
angular.module('tinkFramework.controllers')
  .controller('ModalCtrl',['$scope','tinkUploadService','$modal',function (scope,tinkUploadService,$modal) {

  scope.openModal=function(){
    var modalInstance = $modal.open({
      templateUrl: 'views/modal-template.html',
      // controller: 'ModalInstanceCtrl',
      resolve: {
        items: function () {
          return ['lol'];
        }
      }
    });

    modalInstance.result.then(function (text) {
      console.log(text);
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });
  };

  scope.lose = function(){
    console.log('close called')
  }
  scope.ismissed = function(){
    console.log('dismissed called');
  }
}]);
