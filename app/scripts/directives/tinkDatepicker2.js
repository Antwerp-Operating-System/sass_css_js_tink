'use strict';
angular.module('tink.datepicker', [])
.directive("dynamicName",function($compile){
  return {
      restrict:"A",
      terminal:true,
      link:function(scope,element,attrs){
          element.attr('name', scope.$eval(attrs.dynamicName));
          element.removeAttr("dynamic-name");
          $compile(element)(scope);
      }
   };
})
.directive('tinkDatepicker',['$q','$templateCache','$http','$compile','dateCalculator','calView',function($q,$templateCache,$http,$compile,dateCalculator,calView) {
  return {
    restrict:'EA',
    require:['ngModel','^form'],
    replace:true,
    priority:999,
    templateUrl:'templates/tinkDatePicker2.html',
    scope:{
      ngModel:'='
    },
    link:function(scope,element,attr,ctrl){
      ctrl[1].$removeControl(ctrl[0]);
      var forms = ctrl[1];
      ctrl = ctrl[0];

      scope.opts = attr;
      var input = element.find('input');
      var clickable = element.find('.input-group-addon');
      var copyEl;
      var content;
      scope.$show = function(){
        copyEl = templateElem;
        copyEl.css({position: 'absolute', display: 'block'});
        element.append(copyEl);
        bindLiseners();
        $directive.pane.month = 1;
        scope.build();
      };

        content = angular.element('<input tink-format-input name="'+attr.name+'"  ng-model="ngModel" />');
      $(content).insertBefore($('span.input-group-addon'))
      $compile(content)(scope);


      var dateCal = function(date){
        if(angular.isDate(date)){
          if(date.toString() !== 'Invalid Date'){
            return date;
          }else{
            return null;
          }
        }else{
          if(/^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/.test(date)){
            var dateObject = dateCalculator.getDate(date, options.dateFormat);
            return dateObject;
          }else{
            return null;
          }
        }
      }

      function bindLiseners(){

        copyEl.bind('mousedown',function(){
          input.focus();
          return false;
        })

      }

      scope.destroy = function(){
        console.log("destr")
        //copyEl.remove();
      }

    /*  ctrl.$parsers.unshift(function(viewValue) {console.log(viewValue)
        if(viewValue.length === 10){
          var date = dateCalculator.getDate(viewValue,'dd/mm/yyyy');
          $directive.selectedDate = date;
          $directive.viewDate = date;
          input.val(viewValue);
        }else if(angular.isDate(viewValue)){
          date = viewValue;
        }else if(date === undefined){
          return;
        }
        console.log(date)
        return date;
      });

      scope.$watch('ngModel',function(newVal){
        var date;
        if(typeof newVal === 'function'){
          date = newVal();
        }else {
          date = newVal;
        }
        var setString = '';
        if(angular.isDate(date)){
          $directive.selectedDate = date;
          setString = dateCalculator.formatDate(date, options.dateFormat);
        }else if(typeof date === 'string'  && date.length === 10){
          $directive.selectedDate = dateCalculator.getDate(date,options.dateFormat);
          setString = date;
        }else if(date === undefined){
          setString = dateCalculator.formatDate($directive.viewDate, options.dateFormat);
          scope.ngModel= setString;
        }
        ctrl.$setViewValue(setString);
        scope.build();
      })

      ctrl.$formatters.push(function(modelValue) {console.log(modelValue)
        var date = dateCal(modelValue);
        if(date !== null){
          ctrl.$setViewValue(dateCalculator.formatDate(date, options.dateFormat));
          $directive.viewDate = date;
        }
        return modelValue;
      });
*/
      scope.$watch('ngModel',function(newVal){
        $directive.selectedDate =  newVal;
        $directive.viewDate = newVal;
      });


      clickable.bind('mousedown touch',function(){
        scope.$apply(function(){
          scope.$show();
          content.find('#input').focus();
        });
        return false;
      })


      var options = {
        yearTitleFormat:'mmmm yyyy',
        dateFormat:'dd/mm/yyyy'
      }

      var $directive = {
        viewDate: new Date(),
        pane:{},
        mode:0,
        selectedDate:null
      }

      scope.$selectPane = function(value) {
        $directive.viewDate = new Date(Date.UTC($directive.viewDate.getFullYear()+( ($directive.pane.year|| 0) * value), $directive.viewDate.getMonth() + ( ($directive.pane.month || 0) * value), 1));
        scope.build();
      };

      scope.toggleMode = function(){

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
      }

      scope.hide = function(){
        if(copyEl){
         copyEl.css({display: 'none'});
         copyEl = null;
        }
      }

      scope.$select = function(date){
      $directive.viewDate = date;
        if($directive.mode === 0){
          ctrl.$setViewValue(date);
          //input.val(dateCalculator.formatDate(date, options.dateFormat))
          //ngModel =
          scope.hide();
          content.find('#input').blur();
        }else if($directive.mode >0){
          $directive.mode -= 1;
          scope.build();
        }
      }

      content.find('#input').blur(function(){
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
  }
}]);