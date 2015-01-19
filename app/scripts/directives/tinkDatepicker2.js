'use strict';
angular.module('tink.datepicker', [])
.directive('tinkDatepickerNew',['$q','$templateCache','$http','$compile','dateCalculator',function($q,$templateCache,$http,$compile,dateCalculator) {
  return {
    restrict:'EA',
    replace:true,
    templateUrl:'templates/tinkDatePicker2.html',
    scope:{
      ngModel:"&"
    },
    link:function(scope,element,attr,ctrl){
      var input = element.find('input');
      var clickable = element.find('span');

      scope.$show = function(){

      };

      var options = {
        yearTitleFormat:'yyyy'
      }

      var $directive = {
        viewDate: new Date()
      }

      scope.$build= function() {
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
        templateElem.css({position: 'absolute', display: 'block'});
        element.append(templateElem);
        scope.$build();
      });

    }
  }
}]);