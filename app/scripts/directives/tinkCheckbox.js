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
      var template = $compile(checkboxCtrl.createTemplate(scope.ngModel))(scope);
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
    config.scope.secretIndeterminate = {};
    config.scope.secretSelected = {};
    config.ngmodelN = 'ngModel';

    self.mapArray(config.scope.ngModel,config.scope.secretSelected);
    console.log(config.scope.secretSelected)

  }
  
  this.mapArray = function(arr,map){
    arr.forEach(function (element, index, array) {
      var obj = element;
      map['id'+obj.id] = obj.selected;
      if(obj && obj.childs && obj.childs instanceof Array && obj.childs.length > 0){

        self.mapArray(obj.childs,map);
      }
    });
  }

  
  function doTheChanges(){
    var copyModel = angular.copy(config.scope.ngModel);
    var cope = angular.copy(config.scope.secretIndeterminate);
    doWeird(copyModel,cope);
    config.scope.ngModel = copyModel;
    config.scope.secretIndeterminate = cope;
  }

  function checkFunc(array,secretIndet){
    array.forEach(function (element, index, array) {
      var obj = element;
      if(obj && obj.childs && obj.childs instanceof Array && obj.childs.length > 0){
        if(obj.selected === true){
          allValueChange(obj.childs,true);
          scope.secretIndet['id'+obj.id] = false;
        }else{
          //config.element.find('input[name='+obj.id+']').prop('indeterminate',true);
          scope.secretIndet['id'+obj.id] = true;
          checkFunc(obj.childs);
        }        
      }
    });
    return {array:array,secretIndet:secretIndet};
  }



  function allValueChange(arr,val){
    arr.forEach(function (element, index, array) {
      element.selected = val;
      var obj = element;
      if(obj && obj.childs && obj.childs instanceof Array && obj.childs.length > 0){
        allValueChange(obj.childs,val);
      }
    });
  }

  function changeCheckValue(arr,value){
    arr.forEach(function (element, index, array) {
      config.scope.secretSelected['id'+element.id] = value;
      var obj = element;
      if(obj && obj.childs && obj.childs instanceof Array && obj.childs.length > 0){
        changeCheckValue(obj.childs,value);
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

  function doWeird(arr,inter,parent){
    if(parent === undefined){
      parent = '';
    }else{
      parent += '.childs';
    };
    var length = 0;
    arr.forEach(function (element, index, array) {
      var obj = element;
      if(obj && obj.childs && obj.childs instanceof Array && obj.childs.length > 0){
        var checked = doWeird(obj.childs,inter,parent);
        inter['id'+obj.id] = false;
        obj.selected = false;
        if( checked === 1){
          obj.selected = true;
        }else if(checked === 0){
          inter['id'+obj.id] = true;
        }else{
          obj.selected = false;
        }
      }
      if(obj.selected){
        length++;
      }      
    });

    if(arr.length === length){
      return 1;
    }else if(length > 0){
      return 0;
    }else{
      return -1;
    }

  }

  scope.checkboxChange = function(id){
    console.log(id);
    var selected = findTheParent(config.scope.ngModel,id);
    var valueSelected = config.scope.secretSelected[id];
    console.log(selected.obj)
    changeCheckValue(selected.obj.childs,valueSelected);
  }

  function findTheParent(arr,id){
    var found = false;
    arr.forEach(function (element, index, array) {
      if(found === false || found === undefined){
        var obj = element;
        var safeId = 'id'+obj.id;
        var isMyChild;
        if(safeId === id){
          found = {go:true,obj:obj};
          return true;
        }else{
          if(obj && obj.childs && obj.childs instanceof Array && obj.childs.length > 0){
            isMyChild = findTheParent(obj.childs,id);
          }
        }
        if(isMyChild !== false && typeof isMyChild === "object" && isMyChild.go){
          found = {parent:obj,obj:isMyChild.obj};
          isMyChild.go = false;
        }else{
          found = isMyChild;
        }
      }else{
        return;
      }
    });
    return found;
  }

  function createCheckbox (name,text,checked,parent){
    if(checked === true){
      checked = 'checked';
    }else{
      checked = '';
    }
    var label = '<div class="checkbox">'+
                  '<input type="checkbox" ng-class="{indeterminate:secretIndeterminate.id'+name+'}" ng-change="checkboxChange(\'id'+name+'\')" ng-model="secretSelected.id'+name+'" name="'+name+'" id="'+name+'" '+checked+'>'+
                  '<label for="'+name+'">'+text+'</label>'+
                '</div>';
    return label;
  }
  
  this.createTemplate = function(arr){

    var template = self.teken(arr);
    doTheChanges();
    return template;
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
