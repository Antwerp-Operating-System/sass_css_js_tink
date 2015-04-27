'use strict';
angular.module('tink.checkbox', []);
angular.module('tink.checkbox')
.directive('tinkCheckboxList',[function () {
  return {
    restrict:'A',
    controller:'TinkCheckboxController',
    replace: false,
    scope:{
      ngModel:'=',
      checked:'='
    },
    link:function(scope,element, attrs, checkboxCtrl){
      var elementHulp;
      scope.$watch('ngModel',function(){
        checkboxCtrl.init(scope,attrs.ngModel);
        if(scope.ngModel instanceof Array){
          elementHulp = checkboxCtrl.createTemplate(scope.ngModel);
          element.replaceWith(elementHulp);
          element = elementHulp;
        }else{
          console.warn('you have to give a array of objects check the docs !');
        }
      },true);

      function unique(list) {
          var result = [];
          $.each(list, function(i, e) {
              if ($.inArray(e, result) == -1) result.push(e);
          });
          return result;
      }

    scope.$watch('checked',function(newD,oldD){
      var uniqueT = unique(newD);
      if(uniqueT.length !== newD.length){
        scope.checked = uniqueT;
        return;
      }

      var added = $(newD).not(oldD).get();
      var removed = $(oldD).not(newD).get();
      console.log(added);

      added.forEach(function (element) {console.log( scope.secretSelected)
        scope.secretSelected['id'+element] = true;
        scope.checkboxChange('id'+element);
      });

      removed.forEach(function (element) {console.log( scope.secretSelected)
        var obj = scope.findTheParent(scope.ngModel,'id'+element);
        if(obj.obj){
          if(!(obj.obj.children && obj.obj.children.length >0)){
            scope.secretSelected['id'+element] = false;
            scope.checkboxChange('id'+element,obj);
          } 
        }   
      });

    },true)
  }
};
}])
.controller('TinkCheckboxController', ['$scope','$filter','$compile',function (scope,$filter,$compile) {
  var self = this;

  this.groups = {};
  var config={};

  this.init = function(scope){
    //get the scope from the start is not needed
    config.scope = scope;
    //create private scope variables to handle the dom
    config.scope.checkboxSelect = {};
    config.scope.secretIndeterminate = {};
    config.scope.secretSelected = {};

    if(scope.checked === null || scope.checked === undefined || !scope.checked instanceof Array ){
      scope.checked = [];
    }


    /*Map all the data to the scope.
    * only use the selected variable.
    */
    self.mapArray(config.scope.ngModel,config.scope.secretSelected);

    //get all the elements that has no parent
    var children = objectToWatch(config.scope.ngModel).watch;
    //Loop trough this elements and give them the selected state of the data
    children.forEach(function (element) {
      config.scope.secretSelected['id'+element.id] = element.selected;
    });

    //get alle the elements that has children
    var parents = objectToWatch(config.scope.ngModel).parents;
    /*Check every parent element if their children are selected or not
    * We do this to see if the parent needs thave cheched or inderterminate status.
    */
    parents.reverse().forEach(function (element) {
      checkState(element);
    });
  };

  /*
  * Function to map every slected property to a map object.
  */
  this.mapArray = function(arr,map){
    //Loop trough the array
    arr.forEach(function (element) {
      //rename element
      var obj = element;
      //set the selected value and rename the id so it is always a valid id.
      map['id'+obj.id] = obj.selected;
      //If the object has children go trough.
      if(obj && obj.children && obj.children instanceof Array && obj.children.length > 0){
        //Loop trough the children of the object.
        self.mapArray(obj.children,map);
      }
    });
  };


  /*
  * Function to loop trough every array and set the selected value to a given boolean.
  * This function differs from allValueChange because this function does it on the scope.
  */
  function changeCheckValue(arr,value){
    //Loop trough the array of objects
    arr.forEach(function (element) {
      //set de inderteminate to false
      config.scope.secretIndeterminate['id'+element.id] = false;
      //set the proper value on the scope
      config.scope.secretSelected['id'+element.id] = value;
      var obj = element;
      //If the object has children go further.
      if(obj && obj.children && obj.children instanceof Array && obj.children.length > 0){
      //Loop trough the children of the object.
        changeCheckValue(obj.children,value);
      }
    });
  }

  /*
  *
  */
  function countValues(arr){
    var values = {checked:0,indeterminate:0};
    arr.forEach(function (element) {
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

  /*
  *
  */
  function resetValue(id){
    config.scope.secretSelected[id] = false;
    config.scope.secretIndeterminate[id] = false;
  }

  /*
  *
  */
  scope.$watch('secretIndeterminate',function(newI){
    for (var id in newI) {
      if(newI[id]){
        $(self.element).find('input[name='+id+']').attr('checked',false);
        config.scope.secretSelected[id] = false;
        //config.scope.secretIndeterminate[id] = false;
      }
      $(self.element).find('input[name='+id+']').prop('indeterminate', newI[id]);

    }
  },true);

  scope.$watch('secretSelected',function(newI){
    for (var id in newI) {
      var Did = id.substr(2,id.length);
        var index = scope.checked.indexOf(Did);
        if(newI[id]){
          if(index === -1){
            scope.checked.push(Did);
          }
        }else{
          if(index !== -1){
            scope.checked.splice(index,1);
          }
        }
      }
  },true);

  function checkState(selected){
    if(selected && selected.children && selected.children.length >0){
      var counts = countValues(selected.children);
      var safeID = 'id'+selected.id;

      resetValue(safeID);
      if(counts.all){
        config.scope.secretSelected[safeID] = true;
      }else if(counts.checked > 0 || counts.indeterminate > 0){
        config.scope.secretIndeterminate[safeID] = true;
      }
    }
  }

  function objectToWatch(arr){
    var found = {watch:[],parents:[]};
    arr.forEach(function (element) {
      var obj = element;
      var myChild = null;
      if(obj && obj.children && obj.children instanceof Array && obj.children.length > 0){
        found.parents.push(obj);
        myChild = objectToWatch(obj.children);
        found.watch = found.watch.concat(myChild.watch);
        found.parents = found.parents.concat(myChild.parents);
      }else{
        found.watch.push(obj);
      }
    });
    return found;
  }

  scope.checkboxChange = function(id,obj){
    var selected;
    if(obj !== null && obj !== undefined){
      selected = obj;
    }else{
      selected = scope.findTheParent(config.scope.ngModel,id);
    } 
    var valueSelected = config.scope.secretSelected[id];
    config.scope.secretIndeterminate[id] = false;
    if(selected.obj.children){
      changeCheckValue(selected.obj.children,valueSelected);
    }
    if(selected.newd){
      selected.newd.forEach(function (element) {
        checkState(element);
      });
    }else{
      checkState(selected.obj);
    }
  };

  scope.findTheParent = function(arr,id){
    var found = false;
    arr.forEach(function (element) {
      if(found === false || found === undefined){
        var obj = element;
        var safeId = 'id'+obj.id;
        var isMyChild;
        if(safeId === id){
          found = {go:true,obj:obj};
          return true;
        }else{
          if(obj && obj.children && obj.children instanceof Array && obj.children.length > 0){
            isMyChild = scope.findTheParent(obj.children,id);
          }
        }
        if(isMyChild !== false && typeof isMyChild === 'object' && isMyChild.go){
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

  function createCheckbox (name,text,checked){
    if(checked === true){
      checked = 'checked';
    }else{
      checked = '';
    }
    var label = '<div class="checkbox">'+
                  '<input type="checkbox" ng-class="{indeterminate:secretIndeterminate.id'+name+'}"  ng-model="secretSelected.id'+name+'" name="id'+name+'" id="id'+name+'" '+checked+'>'+
                  '<label for="id'+name+'">'+text+'-'+name+'</label>'+
                '</div>';
    return label;
  }
  this.element = null;
  this.createTemplate = function(arr){
    var template = self.teken(arr);
    this.element = $compile(template)(scope);
    //doTheChanges();
    return this.element;
  };

  this.teken = function(arr,parent){
    if(parent === undefined){
      parent = '';
    }else{
      parent += '.children';
    }
    var aantal = 0;
    var str = '<ul class="checkbox-intermediate">';
    arr.forEach(function (element) {
        var obj = element;
        var subparent = parent + '['+aantal+']';
        str += '<li>';
        str += createCheckbox(obj.id,obj.name,obj.selected,subparent);

        if(obj && obj.children && obj.children instanceof Array && obj.children.length > 0){
          str += self.teken(obj.children,subparent);
        }
        str += '</li>';
        aantal++;
    });
    str += '</ul>';
    return str;
  };

}]);
