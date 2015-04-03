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
      //$(template).find('input[type=checkbox]').bind('change')
      element.replaceWith(checkboxCtrl.createTemplate(scope.ngModel)); 
    }else{
      console.warn('you have to give a array of objects check the docs !');
    }
  }
}
}])
.controller('TinkCheckboxController', ['$scope','$filter','$compile',function (scope,$filter,$compile) {
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
      config.scope.secretIndeterminate['id'+element.id] = false;
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

  function countValues(arr){
    var values = {checked:0,indeterminate:0};
    arr.forEach(function (element, index, array) {
      var safeId = 'id'+element.id;
      var inder = config.scope.secretIndeterminate[safeId];
      var check = config.scope.secretSelected[safeId];
      if(inder){
        values.indeterminate++;
      }else if(check){
        values.checked++;
      }
    });
    values.all = (values.checked === arr.length);
    return values;
  }

  function resetValue(id){
    config.scope.secretSelected[id] = false;
    config.scope.secretIndeterminate[id] = false;
  }

  scope.$watch('secretIndeterminate',function(newI,oldI){
    for (var id in newI) { 
      if(newI[id]){
        $(self.element).find('input[name='+id+']').attr("checked",false);
      }    
      $(self.element).find('input[name='+id+']').prop("indeterminate", newI[id]);
    }
  },true);

  function checkState(selected){
    if(selected && selected.childs){
      var counts = countValues(selected.childs);
      var safeID = 'id'+selected.id;
      resetValue(safeID);
      if(counts.all){
        config.scope.secretSelected[safeID] = true;
      }else if(counts.checked > 0 || counts.indeterminate > 0){
        config.scope.secretIndeterminate[safeID] = true;
      }
    }
  }



  scope.checkboxChange = function(id){
    //config.scope.secretIndeterminate[id] = false;
    var selected = findTheParent(config.scope.ngModel,id);
    var valueSelected = config.scope.secretSelected[id];
    if(selected.obj.childs){
      changeCheckValue(selected.obj.childs,valueSelected);
    }
    if(selected.newd){
      selected.newd.forEach(function (element, index, array) {
        checkState(element);
      });
    }else{
      checkState(selected.obj);
    }
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
          found = {parent:obj,obj:isMyChild.obj,newd:[]};
          found.newd.push(obj);
          isMyChild.go = false;
        }else{
          if(isMyChild && isMyChild.newd){
            isMyChild.newd.push(obj);
          }
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
                  '<input type="checkbox" ng-class="{indeterminate:secretIndeterminate.id'+name+'}" ng-change="checkboxChange(\'id'+name+'\')" ng-model="secretSelected.id'+name+'" name="id'+name+'" id="id'+name+'" '+checked+'>'+
                  '<label for="id'+name+'">'+text+'</label>'+
                '</div>';
    return label;
  }
  this.element = null;
  this.createTemplate = function(arr){
    var template = self.teken(arr);
    this.element = $compile(template)(scope);
    //doTheChanges();
    return this.element;
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
