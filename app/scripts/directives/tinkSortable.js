'use strict';
angular.module('tink.sortable', ['ngLodash']);
angular.module('tink.sortable')
.directive('tinkSortable',[function(){
  return{
    restrict:'E',
    templateUrl:'templates/tinkTable.html',
    scope:{
      data:'=?',
      headers:'=?',
    },
    link:function(scope){

      scope.data = [{name:'vincent',lastname:'bouillart',adress:'doleegstraat 27'},{name:'jef',lastname:'bouillart',adress:'doleegstraat 27'},{name:'valerie',lastname:'bouillart',adress:'doleegstraat 27'},{name:'robert',lastname:'bouillart',adress:'doleegstraat 27'},{name:'vincent',lastname:'bouillart',adress:'doleegstraat 27'}];
      scope.headers = [{name:'Voornaam',checked:true},{lastname:'Achternaam',checked:false},{adress:'Adres',checked:true}];
      scope.viewer = angular.copy(scope.headers);
      function setHeader(table,keys){
        var header = table.createTHead();
        var row = header.insertRow(0);

        for(var i=0;i<keys.length;i++){
          if(keys[i].checked){
            var key = Object.keys(keys[i])[0];
            var val = keys[i][key];

            var cell = row.insertCell(row.cells.length);
            cell.innerHTML = val;
          }
        }
      }
      function setBody(table,content){
        var body = table.createTBody();
        for(var j=0;j<content.length;j++){
           var row = body.insertRow(j);
          for(var i=0;i<scope.headers.length;i++){
            if(scope.headers[i].checked){
              var key = Object.keys(scope.headers[i])[0];
              var val = content[j][key];
              var cell = row.insertCell(body.length+1);
              cell.innerHTML = val;
            }
          }
        }
      }

      scope.buildTable = function(){
        var table = document.createElement('table');
        setHeader(table,scope.headers);
        setBody(table,scope.data);
        $('table').replaceWith($(table));
      };

      scope.selected = -1;

      scope.omhoog = function(){
        if(scope.selected > 0){
          scope.viewer.swap(scope.selected,scope.selected-1);
          scope.selected-=1;
          scope.buildTable();
        }
      };

      scope.omlaag = function(){
        if(scope.selected >=0 && scope.selected < scope.viewer.length-1){
          scope.viewer.swap(scope.selected,scope.selected+1);
          scope.selected+=1;
          scope.buildTable();
        }
      };

      Array.prototype.swap = function(a, b) {
        var temp = this[a];
        this[a] = this[b];
        this[b] = temp;
      };

      scope.buildTable();

      scope.select=function(e,index){
        scope.selected = index;
        e.preventDefault();
        e.stopPropagation();
      };

      scope.save = function(){
        scope.headers = angular.copy(scope.viewer);
        scope.buildTable();
      };

      scope.cancel  = function(){
        scope.selected = -1;
        scope.viewer = angular.copy(scope.headers);
      };

    }
  };
}]).filter('myLimitTo', [function(){
    return function(obj, limit){
        var keys = Object.keys(obj);
        if(keys.length < 1){
            return [];
        }

        var ret = {},
        count = 0;
        angular.forEach(keys, function(key){
           if(count >= limit){
                return false;
            }
            ret[key] = obj[key];
            count++;
        });
        return ret;
    };
}]);


