'use strict';
angular.module('tink.sortable', ['ngLodash']);
angular.module('tink.sortable')
.directive('tinkSortable',['lodash',function(_){
  return{
    restrict:'E',
    templateUrl:'templates/tinkTable.html',
    scope:{
      data:'=?',
      headers:'=?',
    },
    link:function(scope){

      var aantalToShow = 1;
      var pages;

      scope.perPage='10,20,50';
      scope.data = [
        {name:'vincent',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'Valerie',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'Jef',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'robert',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'steven',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'gill',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'Frederic',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'jeroen',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'joris',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'etien',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'richard',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'Yo',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'tinne',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'lora',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'wout',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'astrid',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'jonas',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'yana',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'laura',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'kriste',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'tom',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'leive',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'tomp',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'vdsfds',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'sdfdfsf',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'sef',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'vnbrf',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'azd',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'wcwv',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'vdgfs',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'ruuy',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'uyfh',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:',hgg',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'ezrr',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'trcbn',lastname:'bouillart',adress:'doleegstraat 27'},
        {name:'sdfbv',lastname:'bouillart',adress:'doleegstraat 27'}
      ];
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
          for(var i=scope.headers.length-1;i>=0;i--){
            if(scope.headers[i].checked){
              var key = Object.keys(scope.headers[i])[0];
              var val = content[j][key];
              var cell = row.insertCell(body.length+1);
              cell.innerHTML = val;
            }
          }
        }
      }

      scope.numSelected=0;
      scope.perPageClick = function(index){
        scope.numSelected = index;
        pages = Math.ceil(scope.data.length/aantalToShow);
        scope.pages = _.range(1,pages+1);
        scope.pageSelected=1;
        scope.buildTable();
      };

      scope.pageSelected=1;
      scope.setPage = function(index){
        scope.pageSelected = index+1;
        scope.buildTable();
      };

      scope.perPageView = [];
      function perPage(){
        var per = scope.perPage.split(',');
        for(var i=0;i<per.length;i++){
          var num = _.parseInt(per[i]);
          if(!isNaN(num)){
            scope.perPageView.push(num);
          }
        }
      }
      perPage();

      aantalToShow = scope.perPageView[scope.numSelected];
      pages = Math.ceil(scope.data.length/aantalToShow);
      scope.pages = _.range(1,pages);
      scope.buildTable = function(){
        var table = document.createElement('table');
        setHeader(table,scope.headers);
        aantalToShow = scope.perPageView[scope.numSelected];
        pages = Math.ceil(scope.data.length/aantalToShow);
        scope.pages = _.range(1,pages+1);

        var start = (scope.pageSelected-1)*aantalToShow;
        var stop = (scope.pageSelected *aantalToShow)-1;

        var viewable = _.slice(scope.data, start,stop);
        setBody(table,viewable);
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


