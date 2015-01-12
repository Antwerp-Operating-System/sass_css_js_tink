  'use strict';
  angular.module('tink.validDate',['tink.dateHelper','tink.safeApply'])
  .directive('tinkValidDate', ['$timeout', '$filter','dateCalculator','safeApply','$window', function ($timeout, $filter,dateCalculator,safeApply,$window) {
    return {
      require: 'ngModel',
      priority: 99,

      link: function ($scope, $element, $attrs, ctrl) {
         var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
          var isTouch = ('createTouch' in $window.document) && isNative;
        var format = $attrs.format;
        if(isTouch){
          format = 'yyyy-mm-dd';
        }
        function checkForValid(viewValue) {
          ctrl.$setValidity('date', validFormat(viewValue,format));
          return viewValue;
        }

        function validFormat(date,format){
          if(angular.isDefined(date) && date !== null){

            if(date.length !== 10){ return false; }

            if(!isTouch && !/^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/.test(date)){return false;}

            var dateObject = dateCalculator.getDate(date, format);

            return dateObject.toString()!=='Invalid Date';
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