  'use strict';
  angular.module('tink.validDate',['tink.dateHelper','tink.safeApply'])
  .directive('tinkValidDate', ['$timeout', '$filter','dateCalculator','safeApply', function ($timeout, $filter,dateCalculator,safeApply) {
    return {
      require: 'ngModel',
      priority: 99,
      link: function ($scope, $element, $attrs, ctrl) {

        var format = $attrs.format;

        function checkForValid(viewValue) {
          ctrl.$setValidity('date', validFormat(viewValue,format));
          return viewValue;
        }

        function validFormat(date,format){
          if(angular.isDefined(date) && date !== null){

            if(date.length !== 10){ return false; }

            var dateObject = dateCalculator.getDate(date, format);
            if(dateObject !== 'INVALID DATE'){
              return true;
            }
            return false;
          }          
        }

        $element.unbind('input').unbind('keydown').unbind('change');
        $element.bind('blur', function() {

          safeApply($scope,function() {
            if(validFormat($element.val(),format)){
              checkForValid($element.val(),format);
              ctrl.$setViewValue($element.val());
            }else{
             ctrl.$setViewValue(undefined);
           }
           
         });         
        });

        $element.bind('input change', function() {
          safeApply($scope,function() {
            if(validFormat($element.val(),format)){
              ctrl.$setViewValue($element.val());
            }
          }); 


        });
           //format text going to user (model to view)
           ctrl.$formatters.push(checkForValid);

           ctrl.$parsers.unshift(checkForValid);
         }
       };
     }]);