'use strict';
angular.module('tink.datepicker', [])
.directive('tinkDatepicker',['$q','$templateCache','$http','$compile','dateCalculator','calView','safeApply','$window',function($q,$templateCache,$http,$compile,dateCalculator,calView,safeApply,$window) {
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
        copyEl.css({position: 'absolute', display: 'block'});
        element.append(copyEl);
        bindLiseners();
        $directive.pane.month = 1;
        $directive.open = 1;
        scope.build();
      };

      //content = angular.element('<input tink-format-input data-format="00/00/0000" data-placeholder="mm/dd/jjjj" data-date name="'+attr.name+'"  ng-model="ngModel" />');
      //$(content).insertBefore(element.find('span.datepicker-icon'));
      //$compile(content)(scope);

      function bindLiseners(){

        copyEl.bind('mousedown',function(){
          //input.focus();
          return false;
        });

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
        $directive.selectedDate =  newVal;
        $directive.viewDate = newVal;
      });

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
              content.focus();
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
        selectedDate:null
      };

      scope.$selectPane = function(value) {
        $directive.viewDate = new Date(Date.UTC($directive.viewDate.getFullYear()+( ($directive.pane.year|| 0) * value), $directive.viewDate.getMonth() + ( ($directive.pane.month || 0) * value), 1));
        scope.build();
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
         $directive.open = 0;
         copyEl = null;
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

      content.blur(function(){
        scope.hide();
      });
      scope.pane={prev:0,next:0};
      scope.build = function() {
        if($directive.viewDate === null || $directive.viewDate === undefined){
          $directive.viewDate = new Date();
        }

        if(checkBefore($directive.viewDate,scope.minDate)){
          scope.pane.prev = 1;
          $directive.viewDate = new Date(scope.minDate);
        }else{
          scope.pane.prev = 0;
        }
        if(checkAfter($directive.viewDate,scope.maxDate)){
          scope.pane.next = 1;
          $directive.viewDate = new Date(scope.maxDate);
        }else{
          scope.pane.next = 0;
        }

          if($directive.mode === 1){
            scope.title = dateCalculator.format($directive.viewDate, 'yyyy');
            scope.rows =  calView.monthInRows($directive.viewDate,scope.minDate,scope.maxDate);
          }
          if($directive.mode === 0){
            scope.title = dateCalculator.format($directive.viewDate, options.yearTitleFormat);
            scope.rows =  calView.daysInRows($directive.viewDate,$directive.selectedDate,scope.minDate,scope.maxDate);
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
        var copyDate = new Date(date.getFullYear(),date.getMonth(),1);
        var copyafter = new Date(after.getFullYear(),after.getMonth(),1);

        if(!dateCalculator.dateBeforeOther(copyafter,copyDate)){
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