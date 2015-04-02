'use strict';
angular.module('tink.accordion', []);
angular.module('tink.accordion')
.directive('tinkCheckboxList',['$compile',function ($compile) {
  return {
    restrict:'A',
    controller:'TinkCheckboxController',
    replace: false,
    link:function(scope,element, attrs, checkboxCtrl){
      scope.ngModel = [
        {
          id:'1',
          name:'Belgie',
          selected:false,
          childs:[
            {
              id:'2',
              name:'Antwerpen',
              selected:true,
            }
          ]
        }
      ];
    
    if(scope.ngModel instanceof Array){
      var template = $compile(checkboxCtrl.teken(scope.ngModel))(scope);
      element.replaceWith(template); 
    }else{
      console.warn('you have to give a array of objects check the docs !');
    }
  }
}
}])
.controller('TinkCheckboxController', ['$scope',function (scope) {
  var self = this;

  this.groups = {};

  function createCheckbox (name,text,checked){
    if(checked === true){
      checked = 'checked';
    }else{
      checked = '';
    }
    var label = '<div class="checkbox">'+
                  '<input type="checkbox" name="'+name+'" id="'+name+'" '+checked+'>'+
                  '<label for="'+name+'">'+text+'</label>'+
                '</div>';
    return label;
  }
  

  this.teken = function(arr){
    var str = '<ul>';
    arr.forEach(function (element, index, array) {
        var obj = element;
        str += '<li>';
        str += createCheckbox(obj.id,obj.name,obj.selected);

        if(obj && obj.childs && obj.childs instanceof Array && obj.childs.length > 0){
          str += self.teken(obj.childs);
        }
        str += '</li>';
    });
    str += '</ul>';
    return str;
  }

}]);
