'use strict';
angular.module('tink.sortable', ['ngLodash']);
angular.module('tink.sortable')
.directive('tinkSortable',['lodash','$compile',function(_,$compile){
  return{
    restrict:'E',
    templateUrl:'templates/tinkTable.html',
    scope:{
      data:'=?',
      headers:'=?',
      actions:'=?'
    },
    link:function(scope){

      var aantalToShow = 1;
      var pages;
      var viewable;

      //Preview PAGES
      scope.perPage='10,20,50';
      //Preview DATA
      scope.data = [
        {name:'vincent',lastname:'bouillart',adress:1235},
        {name:'Valerie',lastname:'bouillart',adress:61242},
        {name:'Jef',lastname:'bouillart',adress:5746},
        {name:'robert',lastname:'bouillart',adress:'zaeaz 27'},
        {name:'steven',lastname:'bouillart',adress:'azdqdc 27'},
        {name:'gill',lastname:'bouillart',adress:'bnfdk 27'},
        {name:'Frederic',lastname:'bouillart',adress:'cldlddl 27'},
        {name:'jeroen',lastname:'bouillart',adress:'qlqlqlq 27'},
        {name:'joris',lastname:'bouillart',adress:'slslsls 27'},
        {name:'etien',lastname:'bouillart',adress:'lojkk 27'},
        {name:'richard',lastname:'bouillart',adress:'vidd,, 27'},
        {name:'Yo',lastname:'bouillart',adress:'yorefd27'},
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
        {name:'sdfbv',lastname:'bouillart',adress:{test:'o'}}
      ];
      //which sorting is happening
      scope.sorting = {field:'',direction:1};
      //preview headers
      scope.headers = [{field:'name',alias:'Voornaam',checked:true},{field:'lastname',checked:false},{field:'adress',visible:true,checked:true}];
      //this is a copy to show to the view
      scope.viewer = angular.copy(scope.headers);

      //function that runs at the beginning to handle the headers.
      function handleHeaders(){
        angular.forEach(scope.viewer,function(value){
          if(!angular.isDefined(value.alias) || value.alias === null){
            value.alias = value.field;
          }
          if(!angular.isDefined(value.visible) || value.visible === null){
            value.visible = true;
          }
        });
      }
      handleHeaders();
      //This function creates our table head
      function setHeader(table,keys){
        var header = table.createTHead();
        var row = header.insertRow(0);

        if(typeof scope.actions === 'function'){
          var check = row.insertCell(0);
          check.innerHTML = createCheckbox(-1);
        }

        for(var i=0;i<keys.length;i++){
          if(keys[i].checked && keys[i].visible){
            var key = Object.keys(keys[i])[0];
            var val = keys[i][key];

            var cell = row.insertCell(row.cells.length);
            $(cell).bind('click',sorte(i));
            cell.innerHTML = val;
          }
        }
      }

      //will be called when you press on a header
      function sorte ( i ){
        return function(){
          var key = scope.viewer[i].field;
          if(scope.sorting.field === key){
            scope.sorting.direction = scope.sorting.direction * -1;
          }else{
            scope.sorting.field = key;
            scope.sorting.direction = 1;
          }
          sorter(key,scope.sorting.direction);
          scope.buildTable();
        };
      }

      scope.checked = [];
      scope.checkChange = function(i){
        if(i === -1){
          angular.forEach(scope.data,function(val){
            val._checked = !val._checked;
          });
          scope.checked = angular.copy(viewable);
        }else{
          var index = _.findIndex(scope.checked, scope.data[i]);
          if(index !== -1){
            scope.checked.splice(index,1);
          }else{
            scope.checked.push(scope.data[i]);
          }

        }
      };
      scope.actions = function(){

      };

      function createCheckbox(row,i){
        var checkbox = '<div class="checkbox">'+
                          '<input type="checkbox" ng-change="checkChange('+row+')" ng-model="data['+i+']._checked" id="'+row+'" name="'+row+'" value="'+row+'">'+
                          '<label for="'+row+'"></label>'+
                        '</div>';
        return checkbox;
      }


      //This function create the table body
      function setBody(table,content){
        var body = table.createTBody();

          for(var i=scope.viewer.length-1;i>=0;i--){
            if(scope.viewer[i].checked && scope.viewer[i].visible){
              for(var j=0;j<content.length;j++){
                var row;
                if(body.rows[j]){
                  row = body.rows[j];
                }else{
                  row = body.insertRow(j);
                  if(typeof scope.actions === 'function'){
                    var check = row.insertCell(0);
                    var index = _.findIndex(scope.data,content[j]);
                    check.innerHTML = createCheckbox(index,j);
                  }
                }
                var val = content[j][scope.viewer[i].field];
                var cell;
                if(typeof scope.actions === 'function'){
                  cell = row.insertCell(1);
                }else{
                  cell = row.insertCell(0);
                }
                cell.innerHTML = val;
            }
          }
        }
      }

      function sorter(sortVal,direction){
        scope.data.sort(function(obj1, obj2) {
          var obj1Val = obj1[sortVal];
          var obj2Val = obj2[sortVal];

          if(!_.isString(obj1Val)){
            obj1Val = obj1Val.toString();
          }

          if(!_.isString(obj2Val)){
            obj2Val = obj2Val.toString();
          }

          if(direction){
            return direction*obj1Val.localeCompare(obj2Val);
          }else{
            return obj1Val.localeCompare(obj2Val);
          }

        });
      }

      //number of rows it wil show on the page
      scope.numSelected=0;
      //function to change the row page view
      scope.perPageClick = function(index){
        scope.numSelected = index;
        scope.pageSelected=1;
        scope.buildTable();
      };

      //wich page is selected
      scope.pageSelected=1;
      //function to set the page you need
      scope.setPage = function(index){
        scope.pageSelected = index+1;
        scope.buildTable();
      };


      scope.perPageView = [];
      //this function will create a array to show the per row buttons
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

      //This function build the table and the number of pages!
      scope.buildTable = function(){
        var table = document.createElement('table');
        setHeader(table,scope.viewer);
        aantalToShow = scope.perPageView[scope.numSelected];
        pages = Math.ceil(scope.data.length/aantalToShow);
        scope.pages = _.range(1,pages+1);

        var start = (scope.pageSelected-1)*aantalToShow;
        var stop = (scope.pageSelected *aantalToShow)-1;
        viewable = _.slice(scope.data, start,stop);

        setBody(table,viewable);
        $('table').replaceWith($(table));
        $compile($('table'))(scope);
      };

      scope.selected = -1;
      //Function that will be called to change the order
      scope.omhoog = function(){
        if(scope.selected > 0){
          scope.viewer.swap(scope.selected,scope.selected-1);
          scope.selected-=1;
          scope.buildTable();
        }
      };
      //Function that will be called to change the order
      scope.omlaag = function(){
        if(scope.selected >=0 && scope.selected < scope.viewer.length-1){
          scope.viewer.swap(scope.selected,scope.selected+1);
          scope.selected+=1;
          scope.buildTable();
        }
      };
      //added this to swap elements easly
      Array.prototype.swap = function(a, b) {
        var temp = this[a];
        this[a] = this[b];
        this[b] = temp;
      };

      scope.buildTable();
      //function that will be called when you clicked on row name
      scope.select=function(e,index){
        scope.selected = index;
        e.preventDefault();
        e.stopPropagation();
      };
      //to save the changes you made
      scope.save = function(){
        scope.headers = angular.copy(scope.viewer);
        scope.buildTable();
      };
      //to cancel the changes you made
      scope.cancel  = function(){
        scope.selected = -1;
        scope.viewer = angular.copy(scope.headers);
      };

      //Set first page
      scope.setFirst = function(){
        scope.pageSelected=1;
        scope.buildTable();
      };

      //set lest page
      scope.setLast = function(){
        scope.pageSelected=pages;
        scope.buildTable();
      };

      //set next page
      scope.setNext = function(){
        if(scope.pageSelected < pages){
          scope.pageSelected +=1;
          scope.buildTable();
        }
      };

      //set prev page
      scope.setPrev = function(){
        if(scope.pageSelected >1){
          scope.pageSelected -=1;
          scope.buildTable();
        }
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


