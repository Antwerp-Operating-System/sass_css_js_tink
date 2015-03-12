'use strict';
angular.module('tink.datepicker', [])
.directive('tinkDatepicker',['$q','$templateCache','$http','$compile','dateCalculator','calView','safeApply','$window','$sce','$timeout',function($q,$templateCache,$http,$compile,dateCalculator,calView,safeApply,$window,$sce,setTimeout) {
  return {
    restrict:'E',
    require:['ngModel','?^form'],
    replace:true,
    templateUrl:'templates/tinkDatePickerInput.html',
    scope:{
      ngModel:'=?',
      minDate:'=?',
      maxDate:'=?',
    },
    controller:function($scope,$attrs){
      $scope.dynamicName = $attrs.name;
      $scope.requiredVal = false;
      //$scope.mindate = new Date();
    },
    compile: function(template,$attr) {
      if($attr.required){
        $attr.required = false;
        template.find('input').attr('data-require',true);
      }
      return {
        pre:function(){},
        post:function(scope,element,attr){

        function setAriaInput(date){
         // $(element).find('#input').attr('aria-label','date '+date);
        }
        setAriaInput('');
      //var ctrl = element.controller('ngModel');
      //ctrls[1].$removeControl(ctrls[1]['single']);
      //ctrls[1].$removeControl(ctrls[0])
      scope.opts = attr;
      var input = element.find('div.faux-input');
      var clickable = element.find('.datepicker-icon');
      var copyEl;
      var content = element.find('div.faux-input');

      scope.$show = function(){
        copyEl = templateElem;
        if($directive.appended !== 1) {
          element.append(copyEl);
          $directive.appended=1;
        }
        copyEl.attr('aria-hidden','false');
        copyEl.css({position: 'absolute', display: 'block'});
        bindLiseners();
        $directive.pane.month = 1;
        $directive.open = 1;
        scope.build();
        setFocusButton();
      };

      //content = angular.element('<input tink-format-input data-format="00/00/0000" data-placeholder="mm/dd/jjjj" data-date name="'+attr.name+'"  ng-model="ngModel" />');
      //$(content).insertBefore(element.find('span.datepicker-icon'));
      //$compile(content)(scope);
var mousedown = 0;
      function bindLiseners(){

        copyEl.bind('mousedown',function(event){
          mousedown = 1;
        });
        /*copyEl.bind('mouseup',function(event){
          mousedown = 0;
          return false;
        });*/
        $($window).bind('click',function(event){
          console.log(event)
        });

        copyEl.bind("keydown", function (event) {
          safeApply(scope,function(){
             if (event.which === 38 || event.which === 37 || event.which === 39 || event.which === 40) {
              calcFocus(event.which);
            }
          })
        });
      }

      function setFocusButton(btn){
        setTimeout(function(){
          if(currentSelected){
            currentSelected.attr('aria-selected', 'false');
          }
          if(btn){
            btn.attr('aria-selected', 'true');
            btn.focus();
            currentSelected= btn;
          }else{
            if($(copyEl.find('.btn-today')).length !== 0){
              $(copyEl.find('.btn-today')).attr('aria-selected', 'true');
              $(copyEl.find('.btn-today')).focus();
              currentSelected = $(copyEl.find('.btn-today'));
            }else{
              var firstTb = $(copyEl.find('tbody button:first'));
              firstTb.attr('aria-selected', 'true');
              firstTb.focus();
              currentSelected = firstTb;
            }
          }
          },150);
      }

      function calcFocus(e){
        var rijen = copyEl.find('tbody').children();
        var rijIndex = rijen.index( currentSelected.closest('tr'));
        if(rijIndex != -1){
          var kolommen = $(rijen[rijIndex]).children();
          var kolomIndex = kolommen.index( currentSelected.closest('td'));

          if (e === 37){
            //left Arrow
            if( rijIndex === 0 && kolomIndex === 0){
              scope.$selectPane(-1);
            }else if(kolomIndex>0){
              currentSelected = $($(kolommen[kolomIndex-1]).find('button'));
            }else{
              currentSelected = $($(rijen[rijIndex-1]).children()[$(rijen[rijIndex-1]).children().length-1]).find('button');
            }
          }else if(e === 39){
            //right arrow
            if(rijIndex === rijen.length-1 && kolomIndex === $(rijen[rijIndex]).children().length-1){
              scope.$selectPane(+1);
            }else if(kolomIndex<kolommen.length-1){
              currentSelected = $($(kolommen[kolomIndex+1]).find('button'));
            }else{
              currentSelected = $($(rijen[rijIndex+1]).children()[0]).find('button');
            }
          }else if(e===38){
            if(rijIndex>0){
              currentSelected = $($(rijen[rijIndex-1]).children()[kolomIndex]).find('button');
            }else{
              scope.$selectPane(-1);
            }
          }else if(e===40){
            if(rijIndex<rijen.length-1){
              currentSelected = $($(rijen[rijIndex+1]).children()[kolomIndex]).find('button');
            }else{
              scope.$selectPane(+1);
            }
          }
          currentSelected.focus();
        }
      }

      // ctrl.$formatters.push(function(modelValue) {
      //   console.log(modelValue)
      // });

      if(attr.trigger && attr.trigger === 'focus'){
        input.bind('focus',function(){
         safeApply(scope,function(){
          scope.$show();
         });
        });
      }

      scope.$watch('ngModel',function(newVal){
        setAriaInput(dateCalculator.format(newVal, 'mm/dd/yyyy'));
        $directive.selectedDate =  newVal;
        $directive.viewDate = newVal;
      });

      // labels for the days you can make this variable //
      var dayLabels = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
       // -- create the labels  --/
       scope.labels = [];
      // Add a watch to know when input changes from the outside //

      // -- check if we are using a touch device  --/
     var isDateSupported = function() {
        var i = document.createElement('input');
        i.setAttribute('type', 'date');
        return i.type !== 'text';
      };

     var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
     var isTouch = ('createTouch' in $window.document) && isNative && isDateSupported();

      clickable.bind('mousedown touch',function(){
        if(isTouch){
          element.find('input[type=date]:first').focus();
          element.find('input[type=date]:first').click();
        }else{
          safeApply(scope,function(){

            if($directive.open){
              scope.hide();
            }else{
              scope.$show();
              //content.focus();
            }

          });
        }
        return false;
      });


      var options = {
        yearTitleFormat:'mmmm yyyy',
        dateFormat:'dd/mm/yyyy'
      };

      var $directive = {
        viewDate: new Date(),
        pane:{},
        open:0,
        mode:0,
        appended:0,
        selectedDate:null
      };

      scope.$selectPane = function(value) {
        $directive.viewDate = new Date(Date.UTC($directive.viewDate.getFullYear()+( ($directive.pane.year|| 0) * value), $directive.viewDate.getMonth() + ( ($directive.pane.month || 0) * value), 1));
        scope.build();
        setTimeout(function(){
          var rijen = copyEl.find('tbody').children();
          if(value === +1){
             setFocusButton($(rijen[0]).find('button:first'));
          }else if(value === -1){
            setFocusButton($(rijen[rijen.length-1]).find('button:last'));
          }
        },50)
      };

      scope.$toggleMode = function(){

        if($directive.mode >= 0 && $directive.mode <=1){
          $directive.mode += 1;
        }else{
          $directive.mode = 0;
        }
        setMode($directive.mode);
        scope.build();
      };

      function setMode(mode){
        if(mode >= 0 && mode <=2){
          $directive.mode = mode;
        }else{
          $directive.mode = 0;
        }
        $directive.pane = {};
        switch($directive.mode){
          case 0: $directive.pane.month = 1; break;
          case 1: $directive.pane.month = 12; break;
          case 2: $directive.pane.year = 12; break;
        }

      }

      scope.hide = function(){
        if(copyEl){
         copyEl.css({display: 'none'});
         copyEl.attr('aria-hidden','true');
         $directive.open = 0;
         copyEl = null;
         safeApply(scope,function(){
         // content.click();
         //content.focus();
            $directive.open = 0;
         })

        }
      };

      // function setDirty(ctrl){
      //   ctrl.$dirty = true;
      //   ctrl.$pristine = false;
      // }

      scope.$select = function(date){
      $directive.viewDate = date;
        if($directive.mode === 0){
          //ctrls[1]['single'].$setViewValue('20/01/1992');
          scope.ngModel = date;
          //console.log(ctrls[1]['single'])
          //input.val(dateCalculator.formatDate(date, options.dateFormat))
          //ngModel =
          scope.hide();
          setTimeout(function(){ content.blur(); }, 0);
        }else if($directive.mode >0){
          $directive.mode -= 1;
          setMode($directive.mode);
          scope.build();
        }
      };

      content.bind('blur',function(){console.log(blur)
        safeApply(scope,function(){console.log(mousedown)
          if(!mousedown){
            //scope.hide();
          }
        })
      });

      var currentSelected;



      scope.pane={prev:false,next:false};
      scope.build = function() {
        if($directive.viewDate === null || $directive.viewDate === undefined){
          $directive.viewDate = new Date();
        }

        if(checkBefore($directive.viewDate,scope.minDate)){
          scope.pane.prev = true;
          $directive.viewDate = new Date(scope.minDate);
        }else{
          scope.pane.prev = false;
        }
        if(checkAfter($directive.viewDate,scope.maxDate)){
          scope.pane.next = true;
          $directive.viewDate = new Date(scope.maxDate);
        }else{
          scope.pane.next = false;
        }
          scope.labels = [];
          if($directive.mode === 1){
            scope.title = dateCalculator.format($directive.viewDate, 'yyyy');
            scope.rows =  calView.monthInRows($directive.viewDate,scope.minDate,scope.maxDate);
          }
          if($directive.mode === 0){
            scope.title = dateCalculator.format($directive.viewDate, options.yearTitleFormat);
            scope.rows =  calView.daysInRows($directive.viewDate,$directive.selectedDate,scope.minDate,scope.maxDate);
            scope.labels = $sce.trustAsHtml('<th>' + dayLabels.join('</th><th>') + '</th>');
          }
          if($directive.mode === 2){
            var currentYear = parseInt(dateCalculator.format($directive.viewDate, 'yyyy'));
            scope.title = (currentYear-11) +'-'+ currentYear;
            scope.rows = calView.yearInRows($directive.viewDate,scope.minDate,scope.maxDate);
            //setMode(1);
          }
      };

      function checkBefore(date,before){
        if(!angular.isDate(date)){
          return false;
        }
        if(!angular.isDate(before)){
          return false;
        }
        var copyDate = new Date(date.getFullYear(),date.getMonth(),1);
        var copyBefore = new Date(before.getFullYear(),before.getMonth(),1);

        if(dateCalculator.dateBeforeOther(copyBefore,copyDate)){
          return true;
        }
        return false;

      }
      function checkAfter(date,after){
        if(!angular.isDate(date)){
          return false;
        }
        if(!angular.isDate(after)){
          return false;
        }
        var copyDate = new Date(date.getFullYear(),date.getMonth(),1,0,0,0);
        var copyafter = new Date(after.getFullYear(),after.getMonth(),1,0,0,0);

        if(!dateCalculator.dateBeforeOther(copyafter,copyDate) || copyafter.getTime()===copyDate.getTime()){
          return true;
        }
        return false;
      }

      var fetchPromises =[];
      // -- To load the template for the popup but we can change this ! no html file is better
      // if it is finished we can but it in the javascript file with $cacheTemplate --/
      function haalTemplateOp(template) {
        // --- if the template already is in our app cache return it. //
        if (fetchPromises[template]){
          return fetchPromises[template];
        }
        // --- If not get the template from templatecache or http. //
        return (fetchPromises[template] = $q.when($templateCache.get(template) || $http.get(template))
          .then(function (res) {
            // --- When the template is retrieved return it. //
            if (angular.isObject(res)) {
              $templateCache.put(template, res.data);
              return res.data;
            }
            return res;
          }));
      }
      var templateElem;
      var promise = haalTemplateOp('templates/tinkDatePickerField.html');
      // --- when the data is loaded //
      promise.then(function (template) {
        if (angular.isObject(template)){
          template = template.data;
        }
        // --- store the html we retrieved //
        templateElem = $compile(template);
        templateElem = templateElem(scope, function () {});
      });



    }
      };
    }
  };
}]);