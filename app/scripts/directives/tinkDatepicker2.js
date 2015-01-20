'use strict';
angular.module('tink.datepicker', [])
.directive('tinkDatepickerNew',['$q','$templateCache','$http','$compile','dateCalculator',function($q,$templateCache,$http,$compile,dateCalculator) {
  return {
    restrict:'EA',
    require:'ngModel',
    replace:true,
    templateUrl:'templates/tinkDatePicker2.html',
    scope:{
      ngModel:'&'
    },
    link:function(scope,element,attr,ctrl){
      var input = element.find('input');
      var clickable = element.find('span');

      scope.$show = function(){
        templateElem.css({position: 'absolute', display: 'block'});
        element.append(templateElem);
        var date = dateCal($directive.viewDate);
        if(date !== null){
          ctrl.$setViewValue(dateCalculator.formatDate(date, options.dateFormat));
        }
      };

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

      scope.$destroy = function(){
        templateElem.remove();
      }

      ctrl.$parsers.unshift(function(viewValue) {console.log(viewValue)
        input.val(viewValue);
        return new Date();
      });

      ctrl.$formatters.push(function(modelValue) {
        var date = dateCal($directive.viewDate);
        if(date !== null){
          ctrl.$setViewValue(dateCalculator.formatDate(date, options.dateFormat));
        }
        return modelValue;
      });

      clickable.bind('click touch',function(){
        scope.$show();
      })

      var options = {
        yearTitleFormat:'yyyy',
        dateFormat:'dd/mm/yyyy'
      }

      var $directive = {
        viewDate: new Date()
      }

      scope.$build = function() {
        scope.title = dateCalculator.format($directive.viewDate, options.yearTitleFormat);
        scope.rows =  dateCalculator.daysInRows($directive.viewDate);
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