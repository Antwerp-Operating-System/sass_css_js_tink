'use strict';
    angular.module('tink.datepickerRange', ['tink.dateHelper','tink.safeApply'])
    .directive('tinkDatepickerRange',['$q', '$templateCache', '$http', 'calView', '$sce','$compile','dateCalculator','$window', function ($q, $templateCache, $http, calView, $sce,$compile,dateCalculator,$window) {
      return {
        restrict: 'E',
        replace: true,
        require:['?^form'],
        templateUrl: 'templates/tinkDatePickerRangeInputs.html',
        controller:function($scope,$attrs){
          $scope.dynamicName = $attrs.name;
          $scope.required = $attrs.required;
        },
        scope: {
          firstDate: '=?',
          lastDate: '=?',
          required:'@?'
        },
        link: function postLink(scope, element,attrs,form) {
          var $directive = {
            open: false,
            focused: {firstDateElem: element.find('div[tink-format-input] div:first'), lastDateElem: element.find('div[tink-format-input] div:last')},
            calendar: {first:element.find('span.datepicker-icon:first'),last:element.find('span.datepicker-icon:last')},
            tbody:{firstDateElem:null,lastDateElem:null},
            focusedModel: null,
            selectedDates: {first: scope.firstDate, last: scope.lastDate},
            valid:{firstDateElem:false,lastDateElem:false},
            mouse: 0,
            viewDate:new Date(),
            hardCodeFocus: false
          };
          if(attrs.name){
            scope.ctrlconst = form[0][attrs.name];
          }

          $directive.calendar.first.on('click',function(){
            if($directive.open){
              if($directive.focusedModel ==='firstDateElem'){
                hide();
              }else{
                $directive.focused.firstDateElem.focus();
              }
            }else{
              $directive.focused.firstDateElem.focus();
            }
          });
          $directive.calendar.last.on('click',function(){
            if($directive.open){
               if($directive.focusedModel ==='lastDateElem'){
                hide();
              }else{
                $directive.focused.lastDateElem.focus();
              }
            }else{
              $directive.focused.lastDateElem.focus();
            }
          });

            // -- check if we are using a touch device  --/
             var isDateSupported = function() {
                var i = document.createElement('input');
                i.setAttribute('type', 'date');
                return i.type !== 'text';
              };

             var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
             var isTouch = ('createTouch' in $window.document) && isNative && isDateSupported();

            // labels for the days you can make this variable //
            var dayLabels = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
             // -- create the labels  --/
             scope.dayLabels = $sce.trustAsHtml('<th>' + dayLabels.join('</th><th>') + '</th>');
            // Add a watch to know when input changes from the outside //

            scope.$watch('firstDate', function () {
              if(scope.firstDate !== null){
                $directive.focusedModel = 'firstDateElem';
               scope.$select(scope.firstDate,null,true);
               buildView();
             }else{
              checkValidity();
             }


            });

            // Add a watch to know when input changes from the outside //
            scope.$watch('lastDate', function () {
            if(scope.lastDate !== null){
              $directive.focusedModel = 'lastDateElem';
              scope.$select(scope.lastDate,null,true);
              buildView();
            }else{
              checkValidity();
            }
          });

              // -- the config is for the devolopers to change ! for in the future  --/
              // -- the $directive is four the directive hehehe ;) to keep track of stuff --/
    var
    config = {
      dateFormat: 'dd/mm/yyyy'
    },
    fetchPromises = {};

            // -- This builds the view --/
            function buildView() {

               // -- Retrieve the elements we want to change ! we have to do this because we replace the tbodys !  --/
               $directive.tbody.firstDateElem = element.find('tbody')[0];
               $directive.tbody.lastDateElem = element.find('tbody')[1];

              // -- Create the first calendar --/
              var htmlFirst = calView.createMonthDays($directive.viewDate, scope.firstDate, scope.lastDate,'prevMonth');
               // -- Replace and COMPILE the nieuw calendar view  --/
               angular.element($directive.tbody.firstDateElem).replaceWith($compile( htmlFirst)( scope ));

               // -- Copy the viewDate ! COPY otherwhise you got problems, because of refenties and stuff ;-)  --/
                var copyViewDate = new Date($directive.viewDate);
               // -- add a month  --/
               copyViewDate.setDate(5);
               copyViewDate.setMonth(copyViewDate.getMonth() + 1);

               // -- place the right titles in the scope  --/
               scope.firstTitle = dateCalculator.format($directive.viewDate, 'mmmm yyyy');
               scope.lastTitle = dateCalculator.format(copyViewDate, 'mmmm yyyy');


              // -- create the second view   --/
              var htmlLast = calView.createMonthDays(copyViewDate, scope.firstDate, scope.lastDate,'nextMonth');
               // -- compile and replace the second view   --/
               angular.element($directive.tbody.lastDateElem).replaceWith($compile( htmlLast)( scope ));

             }

            // -- to change the month of the calender --/
            function nextMonth() {
              // -- add one month to the viewDate --/
              $directive.viewDate.setDate(1);
              $directive.viewDate.setMonth($directive.viewDate.getMonth() + 1);
              // -- reload the viewdate :P  --/
              setViewDate($directive.viewDate);
            }
            // -- to change the month of the calender --/
            function prevMonth() {
              // -- remove one month from the viewDate --/
              $directive.viewDate.setDate(1);
              $directive.viewDate.setMonth($directive.viewDate.getMonth() - 1);
               // -- reload the viewdate woopwoop  --/
               setViewDate($directive.viewDate);
             }

             // -- function to build the view again  --/
             function setViewDate(viewDate) {
             // try {
               // -- check if there is a date given  --/
               if (angular.isDate(viewDate) && viewDate !== null) {
                if (angular.isDate(viewDate)) {

                  var hulpDate = new Date(viewDate.getTime());
                  hulpDate.setDate(1);
                  hulpDate.setMonth(hulpDate.getMonth()-1);
                  if(!dateCalculator.isSameMonth(viewDate,$directive.viewDate) && !dateCalculator.isSameMonth(hulpDate,$directive.viewDate)){
                        // -- change the global variable  --/
                        $directive.viewDate = new Date(viewDate);
                      }
                       // -- build the entire view  --/
                       buildView();

                     } else {
                      console.logerror('Wrong date');
                    }
                  }else {

                  }
            //  } catch (e) {
             //   console.log(e);
             // }
           }

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
            var promise = haalTemplateOp('templates/tinkDatePickerRange.html');
            // --- when the data is loaded //
            promise.then(function (template) {
              if (angular.isObject(template)){
                template = template.data;
              }
              // --- store the html we retrieved //
              templateElem = $compile(template);
              templateElem = templateElem(scope, function () {});
              templateElem.css({position: 'absolute', display: 'none'});
              element.append(templateElem);
              init();
            });

            function init() {
              if (isTouch) {
                config.dateFormat = 'yyyy-mm-dd';
                angular.element($directive.focused.firstDateElem).prop('type','date');
                angular.element($directive.focused.lastDateElem).prop('type','date');
              }
              scope.dateFormat = config.dateFormat;
              bindEvents();
            }

            scope.$select = function (el,format,hardcoded) {
              if(!angular.isDefined(format)){
                  format = 'yyyy/mm/dd';
              }
              var date;
              if(angular.isDate(el)){
                date = el;
              }else{
                date = dateCalculator.getDate(el,format);
              }

              if ($directive.focusedModel !== null) {
                if ($directive.focusedModel === 'firstDateElem') {
                  scope.firstDate = date;
                  if(!angular.isDate(scope.lastDate)){
                    if(!hardcoded){
                      setTimeout(function(){ $directive.focused.lastDateElem.focus(); }, 1);
                    }
                  }else{
                    if(dateCalculator.dateBeforeOther(scope.firstDate,scope.lastDate)){
                      scope.lastDate = null;
                      if(!hardcoded){
                        setTimeout(function(){ $directive.focused.lastDateElem.focus(); }, 1);
                      }
                    }
                  }

                } else if ($directive.focusedModel === 'lastDateElem') {
                  scope.lastDate = date;
                  if(!angular.isDate(scope.firstDate)){
                    if(!hardcoded){
                      setTimeout(function(){ $directive.focused.firstDateElem.focus(); }, 1);
                    }
                  }else{
                    if(dateCalculator.dateBeforeOther(scope.firstDate,scope.lastDate)){
                      scope.firstDate = null;
                      if(!hardcoded){
                        setTimeout(function(){ $directive.focused.firstDateElem.focus(); }, 1);
                      }
                    }
                  }

                }

              }
              checkValidity();
            };

            function checkValidity(){
              if(scope.ctrlconst){
                //scope.ctrlconst.$setValidity('required',true);
                if(scope.firstDate === null && scope.lastDate !== null){
                  scope.ctrlconst.$setValidity('firstdate',false);
                }else if(scope.firstDate !== null && scope.lastDate === null){
                  scope.ctrlconst.$setValidity('lastdate',false);
                }else if(scope.firstDate === null && scope.lastDate === null){
                  scope.ctrlconst.$setValidity('firstdate',true);
                  scope.ctrlconst.$setValidity('lastdate',true);
                }
              }
            }

            function $onMouseDown (evt) {
              if (evt.target.isContentEditable) {
                evt.target.focus();
                if(isTouch){
                  evt.preventDefault();
                  evt.stopPropagation();
                }
              }else{
                evt.preventDefault();
                evt.stopPropagation();
              }

              if(isTouch){
                var targetEl = angular.element(evt.target);

                if (targetEl[0].nodeName.toLowerCase() !== 'button') {
                  targetEl = targetEl.parent();
                }
                targetEl.triggerHandler('click');
              }
            }

            scope.$selectPane = function (value) {

              if (value) {
                nextMonth();
              } else {
                prevMonth();
              }
            };

            function hide(evt) { // TH comment out to inspect element
              //if(!(evt.relatedTarget && evt.relatedTarget.nodeName === 'INPUT')){
                templateElem.css({display: 'none'});
                $directive.open = false;
                $directive.focusedModel = null;
              //}
            }

            // -- event liseners to know if you are hitting the right elements --/
            element.on('mouseleave', function () {
              $directive.mouse = 0;
            });
            element.on('mouseenter', function () {
              $directive.mouse = 1;
            });

            function bindEvents() {
              if(!isTouch){
                element.bind('touchstart mousedown',$onMouseDown);
              }

              angular.element($directive.focused.firstDateElem).bind('blur', hide);
              angular.element($directive.focused.lastDateElem).bind('blur', hide);

              angular.element($directive.focused.firstDateElem).bind('focus', function () {
                //safeApply(scope,function(){
                  $directive.focusedModel = 'firstDateElem';
                //})
                show();
              });
              angular.element($directive.focused.lastDateElem).bind('focus', function () {
                //safeApply(scope,function(){
                  $directive.focusedModel = 'lastDateElem';
                //})
                show();
              });
            }


            function show() {
              if (!$directive.open) {
              // -- check if there is an input field focused --/
              if ($directive.focusedModel !== null) {

                // -- if firstelement is focused and we have an corret date show that date --/
                if ($directive.focusedModel === 'firstDateElem' && angular.isDate(scope.firstDate)) {
                 setViewDate(scope.firstDate);
               }else if($directive.focusedModel === 'firstDateElem' && angular.isDate(scope.lastDate)){
                 setViewDate(scope.lastDate);
               } else if($directive.focusedModel === 'lastDateElem' && angular.isDate(scope.lastDate)){
                 setViewDate(scope.lastDate);
               } else if($directive.focusedModel === 'lastDateElem' && angular.isDate(scope.firstDate)){
                 setViewDate(scope.firstDate);
               }else{
                setViewDate(new Date());
              }

            }else{
                // -- no inputfield focused ! so take the date of today --/
                setViewDate(new Date());
              }




              $directive.open = true;
              templateElem.css({display: 'block'});
            }

          }

        }
      };
    }])
.directive('dynamicName', function($compile, $parse) {
  return {
    restrict: 'A',
    terminal: true,
    priority: 100000,
    link: function(scope, elem) {
      var name = $parse(elem.attr('dynamic-name'))(scope);
      elem.removeAttr('dynamic-name');
      elem.attr('name', name);
      $compile(elem)(scope);
    }
  };
});