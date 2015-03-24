'use strict';
angular.module('tink.interactiveTable', ['ngLodash']);
angular.module('tink.interactiveTable')
.directive('tinkInteractiveTable',['lodash','$compile','$rootScope',function(_,$compile,$rootScope){
  return{
    restrict:'E',
    templateUrl:'templates/tinkInteractiveTable.html',
    scope:{
      ngModel:'=',
      headers:'=',
      actions:'=?',
      itemsPerPage:'=?'
    },
    link:function(scope,element){
      if(!scope.headers || scope.headers.length < 1 ){
        return;
      }

      var aantalToShow = 1;
      var pages;
      var viewable;

      function uncheckAll(){
        for(var i=0;i<viewable.length;i++){
          if(scope.checkB[i] && scope.checkB[i]._checked===true){
            scope.checkB[i]._checked = false;
          }
        }
        if(scope.checkB[-1]){
            scope.checkB[-1]._checked = false;
          }
      }
      var ngModelWatch;
      function watch(){
        //scope.ngModel = angular.copy(scope.ngModel);
        ngModelWatch = scope.$watch('ngModel',function(newArray,oldArray){
          if(newArray !== oldArray){
            resort();
            scope.buildTable();
          }
        },true);
      }
      watch();

      if(scope.actions instanceof Array){
        scope.viewActions = [];
        for(var i=0;i<scope.actions.length;i++){
          var action = scope.actions[i];
          scope.viewActions.push({name:action.name,callback:function(){
            var checked = [];
            for(var i=0;i<viewable.length;i++){
              if(scope.checkB[i] && scope.checkB[i]._checked===true){
                checked.push(viewable[i]);
              }
            }
            action.callback(checked,uncheckAll);
          }});
        }
      }
      if(typeof scope.itemsPerPage === 'string'){
        var items = scope.itemsPerPage.split(',');
        scope.itemsPerPage = [];
        for(var j=0;j<items.length;j++){
          if(items[j].slice(-1) === '*'){
            var num = _.parseInt(items[j].substr(0,items[j].length-1));
            scope.perPage = {pages:num};
            scope.itemsPerPage.push(num);
          }else{
            scope.itemsPerPage.push(_.parseInt(items[j]));
          }
        }

        if(!scope.perPage && scope.itemsPerPage.length !==0){
          scope.perPage = {pages:_.parseInt(items[0])};
        }

      }else{
        scope.perPage = {pages:10};
        scope.itemsPerPage = [10,20,50];
      }
      //which sorting is happening
      scope.sorting = {field:'',direction:1};
      //preview headers
      if(!scope.headers instanceof Array){
        scope.headers = [];
      }
      //function that runs at the beginning to handle the headers.
      function handleHeaders(){
        angular.forEach(scope.headers,function(value){
          if(!angular.isDefined(value.alias) || value.alias === null){
            value.alias = value.field;
          }
          if(!angular.isDefined(value.visible) || value.visible === null){
            value.visible = true;
          }
        });
      }
      handleHeaders();
      //this is a copy to show to the view
      scope.viewer = scope.headers;
      //This function creates our table head
      function setHeader(table,keys){
        var header = table.createTHead();
        var row = header.insertRow(0);
        scope.selectedMax = keys.length-1;
        if(typeof scope.actions === 'function'){
          var thCheck = document.createElement('th');
          thCheck.innerHTML = createCheckbox(-1,i,'hulp');
          row.appendChild(thCheck);
        }

        for(var k=0;k<keys.length;k++){
          if(keys[k] && keys[k].checked && keys[k].visible){
            // var key = Object.keys(keys[i])[0];
            var val = keys[k].alias || keys[k].field;
            var th = document.createElement('th');
                th.innerHTML = val;
              row.appendChild(th);
              $(th).bind('click',sorte(k));
              if(keys[k] === scope.sorting.obj){
                if(scope.sorting.direction === 1){
                  $(th).addClass('sort-asc');
                }else if(scope.sorting.direction === -1){
                  $(th).addClass('sort-desc');
                }
              }
          }
        }
      }
      //hersort because of new data
      function resort(){
        if(scope.sorting && scope.sorting.obj){
          var sortKey =  scope.sorting.obj.field;
          sorter(sortKey,scope.sorting.direction);
        }
      }
      //will be called when you press on a header
      function sorte ( i ){
        return function(){
          if(scope.sorting.obj){
            //var index = _.findIndex(scope.viewer, scope.sorting.obj);
          }
          var key = scope.headers[i].field;
          if(scope.sorting.field === key){
            scope.sorting.direction = scope.sorting.direction * -1;
          }else{
            scope.sorting.field = key;
            scope.sorting.direction = 1;
          }
          sorter(key,scope.sorting.direction);
          scope.sorting.obj  = scope.headers[i];
          scope.buildTable();

        };
      }

      function fullChecked(){
        var length = 0;
        for(var i=0;i<viewable.length;i++){
          if(scope.checkB[i] && scope.checkB[i]._checked){
              length+=1;
            }
          }
          if(!scope.checkB[-1]){
            scope.checkB[-1] = {};
          }
          if(length !== 0){
            scope.selectedCheck = true;
          }else{
            scope.selectedCheck = false;
          }
          if(length === viewable.length){
            scope.checkB[-1]._checked = true;
          }else{
            scope.checkB[-1]._checked = false;
          }
      }

      scope.checkChange = function(i){
        if(i === -1){
          var check = scope.checkB[-1]._checked;
          angular.forEach(scope.checkB,function(val){
            val._checked = check;
            scope.selectedCheck = check;
          });
        }else{
          if(scope.checkB[-1]){
            scope.checkB[-1]._checked = false;
          }
          fullChecked();
        }
      };
      scope.actions = function(){

      };

      scope.hulpngModel=[];
      scope.checkB = [];
      function createCheckbox(row,i,hulp){
        if(!hulp){
          hulp ='';
        }
        var checkbox = '<div class="checkbox">'+
                          '<input type="checkbox" ng-change="checkChange('+row+')" ng-model="checkB['+row+']._checked" id="'+row+'" name="'+row+'" value="'+row+'">'+
                          '<label for="'+row+'"></label>'+
                        '</div>';
        return checkbox;
      }


      //This function create the table body
      function setBody(table,content){
        var body = table.createTBody();

          for(var i=scope.headers.length-1;i>=0;i--){
            if(scope.headers[i] && scope.headers[i].checked && scope.headers[i].visible){
              for(var j=0;j<content.length;j++){
                var row;
                if(body.rows[j]){
                  row = body.rows[j];
                }else{
                  row = body.insertRow(j);
                  if(typeof scope.actions === 'function'){
                    var check = row.insertCell(0);
                    // var index = scope.ngModel.indexOf(content[j]);
                    var index = j;
                    check.innerHTML = createCheckbox(index,j);
                  }
                }
                var val = content[j][scope.headers[i].field];
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
        ngModelWatch();
        scope.ngModel.sort(function(obj1, obj2) {
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
        watch();
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
        if(index > 0 ){
          scope.pageSelected = index;
          uncheckAll();
          scope.buildTable();
        }
      };

      scope.setItems = function(){
        scope.buildTable();
        fullChecked();
      };

      scope.createArray = function(num){
        var array = [];
        for(var i=0;i<num;i++){
          array[i] = {};
        }
        return array;
      };

      function buildPagination(){
        scope.showNums = [];
        var num = scope.pageSelected;
        var numPages = scope.pages;

        if(numPages <6){
          scope.showNums = _.range(2,numPages);
        }else{
          if(num < 4){
            scope.showNums = _.range(2,4);
            scope.showNums.push(-1);
          }else if(num >= numPages -2){
            scope.showNums = [-1].concat(_.range(numPages-2,numPages));
          }else{
            scope.showNums = [-1,num,-1];
          }
        }
        if(numPages >1 ){
          scope.showNums.push(numPages);
        }
      }

      aantalToShow = scope.perPage.pages;
      pages = Math.ceil(scope.ngModel.length/aantalToShow);
      scope.pages = _.range(1,pages);

      //This function build the table and the number of pages!
      scope.buildTable = function(){
        var table = document.createElement('table');
        setHeader(table,scope.headers);
        aantalToShow = scope.perPage.pages;
        pages = Math.ceil(scope.ngModel.length/aantalToShow);
        scope.pages = pages;

        var start = (scope.pageSelected-1)*aantalToShow;
        var stop = (scope.pageSelected *aantalToShow)-1;
        viewable = _.slice(scope.ngModel, start,stop+1);
        scope.checkB = scope.createArray(viewable.length);
        if(viewable.length === 0 && scope.pageSelected > 1){
          scope.pageSelected = scope.pageSelected-1;
          scope.buildTable();
          return;
        }
        if(scope.ngModel.length === 0){
          scope.numFirst = 0;
        }else{
          scope.numFirst = start +1;
        }
        if(stop > scope.ngModel.length){
          scope.numLast = scope.ngModel.length;
        }else{
          scope.numLast = stop +1;
        }
        buildPagination();
        scope.itemLength = scope.ngModel.length;
        setBody(table,viewable);  //
        table=$(table);           //variable table is added code to set class table
        table.addClass('table-interactive');   //added code to set class table
        fullChecked();

        var tableEl = element.find('table');
        tableEl.replaceWith(table); // old code: $('table').replaceWith($(table));
        $compile(table)(scope);
      };

      scope.selected = -1;
      //Function that will be called to change the order
      scope.omhoog = function(){
        if(scope.selected > 0){
          scope.viewer.swap(scope.selected,scope.selected-1);
          scope.selected-=1;
        }
        scope.buildTable();
      };
      //Function that will be called to change the order
      scope.omlaag = function(){
        if(scope.selected >=0 && scope.selected < scope.viewer.length-1){
          scope.viewer.swap(scope.selected,scope.selected+1);
          scope.selected+=1;
        }
        scope.buildTable();
      };

      scope.headerChange = function(){
        scope.buildTable();
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

      //Set first page
      scope.setFirst = function(){
        scope.setPage(1);
      };

      //set lest page
      scope.setLast = function(){
        scope.setPage(pages);
      };

      scope.close = function(){
        $rootScope.$broadcast('popover-open', { group: 'option-table',el:$('<div><div>') });
      };

      //set next page
      scope.setNext = function(){
        if(scope.pageSelected < pages){
          scope.pageSelected +=1;
          scope.setPage(scope.pageSelected);
        }
      };

      //set prev page
      scope.setPrev = function(){
        if(scope.pageSelected >1){
          scope.pageSelected -=1;
          scope.setPage(scope.pageSelected);
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
}]).directive('tinkShiftSort',['$timeout',function(timeout){
  return {
    restirct:'A',
    link:function(scope,elem){
      timeout(function(){
        Sortable.create(elem.find('ul').get(0),{
          ghostClass: 'draggable-placeholder',
          animation: 200,
          handle:'.draggable-elem',
          onStart: function (evt) {
             scope.$apply(function(){
              scope.selected = evt.oldIndex;
            });
          },
          onUpdate: function (evt) {
            scope.$apply(function(){
              var old = scope.headers[evt.oldIndex];
              scope.headers[evt.oldIndex] = scope.headers[evt.newIndex];
              scope.headers[evt.newIndex] = old;
              scope.selected = evt.newIndex;
              scope.buildTable();
            });
          },
        });
      },200);
    }
  };
}]);
