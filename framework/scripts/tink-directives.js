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
    template: '<div class="accordion" ng-transclude></div>',
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
.directive('tinkAccordionPanel', function() {
  return {
    require:'^tinkAccordion',         // We need this directive to be inside an accordion group
    restrict:'EA',
    transclude:true,              // It transcludes the contents of the directive into the template
    replace: true,                // The element containing the directive will be replaced with the template
    templateUrl:'templates/tinkAccordionPanel.html',
    scope: {
      heading: '@',               // Interpolate the heading attribute onto this scope
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
angular.module('tink.backtotop', [])
  .directive('tinkBackToTop', [function () {
    return {
      restrict: 'EA',
      scope: {
        offset: '@'
      },
      template: '<button class="back-to-top"><span>Terug naar boven</span></button>',
      replace: true,

      link: function(scope, element) {

      jQuery(document).ready(function($) {

        // Options: offset from which button is showed and duration of the scroll animation
        var offset = 300,
          scrollTopDuration = 200;

        // Hide or show the "back to top" link
        function checkVisibility(checkThis) {
          if(checkThis.scrollTop() >= offset) {
            element.addClass('is-visible');
          } else {
            element.removeClass('is-visible');
          }
        }

        // Do this on load
        function initialize() {
          // var offset = (!isNaN(parseInt(scope.offset))) ? parseInt(scope.offset) : 300;
          if(!isNaN(parseInt(scope.offset))) {
            offset = parseInt(scope.offset);
          }

          // check whether the button should be visible on load
          checkVisibility($(element));
        }

        // Re-evaluate whether button should be shown or not
        $(window).scroll(function () {
          if(offset !== 0) {
            checkVisibility($(this));
          }
        });

        // Scroll to top when the button is clicked
        element.on('click', function(event) {
          event.preventDefault();
          $('body, html').animate({
            scrollTop: 0 ,
          }, scrollTopDuration);
        });

        initialize();
      });
      }
    };
  }]);
;'use strict';
angular.module('tink.datepicker', [])
.directive('tinkDatepicker',['$q','$templateCache','$http','$compile','dateCalculator','calView','safeApply','$window','$sce','$timeout',function($q,$templateCache,$http,$compile,dateCalculator,calView,safeApply,$window,$sce,setTimeout) {
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

      scope.opts = attr;
      var input = element.find('div.faux-input');
      var clickable = element.find('.datepicker-icon');
      var copyEl;
      var content = element.find('div.faux-input');

      scope.$show = function(){
        copyEl = templateElem;
        if($directive.appended !== 1) {
          element.append(copyEl);
          $directive.appended=1;
        }
        copyEl.attr('aria-hidden','false');
        copyEl.css({position: 'absolute', display: 'block'});
        bindLiseners();
        $directive.pane.month = 1;
        $directive.open = 1;
        scope.build();
      };

      content.bind('valueChanged',function(e,val){
        safeApply(scope,function(){
          if(validFormat(val,'dd/mm/yyyy')){
            $directive.selectedDate = dateCalculator.getDate(val,'dd/mm/yyyy');
            $directive.viewDate = $directive.selectedDate;
            scope.build();
          }
        });
      });

      var Liseners = {};
      function bindLiseners(){

        function childOf(c,p){ //returns boolean
          while((c=c.parentNode)&&c!==p){
          }
          return !!c;
        }

        Liseners.windowClick = function(event){
          if($directive.open){
            if(!childOf(event.target,copyEl.get(0)) && !childOf(event.target,element.get(0)) && !$directive.click){
              scope.hide();
            }
            $directive.click = 0;
          }
        };



        Liseners.windowKeydown = function (event) {
          if($directive.open){
            safeApply(scope,function(){
              if (currentSelected && (event.which === 38 || event.which === 37 || event.which === 39 || event.which === 40)) {
                event.preventDefault();
                calcFocus(event.which);
              }else if(event.keyCode === 9){              
                content.bindFirst('blur.disable',function(e){
                  e.stopImmediatePropagation();
                  return false;
                });

                event.preventDefault();
                setFocusButton();
                //return false;
              }else if(currentSelected && event.keyCode !== 13){
                content.focus();
                currentSelected = null;
              }
            });
          }
        };

        $($window).bind('click',Liseners.windowClick);

        $($window).bind('keydown',Liseners.windowKeydown);
      }

      content.bind('focus',function(){
         currentSelected = null;
      });

      $.fn.bindFirst = function(name, fn) {
          // bind as you normally would
          // don't want to miss out on any jQuery magic
          this.on(name, fn);

          // Thanks to a comment by @Martin, adding support for
          // namespaced events too.
          this.each(function() {
              var handlers = $._data(this, 'events')[name.split('.')[0]];
              console.log(handlers);
              // take out the handler we just inserted from the end
              var handler = handlers.pop();
              // move it at the beginning
              handlers.splice(0, 0, handler);
          });
      };

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

      function removeLiseners(){
        $($window).unbind('click',Liseners.windowClick);

        $($window).unbind('keydown',Liseners.windowKeydown);
      }

      scope.elemFocus = function(ev){
        setFocusButton($(ev.target),false);
      };

      function setFocusButton(btn,focus){
        setTimeout(function(){
          if(currentSelected){
            currentSelected.attr('aria-selected', 'false');
          }
          if(btn){
            btn.attr('aria-selected', 'true');
            if(focus !== false){
              btn.focus();
            }
            currentSelected= btn;
          }else{
            if($(copyEl.find('.btn-today')).length !== 0){
              $(copyEl.find('.btn-today')).attr('aria-selected', 'true');
              $(copyEl.find('.btn-today')).focus();
              currentSelected = $(copyEl.find('.btn-today'));
            }else{
              var firstTb = $(copyEl.find('tbody button:not(.btn-grayed):first'));
              firstTb.attr('aria-selected', 'true');
              firstTb.focus();
              currentSelected = firstTb;
            }
          }
          },10);
      }

      function calcLast(){
        var viewDate = $directive.viewDate;
        var firstdate = scope.minDate;
        var lastNum = new Date(viewDate.getFullYear(),viewDate.getMonth()+1,0,0,0,0);
        return !dateCalculator.isSameDate(lastNum,firstdate);
      }

      function calcFirst(){
        var viewDate = $directive.viewDate;
        var lastdate = scope.maxDate;
        var firstNum = new Date(viewDate.getFullYear(),viewDate.getMonth()+1,1,0,0,0);
        var current = new Date(viewDate.getFullYear(),viewDate.getMonth()+1,0,0,0,0);
        return !(dateCalculator.isSameDate(firstNum,lastdate) || dateCalculator.isSameDate(current,lastdate));
      }

      function calcFocus(e){
        var calcPos;
        var btn;
        var rijen = copyEl.find('tbody').children();
        var rijIndex = rijen.index( currentSelected.closest('tr'));
        if(rijIndex !== -1){
          var kolommen = $(rijen[rijIndex]).children();
          var kolomIndex = kolommen.index( currentSelected.closest('td'));

          if (e === 37){
            //left Arrow
            if( rijIndex === 0 && kolomIndex === 0){
              if(!angular.isDate(scope.minDate) || calcLast()){
                scope.$selectPane(-1,true);
              }
            }else if(kolomIndex>0){
               btn = $($(kolommen[kolomIndex-1]).find('button'));
              if(btn.hasClass('btn-grayed') && !btn.is(':disabled')){
                scope.$selectPane(-1,true);
              }else{
                calcPos = btn;
              }
            }else{
              calcPos = $($(rijen[rijIndex-1]).children()[$(rijen[rijIndex-1]).children().length-1]).find('button');
            }
          }else if(e === 39){
            //right arrow
            if(rijIndex === rijen.length-1 && kolomIndex === $(rijen[rijIndex]).children().length-1){
              if(calcFirst()){
                scope.$selectPane(+1,true);
              }
            }else if(kolomIndex<kolommen.length-1){
               btn = $($(kolommen[kolomIndex+1]).find('button'));
              if(btn.hasClass('btn-grayed') && !btn.is(':disabled')){
                scope.$selectPane(+1,true);
              }else{
                calcPos = btn;
              }
            }else{
              calcPos = $($(rijen[rijIndex+1]).children()[0]).find('button');
            }
          }else if(e===38){
            if(rijIndex>0){
               btn = $($(rijen[rijIndex-1]).children()[kolomIndex]).find('button');
              if(btn.hasClass('btn-grayed') && !btn.is(':disabled')){
                scope.$selectPane(-1,true);
              }else{
                calcPos = btn;
              }
            }else{
              scope.$selectPane(-1,true);
            }
          }else if(e===40){
            if(rijIndex<rijen.length-1){
               btn = $($(rijen[rijIndex+1]).children()[kolomIndex]).find('button');
              if(btn.hasClass('btn-grayed') && !btn.is(':disabled')){
                scope.$selectPane(+1,true);
              }else{
                calcPos = btn;
              }
            }else{
              if(calcFirst()){
                scope.$selectPane(+1,true);
              }
            }
          }
          if(calcPos && !calcPos.is(':disabled')){
            setFocusButton(calcPos);
          }
        }
      }

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

      // labels for the days you can make this variable //
      var dayLabels = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
       // -- create the labels  --/
       scope.labels = [];
      // Add a watch to know when input changes from the outside //

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
            currentSelected = null;
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
        appended:0,
        selectedDate:null
      };

      scope.$selectPane = function(value,keyboard) {
        $directive.viewDate = new Date(Date.UTC($directive.viewDate.getFullYear()+( ($directive.pane.year|| 0) * value), $directive.viewDate.getMonth() + ( ($directive.pane.month || 0) * value), 1));
        scope.build();
        if(keyboard){
          setTimeout(function(){
            var rijen = copyEl.find('tbody').children();
            if(value === +1){
               setFocusButton($(rijen[0]).find('button:not(.btn-grayed):first'));
            }else if(value === -1){
              setFocusButton($(rijen[rijen.length-1]).find('button:not(.btn-grayed):last'));
            }
          },50);
        }
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
         copyEl.attr('aria-hidden','true');
         $directive.open = 0;
         copyEl = null;
         removeLiseners();
         safeApply(scope,function(){
         // content.click();
         //content.focus();
            $directive.open = 0;
            content.unbind('blur.disable');
         });

        }
      };

      scope.$select = function(date){
      $directive.click = 1;
      $directive.viewDate = date;
        if($directive.mode === 0){
          scope.ngModel = date;
          scope.hide();
          setTimeout(function(){ content.blur(); }, 0);
        }else if($directive.mode >0){
          $directive.mode -= 1;
          setMode($directive.mode);
          scope.build();
        }
      };

      var currentSelected;

      scope.pane={prev:false,next:false};
      scope.build = function() {
        if($directive.viewDate === null || $directive.viewDate === undefined){
          $directive.viewDate = new Date();
        }

        if(checkBefore($directive.viewDate,scope.minDate)){
          scope.pane.prev = true;
          $directive.viewDate = new Date(scope.minDate);
        }else{
          scope.pane.prev = false;
        }
        if(checkAfter($directive.viewDate,scope.maxDate)){
          scope.pane.next = true;
          $directive.viewDate = new Date(scope.maxDate);
        }else{
          scope.pane.next = false;
        }
          scope.labels = [];
          if($directive.mode === 1){
            scope.title = dateCalculator.format($directive.viewDate, 'yyyy');
            scope.rows =  calView.monthInRows($directive.viewDate,scope.minDate,scope.maxDate);
            scope.showLabels = 0;
          }
          if($directive.mode === 0){
            scope.title = dateCalculator.format($directive.viewDate, options.yearTitleFormat);
            scope.rows =  calView.daysInRows($directive.viewDate,$directive.selectedDate,scope.minDate,scope.maxDate);
            scope.labels = $sce.trustAsHtml('<th>' + dayLabels.join('</th><th>') + '</th>');
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
        var copyDate = new Date(date.getFullYear(),date.getMonth(),1,0,0,0);
        var copyafter = new Date(after.getFullYear(),after.getMonth(),1,0,0,0);

        if(!dateCalculator.dateBeforeOther(copyafter,copyDate) || copyafter.getTime()===copyDate.getTime()){
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
}]);;'use strict';
    angular.module('tink.datepickerRange', ['tink.dateHelper','tink.safeApply'])
    .directive('tinkDatepickerRange',['$q', '$templateCache', '$http', 'calView', '$sce','$compile','dateCalculator','$window','safeApply', function ($q, $templateCache, $http, calView, $sce,$compile,dateCalculator,$window,safeApply) {
      return {
        restrict: 'E',
        replace: true,
        priority:0,
        require:['?^form'],
        templateUrl: 'templates/tinkDatePickerRangeInputs.html',
        controller:function($scope,$attrs){
          $scope.dynamicName = $attrs.name;
          if(angular.isDefined($attrs.required)){
            $scope.requiredVal = true;
          }else{
            $scope.requiredVal = false;
          }
        },
        scope: {
          firstDate: '=?',
          lastDate: '=?',
          minDate:'=?',
          maxDate:'=?',
        },
        compile: function(template,$attr){
          if($attr.required === '' || $attr.required === 'required'){
            template.find('input:first').attr('data-require',true);
            template.find('input:last').attr('data-require',true);
          }
          if($attr.name){
            template.find('input:first').attr('name',$attr.name);
            template.find('input:last').attr('name',$attr.name);
          }
          return{
            pre:function(){},
            post:function postLink(scope, element,attrs,form) {
          var $directive = {
            open: false,
            focused: {firstDateElem: element.find('div[tink-format-input] div:first'), lastDateElem: element.find('div[tink-format-input] div:last')},
            elem:{},
            calendar: {first:element.find('span.datepicker-icon:first'),last:element.find('span.datepicker-icon:last')},
            tbody:{firstDateElem:null,lastDateElem:null},
            focusedModel: null,
            selectedDates: {first: scope.firstDate, last: scope.lastDate},
            valid:{firstDateElem:false,lastDateElem:false},
            mouse: 0,
            viewDate:new Date(),
            hardCodeFocus: false
          };
          if(attrs.name && form[0]){
            scope.ctrlconst = form[0][attrs.name];
          }

          $directive.calendar.first.on('click',function(){
            if(isTouch){
              element.find('input[type=date]:first').click();
            }else{
              if($directive.open){
                if($directive.focusedModel ==='firstDateElem'){
                  hide();
                }else{
                  $directive.focused.firstDateElem.focus();
                }
              }else{
                $directive.focused.firstDateElem.focus();
              }
            }
          });
          $directive.calendar.last.on('click',function(){

            if(isTouch){
              element.find('input[type=date]:last').click();
            }else{
              if($directive.open){
                 if($directive.focusedModel ==='lastDateElem'){
                  hide();
                }else{
                  $directive.focused.lastDateElem.focus();
                }
              }else{
                $directive.focused.lastDateElem.focus();
              }
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
      scope.pane={prev:0,next:0};

            // -- This builds the view --/
            function buildView() {

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

               // -- Retrieve the elements we want to change ! we have to do this because we replace the tbodys !  --/
               $directive.tbody.firstDateElem = element.find('tbody')[0];
               $directive.tbody.lastDateElem = element.find('tbody')[1];

              // -- Create the first calendar --/
              var htmlFirst = calView.createMonthDays($directive.viewDate, scope.firstDate, scope.lastDate,'prevMonth',scope.minDate,scope.maxDate);
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
              var htmlLast = calView.createMonthDays(copyViewDate, scope.firstDate, scope.lastDate,'nextMonth',scope.minDate,scope.maxDate);
               // -- compile and replace the second view   --/
               angular.element($directive.tbody.lastDateElem).replaceWith($compile( htmlLast)( scope ));

             }

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

              if(dateCalculator.dateBeforeOther(copyDate,copyafter)){
                return true;
              }
              return false;
            }

              var first =  element.find('#input:first').controller('ngModel');
              var last = element.find('#input:last').controller('ngModel');
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
                  //first.$setViewValue(new Date())
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
                    if(!dateCalculator.dateBeforeOther(scope.lastDate,scope.firstDate)){
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
            var noErrorClass = 'hide-error';
            var firstEl = $(element.find('.faux-input')[0]);
            var lastEl = $(element.find('.faux-input')[1]);

            function checkValidity(){
                //scope.ctrlconst.$setValidity('required',true);
                if(scope.firstDate === null && scope.lastDate !== null){
                  first.$setValidity('date-required',false);
                  firstEl.removeClass(noErrorClass);
                }else if(scope.firstDate !== null && scope.lastDate === null){
                  last.$setValidity('date-required',false);
                  lastEl.removeClass(noErrorClass);
                }else if(scope.firstDate === null && scope.lastDate === null){
                  if(angular.isDefined(attrs.required)){
                    first.$setValidity('date-required',false);
                    last.$setValidity('date-required',false);
                    firstEl.removeClass(noErrorClass);
                    lastEl.removeClass(noErrorClass);
                  }else{
                    first.$setValidity('date-required',true);
                    last.$setValidity('date-required',true);
                    firstEl.addClass(noErrorClass);
                    lastEl.addClass(noErrorClass);
                  }
                }else if(scope.firstDate !== null && scope.lastDate !== null){
                  first.$setValidity('date-required',true);
                  last.$setValidity('date-required',true);
                  firstEl.addClass(noErrorClass);
                    lastEl.addClass(noErrorClass);
                }

                if(first.$error.date){
                  first.$setValidity('date-required',true);
                  firstEl.addClass(noErrorClass);
                }
                if(last.$error.date){
                  last.$setValidity('date-required',true);
                  lastEl.addClass(noErrorClass);
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

            function hide() { // TH comment out to inspect element
              //if(!(evt.relatedTarget && evt.relatedTarget.nodeName === 'INPUT')){
                templateElem.css({display: 'none'});
                $directive.open = false;
                $directive.focusedModel = null;
                safeApply(scope,function(){
                 // checkValidity();
                });

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
                safeApply(scope,function(){
                  $directive.focusedModel = 'firstDateElem';
                  show();
                });
              });
              angular.element($directive.focused.lastDateElem).bind('focus', function () {
                safeApply(scope,function(){
                  $directive.focusedModel = 'lastDateElem';
                  show();
                });
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
});;'use strict';
angular.module('tink.dropupload', ['ngLodash']);
angular.module('tink.dropupload')
.directive('tinkUpload', ['$window', 'safeApply','UploadFile','lodash','tinkUploadService', function($window, safeApply,UploadFile,_,tinkUploadService) {
    return {
      restrict: 'A',
      replace: true,
      transclude: true,
      templateUrl:'templates/tinkUpload.html',
      scope:{
        ngModel:'=',
        fieldName: '@?',
        multiple: '=?',
        allowedTypes:'=?',
        maxFileSize:'@?',
        url:'@?',
        sendOptions:'=?'
      },
      compile: function() {
        return {
          pre: function() {
          },
          post: function(scope, elem) {
            //Config object with default values
            var config = {
              multiple:true,
              removeFromServer:true,
              allowedTypes:{mimeTypes:[],extensions:[]},
              maxFileSize:'0',
              url:undefined,
              options:{}
            };
            //To let the view know we have a message.
            scope.message = {};
            var holding = null;
            //Check the scope variable and change the config variable
            for(var key in config){
              if(scope[key] !== undefined){
                config[key] = scope[key];
              }
            }
            if(config.url){
              tinkUploadService.addUrls(config.url);
            }

            scope.$watchCollection('ngModel',function(newVa){
              var removed = _.difference(scope.files, newVa);
              var added = _.difference(newVa,scope.files);

              angular.forEach(removed,function(value){
                if(value instanceof UploadFile){
                  if(_.indexOf(scope.files, value)!==-1){
                    _.pull(scope.files, value);
                  }
                }
              });

              angular.forEach(added,function(value){
                if(value instanceof UploadFile){
                  if(config.multiple){
                    if(_.indexOf(scope.files, value)===-1){
                      scope.files.unshift(value);
                    }
                  }else{
                    scope.files.length = 0;
                    scope.files.unshift(value);
                  }
                }
              });
              /*if(newVa instanceof Array){
                if(newVa !== ol && newVa.length > ol.length){
                  angular.forEach(newVa,function(value){
                    if(_.indexOf(scope.files, value)===-1){
                      if(value instanceof UploadFile){
                        scope.files.push(value)
                      }else{
                        _.pull(scope.ngModel, value);
                      }
                    }
                  })
                }else if(newVa !== ol && newVa.length < ol.length){
                  angular.forEach(newVa,function(value){
                      if(value instanceof UploadFile){
                        if(_.indexOf(scope.files, value)!==-1){
                           _.pull(scope.files, value);
                        }
                      }
                  })
                }
              }else if(newVa instanceof UploadFile){
                if(_.indexOf(scope.files, newVa)===-1){
                  scope.files = [];
                  scope.files.push(newVa);
                }
              }*/
            },true);

            //function to add the liseners
            function addLisener(){
              elem.bind('dragenter', dragenter);
              elem.bind('dragleave', dragleave);
              elem.bind('dragover', dragover);
              elem.bind('drop', drop);
            }
            //Drag enter to add a class
            function dragenter(e){
              e.stopPropagation();
              e.preventDefault();
              elem.addClass('dragenter');
            }
            //Leave drag area to remove the class
            function dragleave(){
              elem.removeClass('dragenter');
            }

            //Drag over prevent default because we do not need it.
            function dragover(e){
              e.stopPropagation();
              e.preventDefault();
              elem.addClass('dragenter');
            }

            scope.undo = function(){
              if(scope.files[0]){
                scope.files[0].cancel();
                scope.files[0].remove();
                _.pull(scope.ngModel, scope.files[0]);
                //_.pull(scope.files, scope.files[0]);
              }

              holding.hold = false;
              scope.message = {};
              scope.ngModel.length = 0;
              //scope.files.length = 0;
              //scope.files.push(holding);
              scope.ngModel.push(holding);
              holding = null;
            };

            //if the ngModel is not defined we define it for you
            if(scope.ngModel === undefined){
                scope.ngModel = [];
            }
            //create internal files object for use to handle the view
              scope.files = [];
            //}

            //The file is droped or selected ! same code !
            function drop(e){
              safeApply(scope,function(){
                elem.removeClass('dragenter');
                var files;
                if(e.type && e.type === 'drop'){
                  e.stopPropagation();
                  e.preventDefault();
                  //get the event
                  var dt = e.originalEvent.dataTransfer;
                   files = dt.files;
                }else{
                  files = e;
                }

                  for (var i = 0; i < files.length; i += 1) {
                    var file = new UploadFile(files[i]);

                    if(!config.multiple){
                      //if there is a file present remove this one from the server !
                      if(scope.files[0] !== null && scope.files[0] instanceof UploadFile){
                        if(!scope.files[0].error){
                          if(holding instanceof UploadFile){
                            holding.cancel();
                            holding.remove();
                            _.pull(scope.ngModel, holding);
                          }
                          scope.message.hold = true;
                          holding = scope.files[0];
                          holding.hold = true;
                        }

                        /*if(config.multiple){
                          scope.ngModel.push(holding);
                        }else{
                          scope.ngModel = holding;
                        }*/
                        //_.pull(scope.files, scope.files[0]);
                      }
                    }
                    if(config.multiple){
                      if(!(scope.ngModel instanceof Array)){
                        scope.ngModel = [];
                      }
                      scope.ngModel.unshift(file);
                    }else{
                      scope.ngModel.length = 0;
                      scope.ngModel.push(file);
                    }

                    //check if the type and size is oke.
                    var typeCheck = checkFileType(file);
                    var sizeCheck = checkFileSize(file);

                    if(typeCheck && sizeCheck){
                      file.upload(scope.sendOptions).then(function() {
                        //file is uploaded
                        //add the uploaded file to the ngModel
                      }, function error(file) {
                          //file is not uploaded
                          if(!file.error){
                            file.error = {};
                          }
                          file.error.fail = true;
                      }, function update() {
                        //Notification of upload
                      });

                    }else{
                      if(!file.error){
                        file.error = {};
                      }
                      if(!typeCheck){
                        file.error.type = true;
                      }
                      if(!sizeCheck){
                        file.error.size = true;
                      }
                    }

                  }

              });
            }

            /*function remove(){

            }*/

            scope.del = function(index){
              scope.files[index].cancel();
              scope.files[index].remove();

              if(config.multiple){
                //_.pull(scope.ngModel, scope.files[index]);
              }else{
                scope.ngModel.length = 0;
              }
                _.pull(scope.ngModel, scope.files[index]);
            };

            function checkFileType(file){

              var mimeType = config.allowedTypes.mimeTypes;
              var extention = config.allowedTypes.extensions;

              var fileType = file.getFileMimeType();
              var fileEx = file.getFileExtension();

              if(!mimeType || mimeType.length === 0 || !_.isArray(mimeType)) {
                  return true;
              }

              if(!extention || extention.length === 0 || !_.isArray(extention)) {
                  return true;
              }

              if(_.indexOf(mimeType, fileType) > -1){
                if(_.indexOf(extention, fileEx) > -1){
                  return true;
                }else{
                  return true;
                }
              }else{
                return false;
              }


            }

            function checkFileSize(file){
              var fileSize = _.parseInt(file.getFileSize());

              if(!config.maxFileSize){
                return true;
              }
              if(typeof config.maxFileSize === 'number'){
                if(config.maxFileSize === 0 || fileSize <= config.maxFileSize){
                  return true;
                }else{
                  return false;
                }
              }else if(typeof config.maxFileSize === 'string'){
                var maxSize = _.parseInt(config.maxFileSize);
                if(maxSize === 0 || fileSize <= maxSize){
                  return true;
                }else{
                  return false;
                }
              }else{
                return true;
              }

            }

            scope.browseFiles = function(){
               var dropzone = elem.find('.fileInput');
                dropzone.click();
            };
            scope.onFileSelect = function(files){
              drop(files);
            };

            addLisener();

          }
        };
      }
    };
  }]);;  'use strict';
  angular.module('tink.format', [])
  .directive('tinkFormatInput', ['dateCalculator', '$window', 'safeApply', function(dateCalculator, $window, safeApply) {
    return {
      restrict: 'EA',
      replace: true,
      priority:99,
      controller:'tinkFormatController',
      scope:{
        minDate:'=?',
        maxDate:'=?'
      },
      require:['tinkFormatInput','ngModel','?^form'],
      template: function() {
        var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
        var isTouch = ('createTouch' in $window.document) && isNative;
        if (isTouch) {
          return '<div><input id="input" class="faux-input" type="date"/><div>';
        } else {
          return '<div tabindex="-1"><div  id="input" role="textbox" class="faux-input" contenteditable="true">{{placeholder}}</div></div>';
        }
      },
      compile: function(template) {
        template.prop('type', 'date');
        return {
          pre: function() {
          },
          post: function(scope, elem, attr, ctrl) {
            // -- check if we are using a touch device  --/
            var isDateSupported = function() {
              var i = document.createElement('input');
              i.setAttribute('type', 'date');
              return i.type !== 'text';
            };

            var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
            var isTouch = ('createTouch' in $window.document) && isNative && isDateSupported();
        //variable
        var config = {
          format: '00/00/0000',
          placeholder: 'dd/mm/jjjj'
        };
        var dateformat;
        if(isTouch){
          dateformat = 'yyyy-mm-dd';
        }else{
          dateformat = 'dd/mm/yyyy';
        }

        var element = elem.find('#input');
        var ngControl = ctrl[1];
        var controller = ctrl[0];
        var form = ctrl[2];

        var prefix = '';
        if(angular.isDefined(attr.validName)){
          setTimeout(function(){
            if(form && attr.name && typeof attr.name === 'string' && attr.name !== ''){
            safeApply(scope,function(){
              prefix = attr.validName;
              form.$removeControl(ngControl);
              ngControl.$name = prefix+attr.name;
              form.$addControl(ngControl);
            });
          }
          }, 1);
        }else{
          setTimeout(function(){
            safeApply(scope,function(){
              if(form){
                form.$addControl(ngControl);
              }
            });
          }, 1);
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

        var isRequired = (function(){
          if(attr.require === 'true'){
            return true;
          }else{
            return false;
          }
        })();
        var noErrorClass = 'hide-error';
        var errorElem = $(elem.find('.faux-input')[0]);

        function checkValidity(value){
          var stringValue;
          if(angular.isDate(value)){
            stringValue = dateCalculator.format(value,dateformat);
          }else{
            stringValue = value;
          }


          safeApply(scope,function(){

            if(angular.isDate(scope.minDate)){
              if(dateCalculator.dateBeforeOther(value,scope.minDate)){
                ngControl.$setValidity('date-min',true);
                errorElem.addClass(noErrorClass);
              }else{
                ngControl.$setValidity('date-min',false);
                errorElem.removeClass(noErrorClass);
              }

            }
            if(angular.isDate(scope.maxDate)){
              if(dateCalculator.dateBeforeOther(scope.maxDate,value)){
                ngControl.$setValidity('date-max',true);
                errorElem.addClass(noErrorClass);
              }else{
                ngControl.$setValidity('date-max',false);
                errorElem.removeClass(noErrorClass);
              }
            }

            if(validFormat(stringValue,dateformat)){
              ngControl.$setValidity('date',true);
              errorElem.addClass(noErrorClass);
              if(isRequired){
                ngControl.$setValidity('date-required',true);
                errorElem.addClass(noErrorClass);
              }
            }else if(stringValue !== config.placeholder && stringValue !== null){
              ngControl.$setValidity('date',false);
              ngControl.$setValidity('date-min',true);
              ngControl.$setValidity('date-max',true);
              errorElem.removeClass(noErrorClass);
              if(isRequired){
                ngControl.$setValidity('date-required',true);
              }
            }else{
              ngControl.$setValidity('date',true);
              ngControl.$setValidity('date-min',true);
              ngControl.$setValidity('date-max',true);
              errorElem.addClass(noErrorClass);
              if(isRequired){
                ngControl.$setValidity('date-required',false);
                errorElem.removeClass(noErrorClass);
              }
            }

          });
        }

        controller.init(element,config,form,ngControl);
          //format text going to user (model to view)
          ngControl.$formatters.push(function(modelValue) {
            if(!isTouch || isTouch && modelValue !== ''){
              if(angular.isDate(modelValue)){
                var date = dateCalculator.format(modelValue,dateformat);
                controller.setValue(date,null,isTouch);
                checkValidity(modelValue);
                return date;
              }else{
                controller.setValue(null,null,isTouch);
              }
            }else{
               controller.setValue('',null,isTouch);
            }
            checkValidity(modelValue);
          });

          //format text from the user (view to model)
          ngControl.$parsers.unshift(function(value) {

              if(isTouch && value === ''){
                value = element.val();
              }

            if(value === null || value === ''){
              return value;
            }else if(typeof value === 'string'){
              controller.setValue(value,null,isTouch);
              return dateCalculator.getDate(value,dateformat);
            }else{
              return null;
            }
          });
          element.unbind('input').unbind('change');
          element.bind('input', function() {
                    safeApply(scope,function() {

                        //ctrl.$setViewValue(undefined);

                    });
                  });

          //on blur update the model.
          element.on('blur', function() {
            safeApply(scope,function(){
              var value;
              if(isTouch){
                value = element.val();
              }else{
                value = controller.getValue();
              }
              if(value === config.placeholder){
                checkValidity(value);
              }else{
                var date = dateCalculator.getDate(value,dateformat);
                if(date === null){
                  checkValidity(value);
                }else{
                  checkValidity(date);
                }
                ngControl.$setViewValue(value);
                ngControl.$setDirty();
                ngControl.$render();
              }
              //var modelString = dateCalculator.format(ngControl.$modelValue,dateformat);
              //if(value !== modelString){
                //console.log(value)

              //}
            });
          });
      }
    };

  }
};
}])
  .controller('tinkFormatController',function(){

    var self = this;
    var config;
    var format;
    var placeholder;
    var newVa;
    var deleteVal = -1;
    var controlKey = 0;
    var keyDowned = '';
    self.init = function(element,config,form,ngControl){
      self.element = element;
      self.config = config;
      self.form = form;
      self.ngControl = ngControl;
      loadAll();
    };

    function loadAll(){
      config = self.config;
      format = config.format;
      placeholder = config.placeholder;
      //$scope.placeholder = valueToHtml(placeholder);
      self.setValue(placeholder);
      newVa = placeholder;
      self.element.bind('keydown', function(event) {
        keyDowned = self.getValue();
        if(event.which ===91 || event.which === 92 || event.which === 93){
          controlKey = 1;
        }
        if((event.ctrlKey||event.metaKey) && event.which === 88){
          setTimeout(function() {
            self.setValue(placeholder);
          }, 1);
          return true;
        }
        if (event.which === 8) {
          handleBackspace();
          return false;

        } else if (event.which === 46) {
          handleDelete();
          return false;
        }
      });
      self.element.bind('keyup', function(event) {
        if(event.which ===91 || event.which === 92 || event.which === 93){
          controlKey = 0;
        }
      });
      self.element.bind('mousedown', function() {
        setTimeout(function() {
          if (placeholder === newVa) {
            setCursor(0);
          }
        }, 1);
      });

      self.element.bind('focus',function(){
        setTimeout(function(){
          var pos = firstCh();
          if(pos !== newVa.length){
            setCursor(firstCh());
          }
        },20);
      });

      self.element.bind('paste', function (e) {
          var cursor = getCaretSelection();
          e.preventDefault();
          var text = (e.originalEvent || e).clipboardData.getData('text/plain');
          window.document.execCommand('insertText', false, text);
          self.setValue(keyDowned);
          for(var i=0;i<text.length;i++){
            handleInput(text[i],cursor);
            cursor++;
          }
      });

      self.element.keypress(function(event) {
        if(!controlKey){
          var key = String.fromCharCode(event.which);
          handleInput(key);
          return false;
        }
      });

      if(self.form){
        //setTimeout(function(){ self.form.$addControl(self.ngControl); }, 0);
      }

    }
    String.prototype.replaceAt = function(index, character) {
      return this.substr(0, index) + character + this.substr(index + character.length);
    };
    String.prototype.replaceRange = function(start, stop, value) {
      return this.substr(0, start) + value.substr(start, stop - start) + this.substr(stop);
    };

    function handleInput(key, cur) {
      var cursor;
      var selection;
      if (!cur) {
        cursor = getCaretSelection().start;
        selection = getCaretSelection().end;
      } else {
        cursor = cur.start;
        selection = cur.end;
      }

      if (cursor > -1 && cursor < format.length) {
        if (format[cursor] === '0') {
          if (charIs(key, '0')) {
            if (cursor !== selection) {
              newVa = newVa.replaceRange(cursor, selection, placeholder);
            }
            newVa = newVa.replaceAt(cursor, key);
            cursor += 1;
          } else {
            newVa = newVa.replaceRange(cursor, selection, placeholder);
          }
        } else {
          if (charIs(key, '0')) {
            handleInput(key, {
              start: cursor + 1,
              end: selection + 1
            });
            return;
          } else {
            cursor += 1;
          }
        }
      }
      deleteVal = -1;
      self.setValue(newVa,cursor);
    }

    function handleBackspace() {
      var cursor = getCaretSelection();
      if (cursor.start === cursor.end && cursor.start > 0) {
        newVa = newVa.replaceAt(cursor.start - 1, placeholder[cursor.start - 1]);
        self.setValue(newVa,cursor.start - 1);
      } else {
        newVa = newVa.replaceRange(cursor.start, cursor.end, placeholder);
        self.setValue(newVa,cursor.start);
      }

    }

    function handleDelete() {
      var cursor = getCaretSelection();
      if (cursor.start === cursor.end) {
        var pos = cursor.start;
        while (placeholder[cursor.start] === newVa[cursor.start] && cursor.start < placeholder.length - 1) {
          cursor.start++;
        }
        newVa = newVa.replaceAt(cursor.start, placeholder[cursor.start]);
        self.setValue(newVa,pos);

      } else {
        newVa = newVa.replaceRange(cursor.start, cursor.end, placeholder);
        self.setValue(newVa,cursor.start);
      }
    }

    function firstCh(){
      for(var i=0;i<newVa.length;i++){
        if(newVa.length === format.length){
          if(format[i] === '0'){
            if(newVa[i] >-1 && newVa[i] < 10){

            }else{
              return i;
            }
          }
        }else{
          return 0;
        }
      }
      return newVa.length;
    }

    function valueToHtml(value) {
      var html = '';                // weekDaysLabels.join('</th><th class="dow text-center">') + '</th>')
      var plHtml = '<span class="placeholder">';
      var plEHtml = '</span>';
      var open = 0;
      for (var i = 0; i < placeholder.length; i++) {
        if (placeholder[i] === value[i]) {
          if (open === 0) {
            html += plHtml + value[i];
            open = 1;
          } else if (open === 1) {
            html += value[i];
          }
        } else {
          if (open === 1) {
            html += plEHtml + value[i];
            open = 0;
          } else {
            html += value[i];
          }
        }
      }
      if (open === 1) {
        html += plEHtml;
      }
      return html;
  }

  self.setValue = function(value,cur,force) {

    if(!force){
      if(value && value.length !== placeholder.length){
        newVa = placeholder;
      }else if(!value){
        newVa = placeholder;
      }else{
        newVa = value;
      }
    }else{
      newVa = value;
    }

    if(self.element[0].nodeName === 'DIV'){
      self.element.html(valueToHtml(newVa));
      self.element.trigger('valueChanged',[newVa]);
    }else{
      self.element.val(newVa);
    }
    if (cur && cur > -1 && cur <= format.length) {
      setCursor(cur);
    }
  };

  self.getValue = function(){
    return newVa;
  };

  function charIs(char, base) {
    char = char.trim();
    if (base === '0' && char !== '') {
      if (char > -1 && char < 10) {
        return true;
      }
    }
    return false;
  }

  function getCaretSelection() {
    var caretOffset = 0;
    var element = self.element.get(0);
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
    } else if ((sel = doc.selection) && sel.type !== 'Control') {
      var textRange = sel.createRange();
      var preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(element);
      preCaretTextRange.setEndPoint('EndToEnd', textRange);
      caretOffset = preCaretTextRange.text.length;
      startOffset = caretOffset - document.selection.createRange().text.length;

    }
    return {
      start: startOffset,
      end: caretOffset
    };
  }

function setCursor(cur) {
  var el = self.element[0];
  var range = document.createRange();
  var sel = window.getSelection();
  var lengths = 0;
  var chosenChild = 0;
  for (var i = 0; i < self.element[0].childNodes.length; i++) {
    var node = self.element[0].childNodes[i];
    if (node.nodeName === '#text') {
      lengths += node.length;
      chosenChild = node;
    } else {
      lengths += node.childNodes[0].length;
      chosenChild = node.childNodes[0];
    }
    if (cur <= lengths) {
      cur = cur - (lengths - chosenChild.length);
      i = 9999;
    }
  }
  range.setStart(chosenChild, cur);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  el.focus();
}

});;'use strict';
angular.module('tink.interactiveTable', ['ngLodash']);
angular.module('tink.interactiveTable')
.directive('tinkInteractiveTable',['lodash','$compile','$rootScope',function(_,$compile,$rootScope){
  return{
    restrict:'E',
    templateUrl:'templates/tinkInteractiveTable.html',
    scope:{
      ngModel:'=',
      headers:'=',
      actions:'=?',
      itemsPerPage:'=?'
    },
    link:function(scope,element){
      if(!scope.headers || scope.headers.length < 1 ){
        return;
      }

      var aantalToShow = 1;
      var pages;
      var viewable;

      function uncheckAll(){
        for(var i=0;i<viewable.length;i++){
          if(scope.checkB[i] && scope.checkB[i]._checked===true){
            scope.checkB[i]._checked = false;
          }
        }
        if(scope.checkB[-1]){
            scope.checkB[-1]._checked = false;
          }
      }
      var ngModelWatch;
      function watch(){
        //scope.ngModel = angular.copy(scope.ngModel);
        ngModelWatch = scope.$watch('ngModel',function(newArray,oldArray){
          if(newArray !== oldArray){
            resort();
            scope.buildTable();
          }
        },true);
      }
      watch();

      if(scope.actions instanceof Array){
        scope.viewActions = [];
        for(var i=0;i<scope.actions.length;i++){
          var action = scope.actions[i];
          scope.viewActions.push({name:action.name,callback:function(){
            var checked = [];
            for(var i=0;i<viewable.length;i++){
              if(scope.checkB[i] && scope.checkB[i]._checked===true){
                checked.push(viewable[i]);
              }
            }
            action.callback(checked,uncheckAll);
          }});
        }
      }
      if(typeof scope.itemsPerPage === 'string'){
        var items = scope.itemsPerPage.split(',');
        scope.itemsPerPage = [];
        for(var j=0;j<items.length;j++){
          if(items[j].slice(-1) === '*'){
            var num = _.parseInt(items[j].substr(0,items[j].length-1));
            scope.perPage = {pages:num};
            scope.itemsPerPage.push(num);
          }else{
            scope.itemsPerPage.push(_.parseInt(items[j]));
          }
        }

        if(!scope.perPage && scope.itemsPerPage.length !==0){
          scope.perPage = {pages:_.parseInt(items[0])};
        }

      }else{
        scope.perPage = {pages:10};
        scope.itemsPerPage = [10,20,50];
      }
      //which sorting is happening
      scope.sorting = {field:'',direction:1};
      //preview headers
      if(!scope.headers instanceof Array){
        scope.headers = [];
      }
      //function that runs at the beginning to handle the headers.
      function handleHeaders(){
        angular.forEach(scope.headers,function(value){
          if(!angular.isDefined(value.alias) || value.alias === null){
            value.alias = value.field;
          }
          if(!angular.isDefined(value.visible) || value.visible === null){
            value.visible = true;
          }
        });
      }
      handleHeaders();
      //this is a copy to show to the view
      scope.viewer = scope.headers;
      //This function creates our table head
      function setHeader(table,keys){
        var header = table.createTHead();
        var row = header.insertRow(0);
        scope.selectedMax = keys.length-1;
        if(typeof scope.actions === 'function'){
          var thCheck = document.createElement('th');
          thCheck.innerHTML = createCheckbox(-1,i,'hulp');
          row.appendChild(thCheck);
        }

        for(var k=0;k<keys.length;k++){
          if(keys[k] && keys[k].checked && keys[k].visible){
            // var key = Object.keys(keys[i])[0];
            var val = keys[k].alias || keys[k].field;
            var th = document.createElement('th');
                th.innerHTML = val;
              row.appendChild(th);
              $(th).bind('click',sorte(k));
              if(keys[k] === scope.sorting.obj){
                if(scope.sorting.direction === 1){
                  $(th).addClass('sort-asc');
                }else if(scope.sorting.direction === -1){
                  $(th).addClass('sort-desc');
                }
              }
          }
        }
      }
      //hersort because of new data
      function resort(){
        if(scope.sorting && scope.sorting.obj){
          var sortKey =  scope.sorting.obj.field;
          sorter(sortKey,scope.sorting.direction);
        }
      }
      //will be called when you press on a header
      function sorte ( i ){
        return function(){
          if(scope.sorting.obj){
            //var index = _.findIndex(scope.viewer, scope.sorting.obj);
          }
          var key = scope.headers[i].field;
          if(scope.sorting.field === key){
            scope.sorting.direction = scope.sorting.direction * -1;
          }else{
            scope.sorting.field = key;
            scope.sorting.direction = 1;
          }
          sorter(key,scope.sorting.direction);
          scope.sorting.obj  = scope.headers[i];
          scope.buildTable();

        };
      }

      function fullChecked(){
        var length = 0;
        for(var i=0;i<viewable.length;i++){
          if(scope.checkB[i] && scope.checkB[i]._checked){
              length+=1;
            }
          }
          if(!scope.checkB[-1]){
            scope.checkB[-1] = {};
          }
          if(length !== 0){
            scope.selectedCheck = true;
          }else{
            scope.selectedCheck = false;
          }
          if(length === viewable.length){
            scope.checkB[-1]._checked = true;
          }else{
            scope.checkB[-1]._checked = false;
          }
      }

      scope.checkChange = function(i){
        if(i === -1){
          var check = scope.checkB[-1]._checked;
          angular.forEach(scope.checkB,function(val){
            val._checked = check;
            scope.selectedCheck = check;
          });
        }else{
          if(scope.checkB[-1]){
            scope.checkB[-1]._checked = false;
          }
          fullChecked();
        }
      };
      scope.actions = function(){

      };

      scope.hulpngModel=[];
      scope.checkB = [];
      function createCheckbox(row,i,hulp){
        if(!hulp){
          hulp ='';
        }
        var checkbox = '<div class="checkbox">'+
                          '<input type="checkbox" ng-change="checkChange('+row+')" ng-model="checkB['+row+']._checked" id="'+row+'" name="'+row+'" value="'+row+'">'+
                          '<label for="'+row+'"></label>'+
                        '</div>';
        return checkbox;
      }


      //This function create the table body
      function setBody(table,content){
        var body = table.createTBody();

          for(var i=scope.headers.length-1;i>=0;i--){
            if(scope.headers[i] && scope.headers[i].checked && scope.headers[i].visible){
              for(var j=0;j<content.length;j++){
                var row;
                if(body.rows[j]){
                  row = body.rows[j];
                }else{
                  row = body.insertRow(j);
                  if(typeof scope.actions === 'function'){
                    var check = row.insertCell(0);
                    // var index = scope.ngModel.indexOf(content[j]);
                    var index = j;
                    check.innerHTML = createCheckbox(index,j);
                  }
                }
                var val = content[j][scope.headers[i].field];
                var cell;
                if(typeof scope.actions === 'function'){
                  cell = row.insertCell(1);
                }else{
                  cell = row.insertCell(0);
                }
                cell.innerHTML = val;
            }
          }
        }
      }

      function sorter(sortVal,direction){
        ngModelWatch();
        scope.ngModel.sort(function(obj1, obj2) {
          var obj1Val = obj1[sortVal];
          var obj2Val = obj2[sortVal];

          if(!_.isString(obj1Val)){
            obj1Val = obj1Val.toString();
          }

          if(!_.isString(obj2Val)){
            obj2Val = obj2Val.toString();
          }

          if(direction){
            return direction*obj1Val.localeCompare(obj2Val);
          }else{
            return obj1Val.localeCompare(obj2Val);
          }

        });
        watch();
      }

      //number of rows it wil show on the page
      scope.numSelected=0;
      //function to change the row page view
      scope.perPageClick = function(index){
        scope.numSelected = index;
        scope.pageSelected=1;
        scope.buildTable();
      };

      //wich page is selected
      scope.pageSelected=1;
      //function to set the page you need
      scope.setPage = function(index){
        if(index > 0 ){
          scope.pageSelected = index;
          uncheckAll();
          scope.buildTable();
        }
      };

      scope.setItems = function(){
        scope.buildTable();
        fullChecked();
      };

      scope.createArray = function(num){
        var array = [];
        for(var i=0;i<num;i++){
          array[i] = {};
        }
        return array;
      };

      function buildPagination(){
        scope.showNums = [];
        var num = scope.pageSelected;
        var numPages = scope.pages;

        if(numPages <6){
          scope.showNums = _.range(2,numPages);
        }else{
          if(num < 4){
            scope.showNums = _.range(2,4);
            scope.showNums.push(-1);
          }else if(num >= numPages -2){
            scope.showNums = [-1].concat(_.range(numPages-2,numPages));
          }else{
            scope.showNums = [-1,num,-1];
          }
        }
        if(numPages >1 ){
          scope.showNums.push(numPages);
        }
      }

      aantalToShow = scope.perPage.pages;
      pages = Math.ceil(scope.ngModel.length/aantalToShow);
      scope.pages = _.range(1,pages);

      //This function build the table and the number of pages!
      scope.buildTable = function(){
        var table = document.createElement('table');
        setHeader(table,scope.headers);
        aantalToShow = scope.perPage.pages;
        pages = Math.ceil(scope.ngModel.length/aantalToShow);
        scope.pages = pages;

        var start = (scope.pageSelected-1)*aantalToShow;
        var stop = (scope.pageSelected *aantalToShow)-1;
        viewable = _.slice(scope.ngModel, start,stop+1);
        scope.checkB = scope.createArray(viewable.length);
        if(viewable.length === 0 && scope.pageSelected > 1){
          scope.pageSelected = scope.pageSelected-1;
          scope.buildTable();
          return;
        }
        if(scope.ngModel.length === 0){
          scope.numFirst = 0;
        }else{
          scope.numFirst = start +1;
        }
        if(stop > scope.ngModel.length){
          scope.numLast = scope.ngModel.length;
        }else{
          scope.numLast = stop +1;
        }
        buildPagination();
        scope.itemLength = scope.ngModel.length;
        setBody(table,viewable);  //
        table=$(table);           //variable table is added code to set class table
        table.addClass('table-interactive');   //added code to set class table
        fullChecked();

        var tableEl = element.find('table');
        tableEl.replaceWith(table); // old code: $('table').replaceWith($(table));
        $compile(table)(scope);
      };

      scope.selected = -1;
      //Function that will be called to change the order
      scope.omhoog = function(){
        if(scope.selected > 0){
          scope.viewer.swap(scope.selected,scope.selected-1);
          scope.selected-=1;
        }
        scope.buildTable();
      };
      //Function that will be called to change the order
      scope.omlaag = function(){
        if(scope.selected >=0 && scope.selected < scope.viewer.length-1){
          scope.viewer.swap(scope.selected,scope.selected+1);
          scope.selected+=1;
        }
        scope.buildTable();
      };

      scope.headerChange = function(){
        scope.buildTable();
      };
      //added this to swap elements easly
      Array.prototype.swap = function(a, b) {
        var temp = this[a];
        this[a] = this[b];
        this[b] = temp;
      };

      scope.buildTable();
      //function that will be called when you clicked on row name
      scope.select=function(e,index){
        scope.selected = index;
        e.preventDefault();
        e.stopPropagation();
      };

      //Set first page
      scope.setFirst = function(){
        scope.setPage(1);
      };

      //set lest page
      scope.setLast = function(){
        scope.setPage(pages);
      };

      scope.close = function(){
        $rootScope.$broadcast('popover-open', { group: 'option-table',el:$('<div><div>') });
      };

      //set next page
      scope.setNext = function(){
        if(scope.pageSelected < pages){
          scope.pageSelected +=1;
          scope.setPage(scope.pageSelected);
        }
      };

      //set prev page
      scope.setPrev = function(){
        if(scope.pageSelected >1){
          scope.pageSelected -=1;
          scope.setPage(scope.pageSelected);
        }
      };

    }
  };
}]).filter('myLimitTo', [function(){
    return function(obj, limit){
        var keys = Object.keys(obj);
        if(keys.length < 1){
            return [];
        }

        var ret = {},
        count = 0;
        angular.forEach(keys, function(key){
           if(count >= limit){
                return false;
            }
            ret[key] = obj[key];
            count++;
        });
        return ret;
    };
}]).directive('tinkShiftSort',['$timeout',function(timeout){
  return {
    restirct:'A',
    link:function(scope,elem){
      timeout(function(){
        Sortable.create(elem.find('ul').get(0),{
          ghostClass: 'draggable-placeholder',
          animation: 200,
          handle:'.draggable-elem',
          onStart: function (evt) {
             scope.$apply(function(){
              scope.selected = evt.oldIndex;
            });
          },
          onUpdate: function (evt) {
            scope.$apply(function(){
              var old = scope.headers[evt.oldIndex];
              scope.headers[evt.oldIndex] = scope.headers[evt.newIndex];
              scope.headers[evt.newIndex] = old;
              scope.selected = evt.newIndex;
              scope.buildTable();
            });
          },
        });
      },200);
    }
  };
}]);
;'use strict';
angular.module('tink.modal', [])
  .provider('$modal', function() {
    var defaults = this.defaults = {
      element:null,
    };

    var openInstance = null;

     this.$get = function($http,$q,$rootScope,$templateCache,$compile,$animate,$window,$controller,$injector) {
      var bodyElement = angular.element($window.document.body);
      var htmlElement = $('html');

        var $modal = {};
        var options = $modal.$options = angular.extend({}, defaults);
        var linker;

        //for fetching the template that exist
        var fetchPromises = {};
        function fetchTemplate(template) {
          if(fetchPromises[template]) {return fetchPromises[template];}
          return (fetchPromises[template] = $http.get(template, {cache: $templateCache}).then(function(res) {
            return res.data;
          }));
        }

        function fetchResolvePromises(resolves) {
          var promisesArr = [];
          angular.forEach(resolves, function (value) {
            if (angular.isFunction(value) || angular.isArray(value)) {
              promisesArr.push($q.when($injector.invoke(value)));
            }
          });
          return promisesArr;
        }

        /*$modal.$promise = fetchTemplate(options.template);

        //when the templated is loaded start everyting
        $modal.$promise.then(function(template) {
          linker = $compile(template);
          //$modal.show()
        });*/

        $modal.show = function() {
          $modal.$element = linker(options.scope, function() {});
          enterModal();
        };

        $modal.hide = function() {
          leaveModal();
        };

        $modal.open = function(config){

          //create the promises for opening and result
          var modalResultDeferred = $q.defer();
          var modalOpenedDeferred = $q.defer();

          //Create an instance for the modal
          var modalInstance = {
              result: modalResultDeferred.promise,
              opened: modalOpenedDeferred.promise,
              close: function (result) {
                leaveModal(null).then(function(){
                  modalResultDeferred.resolve(result);
                });
              },
              dismiss: function (reason) {
                leaveModal(null).then(function(){
                  modalResultDeferred.reject(reason);
                });
              }
            };

            var resolveIter = 1;

            //config variable
            config = angular.extend({}, defaults, config);
            config.resolve = config.resolve || {};
            var templateAndResolvePromise;
            if(angular.isDefined(config.templateUrl)){
              templateAndResolvePromise = $q.all([fetchTemplate(config.templateUrl)].concat(fetchResolvePromises(config.resolve)));
            }else{
              templateAndResolvePromise = $q.all([config.template].concat(fetchResolvePromises(config.resolve)));
            }

            //Wacht op de template en de resloved variable


            templateAndResolvePromise.then(function success(tplAndVars){
              //Get the modal scope or create one
              var modalScope = (config.scope || $rootScope).$new();
              //add the close and dismiss to to the scope
              modalScope.$close = modalInstance.close;
              modalScope.$dismiss = modalInstance.dismiss;

              var ctrlInstance,ctrlConstant={};
              ctrlConstant.$scope = modalScope;
              ctrlConstant.$modalInstance = modalScope;
              angular.forEach(config.resolve, function (value, key) {
                  ctrlConstant[key] = tplAndVars[resolveIter++];
              });
              if (config.controller) {
                ctrlInstance = $controller(config.controller, ctrlConstant);
              }

              enterModal(modalInstance,{
                scope:modalScope,
                content: tplAndVars[0],
                windowTemplateUrl: config.template
              });
            });

              return modalInstance;
          };

        function createModalWindow(content){
          var modelView = angular.element('<div class="modal" tabindex="-1" role="dialog">'+
            '<div class="modal-dialog">'+
              '<div class="modal-content">'+
              '</div>'+
            '</div>'+
          '</div>');
          modelView.find('.modal-content').html(content);
          return modelView;
        }

        function enterModal(model,instance){

          function show(){
            var linker = $compile(createModalWindow(instance.content));
            var content = linker(instance.scope, function() {});
            model.$element = content;
            $(htmlElement).addClass('has-open-modal');
            bodyElement.bind('keyup',function(e){
              instance.scope.$apply(function(){
                if(e.which === 27){
                  model.dismiss('esc');
                }
              });
            });

            model.$element.bind('click',function(e){
              var view = $(this);
              instance.scope.$apply(function(){
                if(e.target === view.get(0)){
                  model.dismiss('backdrop');
                }
              });
            });

            $animate.enter(content, bodyElement, null);
            openInstance = {element:content,scope:instance.scope};
          }

          if(openInstance !== null){
            leaveModal(openInstance).then(function(){
              show();
            });
          }else{
            show();
          }
        }

        function leaveModal(modal){
          bodyElement.unbind('keyup');
          var q = $q.defer();
          if(modal === null){
            modal = openInstance;
          }
          $(htmlElement).removeClass('has-open-modal');
          $animate.leave(modal.element).then(function() {
            openInstance = null;
            q.resolve('ended');
          });
          return q.promise;
        }
        return $modal;
     };
  })
  .directive('tinkModal',['$modal',function($modal){
    return{
      restrict:'A',
      scope:{
        tinkModalSuccess:'=',
        tinkModalDismiss:'='
      },
      link:function(scope,element,attr){
        if(!attr.tinkModalTemplate){
          return;
        }

        element.bind('click',function(){
          scope.$apply(function(){
            openModal(attr.tinkModalTemplate);
          });
        });

        function openModal(template){
          var modalInstance = $modal.open({
            templateUrl: template
          });

          if(typeof scope.tinkModalSuccess !== 'function'){
            scope.tinkModalSuccess = null;
          }

          if(typeof scope.tinkModalDismiss !== 'function'){
            scope.tinkModalDismiss = null;
          }

          modalInstance.result.then(scope.tinkModalSuccess,scope.tinkModalDismiss);
        }


      }
    };
  }]);;'use strict';
angular.module('tink.nationalNumber', []);
angular.module('tink.nationalNumber')
  .directive('tinkNationalNumber',['$window','safeApply',function($window,safeApply){
   return {
    restrict:'AE',
    controller:'tinkFormatController',
    require:['tinkNationalNumber','ngModel','?^form'],
    template: function() {
      var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
      var isTouch = ('createTouch' in $window.document) && isNative;
      if (isTouch) {
        return '<div><input class="hide-styling" type="text"><div>';
      } else {
        return '<div tabindex="-1"><div id="input" class="faux-input" contenteditable="true">{{placeholder}}</div></div>';
      }
    },
    link:function(scope,elm,attr,ctrl){
      elm.attr('tabindex','-1');
      var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
      var isTouch = ('createTouch' in $window.document) && isNative;
      var controller = ctrl[0];
      var form = ctrl[2];
      var ngControl = ctrl[1];
      var element = elm.find('div>:first');
      //variable
      var config = {
        format: '00.00.00-000.00',
        placeholder: 'xx.xx.xx-xxx.xx'
      };

       ngControl.$parsers.unshift(function(value) {
        checkvalidty(value);
        return value;
       });

       ngControl.$formatters.push(function(modelValue) {
        if(modelValue !== undefined){
          if(modelValue && modelValue.length === 11){
            modelValue = modelValue.substr(0,2) + '.' + modelValue.substr(2,2)+ '.' + modelValue.substr(4,2)+'-'+ modelValue.substr(6,3)+'-'+modelValue.substr(9,2);
          }

          if(validFormat(modelValue)){
            if(isTouch){
              element.val(modelValue);
            }else{
              controller.setValue(modelValue,null);
            }
          }else{
            modelValue = null;
            ngControl.$setViewValue(modelValue);
          }
          checkvalidty(modelValue);

        }
        return modelValue;
       });

       element.unbind('input').unbind('keydown').unbind('change');
      //on blur update the model.
      element.on('blur', function() {
        safeApply(scope,function(){
          var value;
          if (isTouch) {
            value = element.val();
          }else{
            value = controller.getValue();
          }
          checkvalidty(value);
            if(isRRNoValid(value)){
              ngControl.$setViewValue(value);
              ngControl.$render();
            }else{
               ngControl.$setViewValue(null);
            }
            /*if(value === 'xx.xx.xx-xxx.xx' || value === ''){
              ngControl.$setViewValue(null);
            }*/
        });
      });

       var isRequired = (function(){
          if(attr.required === 'true' || attr.required === '' || attr.required === 'required'){
            return true;
          }else{
            return false;
          }
        })();

        function validFormat(value){
          if(value && value.length === 11){
            return value.match(/[0-9]*/g);
          }else if(value && value.length === 15){
            return value.match(/[0-9][0-9].[0-9][0-9].[0-9][0-9]-[0-9][0-9][0-9].[0-9][0-9]/g);
          }else{
            return false;
          }
        }


       function isRRNoValid(n) {
        if(typeof n !== 'string'){
          return false;
        }
          n = n.replace(/[^\d]*/g, '');
            // RR numbers need to be 11 chars long
            if (n.length !== 11) {
              return false;
            }

            var checkDigit = n.substr(n.length - 2, 2);
            var modFunction = function(nr) { return 97 - (nr % 97); };
            var nrToCheck = parseInt(n.substr(0, 9));

            // first check without 2
            if (modFunction(nrToCheck) === parseInt(checkDigit)) {
              return true;
            }
            // then check with 2 appended for y2k+ births
            nrToCheck = parseInt('2' + n.substr(0, 9));
            return (modFunction(nrToCheck) === parseInt(checkDigit));
        }

       function checkvalidty(value){

        if(value === config.placeholder || value === '' || value === null || value === undefined){
          ngControl.$setValidity('format',true);
        }else{
          ngControl.$setValidity('format',isRRNoValid(value));
        }

        if(isRequired){
          if(controller.getValue() === config.placeholder || value === '' || value === null || value === undefined){
            ngControl.$setValidity('required',false);
            ngControl.$setValidity('format',true);
          }else{
            ngControl.$setValidity('required',true);
          }
        }
       }

       if (!isTouch) {
          controller.init(element,config,form,ngControl);
       }
    }
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
      if(attr.autoSelect){
        opts.autoSelect = (attr.autoSelect === 'true');
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
.directive( 'tinkPopover', ['$q','$templateCache','$http','$compile','$timeout','$window','$rootScope',function ($q,$templateCache,$http,$compile,$timeout,$window,$rootScope) {
  return {
    restrict:'EA',
    compile: function compile( tElement, attrs ) {
      var fetchPromises = {};
      //to retrieve a template;
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
      var theTemplate = null;
      if(attrs.tinkPopoverTemplate){
        theTemplate = haalTemplateOp(attrs.tinkPopoverTemplate);
      }


      return {
          post: function postLink( scope, element, attributes ) {
                var placement = attributes.tinkPopoverPlace;
                var align = attributes.tinkPopoverAlign;
                var trigger = 'click';
                var spacing = 2;


                var isOpen = null;
                if(trigger === 'click'){
                  element.bind('click',function(){
                    scope.$apply(function(){
                      if(isOpen === null){
                        show();
                      }else{
                        hide();
                      }

                    });
                  });
                }else if(trigger === 'hover'){
                   element.bind('mouseenter',function(){
                    show();
                   });
                   element.bind('mouseleave',function(){
                    hide();
                   });
                }

              function popoverHtml(){
                var html = '<div class="popover {{arrowPlacement}}">'+
                            '<span class="arrow"></span>'+
                          '</div>';
                          return html;
              }

              function childOf(c,p){ //returns boolean
                while((c=c.parentNode)&&c!==p){
                }
                return !!c;
              }

              $(document).bind('click',function(e){
                var clicked = $(e.target).parents('.popover').last();
                if(isOpen && !childOf($(e.target).get(0),element.get(0)) && ($(e.target).get(0) !== element.get(0) || clicked.length > 0)){
                  if(isOpen.get(0) !== clicked.get(0) &&  $(e.target).get(0) !== isOpen.get(0) ){
                    hide();
                  }
                }

              });

              if(attributes.tinkPopoverGroup){
                scope.$on('popover-open', function(event, args) {

                    var group = args.group;
                    if(group === attributes.tinkPopoverGroup && isOpen && $(args.el).get(0) !== isOpen.get(0)){
                      hide();
                    }
                });
              }

              function show (){
                if(theTemplate !== null){
                  theTemplate.then(function(data){
                    if(isOpen === null){
                      var elContent = $($compile(data)(scope));
                      var el =$($compile(popoverHtml())(scope));
                      el.css('position','absolute');
                      el.css('visibility','hidden');
                      elContent.insertAfter(el.find('span'));

                      // el.css('z-index','99999999999');
                      if(placement === 'top'){
                        element.before(el);
                      }else{
                        element.after(el);
                      }

                      el.css('top',-100);
                      el.css('left',-10);

                        calcPos(element,el,placement,align,spacing);


                      if(attributes.tinkPopoverGroup){
                        $rootScope.$broadcast('popover-open', { group: attributes.tinkPopoverGroup,el:el });
                      }

                      isOpen = el;
                    }
                  });
                }
              }

              var timeoutResize = null;

              $window.addEventListener('resize', function() {
                if(isOpen!== null){
                  $timeout.cancel( timeoutResize);
                  timeoutResize = $timeout(function(){
                   // setPos(isOpen,placement,align,spacing);
                    calcPos(element,isOpen,placement,align,spacing);
                  },250);
                }
              }, true);

              $window.addEventListener('scroll', function() {
                if(isOpen!== null){
                  $timeout.cancel( timeoutResize);
                  timeoutResize = $timeout(function(){
                   // setPos(isOpen,placement,align,spacing);
                    calcPos(element,isOpen,placement,align,spacing);
                  },450);
                }
              }, true);

              function hide(){
                if(isOpen !== null){
                  isOpen.remove();
                  isOpen = null;
                }
              }

                 //The function that will be called to position the tooltip;
            function getPos(el,placement,align,spacing){


                var porcent = {right:0.85,left:0.15,top:0.15,bottom:0.85};
                var arrowHeight = 10;
                var arrowWidth = 10;

                var alignLeft = 0;
                var alignTop = 0;
                if(align === 'center'){
                  alignLeft = (el.outerWidth(true) / 2)-(element.outerWidth(true)/2);
                  alignTop = 0;
                }else if(align === 'left' || align === 'right'){
                  alignLeft = (el.outerWidth(true)*porcent[align]) -(element.outerWidth(true)/2);
                }else if(align === 'top' || align === 'bottom'){
                  alignTop = 0;
                }

                var left = element.position().left - alignLeft;
                var top = null;
                  if(placement === 'top'){
                    top = element.position().top - (el.outerHeight() + arrowHeight +spacing);
                  }else if(placement === 'bottom'){
                    top = element.position().top + element.outerHeight() + arrowHeight +spacing;
                  }else if(placement === 'right'){
                    left = element.position().left + element.outerWidth(true) + arrowWidth + spacing;
                  }else if(placement === 'left'){
                    left = element.position().left - el.outerWidth(true)- arrowWidth - spacing;
                  }

                  if(align === 'right'){
                    left = element.position().left + (element.outerWidth(true) - el.outerWidth(true));
                  }else if(align === 'left'){
                    left = element.position().left;
                  }else if(align === 'top'){
                    top = element.position().top;
                  }else if(align === 'bottom'){
                    top = element.position().top - el.outerHeight(true) + element.outerHeight(true);
                  }else if(align === 'center'){
                    if(placement === 'top' || placement === 'bottom'){
                      left = element.position().left - ((el.outerWidth(true) / 2)-(element.outerWidth(true)/2));
                    }else if(placement === 'left' || placement === 'right'){
                      top = element.position().top - ((el.outerHeight(true) / 2)-(element.outerHeight(true)/2));
                    }
                  }


                    return {top:top,left:left,place:placement,align:align};

            }

            
              function arrowCal(placement,align){
                  var arrowCss = 'arrow-';
                  switch(placement){
                    case 'left':
                      arrowCss = arrowCss + 'right';
                      break;
                    case 'right':
                      arrowCss = arrowCss + 'left';
                      break;
                    case 'top':
                      arrowCss = arrowCss + 'bottom';
                      break;
                    case 'bottom':
                      arrowCss = arrowCss + 'top';
                      break;
                  }

                  switch(align){
                    case 'center':
                      break;
                    case 'top':
                    case 'bottom':
                      if(placement === 'right' || placement === 'left'){
                        arrowCss = arrowCss + '-' + align;
                      }
                      break;
                    case 'left':
                    case 'right':
                      if(placement === 'top' || placement === 'bottom'){
                        arrowCss = arrowCss + '-' + align;
                      }
                  }
                  scope.arrowPlacement = arrowCss;
                }
              arrowCal(placement,align);

              //calculate the position
              function calcPos(element,el,place,align,spacing){
                var pageScrollY = ($window.scrollY || $window.pageYOffset);
                var pageScrollX = ($window.scrollX || $window.pageXOffset);

                var w1 = element.offset().left - pageScrollX;
                var w2 = $window.innerWidth - (w1+element.outerWidth(true));
                var h1 = element.offset().top - Math.ceil(parseFloat($('body').css('padding-top'))) - pageScrollY;
                var h2 = $window.innerHeight - (h1+element.outerHeight(true));

                if(place){
                  if(place==='top'){
                    if(el.outerHeight(true) + spacing + 10 > h1){
                      place = undefined;
                      align = undefined;
                    }
                  }else if (place === 'bottom'){
                    if(el.outerHeight(true) + spacing + 10 > h2){
                      place = undefined;
                      align = undefined;
                    }
                  }else if(place === 'left'){
                    if((el.outerWidth(true) - element.outerWidth(true)) > w1){
                      place = undefined;
                      align = undefined;
                    }
                  }else if(place === 'right'){
                    if((el.outerWidth(true) - element.outerWidth(true)) > w2){
                      place = undefined;
                      align = undefined;
                    }
                  }else{
                    place = undefined;
                    align = undefined;
                  }
                }

                if(!place){
                  if(h1 > element.outerHeight() || h2 > element.outerHeight()){
                    if(h1 > h2){
                      place = 'top';
                    }else{
                      place = 'bottom';
                    }
                  }else if(w1 > element.outerWidth() || w2 > element.outerWidth()){
                    if(w1 > w2){
                      place = 'left';
                    }else {
                      place = ' right';
                    }
                  }else{
                    place = 'bottom';
                  }
                }
                var val;
                if(align){
                  if(place === 'left' || place === 'right'){
                    if(align === 'top'){
                      if((el.outerHeight(true) - element.outerHeight(true))> h2){
                        align = undefined;
                      }
                    }else if(align === 'bottom'){
                      if((el.outerHeight(true) - element.outerHeight(true))> h1){
                        align = undefined;
                      }
                    }else if(align === 'center'){
                      val = (el.outerHeight(true) - element.outerHeight(true)) / 2;
                      if(val > h1 || val > h2){
                        align = undefined;
                      }
                    }

                  }else if(place === 'top' || place === 'bottom'){
                    if(align === 'left'){
                      if((el.outerWidth(true) - element.outerWidth(true))> w2){
                        align = undefined;
                      }
                    }else if(align === 'right'){
                      if((el.outerWidth(true) - element.outerWidth(true))> w1){
                        align = undefined;
                      }
                    }else if(align === 'center'){
                      val = (el.outerWidth(true) - element.outerWidth(true))/2;
                      if(val > w1 || val > w2){
                        align = undefined;
                      }
                    }

                  }
                }

                if(!align){
                  if(place === 'left' || place === 'right'){
                    if(h1 > h2){
                      align = 'bottom';
                    }else {
                      align = 'top';
                    }
                  }else if(place === 'top' || place === 'bottom'){
                    if(w1 > w2){
                      align  = 'right';
                    }else{
                      align = 'left';
                    }
                  }
                }

                function calcPostInside(){
                  var data = getPos(el,place,align,spacing);
                    el.css('top',data.top);
                    el.css('left',data.left);
                    arrowCal(data.place,data.align);
                }

                calcPostInside();
                $timeout(function(){
                  calcPostInside();
                },120);
                $timeout(function(){el.css('visibility','visible');},220);
              }

          }
      };
    }
  };

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
          if(keycode !== 9){
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
		'tink.format',
		'tink.timepicker',
		'tink.accordion',
		'tink.nationalNumber',
		'tink.dropupload',
		'angularFileUpload',
		'tink.modal',
		'ngAria',
		'tink.interactiveTable',
		'tink.modal',
		'tink.backtotop',
		'ngLodash'
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
          },
          closeById:function(id){
            if(sideToggle[id]){
              sideToggle[id].closeMenu();
            }
          },
          openById:function(id){
            if(sideToggle[id]){
              sideToggle[id].openMenu();
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
    if(month > 11){
      return null;
    }
    var lastDayOfMonth = new Date(dateItems[yearIndex], month+1, 0);
    if(dateItems[dayIndex] > lastDayOfMonth.getDate()){
      return null;
    }

    return formatedDate;
  }

  return {
    dateBeforeOther: function (first, last) {
      var firstDate = new Date(first);
      var lastDate = new Date(last);
      firstDate.setHours(0, 0, 0, 0);
      lastDate.setHours(0, 0, 0, 0);
      if (firstDate >= lastDate && lastDate !== null) {
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
      date = stringToDate(date, format);

      if(date !== null && date.toString() !== 'Invalid Date'){
        return date;
      }else{
        return null;
      }
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
      if(date === null || date === undefined || date === ''){
        return null;
      }else{
        return dateFormat(date, format, null, nl);
      }
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

  function daysInRows(date,selectedDate,before,after){
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

        var disable = false;
        if(angular.isDate(before) && !dateCalculator.dateBeforeOther(day,before)){
          disable = true;
        }
        if(angular.isDate(after) && !dateCalculator.dateBeforeOther(after,day)){
          disable = true;
        }

        days.push({date: day,selected:isSelected, isToday: day.toDateString() === today.toDateString(), label: dateCalculator.formatDate(day, 'd'),isMuted:isMuted,disabled:disable});
    }
    var arrays = split(days, 7);
     return arrays;

  }

  function monthInRows(date,before,after){
    var months = [];
    var monthDate;
    if(angular.isDefined(before) && before !== null){
      before = new Date(before.getFullYear(),before.getMonth(),1);
    }
    if(angular.isDefined(after) && after !== null){
      after = new Date(after.getFullYear(),after.getMonth(),1);
    }
     for(var i = 0; i < 12; i++) {
      monthDate = new Date(date.getFullYear(),i,1);

    var disable = false;
    if(angular.isDate(before) && !dateCalculator.dateBeforeOther(monthDate,before)){
      disable = true;
    }
    if(angular.isDate(after) && !dateCalculator.dateBeforeOther(after,monthDate)){
      disable = true;
    }

      months.push({date: monthDate,label: dateCalculator.formatDate(monthDate, 'mmm'),disabled:disable});
     }
    var arrays = split(months, 4);
    return arrays;
  }

  function yearInRows(date,before,after){
    var years = [];
    var yearDate;

    if(angular.isDefined(before) && before !== null){
      before = new Date(before.getFullYear(),date.getMonth(),1);
    }
    if(angular.isDefined(after) && after !== null){
      after = new Date(after.getFullYear(),date.getMonth(),1);
    }

   for(var i = 11; i > -1; i--) {
    yearDate = new Date(date.getFullYear()-i,date.getMonth(),1);

    var disable = false;
    if(angular.isDate(before) && !dateCalculator.dateBeforeOther(yearDate,before)){
      disable = true;
    }
    if(angular.isDate(after) && !dateCalculator.dateBeforeOther(after,yearDate)){
      disable = true;
    }

    years.push({date: yearDate,label: dateCalculator.formatDate(yearDate, 'yyyy'),disabled:disable});
   }
    var arrays = split(years, 4);
    return arrays;
  }

  function createLabels(date, firstRange, lastRange,grayed,before,after) {
    var label = '',cssClass = '';
    if (label !== null && angular.isDate(date)) {
      label = date.getDate();
      if(grayed){
        cssClass = 'btn-grayed';
      }
      if (isSameDate(date, firstRange) || isSameDate(date, lastRange)) {
        if(grayed){
          cssClass = 'btn-grayed-selected-clicked';
        }else{
          cssClass = 'btn-selected-clicked';
        }
      } else if (inRange(date, firstRange, lastRange)) {
        if(grayed){
          cssClass = 'btn-grayed-selected';
        }else{
          cssClass = 'btn-selected';
        }
      } else if (isSameDate(date, new Date())) {
        if(grayed){
          cssClass = 'btn-grayed';
        }else{
          cssClass = 'btn-today';
        }
      }

      var disable = '';
      if(angular.isDate(before) && !dateCalculator.dateBeforeOther(date,before)){
        disable = 'disabled';
      }
      if(angular.isDate(after) && !dateCalculator.dateBeforeOther(after,date)){
        disable = 'disabled';
      }

      var month = ('0' + (date.getMonth() + 1)).slice(-2);
      var day = ('0' + (date.getDate())).slice(-2);
      return '<td><button '+disable+' ng-click="$select(\''+date.getFullYear()+'/'+month+'/'+day+'\')" class="btn ' + cssClass + '"><span>' + label + '</span></button></td>';
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
        createMonthDays: function (date, firstRange, lastRange,control,before,after) {
          var domElem = '', monthCall = callCullateData(date), label;
          //var tr = createTR();
          var tr = '<tr>';
          for (var i = 0; i < monthCall.days; i++) {
            var day = new Date(monthCall.firstDay.getFullYear(), monthCall.firstDay.getMonth(), monthCall.firstDay.getDate() + i);
            label = createLabels(null, firstRange, lastRange,false,before,after);
            if(control === 'prevMonth'){
              if(day.getMonth() !== date.getMonth() && dateCalculator.dateBeforeOther(date,day)){
                label = createLabels(day, firstRange, lastRange,true,before,after);
              }
            } else if(control === 'nextMonth'){
              if(day.getMonth() !== date.getMonth() && dateCalculator.dateBeforeOther(day,date)){
                label = createLabels(day, firstRange, lastRange,true,before,after);
              }
            }
            if(day.getMonth() === date.getMonth()){
              label = createLabels(day, firstRange, lastRange,false,before,after);
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
        daysInRows: function(date,model,before,last){
         return daysInRows(date,model,before,last);
        },
        monthInRows:function(date,before,last){
          return monthInRows(date,before,last);
        },
        yearInRows:function(date,before,last){
          return yearInRows(date,before,last);
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
angular.module('tink.dropupload')
.factory('UploadFile',['$q','tinkUploadService',function($q,tinkUploadService) {
    var upload = null;
    // instantiate our initial object
    var uploudFile = function(data,uploaded) {
        if(!data instanceof window.File){
            throw 'uploadFile was no file object!';
        }
        this.fileData = data;
        if(this.fileData){
            this.fileName = this.fileData.name;
            this.fileType = this.fileData.type;
            this.fileSize = this.fileData.size;
        }


        if(uploaded){
            this.progress = 100;
        }else{
            this.progress = 0;
        }
    };


    uploudFile.prototype.getFileName = function() {
        return this.fileName;
    };

    uploudFile.prototype.getData = function() {
        return this.fileData;
    };

    uploudFile.prototype.getProgress = function() {
        return this.progress;
    };

    uploudFile.prototype.getFileSize = function() {
        return this.fileSize;
    };

    uploudFile.prototype.getFileExtension = function() {
        var posLastDot = this.getFileName().lastIndexOf('.');
        return this.getFileName().substring(posLastDot, this.getFileName().length);
    };

    uploudFile.prototype.getFileMimeType = function() {
        return this.fileType;
    };

    uploudFile.prototype.cancel = function(){
        if(upload !== null){
            if(upload.abort){
                upload.abort();
            }
        }
    };


    uploudFile.prototype.upload = function(options){
        var scope = this;
        var promise = $q.defer();
        upload = tinkUploadService.upload(this,options);
        upload.then(
            function success() {
                scope.progress=100;
                promise.resolve(scope);
            },
            function fail(){
                scope.progress=0;
                promise.reject(scope);
            },
            function notify(evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                if(isNaN(progressPercentage)){
                    progressPercentage = 0;
                }
                scope.progress = progressPercentage;
                promise.notify({progress:progressPercentage,object:scope});
            });
        return promise.promise;
    };

     uploudFile.prototype.remove = function(){
        tinkUploadService.remove(this);
     };

    return uploudFile;


}]);;'use strict';
angular.module('tink.dropupload')
.provider('tinkUploadService',['lodash', function (_) {
  var urls = {};
  return {
    $get: function ($upload) {
      return {
        upload: function(file,options){
          if(file.getData() instanceof window.File){
            var fileMime = file.getFileMimeType();
            var sendUrl = '';
            if(urls[fileMime]){
              sendUrl = urls[fileMime];
            }else{
              if(!urls.all){
                throw 'no All url is set ! in uploadservice';
              }else{
                sendUrl = urls.all;
              }
            }

            var data = angular.extend({}, {url:sendUrl,file: file.getData()}, options);
            return $upload.upload(data);
          }else{
            throw 'No instanceof uploadfile';
          }
        },
        remove: function(file){
          if(file.getData() instanceof window.File){
            //TODO
          }
        },
        addUrls: function (url,type) {
          if(type === undefined || type === null || type === ''){
            type = 'all';
            urls[type] = url;
          }else{
            if(_.isArray(type)){
              for(var i = 0;i < type.length; i++){
                urls[type[i]] = url;
              }
            }else if(typeof type === 'string'){
              urls[type] = url;
            }
          }
        }
      };
    }
  };
}]);;angular.module('tink.templates', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/tinkAccordionPanel.html',
    "<section class=accordion-panel> <a href class=accordion-toggle ng-click=toggleOpen()> <div class=accordion-panel-heading> <h4 class=panel-title> <span>{{heading}}</span> </h4> </div> </a> <div class=accordion-panel-body> <div class=accordion-loaded-content ng-transclude> <p>DOM content comes here</p> </div> </div> </section>"
  );


  $templateCache.put('templates/tinkDatePicker.html',
    "<div class=\"dropdown-menu datepicker\" ng-class=\"'datepicker-mode-' + $mode\"> <table style=\"table-layout: fixed; height: 100%; width: 100%\"> <thead> <tr class=text-center> <th> <button tabindex=-1 type=button ng-disabled=pane.prev class=\"btn pull-left\" ng-click=$selectPane(-1)> <i class=\"fa fa-chevron-left\"></i> </button> </th> <th colspan=\"{{ rows[0].length - 2 }}\"> <button tabindex=-1 type=button class=\"btn btn-block text-strong\" ng-click=$toggleMode()> <strong style=\"text-transform: capitalize\" ng-bind=title></strong> </button> </th> <th> <button tabindex=-1 type=button ng-disabled=pane.next class=\"btn pull-right\" ng-click=$selectPane(+1)> <i class=\"fa fa-chevron-right\"></i> </button> </th> </tr> <tr ng-show=showLabels class=datepicker-days ng-bind-html=labels></tr> </thead> <tbody> <tr ng-repeat=\"(i, row) in rows\" height=\"{{ 100 / rows.length }}%\"> <td class=text-center ng-repeat=\"(j, el) in row\"> <button tabindex=-1 type=button class=btn style=\"width: 100%\" ng-class=\"{'btn-selected': el.selected, 'btn-today': el.isToday && !el.elected}\" ng-click=$select(el.date) ng-disabled=el.disabled> <span ng-class=\"{'text-muted': el.muted}\" ng-bind=el.label></span> </button> </td> </tr> </tbody> </table> </div>"
  );


  $templateCache.put('templates/tinkDatePickerField.html',
    "<div role=datepicker class=\"dropdown-menu datepicker\" ng-class=\"'datepicker-mode-' + $mode\"> <table style=\"table-layout: fixed; height: 100%; width: 100%\"> <thead> <tr class=text-center> <th> <button tabindex=-1 type=button ng-disabled=pane.prev aria-label=\"vorige maand\" class=\"btn pull-left\" ng-click=$selectPane(-1)> <i class=\"fa fa-chevron-left\"></i> </button> </th> <th colspan=\"{{ rows[0].length - 2 }}\"> <button tabindex=0 type=button class=\"btn btn-block text-strong\" ng-click=$toggleMode()> <strong style=\"text-transform: capitalize\" ng-bind=title></strong> </button> </th> <th> <button tabindex=0 type=button ng-disabled=pane.next aria-label=\"volgende maand\" class=\"btn pull-right\" ng-click=$selectPane(+1)> <i class=\"fa fa-chevron-right\"></i> </button> </th> </tr> <tr class=datepicker-days ng-bind-html=labels ng-if=showLabels></tr> </thead> <tbody> <tr ng-repeat=\"(i, row) in rows\" height=\"{{ 100 / rows.length }}%\"> <td class=text-center ng-repeat=\"(j, el) in row\"> <button tabindex=0 type=button class=btn style=\"width: 100%\" ng-class=\"{'btn-selected': el.selected, 'btn-today': el.isToday && !el.elected, 'btn-grayed':el.isMuted}\" ng-focus=elemFocus($event) ng-click=$select(el.date) ng-disabled=el.disabled> <span role=\"\" ng-class=\"{'text-muted': el.muted}\" ng-bind=el.label></span> </button> </td> </tr> </tbody> </table> </div>"
  );


  $templateCache.put('templates/tinkDatePickerInput.html',
    "<div class=datepicker-input-fields tabindex=-1> <input role=date aria-label=datepicker tabindex=-1 tink-format-input data-format=00/00/0000 data-placeholder=dd/mm/jjjj data-date dynamic-name=dynamicName data-max-date=maxDate data-min-date=minDate ng-model=\"ngModel\">\n" +
    "<span role=\"datepicker icon\" class=datepicker-icon> <i class=\"fa fa-calendar\"></i> </span> </div>"
  );


  $templateCache.put('templates/tinkDatePickerRange.html',
    "<div class=datepickerrange> <div class=\"pull-left datepickerrange-left\"> <div class=datepickerrange-header-left> <div class=pull-left> <button tabindex=-1 type=button class=\"btn pull-left\" ng-click=$selectPane(0)> <i class=\"fa fa-chevron-left\"></i> </button> </div> <div class=\"text-center clearfix\"> <label ng-bind=firstTitle></label> </div> </div> <div class=table-responsive> <table> <thead> <tr class=datepicker-days ng-bind-html=dayLabels> </tr> </thead> <tbody id=firstCal ng-bind-html=firstCal> </tbody> </table> </div> </div> <div class=\"pull-right datepickerrange-right\"> <div class=datepickerrange-header-right> <div class=pull-right> <button tabindex=-1 type=button class=\"btn pull-left\" ng-click=$selectPane(1)> <i class=\"fa fa-chevron-right\"></i> </button> </div> <div class=\"text-center clearfix\"> <label ng-bind=lastTitle></label> </div> </div> <div class=table-responsive> <table> <thead> <tr class=datepicker-days ng-bind-html=dayLabels></tr> </thead> <tbody id=secondCal ng-bind-html=secondCal> </tbody> </table> </div> </div> </div>"
  );


  $templateCache.put('templates/tinkDatePickerRangeInputs.html',
    "<div class=\"datepicker-input-fields row no-gutter\"> <div class=col-sm-6> <input id=firstDateElem tabindex=-1 class=elem-one data-date data-format=00/00/0000 data-placeholder=dd/mm/jjjj tink-format-input ng-model=firstDate valid-name=first>\n" +
    "<span class=datepicker-icon> <i class=\"fa fa-calendar\"></i> </span> </div> <div class=col-sm-6> <input id=lastDateElem tabindex=-1 class=elem-two data-date data-format=00/00/0000 data-placeholder=dd/mm/jjjj tink-format-input ctrl-model=dynamicName valid-name=last ng-model=lastDate>\n" +
    "<span class=datepicker-icon> <i class=\"fa fa-calendar\"></i> </span> </div> </div>"
  );


  $templateCache.put('templates/tinkInteractiveTable.html',
    " <div class=bar> <div class=bar-section>  <ul class=bar-section-right> <li> <button data-ng-if=\"viewActions && selectedCheck\" tink-popover tink-popover-group=option-table tink-popover-template=templates/tinkTableAction.html>Acties <i class=\"fa fa-caret-down\"></i></button> </li> <li> <button tink-popover tink-popover-group=option-table tink-popover-template=templates/tinkTableShift.html>Kolommen <i class=\"fa fa-caret-down\"></i></button> </li> </ul> </div> </div>  <table></table> <div class=table-sort-options data-ng-if=\"itemLength > 0\"> <div class=table-sort-info> <strong>{{numFirst}} - {{numLast}}</strong> van {{itemLength}} <div class=select> <select data-ng-change=setItems() data-ng-model=perPage.pages> <option data-ng-repeat=\"items in itemsPerPage\" data-ng-bind=items>{{items}}</option> </select> items per pagina </div> </div> <div class=table-sort-pagination data-ng-if=\"pages > 1\"> <ul class=pagination> <li class=prev data-ng-class=\"{disabled:pageSelected===1}\" data-ng-click=setPrev()><a href=\"\"><span>Vorige</span></a></li> <li data-ng-class=\"{active:pageSelected===1}\" data-ng-click=setFirst()><a href=\"\">1</a></li> <li data-ng-repeat=\"pag in showNums track by $index\" data-ng-class=\"{active:pag===pageSelected}\" data-ng-click=setPage(pag)><a href=\"\" data-ng-if=\"pag !== -1\">{{pag}}</a> <span data-ng-show=\"pag === -1\">...<span></span></span></li> <li class=next data-ng-click=setNext() data-ng-class=\"{disabled:pageSelected===pages}\"><a href=\"\"><span>Volgende</span></a></li> </ul> </div> </div>"
  );


  $templateCache.put('templates/tinkTableAction.html',
    "<ul class=\"popover-list-buttons ng-scope\"> <li data-ng-repeat=\"action in viewActions\"><a href=\"\" data-ng-click=action.callback()>{{action.name}}</a></li> </ul>"
  );


  $templateCache.put('templates/tinkTableShift.html',
    "<div class=table-interactive-options tink-shift-sort>  <div class=table-interactive-sort> <button class=btn-borderless ng-disabled=\"selected<1\" ng-click=omhoog()><i class=\"fa fa-arrow-up\"> </i></button>\n" +
    "<button class=btn-borderless ng-disabled=\"selected<0 || selected === selectedMax\" ng-click=omlaag()><i class=\"fa fa-arrow-down\"></i></button> </div>  <ul ng-model=viewer class=table-interactive-cols> <li ng-repeat=\"header in viewer | filter:{ visible: true }\"> <div class=\"checkbox is-selectable is-draggable\" ng-class=\"{selected:selected===$index}\"> <input type=checkbox ng-model=header.checked ng-change=headerChange() id={{header.alias}} name={{header.alias}} value={{header.alias}} checked> <label for={{header.alias}}><span class=draggable-elem ng-class=\"{selected:selected===$index}\" ng-click=select($event,$index)>{{header.alias}}</span></label> </div> </li> </ul> <div class=table-interactive-sort>  <button class=btn-xs ng-click=close()>Sluiten</button> </div> </div>"
  );


  $templateCache.put('templates/tinkUpload.html',
    "<div class=upload> <div class=upload-zone> <div data-ng-mouseup=browseFiles($event)> <strong translate>Sleep hier een bestand</strong> <span translate>of klik om te bladeren</span>\n" +
    "<input data-ng-if=multiple class=upload-file-input name={{fieldName}} type=file data-ng-file-select=onFileSelect($files) multiple>\n" +
    "<input data-ng-if=!multiple class=upload-file-input name={{fieldName}} type=file data-ng-file-select=\"onFileSelect($files)\"> </div> <span class=help-block data-ng-transclude>Toegelaten bestanden: jpg, gif, png, pdf. Maximum grootte: 2MB</span> </div> <p class=upload-file-change data-ng-if=message.hold>De vorige file werd vervangen. <a data-ng-mouseup=undo($event)>Ongedaan maken.</a></p> <ul class=upload-files> <li data-ng-repeat=\"file in files\" data-ng-class=\"{'success': !file.error && file.getProgress() === 100, 'error': file.error}\"> <span class=upload-filename>{{file.getFileName()}}</span>\n" +
    "<span class=upload-fileoptions> <button class=upload-btn-delete data-ng-click=del($index) data-ng-if=\"file.getProgress() === 100 || file.error\"><span class=sr-only>Verwijder</span></button>\n" +
    "<span class=upload-feedback data-ng-if=\"!file.error && file.getProgress() !== 100\">{{file.getProgress()}}%</span> </span>\n" +
    "<span class=upload-error data-ng-if=file.error> <span data-ng-if=file.error.type>Dit bestandstype is niet toegelaten.</span>\n" +
    "<span data-ng-if=file.error.size>Dit bestand overschrijdt de toegelaten bestandsgrootte.</span>\n" +
    "<span data-ng-if=\"!file.error.type && !file.error.size\">Er is een fout opgetreden bij het uploaden. Probeer het opnieuw.</span> </span>\n" +
    "<span class=upload-progress style=\"width: {{file.getProgress()}}%\"></span> </li> </ul> </div>"
  );


  $templateCache.put('templates/tooltip.html',
    "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\"> <div class=tooltip-arrow></div> <div class=tooltip-inner ng-bind=content></div> </div>"
  );

}]);
