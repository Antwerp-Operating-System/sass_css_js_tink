'use strict';
angular.module('tink.datepicker', [])
.directive('tinkDatepicker',['$q','$templateCache','$http','$compile','dateCalculator','calView','safeApply',function($q,$templateCache,$http,$compile,dateCalculator,calView,safeApply) {
  return {
    restrict:'EA',
    require:['ngModel','?^form'],
    replace:true,
    priority:99,
    templateUrl:'templates/tinkDatePickerInput.html',
    scope:{
      ngModel:'=?',
      required:'@?'
    },
    controller:function($scope,$attrs){
      $scope.dynamicName = $attrs.name;
      $scope.required = $attrs.required;
    },
    link:function(scope,element,attr,ctrl){
      ctrl = ctrl[0];

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


      clickable.bind('mousedown touch',function(){
        safeApply(scope,function(){
          if($directive.open){
            scope.hide();
          }else{
            scope.$show();
            content.focus();
          }
        });
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
        $directive.pane = {};
        switch($directive.mode){
          case 0: $directive.pane.month = 1; break;
          case 1: $directive.pane.month = 12; break;
          case 2: $directive.pane.year = 12; break;
        }
        scope.build();
      };

      scope.hide = function(){
        if(copyEl){
         copyEl.css({display: 'none'});
         $directive.open = 0;
         copyEl = null;
        }
      };

      scope.$select = function(date){
      $directive.viewDate = date;
        if($directive.mode === 0){
          ctrl.$setViewValue(date);
          //input.val(dateCalculator.formatDate(date, options.dateFormat))
          //ngModel =
          scope.hide();
          content.blur();
        }else if($directive.mode >0){
          $directive.mode -= 1;
          scope.build();
        }
      };

      content.blur(function(){
        scope.hide();
      });
      scope.build = function() {
        if($directive.viewDate === null || $directive.viewDate === undefined){
          $directive.viewDate = new Date();
        }
          if($directive.mode === 1){
            scope.title = dateCalculator.format($directive.viewDate, 'yyyy');
            scope.rows =  calView.monthInRows($directive.viewDate);
          }
          if($directive.mode === 0){
            scope.title = dateCalculator.format($directive.viewDate, options.yearTitleFormat);
            scope.rows =  calView.daysInRows($directive.viewDate,$directive.selectedDate);
          }
          if($directive.mode === 2){
            var currentYear = parseInt(dateCalculator.format($directive.viewDate, 'yyyy'));
            scope.title = (currentYear-11) +'-'+ currentYear;
            scope.rows =  calView.yearInRows($directive.viewDate);
          }
      };

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
}]);