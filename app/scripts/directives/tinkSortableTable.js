'use strict';
angular.module('tink.sortable', ['ngLodash']);
angular.module('tink.sortable')
.directive('tinkSortableTable',['lodash','$compile',function(_,$compile){
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
      scope.perPage='10,20,100';
      //Preview DATA
      scope.data = [
        {name:'vincent',achternaam:'bouillart',adress:1235},
        {name:'Valerie',achternaam:'bouillart',adress:61242},
        {name:'Jef',achternaam:'bouillart',adress:5746},
        {name:'robert',achternaam:'bouillart',adress:'zaeaz 27'},
        {name:'steven',achternaam:'bouillart',adress:'azdqdc 27'},
        {name:'gill',achternaam:'bouillart',adress:'bnfdk 27'},
        {name:'Frederic',achternaam:'bouillart',adress:'cldlddl 27'},
        {name:'jeroen',achternaam:'bouillart',adress:'qlqlqlq 27'},
        {name:'joris',achternaam:'bouillart',adress:'slslsls 27'},
        {name:'etien',achternaam:'bouillart',adress:'lojkk 27'},
        {name:'richard',achternaam:'bouillart',adress:'vidd,, 27'},
        {name:'Yo',achternaam:'bouillart',adress:'yorefd27'},
        {name:'tinne',achternaam:'bouillart',adress:'doleegstraat 27'},
        {name:'lora',achternaam:'bouillart',adress:'doleegfstraat 27'},
        {name:'wout',achternaam:'bouillart',adress:'doleegstrfaat 27'},
        {name:'astrid',achternaam:'bouillart',adress:'doleegstraat 27'},
        {name:'jonas',achternaam:'bouillart',adress:'doleegsftraat 27'},
        {name:'yana',achternaam:'bouillart',adress:'doleegstraat 27'},
        {name:'laura',achternaam:'bouillart',adress:'doleegsfftraat 27'},
        {name:'kriste',achternaam:'bouillart',adress:'doleegfstraat 27'},
        {name:'tom',achternaam:'bouillart',adress:'doleegstrafat 27'},
        {name:'leive',achternaam:'bouillart',adress:'doleegstraat 27'},
        {name:'tomp',achternaam:'bouillart',adress:'doleegstrfaat 27'},
        {name:'vdsfds',achternaam:'bouillart',adress:'doleegsftraat 27'},
        {name:'sdfdfsf',achternaam:'bouillart',adress:'doleegfstraat 27'},
        {name:'sef',achternaam:'bouillart',adress:'doleegstrfaat 27'},
        {name:'vnbrf',achternaam:'bouillart',adress:'doleegstraat 27'},
        {name:'azd',achternaam:'bouillart',adress:'doleegstffraat 27'},
        {name:'wcwv',achternaam:'bouillart',adress:'doleegstraat 27'},
        {name:'vdgfs',achternaam:'bouillart',adress:'doleegfstraat 27'},
        {name:'vdfssfds',achternaam:'bouillart',adress:'doleeggsftraat 27'},
        {name:'sdfdsffsf',achternaam:'bouillart',adress:'doleefstraat 27'},
        {name:'sesfsf',achternaam:'bouillart',adress:'doleegsgtrfaat 27'},
        {name:'vnsfbrf',achternaam:'bouillart',adress:'doleegsgtraat 27'},
        {name:'azfsd',achternaam:'bouillart',adress:'doleegstrgaat 27'},
        {name:'wcfswv',achternaam:'bouillart',adress:'doleegstgfraat 27'},
        {name:'vdfsgfs',achternaam:'bouillart',adress:'doleegsgftraat 27'},
        {name:'rufsuy',achternaam:'bouillart',adress:'doleegsfgraat 27'},
        {name:'uyfsffh',achternaam:'bouillart',adress:'doleegsgftraat 27'},
        {name:'fhgsfg',achternaam:'bouillart',adress:'doleegstgfraat 27'},
        {name:'ezrsfr',achternaam:'bouillart',adress:'doleegstgrfaat 27'},
        {name:'trcsfbn',achternaam:'bouillart',adress:'doleegsgtfraat 27'},
        {name:'sdffsbv',achternaam:'bouillart',adress:{test:'o'}}
      ];
      //which sorting is happening
      scope.sorting = {field:'',direction:1};
      //preview headers
      scope.headers = [{field:'name',alias:'Voornaam',checked:true},{field:'achternaam',alias:'Achternaam',checked:false},{field:'adress',alias:'Adres',visible:true,checked:true}];

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
      scope.viewer = angular.copy(scope.headers);
      //This function creates our table head
      function setHeader(table,keys){
        var header = table.createTHead();
        var row = header.insertRow(0);

        if(typeof scope.actions === 'function'){
          var thCheck = document.createElement('th');
          thCheck.innerHTML = createCheckbox(-1);
          row.appendChild(thCheck);
        }

        for(var i=0;i<keys.length;i++){
          if(keys[i].checked && keys[i].visible){
            // var key = Object.keys(keys[i])[0];
            var val = keys[i].alias || keys[i].field;
            var th = document.createElement('th');
                th.innerHTML = val;
              row.appendChild(th);
              $(th).bind('click',sorte(i));
              if(keys[i] === scope.sorting.obj){
                if(scope.sorting.direction === 1){
                  $(th).addClass('sort-asc');
                }else if(scope.sorting.direction === -1){
                  $(th).addClass('sort-desc');
                }
              }
          }
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

          for(var i=scope.headers.length-1;i>=0;i--){
            if(scope.headers[i].checked && scope.headers[i].visible){
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
        setHeader(table,scope.headers);
        aantalToShow = scope.perPageView[scope.numSelected];
        pages = Math.ceil(scope.data.length/aantalToShow);
        scope.pages = _.range(1,pages+1);

        var start = (scope.pageSelected-1)*aantalToShow;
        var stop = (scope.pageSelected *aantalToShow)-1;
        viewable = _.slice(scope.data, start,stop);


        setBody(table,viewable);  //
        table=$(table);           //variable table is added code to set class table
        table.addClass('table-sortable');   //added code to set class table


        $('table').replaceWith(table); // old code: $('table').replaceWith($(table));
        $compile($('table'))(scope);
      };

      scope.selected = -1;
      //Function that will be called to change the order
      scope.omhoog = function(){
        if(scope.selected > 0){
          scope.viewer.swap(scope.selected,scope.selected-1);
          scope.selected-=1;
        }
      };
      //Function that will be called to change the order
      scope.omlaag = function(){
        if(scope.selected >=0 && scope.selected < scope.viewer.length-1){
          scope.viewer.swap(scope.selected,scope.selected+1);
          scope.selected+=1;
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
