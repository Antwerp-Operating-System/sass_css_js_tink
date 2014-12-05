angular.module('tink.datepicker', []);
angular.module('tink.datepicker')
  .directive('myDate', ['$timeout', '$filter', function ($timeout, $filter) {
    return {
      require: 'ngModel',

      link: function ($scope, $element, $attrs, ctrl) {

        ctrl.$formatters.push(function(value) {
          if(value != undefined)
          return value.toUpperCase()
        });

        ctrl.$parsers.push(function(value) {
          if(value != undefined)
            return value.toUpperCase()
        });
        ctrl.$parsers.unshift(checkForValid);

        function isValidDate(strDate) {
          if (strDate.length != 10) return false;
          var dateParts = strDate.split("/");
          var date = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
          if (date.getDate() == dateParts[0] && date.getMonth() == (dateParts[1] - 1) && date.getFullYear() == dateParts[2]) {
            return true;
          }
          else return false;
        }

        function checkForValid(viewValue) {
          if (isValidDate(viewValue)) {
            ctrl.$setValidity('date', true);
          }else {
            ctrl.$setValidity('date', false);
          }
          return viewValue;

        }


      }
    };
  }])
  .directive('tinkDatepicker', function ($q, $templateCache, $http, $compile, calView, dateParser,$sce) {
    return {
      restrict: 'EAC',
      replace: true,
      templateUrl: 'templates/datepickerD.html',
      scope: {
        fristdate: '=',
        lastdate: '='
      },
      link: function postLink(scope, element, attr, controller) {
        // labels for the days you can make this variable //
        var dayLabels = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
        scope.dayLabels = $sce.trustAsHtml('<th>' + dayLabels.join('</th><th>') + '</th>');
        // Add a watch to know when input changes from the outside //
        scope.$watch('firstDate', function (newDate,oldDate) {
          if(newDate !== oldDate && angular.isDefined(newDate) && newDate !== null){
            if(angular.isDate(newDate)){
              scope.firstDate = newDate;
            }else{
              try{
                var date = dateParser.getDate(newDate, config.dateFormat);
                scope.firstDate = date;
              }catch(e){
                scope.firstDate = null;
              }
            };
            scope.firstDateModel = dateParser.format(scope.firstDate,config.dateFormat);
            console.log(scope.firstDate)
            refreshView();
          }

        });
        // Add a watch to know when input changes from the outside //
        scope.$watch('lastDate', function (newDate,oldDate) {
          if(newDate !== oldDate && angular.isDefined(newDate) && newDate !== null){
            //console.log("strange")
            if(angular.isDate(newDate)){
              scope.lastDate = newDate;
            }else{
              try{
                var date = dateParser.getDate(newDate, config.dateFormat);
                scope.lastDate = date;
              }catch(e){
                scope.lastDate = null;
              }
            };
            scope.lastDateModel = dateParser.format(scope.lastDate,config.dateFormat);
            refreshView();
          }
        });

        var
          config = {
            dateFormat: 'dd/mm/yyyy'
          },
          $directive = {
            open: false,
            focused: {firstDateElem: element[0].children[0], lastDateElem: element[0].children[1]},
            focusedModel: null,
            selectedDates:{first:scope.firstDate,last:scope.lastDate},
            mouse:0,
            viewDate:null,
            preRender:null
          },
          fetchPromises = {

          };
        // -- When the call view needs to be callculated and changed ! --/
        function changeView() {
          //console.log(scope.firstDate)
          scope.firstCal = calView.createMonthDays($directive.viewDate,scope.firstDate,scope.lastDate);
          var copyViewDate = new Date($directive.viewDate.getTime());
          copyViewDate.setMonth(copyViewDate.getMonth() + 1);
          scope.firstTitle = dateParser.format($directive.viewDate,'mmmm yyyy');
          scope.lastTitle = dateParser.format(copyViewDate,'mmmm yyyy');
          scope.secondCal = calView.createMonthDays(copyViewDate,scope.firstDate,scope.lastDate);
        };

        function buildView(){
          scope.firstCal = calView.createMonthDays($directive.viewDate,scope.firstDate,scope.lastDate);
          var copyViewDate = new Date($directive.viewDate.getTime());
          copyViewDate.setMonth(copyViewDate.getMonth() + 1);
          scope.firstTitle = dateParser.format($directive.viewDate,'mmmm yyyy');
          scope.lastTitle = dateParser.format(copyViewDate,'mmmm yyyy');
          scope.secondCal = calView.createMonthDays(copyViewDate,scope.firstDate,scope.lastDate);
        }

        // -- refresh the view --/
        function refreshView(){
          changeView();
        };

        // -- to change the month of the calender --/
        function nextMonth() {
          var nextMonth = $directive.viewDate.setMonth($directive.viewDate.getMonth() + 1);
          setViewDate($directive.viewDate);
        };
        // -- to change the month of the calender --/
        function prevMonth() {
          var prevMonth = $directive.viewDate.setMonth($directive.viewDate.getMonth() - 1);
          setViewDate($directive.viewDate);
        };

        function setViewDate(viewDate){
          try{
            if(angular.isDefined(viewDate) && viewDate !== null){
              if(angular.isDate(viewDate)){

                $directive.viewDate = viewDate;
                buildView();
              }else{
                ////console.logerror("Wrong date");
              }
            }
          }catch(e){
            ////console.logerror(e);
          }
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
        var promise = haalTemplateOp('templates/datepicker2.tpl.html');
        // --- when the data is loaded //
        promise.then(function (template) {
          if (angular.isObject(template)) template = template.data;
          // --- store the html we retrieved //
          var templateHtml = String.prototype.trim.apply(template);
          templateElem = $compile(template);
          templateElem = templateElem(scope, function (clonedElement, clone) {
          });
          templateElem.css({display: 'block', position: 'absolute', visibility: 'hidden'});
          element.append(templateElem);
          init();
        });

        function init(){
          bindEvents();
        }
        scope.$select = function (el) {
          ////console.loglog($directive.focusedModel)
          if ($directive.focusedModel !== null) {
            if ($directive.focusedModel === 'firstDateElem') {
              scope.firstDate = el.date;
              $directive.focusedModel = 'lastDateElem';
            } else if ($directive.focusedModel === 'lastDateElem') {
              scope.lastDate = el.date;
              $directive.focusedModel = 'firstDateElem';
            }
          }

        };

        scope.$selectPane = function (value) {

          if (value) {
            nextMonth();
          } else {
            prevMonth();
          }
        };

        function hide(){
          templateElem.css({visibility: 'hidden'});
          $directive.open = false;
        }

        function bindEvents(){
          element.bind('click',function(){
            event.stopPropagation();
          })
          element.bind('mousedown',function(evt){
            evt.preventDefault();
            evt.stopPropagation(); console.log(evt)
            if(evt.srcElement.nodeName === "INPUT"){
              evt.srcElement.focus();
            }

          })

          angular.element($directive.focused.firstDateElem).on('blur',hide);
          angular.element($directive.focused.lastDateElem).on('blur', hide);

          angular.element($directive.focused.firstDateElem).on('focus', function () {
            $directive.focusedModel = "firstDateElem";
            scope.$apply(show);

          });
          angular.element($directive.focused.lastDateElem).on('focus', function () {
            $directive.focusedModel = "lastDateElem";
            scope.$apply(show);

          });
        }


        function show() {
          if(!$directive.open){
            if($directive.focusedModel !== null){
              if($directive.focusedModel === "firstDateElem" && angular.isDate(scope.firstDate)){
                setViewDate(scope.firstDate);
              }else if( angular.isDate(scope.lastDate)){
                setViewDate(scope.lastDate);
              }else{
                setViewDate(new Date())
              }
            }else{
              setViewDate(new Date())
            }
          }
          templateElem.css({visibility: 'visible'})
          $directive.open = true;
        };

      }
    }
  })
  .factory('calView', function (dateParser) {

    function isSameDate(a,b){
      if(angular.isDate(a) && angular.isDate(b)) {
        return a.getTime() === b.getTime();
      }else{
        return false;
      }
    };

    function inRange(date,first,last) {
      if(angular.isDate(first) && angular.isDate(last) && angular.isDate(date)){
        if(date> first && date< last ){
          return true;
        }else{
          return false;
        }
      }else {
        return false;
      }
    };

    return {
      createMonthDays: function (date,firstRange,lastRange) {
        function mod(n, m) {
          return ((n % m) + m) % m;
        }
        //console.log(firstRange)

        var today = new Date().toDateString();
        var year = dateParser.format(date, 'yyyy'), month = dateParser.format(date, 'mm');
        var firstDayOfMonth = new Date(year, month - 1, 1);
        //The 1 is de start week !
        var firstDayOfWeek = new Date(+firstDayOfMonth - mod(firstDayOfMonth.getDay() - 1, 7) * 864e5);
        var offsetDayOfMonth = firstDayOfMonth.getTimezoneOffset();
        var offsetDayOfweek = firstDayOfWeek.getTimezoneOffset();
        if (offsetDayOfMonth !== offsetDayOfweek) {
          firstDayOfWeek = new Date(+firstDayOfWeek + (offsetDayOfweek - offsetDayOfMonth) * 60e3);
        }
        var daysToDraw = dateParser.daysInMonth(date) + dateParser.daysBetween(firstDayOfWeek, firstDayOfMonth);
        if (daysToDraw % 7 !== 0) {
          daysToDraw += 7 - (daysToDraw % 7);
        }

        var days = [];
        for (var i = 0; i < daysToDraw; i++) {
          var day = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate() + i);
          var dayMonth = day.getMonth();
          var month = firstDayOfMonth.getMonth();
          days.push({date: day,view:dayMonth == month,isToday: day.toDateString() === today,selected:isSameDate(day,firstRange) || isSameDate(day,lastRange),range:inRange(day,firstRange,lastRange), label: dateParser.format(day, 'dd')});
        }

        return dateParser.splitRow(days, 7);
      }
    }
  })
  .factory('dateParser', function () {
    var nl = {
      "DAY": ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"],
      "MONTH": ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
      "SHORTDAY": ["zo", "ma", "di", "wo", "do", "vr", "za"],
      "SHORTMONTH": ["jan.", "feb.", "mrt.", "apr.", "mei", "jun.", "jul.", "aug.", "sep.", "okt.", "nov.", "dec."]
    };


    var dateFormat = function (lang) {
      var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
          val = String(val);
          len = len || 2;
          while (val.length < len) val = "0" + val;
          return val;
        };

      // Regexes and supporting functions are cached through closure
      return function (date, mask, utc, lang) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
          mask = date;
          date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]).toLowerCase();
        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
          mask = mask.slice(4);
          utc = true;
        }

        var _ = utc ? "getUTC" : "get",
          d = date[_ + "Date"](),
          D = date[_ + "Day"](),
          m = date[_ + "Month"](),
          y = date[_ + "FullYear"](),
          H = date[_ + "Hours"](),
          M = date[_ + "Minutes"](),
          s = date[_ + "Seconds"](),
          L = date[_ + "Milliseconds"](),
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
            t: H < 12 ? "a" : "p",
            tt: H < 12 ? "am" : "pm",
            T: H < 12 ? "A" : "P",
            TT: H < 12 ? "AM" : "PM",
            Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
            o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
            S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
          };

        return mask.replace(token, function ($0) {
          return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
      };
    }();

// Some common format strings
    dateFormat.masks = {
      "default": "ddd mmm dd yyyy HH:MM:ss",
      shortDate: "d/m/yy",
      mediumDate: "mmm d, yyyy",
      longDate: "mmmm d, yyyy",
      fullDate: "dddd, mmmm d, yyyy",
      shortTime: "h:MM TT",
      mediumTime: "h:MM:ss TT",
      longTime: "h:MM:ss TT Z",
      isoDate: "yyyy-mm-dd",
      isoTime: "HH:MM:ss",
      isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
      isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
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
      var monthIndex = formatItems.indexOf("mm");
      var dayIndex = formatItems.indexOf("dd");
      var yearIndex = formatItems.indexOf("yyyy");
      var month = parseInt(dateItems[monthIndex]);
      month -= 1;
      var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
      return formatedDate;
    }

    return {
      dateBeforeOther:function(first,last){
        if(new Date(first).getTime() > new Date(last).getTime())
        {
          return true;
        }else{
          return false
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
      getDate: function (date, format) {
        return stringToDate(date, format);
      },
      daysInMonth: function (date) {
        return new Date(date.getYear(), date.getMonth() + 1, 0).getDate();
      },
      format: function (date, format, lang) {
        return dateFormat(date, format, null, nl);
      },
      getShortDays: function (lang) {

        if (lang !== angular.isDefined(lang)) {
          lang = '';
        }
        ;
        switch (lang.toLowerCase()) {
          case 'nl':
          default:
            return nl.SHORTDAY;
        }
        ;
      },
      getShortMonths: function (lang) {
        if (lang !== angular.isDefined(lang)) {
          lang = '';
        }
        ;
        switch (lang.toLowerCase()) {
          case 'nl':
          default:
            return nl.SHORTMONTH;
        }
        ;
      },
      getDays: function (lang) {
        if (lang !== angular.isDefined(lang)) {
          lang = '';
        }
        ;
        switch (lang.toLowerCase()) {
          case 'nl':
          default:
            return nl.DAY;
        }
        ;
      },
      getMonths: function (lang) {
        if (lang !== angular.isDefined(lang)) {
          lang = '';
        }
        ;
        switch (lang.toLowerCase()) {
          case 'nl':
          default:
            return nl.MONTH;
        }
        ;
      }
    }

  });
