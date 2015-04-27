'use strict';

/**
 * @ngdoc function
 * @name tinkApp.controller:DocsCtrl
 * @description
 * # DocsCtrl
 * Controller of the tinkApp
 */
angular.module('tinkFramework.controllers')
  .controller('MainCtrl',['$scope','tinkUploadService',function (scope,tinkUploadService) {

  scope.dates= {last:new Date(2015,0,2),first:new Date()};
scope.signup={username:'11.11.11-111.1'};
scope.mindate = new Date(2012,8,1);
scope.maxdate = new Date(2016,9,1);
scope.pages='5,10*,15,20,50';
scope.rek='92012023338';
  scope.go = function(){
  	console.log(scope.dates);
  };
scope.file=null;
  scope.getDate = function(){
    scope.dates.first.setMonth(scope.dates.first.getMonth()+1);
  };
  scope.dataX = [];
scope.addID = function(){
  scope.dataY.push(scope.idtomap);
};
scope.removeID = function(){
  var index = scope.dataY.indexOf(scope.idtomap);
  if(index !== -1){
    scope.dataY.splice(index,1);
  }
  
};
    {
                  id:'33',
                  name:'Lubbeekstraat',
                  selected:false,
                  children:[]
                  },

                      {
                  id:'343',
                  name:'Lubbeekstraat',
                  selected:false
                  },
        {
          id:'1',
          name:'Belgie',
          selected:false,
          children:[
            {
              id:'2',
              name:'Antwerpen',
              selected:false,
            },
            {
              id:'3',
              name:'Vlaams-brabant',
              selected:false,
              children:[
                {
                id:'4',
                name:'Leuven',
                selected:true,
                },
                {
                id:'5',
                name:'Heverlee',
                selected:true,
                  children:[
                  {
                  id:'6',
                  name:'Doleegstraat',
                  selected:true,
                  },
                  {
                  id:'7',
                  name:'Bergstraat',
                  selected:true,
                  children:[
                  {
                  id:'8',
                  name:'Doleegstraat',
                  selected:true,
                  },
                  {
                  id:'9',
                  name:'Bergstraat',
                  selected:true,
                  children:[
                  {
                  id:'10',
                  name:'Doleegstraat',
                  selected:true,
                  },
                  {
                  id:'11',
                  name:'Bergstraat',
                  selected:true,
                  },
                  {
                  id:'12',
                  name:'Lubbeekstraat',
                  selected:false,
                  },
                ]
                  },
                  {
                  id:'13',
                  name:'Lubbeekstraat',
                  selected:false,
                  },
                ]
                  },
                  {
                  id:'14',
                  name:'Lubbeekstraat',
                  selected:false,
                  },
                ]
                },
              ]
            }
          ]
        }
      ];
  };

scope.dataxc=function(){
  scope.dataX[0].childs[0].selected = !scope.dataX[0].childs[0].selected;
};

tinkUploadService.addUrls('http://localhost:3000/upload');
//scope.valid={mimeTypes:['image/jpeg', 'image/png', 'image/pjpeg', 'image/gif'],extensions:['.jpg', '.png', '.gif']};
scope.extraOptions = {date:{isPrivate:true},formName:'lalaForm'};
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

  scope.headers = [{field:'name',alias:'Voornaam',checked:true},{field:'achternaam',alias:'Achternaam',checked:false},{field:'adress',alias:'Adres',checked:true}];

  scope.submitForm = function() {
    console.log(scope.userForm.dubbel);
  };
  scope.addData = function(){
    scope.data.push({name:'First name',achternaam:'Last name',adress:'Generaal Armstrongweg 1, 2020 Antwerp'});
  };
  scope.changeData = function(){
    scope.data[0].name = 'AUWJEEASS';
  };

  scope.actions = [
    {
      name: 'Rij verwijderen',
      callback: function(items,uncheck){
        console.log(scope.data.indexOf(items[0]));
        //scope.data[scope.data.indexOf(items[0])]._checked = false;
        uncheck();
        angular.forEach(items,function(val){
          scope.data.splice(scope.data.indexOf(val),1);
        });
        console.log(items);
        //console.log(scope.data.indexOf(items[0]))
        //uncheck();
      }
    }
  ];



}]);
