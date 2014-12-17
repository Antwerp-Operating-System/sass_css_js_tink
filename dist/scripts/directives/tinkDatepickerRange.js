    angular.module('tink.datepickerRange', ['tink.dateHelper','tink.safeApply'])
    .directive('tinkDatepickerRange', function ($q, $templateCache, $http, $compile, calView, dateParser, $sce,$compile,dateParser,$window,safeApply) {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/tinkDatePickerRangeInputs.html',
        scope: {
          firstDate: '=',
          lastDate: '='
        },
        link: function postLink(scope, element, attr, controller) {
             // -- check if we are using a touch device  --/
             var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
             var isTouch = ('createTouch' in $window.document) && isNative;

            // labels for the days you can make this variable //
            var dayLabels = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
             // -- create the labels  --/
             scope.dayLabels = $sce.trustAsHtml('<th>' + dayLabels.join('</th><th>') + '</th>');
            // Add a watch to know when input changes from the outside //

            scope.$watch('firstDate', function (newDate, oldDate) {
              var date;
              if (newDate !== oldDate && angular.isDefined(newDate) && newDate !== null) {
                if (angular.isDate(newDate)) {
                  date = newDate;
                  setViewDate(newDate);
                } else {
                  try {
                    date = dateParser.getDate(newDate, config.dateFormat);
                    scope.firstDate = date;
                    //setViewDate(date);
                  } catch (e) {
                    scope.firstDate = null;
                  }
                }
                ;
                scope.firstDateModel = dateParser.format(date, config.dateFormat);
              }

            });

            // Add a watch to know when input changes from the outside //
            scope.$watch('lastDate', function (newDate, oldDate) {
              if (newDate !== oldDate && angular.isDefined(newDate) && newDate !== null) {
                if (angular.isDate(newDate)) {
                 setViewDate(newDate);
               } else {
                try {
                  var date = dateParser.getDate(newDate, config.dateFormat);
                  scope.lastDate = date;
                  setViewDate(date);
                } catch (e) {
                  scope.lastDate = null;
                }
              }
              ;
              scope.lastDateModel = dateParser.format(scope.lastDate, config.dateFormat);
            }
          });

            /* this slows down the code !! refactor this */
            scope.$watch('firstDateModel',function(date){
              scope.firstDate = date;
            });

            scope.$watch('lastDateModel',function(date){
              scope.lastDate = date;
            });

              // -- the config is for the devolopers to change ! for in the future  --/
              // -- the $directive is four the directive hehehe ;) to keep track of stuff --/
    var
    config = {
      dateFormat: 'dd/mm/yyyy'
    },
    $directive = {
      open: false,
      focused: {firstDateElem: element[0].children[0], lastDateElem: element[0].children[1]},
      tbody:{firstDateElem:null,lastDateElem:null},
      focusedModel: null,
      selectedDates: {first: scope.firstDate, last: scope.lastDate},
      valid:{firstDateElem:false,lastDateElem:false},
      mouse: 0,
      viewDate: null,
      hardCodeFocus: false
    },
    fetchPromises = {};

            // -- This builds the view --/
            function buildView() {

               // -- Retrieve the elements we want to change ! we have to do this because we replace the tbodys !  --/
               $directive.tbody.firstDateElem = element.find('tbody')[0];
               $directive.tbody.lastDateElem = element.find('tbody')[1];

              // -- Create the first calendar --/
              var htmlFirst = calView.createMonthDays($directive.viewDate, scope.firstDate, scope.lastDate);
               // -- Replace and COMPILE the nieuw calendar view  --/
               angular.element($directive.tbody.firstDateElem).replaceWith($compile( htmlFirst)( scope ));

               // -- Copy the viewDate ! COPY otherwhise you got problems, because of refenties and stuff ;-)  --/
    var copyViewDate = new Date($directive.viewDate);
               // -- add a month  --/
               copyViewDate.setMonth(copyViewDate.getMonth() + 1);

               // -- place the right titles in the scope  --/
               scope.firstTitle = dateParser.format($directive.viewDate, 'mmmm yyyy');
               scope.lastTitle = dateParser.format(copyViewDate, 'mmmm yyyy');

              // -- create the second view   --/
              var htmlLast = calView.createMonthDays(copyViewDate, scope.firstDate, scope.lastDate);
               // -- compile and replace the second view   --/
               angular.element($directive.tbody.lastDateElem).replaceWith($compile( htmlLast)( scope ));

             }

            // -- refresh the view --/
            function refreshView() {
              buildView();
            };

            // -- to change the month of the calender --/
            function nextMonth() {
              // -- add one month to the viewDate --/
              $directive.viewDate.setMonth($directive.viewDate.getMonth() + 1);
              // -- reload the viewdate :P  --/
              setViewDate($directive.viewDate);
            };
            // -- to change the month of the calender --/
            function prevMonth() {
              // -- remove one month from the viewDate --/
              $directive.viewDate.setMonth($directive.viewDate.getMonth() - 1);
               // -- reload the viewdate woopwoop  --/
               setViewDate($directive.viewDate);
             };

             // -- function to build the view again  --/
             function setViewDate(viewDate) {
             // try {
               // -- check if there is a date given  --/
               if (angular.isDate(viewDate) && viewDate !== null) {
                if (angular.isDate(viewDate)) {

                  var hulpDate = new Date(viewDate.getTime());
                  hulpDate.setMonth(hulpDate.getMonth()-1);

                  if(!dateParser.isSameMonth(viewDate,$directive.viewDate) && !dateParser.isSameMonth(hulpDate,$directive.viewDate)){
                        // -- change the global variable  --/
                        $directive.viewDate = new Date(viewDate);
                      }         
                       // -- build the entire view  --/
                       buildView();       

                     } else {
                      console.logerror("Wrong date");
                    }
                  }
            //  } catch (e) {
             //   console.log(e);
             // }
           }

            // -- To load the template for the popup but we can change this ! no html file is better
            // if it is finished we can but it in the javascript file with $cacheTemplate --/
            function haalTemplateOp(template) {
              // --- if the template already is in our app cache return it. //
              if (fetchPromises[template]) return fetchPromises[template];
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
            };
            var templateElem;
            var promise = haalTemplateOp('templates/tinkDatePickerRange.html');
            // --- when the data is loaded //
            promise.then(function (template) {
              if (angular.isObject(template)) template = template.data;
              // --- store the html we retrieved //
              var templateHtml = String.prototype.trim.apply(template);
              templateElem = $compile(template);
              templateElem = templateElem(scope, function (clonedElement, clone) {
              });
              templateElem.css({display: 'block', position: 'absolute', display: 'none'});
              element.append(templateElem);
              init();
            });

            function init() {
              if (isTouch) {
                angular.element($directive.focused.firstDateElem).attr('readonly', 'true');
                angular.element($directive.focused.lastDateElem).attr('readonly', 'true');
              }
              bindEvents();
            }

            scope.$select = function (el) {
              var date = dateParser.getDate(el,"yyyy/mm/dd");

              if ($directive.focusedModel !== null) {
                if ($directive.focusedModel === 'firstDateElem') {
                  scope.firstDate = date;
                  if(!scope.lastDate){
                    $directive.hardCodeFocus = true;
                    $directive.focused.lastDateElem.focus();
                  }                

                } else if ($directive.focusedModel === 'lastDateElem') {
                  scope.lastDate = date;
                  if(!scope.firstDate){
                    $directive.hardCodeFocus = true;
                    $directive.focused.firstDateElem.focus();
                  }

                }

              }
            };

            function $onMouseDown (evt) {
              if (evt.target.nodeName === "INPUT") {
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


            };

            scope.$selectPane = function (value) {

              if (value) {
                nextMonth();
              } else {
                prevMonth();
              }
            };

            function hide(evt,l) {

              if(evt.relatedTarget && evt.relatedTarget.nodeName === 'INPUT'){

              }else{
                templateElem.css({display: 'none'});
                $directive.open = false;
                $directive.focusedModel = null;
              }

            };

            // -- event liseners to know if you are hitting the right elements --/
            element.on('mouseleave', function () {
              $directive.mouse = 0;
            });
            element.on('mouseenter', function () {
              $directive.mouse = 1;
            });

            function bindEvents() {
              element.bind('click', function (evt) {
                evt.stopPropagation();
              })


              element.bind('touchstart mousedown',$onMouseDown);

              angular.element($directive.focused.firstDateElem).on('blur', hide);
              angular.element($directive.focused.lastDateElem).on('blur', hide);

              angular.element($directive.focused.firstDateElem).on('focus', function () {
                $directive.focusedModel = "firstDateElem";
                safeApply(scope,show);

              });
              angular.element($directive.focused.lastDateElem).on('focus', function () {
                $directive.focusedModel = "lastDateElem";
                safeApply(scope,show);

              });
            }


            function show() {
              if (!$directive.open) {
              // -- check if there is an input field focused --/
              if ($directive.focusedModel !== null) {

                // -- if firstelement is focused and we have an corret date show that date --/
                if ($directive.focusedModel === "firstDateElem" && angular.isDate(scope.firstDate)) {
                 setViewDate(scope.firstDate);
               }else if($directive.focusedModel === "firstDateElem" && angular.isDate(scope.lastDate)){
                 setViewDate(scope.lastDate);
               } else if($directive.focusedModel === "lastDateElem" && angular.isDate(scope.lastDate)){
                 setViewDate(scope.lastDate);
               } else if($directive.focusedModel === "lastDateElem" && angular.isDate(scope.firstDate)){
                 setViewDate(scope.firstDate);
               }else{
                setViewDate(new Date());
              }

            }else{
                // -- no inputfield focused ! so take the date of today --/
                setViewDate(new Date())
              }




              $directive.open = true;
              templateElem.css({display: 'block'});
            }

          };

        }
      }
    });