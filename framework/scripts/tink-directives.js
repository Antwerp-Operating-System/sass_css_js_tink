'use strict';
angular.module('tink.accordion', []);
angular.module('tink.accordion')
.directive('tinkAccordion',['tinkApi',function (tinkApi) {
  return {
    restrict:'EA',
    controller:'TinkAccordionController',
    transclude: true,
    replace: false,
    scope:{
      startOpen:'=',
      oneAtATime:'='
    },
    template: '<div class="panel-group" ng-transclude></div>',
    link:function(scope,element, attrs, accordionCtrl){
      var options = {};
      angular.forEach(['oneAtATime','startOpen'], function(key) {
        if(angular.isDefined(attrs[key])) {
          if(typeof scope[key] === 'boolean'){
            options[key] = scope[key];
          }else{
            options[key] = attrs[key] === 'true';
          }
        }
      });
      var accordionElem = tinkApi.accordion(element);
      accordionCtrl.init(accordionElem,element,options);
    }
  };
}])
.directive('tinkAccordionGroup', function() {
  return {
    require:'^tinkAccordion',         // We need this directive to be inside an accordion
    restrict:'EA',
    transclude:true,              // It transcludes the contents of the directive into the template
    replace: true,                // The element containing the directive will be replaced with the template
    templateUrl:'templates/tinkAccordionGroup.html',
    scope: {
      heading: '@',               // Interpolate the heading attribute onto this scope
      isOpen: '=?',
      isDisabled: '=?',
      onclick:'=?',
      isCollapsed:'='
    },
    link: function(scope, element, attrs, accordionCtrl) {
     var states = {closed:1,open:2,loading:0};
      var state = states.closed;
      var trackToggle;
      var onFunc = typeof scope.onclick === 'function';
      if(!onFunc){
        element.addClass('no-call-back');
      }

      scope.toggleOpen = function(){
        if(state === states.closed){
          if(onFunc){
            scope.loading();
          }else{
            scope.open();
          }
        }else if(state === states.open){
          scope.close();
        }else if(state === states.loading){
          scope.cancel();
        }
      };


      if(attrs.isCollapsed){
        if(attrs.isCollapsed === 'true' || attrs.isCollapsed === 'false'){
          trackToggle = false;
        }else{
          trackToggle = true;
        }
      }

      if(trackToggle){
        scope.$watch('isCollapsed',function(newVar){
          if(newVar === true){
            stateClose();
          }else if(newVar === false){
            stateOpen();
          }
        });
      }

      scope.open = function(){
        if(trackToggle){
          scope.isCollapsed = false;
        }else{
          stateOpen();
        }
      };

      scope.close = function(){
        if(trackToggle){
          scope.isCollapsed = true;
        }else{
          stateClose();
        }
      };

      scope.loading = function(){
        if(trackToggle){
          scope.isCollapsed = false;
        }else{
          stateLoad();
        }
      };

      scope.cancel = function(){
        if(trackToggle){
          scope.isCollapsed = true;
        }else{
          cancelTrans();
        }
      };

      var stateLoad = function(){
        state = states.loading;
        callback('loading',function(){
          if(state === states.loading){
            stateOpen();
          }
        });
        accordionCtrl.openGroup(element,scope);
      };

      var stateOpen = function(){
        if((!onFunc && state === states.closed)||(onFunc && state === states.loading)){
          state = states.open;
          accordionCtrl.openGroup(element,scope);
          callback('open');
        }else if(onFunc && state === states.closed){
          stateLoad();
        }
      };

      var stateClose = function(){
        if(state === states.open){
          state = states.closed;
          accordionCtrl.closeGroup(element);
          callback('closed');
        }else if(state === states.canceld){
          cancelTrans();
        }

      };

      var cancelTrans = function(){
        state = states.closed;
        accordionCtrl.closeGroup(element);
         callback('canceld');
      };

      var callback = function(type,fn){
        if(onFunc){
          scope.onclick(type,fn);
        }
      };
      accordionCtrl.addGroup(scope,element);
    }
  };
})
.controller('TinkAccordionController', [function () {
  var self = this;

  this.groups = {};

  this.init = function(accordion,element,opts){
   self.$accordion = accordion;
   self.$options = opts;
   self.$accordion.init(element);
 };

 var currentOpen;
 this.addGroup = function(scope,elem){
  self.$accordion.addGroup(elem);
  if(self.$options.startOpen && scope.isCollapsed !== true){
    scope.open();
  }else if(scope.isCollapsed === false){
    scope.open();
  }
};

this.addLoader = function(elem){
  currentOpen = elem;
  self.$accordion.addLoader(elem);
};

this.openGroup = function(elem,scope){
  if(self.$options.oneAtATime && currentOpen && currentOpen !== scope){
    currentOpen.toggleOpen();
  }
  currentOpen = scope;
  self.$accordion.openGroup(elem);
};

this.closeGroup = function(elem){
  self.$accordion.closeGroup(elem);
  currentOpen = null;
};

}]);
;'use strict';
angular.module('tink.datepicker', [])
.directive('tinkDatepicker',['$q','$templateCache','$http','$compile','dateCalculator','calView',function($q,$templateCache,$http,$compile,dateCalculator,calView) {
  return {
    restrict:'EA',
    require:['ngModel','?^form'],
    replace:true,
    priority:999,
    templateUrl:'templates/tinkDatePickerInput.html',
    scope:{
      ngModel:'='
    },
    link:function(scope,element,attr,ctrl){
      if(ctrl[1]){
        ctrl[1].$removeControl(ctrl[0]);
      }
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

        content = angular.element('<input tink-format-input data-format="00/00/0000" data-placeholder="mm/dd/jjjj" data-date name="'+attr.name+'"  ng-model="ngModel" />');
      $(content).insertBefore(element.find('span.input-group-addon'));
      $compile(content)(scope);

      function bindLiseners(){

        copyEl.bind('mousedown',function(){
          input.focus();
          return false;
        });

      }

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
      });


      var options = {
        yearTitleFormat:'mmmm yyyy',
        dateFormat:'dd/mm/yyyy'
      };

      var $directive = {
        viewDate: new Date(),
        pane:{},
        mode:0,
        selectedDate:null
      };

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
      };

      scope.hide = function(){
        if(copyEl){
         copyEl.css({display: 'none'});
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
          content.find('#input').blur();
        }else if($directive.mode >0){
          $directive.mode -= 1;
          scope.build();
        }
      };

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
}]);;'use strict';
    angular.module('tink.datepickerRange', ['tink.dateHelper','tink.safeApply'])
    .directive('tinkDatepickerRange',['$q', '$templateCache', '$http', 'calView', '$sce','$compile','dateCalculator','$window', function ($q, $templateCache, $http, calView, $sce,$compile,dateCalculator,$window) {
      return {
        restrict: 'E',
        replace: true,
        require:['?^form'],
        templateUrl: 'templates/tinkDatePickerRangeInputs.html',
        controller:function($scope,$attrs){
          $scope.dynamicName = $attrs.name;
        },
        scope: {
          firstDate: '=',
          lastDate: '=',
        },
        link: function postLink(scope, element,attrs,form) {
          var $directive = {
            open: false,
            focused: {firstDateElem: element.find('div[tink-format-input] div:first'), lastDateElem: element.find('div[tink-format-input] div:last')},
            calendar: {first:element.find('span.input-group-addon:first'),last:element.find('span.input-group-addon:last')},
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
         // form[0].$removeControl(form[0].dubbel);

          $directive.calendar.first.on('click',function(){
            $directive.focused.firstDateElem.focus();
            show();
          });
          $directive.calendar.last.on('click',function(){
            $directive.focused.lastDateElem.focus();
            show();
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
             }


            });

            // Add a watch to know when input changes from the outside //
            scope.$watch('lastDate', function () {
            if(scope.lastDate !== null){
              $directive.focusedModel = 'lastDateElem';
              scope.$select(scope.lastDate,null,true);
              buildView();
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
                        $directive.focused.lastDateElem.focus();
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
                        $directive.focused.firstDateElem.focus();
                      }
                    }
                  }

                }

              }
            };

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
              if(!(evt.relatedTarget && evt.relatedTarget.nodeName === 'INPUT')){
                templateElem.css({display: 'none'});
                $directive.open = false;
                $directive.focusedModel = null;
              }
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
                $directive.focusedModel = 'firstDateElem';
              });
              angular.element($directive.focused.lastDateElem).bind('focus', function () {
                $directive.focusedModel = 'lastDateElem';
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
});;'use strict';
angular.module('tink.dropdown', [])
.constant('dropdownConfig', {
  openClass: 'open'
})
.service('tinkDropdownService', ['$document', function($document) {
  var openScope = null;

  this.open = function( dropdownScope ) {
    if ( !openScope ) {
      $document.bind('click', closeDropdown);
      $document.bind('keydown', escapeKeyBind);
    }

    if ( openScope && openScope !== dropdownScope ) {
        openScope.isOpen = false;
    }

    openScope = dropdownScope;
  };

  this.close = function( dropdownScope ) {
    if ( openScope === dropdownScope ) {
      openScope = null;
      $document.unbind('click', closeDropdown);
      $document.unbind('keydown', escapeKeyBind);
    }
  };

  var closeDropdown = function( evt ) {
    // This method may still be called during the same mouse event that
    // unbound this event handler. So check openScope before proceeding.
    if (!openScope) { return; }

    var toggleElement = openScope.getToggleElement();
    if ( evt && toggleElement && toggleElement[0].contains(evt.target) ) {
        return;
    }

    openScope.$apply(function() {
      openScope.isOpen = false;
    });
  };

  var escapeKeyBind = function( evt ) {
    if ( evt.which === 27 ) {
      openScope.focusToggleElement();
      closeDropdown();
    }
  };
}])

.controller('tinkDropdownController', ['$scope', '$attrs', '$parse', 'dropdownConfig', 'tinkDropdownService', '$animate', function($scope, $attrs, $parse, dropdownConfig, dropdownService, $animate) {
  var self = this,
      scope = $scope.$new(), // create a child scope so we are not polluting original one
      openClass = dropdownConfig.openClass,
      getIsOpen,
      setIsOpen = angular.noop,
      toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop;

  this.init = function( element ) {
    self.$element = element;

    if ( $attrs.isOpen ) {
      getIsOpen = $parse($attrs.isOpen);
      setIsOpen = getIsOpen.assign;

      $scope.$watch(getIsOpen, function(value) {
        scope.isOpen = !!value;
      });
    }
  };

  this.toggle = function( open ) {
    scope.isOpen = arguments.length ? !!open : !scope.isOpen;
    return scope.isOpen;
  };

  // Allow other directives to watch status
  this.isOpen = function() {
    return scope.isOpen;
  };

  scope.getToggleElement = function() {
    return self.toggleElement;
  };

  scope.focusToggleElement = function() {
    if ( self.toggleElement ) {
      self.toggleElement[0].focus();
    }
  };

  scope.$watch('isOpen', function( isOpen, wasOpen ) {
    $animate[isOpen ? 'addClass' : 'removeClass'](self.$element, openClass);

    if ( isOpen ) {
      scope.focusToggleElement();
      dropdownService.open( scope );
    } else {
      dropdownService.close( scope );
    }

    setIsOpen($scope, isOpen);
    if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
      toggleInvoker($scope, { open: !!isOpen });
    }
  });

  $scope.$on('$locationChangeSuccess', function() {
    scope.isOpen = false;
  });

  $scope.$on('$destroy', function() {
    scope.$destroy();
  });
}])

.directive('tinkDropdown', function() {
  return {
    controller: 'tinkDropdownController',
    link: function(scope, element, attrs, dropdownCtrl) {
      dropdownCtrl.init( element );
    }
  };
})

.directive('tinkDropdownToggle', function() {
  return {
    require: '?^tinkDropdown',
    link: function(scope, element, attrs, dropdownCtrl) {
      if ( !dropdownCtrl ) {
        return;
      }

      dropdownCtrl.toggleElement = element;

      var toggleDropdown = function(event) {
        event.preventDefault();

        if ( !element.hasClass('disabled') && !attrs.disabled ) {
          scope.$apply(function() {
            dropdownCtrl.toggle();
          });
        }
      };

      element.bind('click', toggleDropdown);

      // WAI-ARIA
      element.attr({ 'aria-haspopup': true, 'aria-expanded': false });
      scope.$watch(dropdownCtrl.isOpen, function( isOpen ) {
        element.attr('aria-expanded', !!isOpen);
      });

      scope.$on('$destroy', function() {
        element.unbind('click', toggleDropdown);
      });
    }
  };
});;  'use strict';
  angular.module('tink.format',[])
  .directive('tinkFormatInput', ['dateCalculator','$window','safeApply',function (dateCalculator,$window,safeApply) {
    return {
      replace:true,
      require:['ngModel','?^form'],
      template:'<div><div id="input" class="faux-input" contenteditable="true">{{placeholder}}</div></div>',
      link:function(scope,elem,attr,ctrl){
      //var ctrl = elem.data('$ngModelController');
      var forms = ctrl[1];
      if(forms){
        forms.$addControl(ctrl[0]);
      }
      ctrl = ctrl[0];
      if(!attr.format || !attr.placeholder){
        return;
      }
      var format = attr.format;
      var placeholder = attr.placeholder;
      var dateFormat ='dd/mm/yyyy';
      scope.format = format;
      scope.placeholder = placeholder;
      var type ='';
      if(angular.isDefined(attr.date)){
        type = 'date';
      }
      var newVa = placeholder;

      String.prototype.replaceAt=function(index, character) {
        return this.substr(0, index) + character + this.substr(index+character.length);
      };
      String.prototype.replaceRange=function(start,stop, value) {
        return this.substr(0, start) + value.substr(start,stop-start) + this.substr(stop);
      };
      var ctrlForm;

      if(attr.ctrlModel && forms){
        ctrlForm = forms[scope[attr.ctrlModel]];
      }else{
        ctrlForm = ctrl;
      }

      function handleInput(key,cur){
        var cursor;
        var selection;
        if(!cur){
          cursor = getCaretSelection().start;
          selection = getCaretSelection().end;
        }else{
          cursor = cur.start;
          selection = cur.end;
        }

        if(cursor > -1 && cursor < format.length){
           if(format[cursor]==='0'){
             if(charIs(key,'0')){
              if(cursor !== selection){
                newVa = newVa.replaceRange(cursor,selection,placeholder);
              }
               newVa = newVa.replaceAt(cursor,key);
               cursor +=1;
             }else{
               newVa = newVa.replaceRange(cursor,selection,placeholder);
             }
           }else{
             if(charIs(key,'0')){
                handleInput(key,{start:cursor+1,end:selection+1});
              return;
             }else{
               cursor +=1;
             }
           }
         }
         deleteVal = -1;
         setValue(cursor);
       }

       function validValue(value){

        if(value){
          if(value.length !== format.length) {return false;}

        for(var i =0; i < format.length; i++){
          if(format[i] === '0' && !charIs(value[i],'0')){
            return false;
          }else if(format[i] !== '0' && format[i] !== value[i]){
            return false;
          }
        }
        return true;
      }else {
        return false;
      }
       }

       function handleBackspace(){
        var cursor = getCaretSelection();
        if(cursor.start === cursor.end && cursor.start > 0 ){
          newVa = newVa.replaceAt(cursor.start-1,placeholder[cursor.start-1]);
          setValue(cursor.start-1);
        }else{
          newVa = newVa.replaceRange(cursor.start,cursor.end,placeholder);
          setValue(cursor.start);
        }

       }
       var deleteVal=-1;

       function handleDelete(){
        var cursor = getCaretSelection();
        if(cursor.start === cursor.end){
          var pos=cursor.start;
          while(placeholder[cursor.start]===newVa[cursor.start] && cursor.start < placeholder.length-1){
            cursor.start++;
          }
           newVa = newVa.replaceAt(cursor.start,placeholder[cursor.start]);
          setValue(pos);

        }else{
          newVa = newVa.replaceRange(cursor.start,cursor.end,placeholder);
          setValue(cursor.start);
        }
       }

      var valueToHtml = function(value){
        var html = '';
        // weekDaysLabels.join('</th><th class="dow text-center">') + '</th>')
        var plHtml = '<span class="placeholder">';
        var plEHtml = '</span>';
        var open = 0;
        for(var i=0; i<placeholder.length;i++){
          if(placeholder[i] === value[i]){
            if(open ===0){
              html += plHtml + value[i];
              open = 1;
            }else if( open === 1){
              html += value[i];
            }
          }else{
            if(open === 1){
              html += plEHtml + value[i];
              open = 0;
            }else{
              html += value[i];
            }
          }
        }
        if(open === 1){
          html += plEHtml;
        }
        return html;
      };

      var setValue = function(cur){
        elem.find('#input').html(valueToHtml(newVa));

        if(cur > -1 && cur <= format.length){
           setCursor(cur);
        }
        ctrl.$dirty = true;
        ctrl.$pristine = false;
      };

      var charIs = function(char,base){
        char = char.trim();
        if(base === '0' && char !== ''){
          if(char > -1 && char < 10){
            return true;
          }
        }
        return false;
      };

     var getCaretSelection = function()
      {
         var caretOffset = 0;
        var element = elem.get(0);
        element.focus();
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        var startOffset;

        if (typeof win.getSelection !== 'undefined') {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
                startOffset = caretOffset - window.getSelection().toString().length;
            }
        } else if ( (sel = doc.selection) && sel.type !== 'Control') {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint('EndToEnd', textRange);
            caretOffset = preCaretTextRange.text.length;
            startOffset = caretOffset - document.selection.createRange().text.length;

        }
        return  {start:startOffset,end:caretOffset};
      };

      function setCursor(cur) {
        var el = elem.find('#input')[0];
        var range = document.createRange();
        var sel = window.getSelection();
        var lengths = 0;
        var chosenChild = 0;
        for(var i = 0; i< elem.find('#input')[0].childNodes.length;i++){
          var node = elem.find('#input')[0].childNodes[i];
          if(node.nodeName === '#text'){
            lengths += node.length;
            chosenChild = node;
          }else{
            lengths += node.childNodes[0].length;
            chosenChild = node.childNodes[0];
          }
          if(cur <= lengths){
            cur = cur - (lengths - chosenChild.length);
            i=9999;
          }
        }
        range.setStart(chosenChild,cur);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        el.focus();
      }


      elem.find('#input').bind('keydown',function(event){
        if(event.which === 8){
          handleBackspace();
          return false;
        }else if(event.which === 46){
          handleDelete();
          return false;
        }
      });
      var firstclick = 0;
      elem.find('#input').bind('mousedown',function(){
        setTimeout(function(){
          if(placeholder === newVa && firstclick !== 1){
            setCursor(0);
            firstclick = 1;
          }
        }, 1);
      });

      elem.find('#input').keypress(function(event){
        var key = String.fromCharCode(event.which);
        setTimeout(function(){
          handleInput(key);
        }, 1);
        console.log(event)

        return false;
      });
//hnb314
      ctrl.$parsers.unshift(function(viewValue) {
        handleFormat(viewValue);
        return viewValue;
      });

      scope.$watch('ngModel',function(newVal,oldVal){
        if(newVal !== oldVal){
          handleFormat(newVal);
        }
      });

      var isRequired=function(){
        if(attr.required){
          if(placeholder !== newVa){
            ctrlForm.$setValidity('required', true);
          }else{
            ctrlForm.$setValidity('required', false);
          }
        }
      }

      elem.find('#input').on('blur', function() {
        var pre = '';
        if(attr.validName){
          pre = attr.validName;
        }
        safeApply(scope,function(){
          if(type === 'date' && validFormat(newVa,'dd/mm/yyyy')){
            ctrlForm.$setValidity(pre+'date', true);
            ctrl.$setViewValue(dateCalculator.getDate(newVa,'dd/mm/yyyy'));
          }else if(type === 'date' ){
            ctrlForm.$setValidity(pre+'date', false);
            ctrl.$setViewValue(null);
          }else if(validValue(newVa)){
            ctrl.$setViewValue(newVa);
            ctrlForm.$setValidity(pre+'format', true);
          }else{
            ctrl.$setViewValue(null);
            if(placeholder === newVa){
              ctrlForm.$setValidity(pre+'format', true);
            }else{
              ctrlForm.$setValidity(pre+'format', false);
            }
          }
          isRequired();
        });
      });

      //has to change
      var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
      var isTouch = ('createTouch' in $window.document) && isNative;
      function validFormat(date,format){
        var dateObject;
          if(angular.isDefined(date) && date !== null){

            if(typeof date === 'string'){
              if(date.length !== 10){ return false; }

              if(!isTouch && !/^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/.test(date)){return false;}

              dateObject = dateCalculator.getDate(date, format);
            }else if(angular.isDate(date)){
              dateObject = date;
            }else if(typeof date === 'function'){
              return validFormat(date(),format);
            }else {
              return false;
            }

            return dateObject.toString()!=='Invalid Date';
          }
        }

      ctrl.$formatters.push(function(modelValue) {

         if(modelValue === null || modelValue === undefined){
          newVa = placeholder;
          setValue();
          modelValue = null;
         }
        handleFormat(modelValue);
        ctrl.$setPristine();
      });

      var handleFormat = function(modelValue){

        if(typeof modelValue ==='function'){
          modelValue = modelValue();
        }
        if(type === 'date'){
        var pre = '';
        if(attr.validName){
          pre = attr.validName;
        }
          var date;
          if(angular.isDate(modelValue)){
            date = dateCalculator.formatDate(modelValue, dateFormat);
          }else{
            date = modelValue;
          }

          if(validValue(date) && validFormat(date,'dd/mm/yyyy')){
            newVa =  date;
             ctrlForm.$setValidity(pre+'date', true);
            setValue();
          }else{
             ctrlForm.$setValidity(pre+'date', false);
          }
        }else if(typeof modelValue === 'string'){
          if(validValue(modelValue)){
             newVa =  modelValue;
             setValue();
          }else{
            ctrl.$setViewValue(null);
          }
        }

       isRequired();
        return modelValue;
      };


      }
    };
  }])
  .controller('TinkFormatController', [function () {
  var self = this;

    this.groups = {};

    this.init = function(accordion,element,opts){
     self.$accordion = accordion;
     self.$options = opts;
     self.$accordion.init(element);
   };

  }]);; 'use strict';
 angular.module('tink.sideNav', []);
 angular.module('tink.sideNav')
  .directive('tinkNavAside',['tinkApi',function(tinkApi){
   return {
    restrict:'AE',
    link:function(scope,elem,attr){
      if(!tinkApi.sideNavigation || !tinkApi.sideNavToggle){
        return;
      }

      var opts= {};
      if(attr.accordion){
        opts.accordion = (attr.accordion === 'true');
      }
      if(attr.accordionFirst){
        opts.gotoPage = (attr.accordionFirst === 'true');
      }
      var sideNav = tinkApi.sideNavigation(elem);
      sideNav.init(opts);
      if(attr.toggleId){
        tinkApi.sideNavToggle.register(attr.toggleId,sideNav);
      }
    }
};
}]);;'use strict';
angular.module('tink.popOver', ['tink.tooltip'])
.directive( 'tinkPopoverPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'templates/popover.html'
  };
})
.directive( 'tinkPopover', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'tinkPopover', 'popover', 'click' );
}]);;'use strict';
angular.module('tink.timepicker', []);
angular.module('tink.timepicker')
.directive('tinkTimepicker',['$window',function($window){
  return{
    restrict:'AE',
    //template:'<div style="background:white;"><span style="float:left;">--</span><div style="float:left;">:</div><span>--</span></div>',
    template:'<div class="timepicker"><input type="text" ng-model="ngModel" /><span class="timepicker-later" role="spinbutton"></span><span class="timepicker-earlier" role="spinbutton"></span></div>',
    require:'ngModel',
    replace:true,
    scope:{
      ngModel:'&'
    },
    link:function(scope,elem,attr,ngModel){
      var current = {hour:{num:0,reset:true,prev:-1,start:true},min:{num:0,reset:true,start:true}};
      var inputField = elem.find('input');
      // Needs to be fixed
      // elem = elem.find('input');

      var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent) ;
      function isDateSupported() {
        var i = document.createElement('input');
        i.setAttribute('type', 'date');
        return i.type !== 'text';
      }
      if(isNative && isDateSupported()){
        inputField.prop('type', 'time');
      }

      // var dateToTime = function(date){
      //   if(angular.isDate(date)){
      //     var hour = date.getHours();
      //     var minute = date.getMinutes();
      //     if(hour && minute){
      //       return hour+':'+minute;
      //     }else{
      //       return '--:--';
      //     }
      //   }else{
      //     return '--;--';
      //   }
      // };

      elem.bind('mousedown',function(){
        return false;
      });

      elem.find('.timepicker-later').bind('click',function(){
        if(selected === 1){
          addHour(1);
        }else if(selected === 2){
          addMinute(1);
        }
        return false;
      });

      var bindEvent = function(){
        inputField.unbind('input').unbind('keydown').unbind('change').unbind('click').unbind('mousedown');
        inputField.keydown(function(e){
          var keycode = e.keyCode;
          var shift = e.shiftKey;
          if((keycode > 47 && keycode <58) || (keycode >95 && keycode <106)){
            if(selected === 1){
              handleHour(keycode);
            }else{
              handleMinute(keycode);
            }
          }else if(keycode === 39 && selected === 1){
            selectMinute(true);
          }else if(keycode === 37 && selected === 2){
            selectHour(true);
          }else if(keycode === 38){
            if(selected === 1){
              addHour(1);
            }else if(selected === 2){
              addMinute(1);
            }
          }else if(keycode === 40){
            if(selected === 1){
              addHour(-1);
            }else if(selected === 2){
              addMinute(-1);
            }
          }
          if(keyCode !== 9){
            return false;
          }
        });
      };

      elem.find('.timepicker-earlier').bind('click',function(){
        if(selected === 1){
          addHour(-1);
        }else if(selected === 2){
          addMinute(-1);
        }
        return false;
      });

      if(isNative && isDateSupported()){
        inputField.val('00:00:00');
      }else{
        bindEvent();
      }

      var keycodeMapper = {};

      var mapKeycodes = function(){
        var hulp = 0;
        for(var i = 48; i<=57;i++){
          keycodeMapper[i] = hulp;
          hulp++;
        }

        hulp = 0;

        for(var j = 96; j<= 105;j++){
          keycodeMapper[j] = hulp;
          hulp++;
        }
      };
      mapKeycodes();

      var handleHour = function(key){
        var num = keycodeMapper[key];
        if(current.hour.reset){
          current.hour.num = 0;
          current.hour.prev = -1;
          current.hour.reset = !current.hour.reset;
        }
        current.hour.start =false;
        scope.setHour(num);
      };

      var selectHour = function(reset){
        if(!(isNative && isDateSupported())){
          inputField[0].setSelectionRange(0, 2);
        }
        selected = 1;
        current.hour.reset = reset;
        current.min.reset = false;
      };

      var selectMinute = function(reset){
        if(!(isNative && isDateSupported())){
          inputField[0].setSelectionRange(3, 5);
        }
        selected = 2;
        current.min.reset = reset;
        current.hour.reset = false;
      };

      scope.setHour = function(num){
        var select = 2;
        var firstNumber = parseInt(hourString()[0]);
        var lastNumber = parseInt(hourString()[1]);
        if(lastNumber<2){
          current.hour.num = (lastNumber*10)+num;
          if(current.hour.prev !== -1){
            select = 2;
          }else if(firstNumber !== 0){
            select = 2;
          }else{
            select = 1;
          }
        }else if(lastNumber === 2){
          if(num < 4){
            current.hour.num = (lastNumber*10)+num;
          }else{
            current.hour.num = num;
          }
          select = 2;
        }else{
          current.hour.num = num;
          select = 2;
        }
        current.hour.prev = num;
        setValue(select);
      };

      // var isMobile = function(){
      //   return isNative && isDateSupported();
      // };

      var hourString = function(){

        if(current.hour.start){
          return '--';
        }else{
          return ('0'+current.hour.num).slice(-2);
        }

      };

      var minString = function(){
        if(current.min.start){
          return '--';
        }else{
          return ('0'+current.min.num).slice(-2);
        }
      };

      scope.setMinute = function(num){
        var lastNumber = parseInt(minString()[1]);
        if(isNaN(lastNumber) || lastNumber === 0 || lastNumber > 5){
          current.min.num = num;
        }else if(lastNumber<6){
          current.min.num = (lastNumber*10)+num;
        }

        setValue(2);
      };

      var setValue =  function(select){
        if(isNative && isDateSupported()){
          var timeStr = hourString()+':'+minString()+':00';
          timeStr.replace('-','0');
          ngModel.$setViewValue(timeStr);
        }else{
          ngModel.$setViewValue(hourString()+':'+minString());
        }

        ngModel.$render();
          if(select === 1){
            selectHour();
          }else if(select === 2){
            selectMinute();
          }

        if(!current.hour.start && !current.min.start){
          ngModel.$setValidity('time', true);
        }else{
          ngModel.$setValidity('time', false);
        }
      };

      var handleMinute = function(key){
        var num = keycodeMapper[key];
        current.min.start =false;
        scope.setMinute(num);
      };

      var selected = -1;

      var getHourOffset = function(){
        var padding = parseInt(inputField.css('padding-left'), 10);
        return padding+inputField.val().substr(0,2).width(inputField.css('font'),inputField.css('padding'))+2;
      };

      var getMinOffset = function(){
        return getHourOffset()+inputField.val().substr(3,2).width(inputField.css('font'),inputField.css('padding'))+2;
      };

      var pollyOffset = function(e){
        var target = e.target || e.srcElement,
        style = target.currentStyle || window.getComputedStyle(target, null),
        borderLeftWidth = parseInt(style.borderLeftWidth, 10),
        // borderTopWidth = parseInt(style.borderTopWidth, 10),
        rect = target.getBoundingClientRect(),
        offsetX = e.clientX - borderLeftWidth - rect.left;
        return offsetX;
      };

      inputField.bind('mousedown',function(evt){

        var offset  = pollyOffset(evt);
        if(offset < getHourOffset() || offset > getMinOffset()){
          selectHour(true);
          selected = 1;
        }else{
          selectMinute(true);
          selected = 2;
        }
        inputField.focus();

        return false;
      });

      String.prototype.width = function(font,padding) {
        var f = font || '15px arial',
        p = padding || '',
        o = $('<div>' + this + '</div>')
        .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f,'padding':p})
        .appendTo($('body')),
        w = o.width();

        o.remove();

        return w;
      };

      // function getTextWidth(text, font,padding) {
      //     // re-use canvas object for better performance
      //     var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
      //     canvas.style.padding = padding;
      //     var context = canvas.getContext('2d');
      //     context.font = font;
      //     var metrics = context.measureText(text);
      //     return metrics.width;
      // }
      var addMinute = function(size){
        current.min.start =false;
        var newMin = current.min.num + size;
        if(newMin > 0 && newMin < 60){
          current.min.num = newMin;
        }else if(newMin >= 60 || newMin < 0){
          addHour(Math.floor(newMin/60));
          if(newMin % 60 < 0){
            current.min.num = 60 + (newMin % 60);
          }else{
            current.min.num = newMin % 60;
          }
        }else{
          current.min.num = 0;
        }
        setValue(2);
      };

      var clearSelection = function(){
        if(!(isNative && isDateSupported())){
          inputField[0].setSelectionRange(0, 0);
        }
      };

      var addHour = function(size){
        current.hour.start =false;
        var newHour = current.hour.num + size;
        if(newHour > 0 && newHour < 24){
          current.hour.num = newHour;
        }else if(newHour < 0){
          current.hour.num = 24 + newHour;
        }else{
          current.hour.num = 0;
        }
        setValue(1);
        current.hour.reset = true;
      };

      var reset = function(){
        current = {hour:{num:0,reset:true,prev:-1,start:true},min:{num:0,reset:true,start:true}};
        ngModel.$setValidity('time', false);
        setValue();
      };
      //reset();

      scope.$watch('ngModel',function(newVal){
        var date=null;
        var hour = null;
        var minute = null;
        if(typeof newVal === 'function'){
          date = newVal();
        }else {
          date = newVal;
        }

        if(angular.isDate(date)){
          hour = date.getHours();
          minute = date.getMinutes();
        }else if(typeof date === 'string'  && date.length >= 5){
          if(/^([01]\d|2[0-3]):?([0-5]\d)$/.test(date.substr(0,5))){
            hour = parseInt(date.substr(0,2));
            minute = parseInt(date.substr(3,2));
          }
        }else{
          reset();
        }
        if(hour && minute){
          current.hour.start = false;
          current.hour.num = hour;
          current.min.start =false;
          current.min.num = minute;
          setValue();
         }
      });

      ngModel.$formatters.unshift(function(modelValue) {

        var date = modelValue;
        console.log(date);
        if(angular.isDate(date)){
          var hour = date.getHours();
          var minute = date.getMinutes();
          if(hour && minute){
            current.hour.start =false;
            scope.setHour(hour);
            current.min.start =false;
            scope.setMinute(minute);
            clearSelection();
          }
        }else{
          reset();
        }
       });

      ngModel.$parsers.push(function(time) {
        inputField.val(time);
        var hour = parseInt(time.substr(0,2));
        var minute = parseInt(time.substr(3,2));
        if(hour && minute){
          var date = new Date();
          date.setHours(hour);
          date.setMinutes(minute);
          return date;
        }

      });

    }
  };
}]);


;'use strict';
 angular.module('tink.sideNav')
  .directive('tinkSidenavCollapse',['tinkApi',function(tinkApi){
   return {
    restrict:'A',
    link:function(scope,elem,attr){
      if(!tinkApi.sideNavigation || !tinkApi.sideNavToggle){
        return;
      }
    	elem.bind('click', function(){
        if(attr.tinkSidenavCollapse && attr.tinkSidenavCollapse.trim() !== ''){
          tinkApi.sideNavToggle.toggleById(attr.tinkSidenavCollapse);
          return false;
        }
      });
  	}
};
}]);;'use strict';
angular.module('tink.tooltip', [])
.provider( '$tooltip', function () {
  // The default options tooltip and popover.
  var defaultOptions = {
    placement: 'top',
    animation: true,
    popupDelay: 0
  };

  // Default hide triggers for each show trigger
  var triggerMap = {
    'mouseenter': 'mouseleave',
    'click': 'click',
    'focus': 'blur'
  };

  // The options specified to the provider globally.
  var globalOptions = {};

  /**
   * `options({})` allows global configuration of all tooltips in the
   * application.
   *
   *   var app = angular.module( 'App', ['ui.bootstrap.tooltip'], function( $tooltipProvider ) {
   *     // place tooltips left instead of top by default
   *     $tooltipProvider.options( { placement: 'left' } );
   *   });
   */
	this.options = function( value ) {
		angular.extend( globalOptions, value );
	};

  /**
   * This allows you to extend the set of trigger mappings available. E.g.:
   *
   *   $tooltipProvider.setTriggers( 'openTrigger': 'closeTrigger' );
   */
  this.setTriggers = function setTriggers ( triggers ) {
    angular.extend( triggerMap, triggers );
  };

  /**
   * This is a helper function for translating camel-case to snake-case.
   */
   /*jshint camelcase: false */
  function snake_case(name){
    var regexp = /[A-Z]/g;
    var separator = '-';
    return name.replace(regexp, function(letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  }

  /**
   * Returns the actual instance of the $tooltip service.
   * TODO support multiple triggers
   */
  this.$get = [ '$window', '$compile', '$timeout', '$document', '$position', '$interpolate', function ( $window, $compile, $timeout, $document, $position, $interpolate ) {
    return function $tooltip ( type, prefix, defaultTriggerShow ) {
      var options = angular.extend( {}, defaultOptions, globalOptions );
      /**
       * Returns an object of show and hide triggers.
       *
       * If a trigger is supplied,
       * it is used to show the tooltip; otherwise, it will use the `trigger`
       * option passed to the `$tooltipProvider.options` method; else it will
       * default to the trigger supplied to this directive factory.
       *
       * The hide trigger is based on the show trigger. If the `trigger` option
       * was passed to the `$tooltipProvider.options` method, it will use the
       * mapped trigger from `triggerMap` or the passed trigger if the map is
       * undefined; otherwise, it uses the `triggerMap` value of the show
       * trigger; else it will just use the show trigger.
       */
      function getTriggers ( trigger ) {
        var show = trigger || options.trigger || defaultTriggerShow;
        var hide = triggerMap[show] || show;
        return {
          show: show,
          hide: hide
        };
      }

      var directiveName = snake_case( type );

      var startSym = $interpolate.startSymbol();
      var endSym = $interpolate.endSymbol();
      var template =
        '<div '+ directiveName +'-popup '+
          'title="'+startSym+'title'+endSym+'" '+
          'content="'+startSym+'content'+endSym+'" '+
          'placement="'+startSym+'placement'+endSym+'" '+
          'animation="animation" '+
          'is-open="isOpen"'+
          '>'+
        '</div>';

      return {
        restrict: 'EA',
        compile: function () {
          var tooltipLinker = $compile( template );

          return function link ( scope, element, attrs ) {
            var tooltip;
            var tooltipLinkedScope;
            var transitionTimeout;
            var popupTimeout;
            var appendToBody = angular.isDefined( options.appendToBody ) ? options.appendToBody : false;
            var triggers = getTriggers( undefined );
            var hasEnableExp = angular.isDefined(attrs[prefix+'Enable']);
            var ttScope = scope.$new(true);

            var positionTooltip = function () {

              var ttPosition = $position.positionElements(element, tooltip, ttScope.placement, appendToBody);
              ttPosition.top += 'px';
              ttPosition.left += 'px';

              // Now set the calculated positioning.
              tooltip.css( ttPosition );
            };

            // By default, the tooltip is not open.
            // TODO add ability to start tooltip opened
            ttScope.isOpen = false;

            function toggleTooltipBind () {
              if ( ! ttScope.isOpen ) {
                showTooltipBind();
              } else {
                hideTooltipBind();
              }
            }

            // Show the tooltip with delay if specified, otherwise show it immediately
            function showTooltipBind() {
              if(hasEnableExp && !scope.$eval(attrs[prefix+'Enable'])) {
                return;
              }

              prepareTooltip();

              if ( ttScope.popupDelay ) {
                // Do nothing if the tooltip was already scheduled to pop-up.
                // This happens if show is triggered multiple times before any hide is triggered.
                if (!popupTimeout) {
                  popupTimeout = $timeout( show, ttScope.popupDelay, false );
                  popupTimeout.then(function(reposition){reposition();});
                }
              } else {
                show()();
              }
            }

            function hideTooltipBind () {
              scope.$apply(function () {
                hide();
              });
            }

            // Show the tooltip popup element.
            function show() {

              popupTimeout = null;

              // If there is a pending remove transition, we must cancel it, lest the
              // tooltip be mysteriously removed.
              if ( transitionTimeout ) {
                $timeout.cancel( transitionTimeout );
                transitionTimeout = null;
              }

              // Don't show empty tooltips.
              if ( ! ttScope.content ) {
                return angular.noop;
              }

              createTooltip();

              // Set the initial positioning.
              tooltip.css({ top: 0, left: 0, display: 'block' });

              // Now we add it to the DOM because need some info about it. But it's not
              // visible yet anyway.
              if ( appendToBody ) {
                  $document.find( 'body' ).append( tooltip );
              } else {
                element.after( tooltip );
              }

              positionTooltip();

              // And show the tooltip.
              ttScope.isOpen = true;
              ttScope.$digest(); // digest required as $apply is not called

              // Return positioning function as promise callback for correct
              // positioning after draw.
              return positionTooltip;
            }

            // Hide the tooltip popup element.
            function hide() {
              // First things first: we don't show it anymore.
              ttScope.isOpen = false;

              //if tooltip is going to be shown after delay, we must cancel this
              $timeout.cancel( popupTimeout );
              popupTimeout = null;

              // And now we remove it from the DOM. However, if we have animation, we
              // need to wait for it to expire beforehand.
              // FIXME: this is a placeholder for a port of the transitions library.
              if ( ttScope.animation ) {
                if (!transitionTimeout) {
                  transitionTimeout = $timeout(removeTooltip, 500);
                }
              } else {
                removeTooltip();
              }
            }

            function createTooltip() {
              // There can only be one tooltip element per directive shown at once.
              if (tooltip) {
                removeTooltip();
              }
              tooltipLinkedScope = ttScope.$new();
              tooltip = tooltipLinker(tooltipLinkedScope, angular.noop);
            }

            function removeTooltip() {
              transitionTimeout = null;
              if (tooltip) {
                tooltip.remove();
                tooltip = null;
              }
              if (tooltipLinkedScope) {
                tooltipLinkedScope.$destroy();
                tooltipLinkedScope = null;
              }
            }

            function prepareTooltip() {
              prepPlacement();
              prepPopupDelay();
            }

            /**
             * Observe the relevant attributes.
             */
            attrs.$observe( type, function ( val ) {
              ttScope.content = val;

              if (!val && ttScope.isOpen ) {
                hide();
              }
            });

            attrs.$observe( prefix+'Title', function ( val ) {
              ttScope.title = val;
            });

            function prepPlacement() {
              var val = attrs[ prefix + 'Placement' ];
              ttScope.placement = angular.isDefined( val ) ? val : options.placement;
            }

            function prepPopupDelay() {
              var val = attrs[ prefix + 'PopupDelay' ];
              var delay = parseInt( val, 10 );
              ttScope.popupDelay = ! isNaN(delay) ? delay : options.popupDelay;
            }

            var unregisterTriggers = function () {
              element.unbind(triggers.show, showTooltipBind);
              element.unbind(triggers.hide, hideTooltipBind);
            };

            function prepTriggers() {
              var val = attrs[ prefix + 'Trigger' ];
              unregisterTriggers();

              triggers = getTriggers( val );

              if ( triggers.show === triggers.hide ) {
                element.bind( triggers.show, toggleTooltipBind );
              } else {
                element.bind( triggers.show, showTooltipBind );
                element.bind( triggers.hide, hideTooltipBind );
              }
            }
            prepTriggers();

            var animation = scope.$eval(attrs[prefix + 'Animation']);
            ttScope.animation = angular.isDefined(animation) ? !!animation : options.animation;

            var appendToBodyVal = scope.$eval(attrs[prefix + 'AppendToBody']);
            appendToBody = angular.isDefined(appendToBodyVal) ? appendToBodyVal : appendToBody;

            // if a tooltip is attached to <body> we need to remove it on
            // location change as its parent scope will probably not be destroyed
            // by the change.
            if ( appendToBody ) {
              scope.$on('$locationChangeSuccess', function closeTooltipOnLocationChangeSuccess () {
              if ( ttScope.isOpen ) {
                hide();
              }
            });
            }

            // Make sure tooltip is destroyed and removed.
            scope.$on('$destroy', function onDestroyTooltip() {
              $timeout.cancel( transitionTimeout );
              $timeout.cancel( popupTimeout );
              unregisterTriggers();
              removeTooltip();
              ttScope = null;
            });
          };
        }
      };
    };
  }];
})
 .factory('$position', ['$document', '$window', function ($document, $window) {

    function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl !== $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
        };
      },

      /**
       * Provides coordinates for the targetEl in relation to hostEl
       */
      positionElements: function (hostEl, targetEl, positionStr, appendToBody) {

        var positionStrParts = positionStr.split('-');
        var pos0 = positionStrParts[0], pos1 = positionStrParts[1] || 'center';

        var hostElPos,
          targetElWidth,
          targetElHeight,
          targetElPos;

        hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

        targetElWidth = targetEl.prop('offsetWidth');
        targetElHeight = targetEl.prop('offsetHeight');

        var shiftWidth = {
          center: function () {
            return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
          },
          left: function () {
            return hostElPos.left;
          },
          right: function () {
            return hostElPos.left + hostElPos.width;
          }
        };

        var shiftHeight = {
          center: function () {
            return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
          },
          top: function () {
            return hostElPos.top;
          },
          bottom: function () {
            return hostElPos.top + hostElPos.height;
          }
        };

        switch (pos0) {
          case 'right':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: shiftWidth[pos0]()
            };
            break;
          case 'left':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: hostElPos.left - targetElWidth
            };
            break;
          case 'bottom':
            targetElPos = {
              top: shiftHeight[pos0](),
              left: shiftWidth[pos1]()
            };
            break;
          default:
            targetElPos = {
              top: hostElPos.top - targetElHeight,
              left: shiftWidth[pos1]()
            };
            break;
        }

        return targetElPos;
      }
    };
  }])
.directive( 'tinkTooltipPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'templates/tooltip.html'
  };
})

.directive( 'tinkTooltip', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'tinkTooltip', 'tooltip', 'mouseenter' );
}])

.directive( 'tinkTooltipHtmlUnsafePopup', function ($sce) {
  return {
    restrict: 'EA',
    replace: true,
    scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'templates/tooltip.html',
    link:function($scope){
      $scope.content = $sce.trustAsHtml($scope.content);
    }
  };
})

.directive( 'tinkTooltipHtmlUnsafe', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'tinkTooltipHtmlUnsafe', 'tooltip', 'mouseenter' );
}]);;  'use strict';
  angular.module('tink.topNav', []);
  angular.module('tink.topNav')
  .directive('tinkTopNav',['$document','$window','tinkApi',function($document,$window,tinkApi){

   return {
    restrict:'AE',
    priority:99,
    link:function(scope,elem){
      if(!tinkApi.sideNavigation || !tinkApi.sideNavToggle){
        return;
      }
      tinkApi.topNavigation(elem).init();
  }
};
}]);;  'use strict';
  angular.module('tink.validDate',['tink.dateHelper','tink.safeApply'])
  .directive('tinkValidDate', ['$timeout', '$filter','dateCalculator','safeApply','$window', function ($timeout, $filter,dateCalculator,safeApply,$window) {
    return {
      require: 'ngModel',
      priority: 99,

      link: function ($scope, $element, $attrs, ctrl) {
        var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
        var isTouch = ('createTouch' in $window.document) && isNative;
        var prevVal = '';
        var format = $attrs.format;
        if(isTouch){
          format = 'yyyy-mm-dd';
        }
        function checkForValid(viewValue) {
          ctrl.$setValidity('date', validFormat(viewValue,format));
          return viewValue;
        }

        function validFormat(date,format){
          var dateObject;
          if(angular.isDefined(date) && date !== null){

            if(typeof date === 'string'){
              if(date.length !== 10){ return false; }

              if(!isTouch && !/^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/.test(date)){return false;}

              dateObject = dateCalculator.getDate(date, format);
            }else if(angular.isDate(date)){
              dateObject = date;
            }else if(typeof date === 'function'){
              return validFormat(date(),format);
            }else {
              return false;
            }

            return dateObject.toString()!=='Invalid Date';
          }
        }

        $element.unbind('input').unbind('keydown').unbind('change');
        $element.bind('blur', function() {

          safeApply($scope,function() {
            if(validFormat($element.val(),format)){
              checkForValid($element.val(),format);
              prevVal = $element.val();
              ctrl.$setViewValue($element.val());
            }else{
             ctrl.$setViewValue(undefined);
           }

         });
        });

        $element.bind('input change', function() {
          safeApply($scope,function() {
            if(validFormat($element.val(),format)){
            }else{
              //ctrl.$setViewValue(undefined);
              return;
            }
          });


        });
           //format text going to user (model to view)
           ctrl.$formatters.push(checkForValid);

           ctrl.$parsers.unshift(checkForValid);
         }
       };
     }]);;'use strict';
angular.module('tink', [
		'tink.tinkApi',
		'tink.datepickerRange',
		'tink.popOver',
		'tink.tooltip',
		'tink.datepicker',
		'tink.topNav',
		'tink.sideNav',
		'tink.dropdown',
		'tink.templates',
		'tink.validDate',
		'tink.format'
	]);
; 'use strict';
 angular.module('tink.tinkApi', []);
 angular.module('tink.tinkApi')
.provider('tinkApi', function () {
  var _options = {};

  return {
    setOptions: function (options) {
      angular.extend(_options, options);
    },
    getOptions: function () {
      return angular.copy(_options);
    },
    $get: ['$window', function ($window) {
       var sideToggle = {};

      return {
        sideNavigation: $window.tinkApi.sideNavigation,
        sideNavToggle:{
          register:function(id,sideElem){
            sideToggle[id]=sideElem;
          },
          toggleById:function(id){
            if(sideToggle[id]){
              sideToggle[id].toggleMenu();
            }
          }
        },
        topNavigation:$window.tinkApi.topNavigation,
        accordion:$window.tinkApi.accordion

      };

    }]
  };
});;'use strict';
angular.module('tink.dateHelper', []);
angular.module('tink.dateHelper')
.factory('dateCalculator', function () {
  var nl = {
    'DAY': ['Zondag', 'Maandag', 'DinsDag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'],
    'MONTH': ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
    'SHORTDAY': ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'],
    'SHORTMONTH': ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug','Sep', 'Okt', 'Nov', 'Dec']
  },
  dateFormat = (function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
    timezoneClip = /[^-+\dA-Z]/g,
    pad = function (val, len) {
      val = String(val);
      len = len || 2;
      while (val.length < len) {
        val = '0' + val;
      }
      return val;
    };

        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc, lang) {
          var dF = dateFormat;

          // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
          if (arguments.length === 1 && Object.prototype.toString.call(date) === '[object String]' && !/\d/.test(date)) {
            mask = date;
            date = undefined;
          }

          // Passing date through Date applies Date.parse, if necessary
          date = date ? new Date(date) : new Date();
          if (isNaN(date)) {
            throw new SyntaxError('invalid date');
          }

          mask = String(dF.masks[mask] || mask || dF.masks['default']).toLowerCase();
          // Allow setting the utc argument via the mask
          if (mask.slice(0, 4) === 'UTC:') {
            mask = mask.slice(4);
            utc = true;
          }

          var _ = utc ? 'getUTC' : 'get',
          d = date[_ + 'Date'](),
          D = date[_ + 'Day'](),
          m = date[_ + 'Month'](),
          y = date[_ + 'FullYear'](),
          H = date[_ + 'Hours'](),
          M = date[_ + 'Minutes'](),
          s = date[_ + 'Seconds'](),
          L = date[_ + 'Milliseconds'](),
          o = utc ? 0 : date.getTimezoneOffset(),
          flags = {
            d: d,
            dd: pad(d),
            ddd: lang.SHORTDAY[D],
            dddd: lang.DAY[D],
            m: m + 1,
            mm: pad(m + 1),
            mmm: lang.SHORTMONTH[m],
            mmmm: lang.MONTH[m],
            yy: String(y).slice(2),
            yyyy: y,
            h: H % 12 || 12,
            hh: pad(H % 12 || 12),
            H: H,
            HH: pad(H),
            M: M,
            MM: pad(M),
            s: s,
            ss: pad(s),
            l: pad(L, 3),
            L: pad(L > 99 ? Math.round(L / 10) : L),
            t: H < 12 ? 'a' : 'p',
            tt: H < 12 ? 'am' : 'pm',
            T: H < 12 ? 'A' : 'P',
            TT: H < 12 ? 'AM' : 'PM',
            Z: utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
            o: (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
            S: ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
          };

          return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
          });
        };
      }());

  // Some common format strings
  dateFormat.masks = {
    'default': 'ddd mmm dd yyyy HH:MM:ss',
    shortDate: 'dd/mm/yyyy',
    mediumDate: 'mmm d, yyyy',
    longDate: 'mmmm d, yyyy',
    fullDate: 'dddd, mmmm d, yyyy',
    shortTime: 'h:MM TT',
    mediumTime: 'h:MM:ss TT',
    longTime: 'h:MM:ss TT Z',
    isoDate: 'yyyy-mm-dd',
    isoTime: 'HH:MM:ss',
    isoDateTime: 'yyyy-mm-dd\'T\'HH:MM:ss',
    isoUtcDateTime: 'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\''
  };

  function stringToDate(_date, _format) {
    var _delimiter;
    if (_format.indexOf('/') !== -1) {
      _delimiter = '/';
    } else if (_format.indexOf('-') !== -1) {
      _delimiter = '-';
    } else if (_format.indexOf('.') !== -1) {
      _delimiter = '.';
    }
    var formatLowerCase = _format.toLowerCase();
    var formatItems = formatLowerCase.split(_delimiter);
    var dateItems = _date.split(_delimiter);
    var monthIndex = formatItems.indexOf('mm');
    var dayIndex = formatItems.indexOf('dd');
    var yearIndex = formatItems.indexOf('yyyy');
    var month = parseInt(dateItems[monthIndex]);
    month -= 1;
    var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);

    return formatedDate;
  }

  return {
    dateBeforeOther: function (first, last) {
      if (new Date(first).getTime() > new Date(last).getTime() && last !== null) {
        return true;
      } else {
        return false;
      }
    },
    splitRow: function (arr, size) {
      var arrays = [];
      while (arr.length > 0) {
        arrays.push(arr.splice(0, size));
      }
      return arrays;
    },
    daysBetween: function (first, last) {
      return Math.round(Math.abs((first.getTime() - last.getTime()) / (24 * 60 * 60 * 1000)));
    },
    isSameDate:function (a, b) {
      if (angular.isDate(a) && angular.isDate(b)) {
        a.setHours(0,0,0,0);
        b.setHours(0,0,0,0);
        return a.getTime() === b.getTime();
      } else {
        return false;
      }
    },
    isSameMonth:function (a, b) {
      if (angular.isDate(a) && angular.isDate(b)) {
        a.setHours(0,0,0,0);
        b.setHours(0,0,0,0);
        return (a.getMonth() === b.getMonth()) && (a.getFullYear() === b.getFullYear()) ;
      } else {
        return false;
      }
    },
    getDate: function (date, format) {
      if(!angular.isDefined(date) || !angular.isDefined(format) || date.trim()===''){
        return null;
      }
      return stringToDate(date, format);
    },
    daysInMonth: function (month,year) {
      if(angular.isDate(month)){
        return new Date(month.getYear(), month.getMonth() + 1, 0).getDate();
      }else{
        return new Date(year, month, 0).getDate();
      }
    },
    daysInMonthNodays: function (month,year) {

      return new Date(year, month, 0).getDate();
    },
    format: function (date, format) {
      return dateFormat(date, format, null, nl);
    },
    formatDate: function (date, format) {
        return dateFormat(date, format,null,nl);
    },
    getShortDays: function (lang) {

      if (lang !== angular.isDefined(lang)) {
        lang = 'nl';
      }
      switch (lang.toLowerCase()) {
        case 'nl':
        return nl.SHORTDAY;
      }
    },
    getShortMonths: function (lang) {
      if (lang !== angular.isDefined(lang)) {
        lang = 'nl';
      }
      switch (lang.toLowerCase()) {
        case 'nl':
        return nl.SHORTMONTH;
      }
    },
    getDays: function (lang) {
      if (lang !== angular.isDefined(lang)) {
        lang = 'nl';
      }
      switch (lang.toLowerCase()) {
        case 'nl':
        return nl.DAY;
      }
    },
    getMonths: function (lang) {
      if (lang !== angular.isDefined(lang)) {
        lang = 'nl';
      }
      switch (lang.toLowerCase()) {
        case 'nl':
        return nl.MONTH;
      }
    }
  };
})
.factory('safeApply', [function() {
  return function($scope, fn) {
    var phase = $scope.$root.$$phase;
    if(phase === '$apply' || phase === '$digest') {
      if (fn) {
        $scope.$eval(fn);
      }
    } else {
      if (fn) {
        $scope.$apply(fn);
      } else {
        $scope.$apply();
      }
    }
  };
}])
.factory('calView',['dateCalculator',function (dateCalculator) {
  function isSameDate(a, b) {
    if (angular.isDate(a) && angular.isDate(b)) {
      a.setHours(0,0,0,0);
      b.setHours(0,0,0,0);
      return a.getTime() === b.getTime();
    } else {
      return false;
    }
  }
  function inRange(date, first, last) {

    if (angular.isDate(first) && angular.isDate(last) && angular.isDate(date)) {
      date.setHours(0,0,0,0);
      first.setHours(0,0,0,0);
      last.setHours(0,0,0,0);
      if (date > first && date < last) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  function mod(n, m) {
    return ((n % m) + m) % m;
  }
  function callCullateData(date) {

    var year = date.getFullYear(),
    month = date.getMonth();

    var firstDayOfMonth = new Date(year, month, 1);
    var firstDayOfWeek = new Date(+firstDayOfMonth - mod(firstDayOfMonth.getDay() - 1, 7) * 864e5);


    var offsetDayOfMonth = firstDayOfMonth.getTimezoneOffset();
    var offsetDayOfweek = firstDayOfWeek.getTimezoneOffset();

    if (offsetDayOfMonth !== offsetDayOfweek) {
      firstDayOfWeek = new Date(+firstDayOfWeek + (offsetDayOfweek - offsetDayOfMonth) * 60e3);
    }

    var daysToDraw = dateCalculator.daysInMonth(date) + dateCalculator.daysBetween(firstDayOfWeek, firstDayOfMonth);
    if (daysToDraw % 7 !== 0) {
      daysToDraw += 7 - (daysToDraw % 7);
    }

    return {days: daysToDraw, firstDay: firstDayOfWeek};
  }

  function split(arr, size) {
    var arrays = [];
    while(arr.length > 0) {
      arrays.push(arr.splice(0, size));
    }
    return arrays;
  }

  function daysInRows(date,selectedDate){
    var monthCall = callCullateData(date);
    var today = new Date();
    var days = [], day;
      for(var i = 0; i < monthCall.days; i++) { // < 7 * 6

        day = new Date(monthCall.firstDay.getFullYear(), monthCall.firstDay.getMonth(), monthCall.firstDay.getDate() + i);
        var isMuted = false;
        if(day.getMonth() !== date.getMonth()){
          isMuted = true;
        }
        var isSelected = false;
        if(angular.isDate(selectedDate)){
          isSelected = selectedDate.toDateString() === day.toDateString();
        }
        days.push({date: day,selected:isSelected, isToday: day.toDateString() === today.toDateString(), label: dateCalculator.formatDate(day, 'dd'),isMuted:isMuted});
    }
    var arrays = split(days, 7);
     return arrays;

  }

  function monthInRows(date){
    var months = [];
    var monthDate;
     for(var i = 0; i < 12; i++) {
      monthDate = new Date(date.getFullYear(),i,1);
      months.push({date: monthDate,label: dateCalculator.formatDate(monthDate, 'mmm')});
     }
    var arrays = split(months, 4);
    return arrays;
  }

  function yearInRows(date){
    var years = [];
    var yearDate;
     for(var i = 11; i > -1; i--) {
      yearDate = new Date(date.getFullYear()-i,date.getMonth(),1);
      years.push({date: yearDate,label: dateCalculator.formatDate(yearDate, 'yyyy')});
     }
    var arrays = split(years, 4);
    return arrays;
  }

  function createLabels(date, firstRange, lastRange,grayed) {
    var label = '',cssClass = '';
    if (label !== null && angular.isDate(date)) {
      label = date.getDate();
      if(grayed){
        cssClass = 'btn-grayed';
      }
      if (isSameDate(date, firstRange) || isSameDate(date, lastRange)) {
        if(grayed){
          cssClass = 'btn-grayed-selected';
        }else{
          cssClass = 'btn-primary';
        }
      } else if (inRange(date, firstRange, lastRange)) {
        if(grayed){
          cssClass = 'btn-grayed-selected';
        }else{
          cssClass = 'btn-info';
        }
      } else if (isSameDate(date, new Date())) {
        if(grayed){
          cssClass = 'btn-grayed';
        }else{
          cssClass = 'btn-warning';
        }
      }
      var month = ('0' + (date.getMonth() + 1)).slice(-2);
      var day = ('0' + (date.getDate())).slice(-2);
      return '<td><button ng-click="$select(\''+date.getFullYear()+'/'+month+'/'+day+'\')" class="' + cssClass + '"><span>' + label + '</span></button></td>';
    } else{
      return '<td></td>';
    }

        /* var td = document.createElement("td");
         var button = document.createElement("button");
         button.class=cssClass;
         var span = document.createElement("span");
         span.innerHTML = document.createTextNode(label).textContent;
         button.appendChild(span);
         td.appendChild(button);
         return td;*/

       }

      return {
        createMonthDays: function (date, firstRange, lastRange,control) {
          var domElem = '', monthCall = callCullateData(date), label;
          //var tr = createTR();
          var tr = '<tr>';
          for (var i = 0; i < monthCall.days; i++) {
            var day = new Date(monthCall.firstDay.getFullYear(), monthCall.firstDay.getMonth(), monthCall.firstDay.getDate() + i);
            label = createLabels(null, firstRange, lastRange);
            if(control === 'prevMonth'){
              if(day.getMonth() !== date.getMonth() && dateCalculator.dateBeforeOther(date,day)){
                label = createLabels(day, firstRange, lastRange,true);
              }
            } else if(control === 'nextMonth'){
              if(day.getMonth() !== date.getMonth() && dateCalculator.dateBeforeOther(day,date)){
                label = createLabels(day, firstRange, lastRange,true);
              }
            }
            if(day.getMonth() === date.getMonth()){
              label = createLabels(day, firstRange, lastRange);
            }

            //tr.appendChild(label);
            tr += label;
            if ((i + 1) % 7 === 0) {
              tr += '</tr>';
              domElem += tr;
              tr = '<tr>';
              //tr = createTR();
            }
          }
          domElem = '<tbody id="secondCal">' + domElem + '</tbody>';
          return domElem;


        },
        daysInRows: function(date,model){
         return daysInRows(date,model);
        },
        monthInRows:function(date){
          return monthInRows(date);
        },
        yearInRows:function(date){
          return yearInRows(date);
        }
      };
    }]);;'use strict';
angular.module('tink.safeApply', [])
.factory('safeApply', [function() {
    return function($scope, fn) {
        var phase = $scope.$root.$$phase;
        if(phase === '$apply' || phase === '$digest') {
            if (fn) {
                $scope.$eval(fn);
            }
        } else {
            if (fn) {
                $scope.$apply(fn);
            } else {
                $scope.$apply();
            }
        }
    };
}]);;'use strict';
angular.module('tink.templates', [])
    .run(['$templateCache', function($templateCache) {
      $templateCache.put('templates/popover.html',
        '<div class="popover {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">'+
            '<div class="arrow"></div>'+
            '<div class="popover-inner">'+
            '<h3 class="popover-title" ng-bind="title" ng-show="title"></h3>'+
            '<div class="popover-content" ng-bind="content"></div>'+
           '</div>'+
        '</div>');

      $templateCache.put('templates/tinkDatePicker.html',
        '<div class="dropdown-menu datepicker" ng-class="\'datepicker-mode-\' + $mode">'+
        '<table style="table-layout: fixed; height: 100%; width: 100%;">'+
        '<thead>'+
        '<tr class="text-center">'+
            '<th>'+
                '<button tabindex="-1" type="button" class="btn pull-left" ng-click="$selectPane(-1)">'+
                    '<i class="fa fa-chevron-left"></i>'+
                '</button>'+
            '</th>'+
            '<th colspan="{{ rows[0].length - 2 }}">'+
                '<button tabindex="-1" type="button" class="btn btn-default btn-block text-strong"  ng-click="$toggleMode()">'+
                    '<strong style="text-transform: capitalize;" ng-bind="title"></strong>'+
                '</button>'+
            '</th>'+
            '<th>'+
                '<button tabindex="-1" type="button" class="btn pull-right" ng-click="$selectPane(+1)">'+
                    '<i class="fa fa-chevron-right"></i>'+
                '</button>'+
            '</th>'+
        '</tr>'+
        '<tr ng-show="showLabels" class="days" ng-bind-html="labels"></tr>'+
        '</thead>'+
        '<tbody>'+
        '<tr ng-repeat="(i, row) in rows" height="{{ 100 / rows.length }}%">'+
            '<td class="text-center" ng-repeat="(j, el) in row">'+
                '<button tabindex="-1" type="button" class="btn btn-default" style="width: 100%" ng-class="{\'btn-primary\': el.selected, \'btn-info btn-today\': el.isToday && !el.selected}" ng-click="$select(el.date)" ng-disabled="el.disabled">'+
                                    '<span ng-class="{\'text-muted\': el.muted}" ng-bind="el.label"></span>'+
                '</button>'+
            '</td>'+
        '</tr>'+
        '</tbody>'+
    '</table>'+
'</div>');

$templateCache.put('templates/tinkDatePickerRange.html',
        '<div class="datepickerrange">'+
  '<div class="pull-left datepickerrange-left">'+
    '<div class="datepickerrange-header-left">'+
      '<div class="pull-left">'+
        '<button tabindex="-1" type="button" class="btn pull-left" ng-click="$selectPane(0)">'+
          '<i class="fa fa-chevron-left"></i>'+
        '</button>'+
      '</div>'+
      '<div class="text-center clearfix">'+
        '<label ng-bind="firstTitle"></label>'+
      '</div>'+
    '</div>'+
    '<div class="table-responsive">'+
      '<table >'+
        '<thead>'+
        '<tr ng-bind-html="dayLabels" >'+
        '</tr>'+
        '</thead>'+
        '<tbody  id="firstCal" ng-bind-html="firstCal">'+
        '</tbody>'+
      '</table>'+
    '</div>'+
  '</div>'+
  '<div class="pull-right datepickerrange-right">'+
    '<div class="datepickerrange-header-right">'+
     ' <div class="pull-right">'+
        '<button tabindex="-1" type="button" class="btn pull-left" ng-click="$selectPane(1)">'+
          '<i class="fa fa-chevron-right"></i>'+
        '</button>'+
      '</div>'+
      '<div class="text-center clearfix">'+
        '<label ng-bind="lastTitle"></label>'+
      '</div>'+
    '</div>'+
    '<div class="table-responsive">'+
      '<table>'+
        '<thead>'+
        '<tr class="days" ng-bind-html="dayLabels"></tr>'+
        '</thead>'+
        '<tbody id="secondCal" ng-bind-html="secondCal">'+
        '</tbody>'+
      '</table>'+
    '</div>'+
'</div>'+
  '</div>');

$templateCache.put('templates/tinkDatePickerRangeInputs.html',
  '<div class="tink-datepickerrange-input-fields">'+
  '<div class="input-group col-sm-6">'+
    '<input type="text" id="firstDateElem" data-date data-format="00/00/0000" data-placeholder="mm/dd/jjjj" dynamic-name="dynamicName" tink-format-input ng-model="firstDate" valid-name="first">'+
    '<span class="input-group-addon">'+
      '<i class="fa fa-calendar"></i>'+
    '</span>'+
  '</div>'+
  '<div class="input-group col-sm-6">'+
    '<input type="text" id="lastDateElem" data-date data-format="00/00/0000" data-placeholder="mm/dd/jjjj" tink-format-input ctrl-model="dynamicName" valid-name="last"  ng-model="lastDate">'+
    '<span class="input-group-addon">'+
      '<i class="fa fa-calendar"></i>'+
    '</span>'+
  '</div>'+
'</div>');

$templateCache.put('templates/tooltip.html',
    '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">'+
      '<div class="tooltip-arrow"></div>'+
      '<div class="tooltip-inner" ng-bind="content"></div>'+
    '</div>');

$templateCache.put('templates/tinkDatePickerInput.html',
  '<div class="tink-datepickerrange-input-fields">'+
  '<div class="input-group">'+
  '<span class="input-group-addon">'+
  '<i class="fa fa-calendar"></i>'+
  '</span>'+
  '</div>'+
  '</div>');

$templateCache.put('templates/tinkAccordionGroup.html',
  '<section class="accordion-panel">'+
  '<a href class="accordion-toggle" ng-click="toggleOpen()">'+
    '<div class="accordion-panel-heading">'+
      '<i class="fa fa-th-large"></i>'+
      '<h4 class="panel-title">'+
        '<span>{{heading}}</span>'+
      '</h4>'+
    '</div>'+
  '</a>'+
  '<div class="accordion-panel-body">'+
    '<div class="accordion-spinner"><i class="fa fa-rotate-right fa-spin"></i></div>'+
    '<div class="accordion-loaded-content" ng-transclude>'+
        '<p>New DOM content comes here</p>'+
    '</div>'+
  '</div>'+
'</section>');
}]);
