'use strict';
angular.module('tink.accordion', []);
angular.module('tink.accordion')
.directive('tinkCheckboxList',['$compile',function ($compile) {
  return {
    restrict:'A',
    controller:'TinkCheckboxController',
    replace: false,
    scope:{
      ngModel:'='
    },
    link:function(scope,element, attrs, checkboxCtrl){
      checkboxCtrl.init(scope,attrs.ngModel);

    
    
    if(scope.ngModel instanceof Array){
      var template = $compile(checkboxCtrl.teken(scope.ngModel))(scope);
      //$(template).find('input[type=checkbox]').bind('change')
      element.replaceWith(template); 
    }else{
      console.warn('you have to give a array of objects check the docs !');
    }
  }
}
}])
.controller('TinkCheckboxController', ['$scope','$filter',function (scope,$filter) {
  var self = this;

  this.groups = {};
  var config={};

  this.init = function(scope,modelName){
    config.scope = scope;
    config.scope.checkboxSelect = {};
    config.ngmodelN = 'ngModel';
    config.scope.$watch('ngModel',function(newVal,oldVal){
      console.log(newVal,oldVal);
    },true);
  }
  scope.secretIndeterminate = {};
  function checkFunc(array,secretIndet){
    array.forEach(function (element, index, array) {
      var obj = element;
      if(obj && obj.childs && obj.childs instanceof Array && obj.childs.length > 0){
        if(obj.selected === true){
          allValueChange(obj.childs,true);
          scope.secretIndet[id] = false;
        }else{
          //config.element.find('input[name='+obj.id+']').prop('indeterminate',true);
          scope.secretIndet[id] = true;
          checkFunc(obj.childs);
        }        
      }
    });
    return {array:array,secretIndet:secretIndet};
  }

  function allValueChange(arr,val){
    arr.forEach(function (element, index, array) {
      element.selected = val;
      if(obj && obj.childs && obj.childs instanceof Array && obj.childs.length > 0){
        allValueChange(obj.childs,val);
      }
    });
  }

  function checkIfoneTrue(arr){

    arr.forEach(function (element, index, array) {
      element.selected = val;
      if(obj && obj.childs && obj.childs instanceof Array && obj.childs.length > 0){
        allValueChange(obj.childs,val);
      }
    });
  }

  function doWeird(arr,parent){
    if(parent === undefined){
      parent = '';
    }else{
      parent += '.childs';
    };
    var length = 0;
    arr.forEach(function (element, index, array) {
      element.selected = val;
      if(obj && obj.childs && obj.childs instanceof Array && obj.childs.length > 0){
        console.log(doWeird(arr,parent));
      }
      length++;
    });
    console.log(arr.length === length)
    return arr.length === length;
  }

  scope.checkboxChange = function(id){
    var id = '5';
   $scope.users = $filter('filter')(config.scope, function( obj ){
      if ( obj._id !== old._id ){ return obj; } else { return false; }
    });

  }

  function createCheckbox (name,text,checked,parent){
    if(checked === true){
      checked = 'checked';
    }else{
      checked = '';
    }
    var label = '<div class="checkbox">'+
                  '<input type="checkbox" indeterminate="secretIndeterminate.'+name+'" ng-change="checkboxChange(\'id'+name+'\')" ng-model="'+config.ngmodelN+''+parent+'.selected" name="'+name+'" id="'+name+'" '+checked+'>'+
                  '<label for="'+name+'">'+text+'</label>'+
                '</div>';
    return label;
  }
  

  this.teken = function(arr,parent){
    if(parent === undefined){
      parent = '';
    }else{
      parent += '.childs';
    };
    var aantal = 0;
    var str = '<ul>';
    arr.forEach(function (element, index, array) {
        var obj = element;
        var subparent = parent + '['+aantal+']';
        str += '<li>';
        str += createCheckbox(obj.id,obj.name,obj.selected,subparent);

        if(obj && obj.childs && obj.childs instanceof Array && obj.childs.length > 0){
          str += self.teken(obj.childs,subparent);
        }
        str += '</li>';
        aantal++;
    });
    str += '</ul>';
    return str;
  }

}]);
