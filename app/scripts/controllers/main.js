'use strict';

/**
 * @ngdoc function
 * @name tinkApp.controller:DocsCtrl
 * @description
 * # DocsCtrl
 * Controller of the tinkApp
 */
angular.module('tinkFramework.controllers')
  .controller('MainCtrl',['$scope','$modal',function (scope,$modal) {

scope.dates= {last:new Date(2015,0,2),first:new Date()};
scope.signup={username:'11.11.11-111.1'};
scope.mindate = new Date(2014,1,27);
scope.maxdate = new Date(2014,2,20);
  scope.go = function(){
  	 var modalInstance = $modal.open({
        scope:scope,
        controller:'ModalInstanceCtrl',
        templateUrl:'views/tinkModal.html'
      });

     modalInstance.result.then(function (selectedItem) {
      console.log('closed',selectedItem);
    }, function (reason) {
      console.log('dismised',reason);
    });
  };

  scope.getDate = function(){
    console.log(scope.userForm.single.$error);
    console.log(scope.userForm);
  };

  scope.submitForm = function() {
    console.log(scope.userForm.dubbel);
  };
}]).controller('ModalInstanceCtrl',['$scope','$modalInstance', function ($scope, $modalInstance) {

  $scope.ok = function () {
    console.log("lol")
    $modalInstance.$close({de:'data'});
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);
