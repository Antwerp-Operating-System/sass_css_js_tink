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
  .directive('thinkdatepicker', function ($q, $templateCache, $http, $compile, calView, dateLang) {
    return {
      restrict: 'EAC',
      require: 'ngModel',
      replace: true,
      templateUrl: 'templates/datepickerD.html',
      scope: {
        'dataFristdate': '@',
        'dataLastdate': '@'
      },
      link: function postLink(scope, element, attr, controller) {
        scope.dayLabels = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
        var config = {
          dateFormat: 'dd/mm/yyyy',
          open: false,
          focused: {firstDateElem: element[0].children[0], lastDateElem: element[0].children[1]},
          focusedModel: null,
          selectedDates:{first:null,last:null}
        };
        scope.firstDate = '3/12/2014'

        var fetchPromises = {}, settings = {};

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

        var viewDate;

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
        });

        element.on('mouseleave', function () {
          settings.mouse = 0;
        });
        element.on('mouseenter', function () {
          settings.mouse = 1;
        });

        function changeView(viewDate) {
          scope.firstCal = calView.createMonthDays(viewDate,config.selectedDates.first,config.selectedDates.last);
          var copyViewDate = new Date(viewDate.getTime());
          copyViewDate.setMonth(copyViewDate.getMonth() + 1);
          scope.firstTitle = dateLang.format(viewDate,'mm yyyy');
          scope.lastTitle = dateLang.format(viewDate,'mm yyyy');
          scope.secondCal = calView.createMonthDays(copyViewDate,config.selectedDates.first,config.selectedDates.last);
        };

        function refreshView(){
          changeView(viewDate,config.selectedDates.first,config.selectedDates.last)
        }

        function nextMonth() {
          var nextMonth = viewDate.setMonth(viewDate.getMonth() + 1);
        }

        function prevMonth() {
          var prevMonth = viewDate.setMonth(viewDate.getMonth() - 1);
        }

        function setFirstDate(value) {
          config.selectedDates.first = value.date;
          scope.firstDate = dateLang.format(value.date,config.dateFormat);
        }

        function setLastDate(value) {
          config.selectedDates.last = value.date;
          scope.lastDate = dateLang.format(value.date,config.dateFormat);
        }

        scope.$select = function (el) {
          if (config.focusedModel !== null) {
            if (config.focusedModel === 'firstDateElem') {

              setFirstDate(el);
              config.focusedModel = 'lastDateElem';
            } else if (config.focusedModel === 'lastDateElem') {
              setLastDate(el);
              config.focusedModel = 'firstDateElem';
            }
          }
          refreshView();
        }

        scope.$watch(function () {
          return viewDate
        }, function (newDate, oldDate) {
          console.log(newDate)
          if (angular.isDefined(newDate)) {
            changeView(newDate);
          }

        }, true)

        scope.$selectPane = function (value) {

          if (value) {
            nextMonth();
          } else {
            prevMonth();
          }
        };

        angular.element(document).on("click", function () {
          scope.$apply(function () {
            if (settings.mouse) {
              scope.title = "d"
              templateElem.css({visibility: 'visible'})
              show();
            } else {
              templateElem.css({visibility: 'hidden'})
              config.open = false;
            }
          });
        });


        function show() {
          if (angular.isDefined(scope.firstDate) && !config.open) {
            var selectedFirstDate = dateLang.getDate(scope.firstDate, config.dateFormat);
            viewDate = selectedFirstDate;
            changeView(selectedFirstDate);
            config.open = true;
          } else {
            //viewDate = new Date();
          }
        }

        angular.element(config.focused.firstDateElem).on('focus', function () {
          console.log("d")
          config.focusedModel = "firstDateElem";
        });
        angular.element(config.focused.lastDateElem).on('focus', function () {
          config.focusedModel = "lastDateElem";
        })

        scope.$watch(scope.firstDate, function () {
          //firstdate is changed do something
        })
        scope.$watch(scope.lastDate, function () {
          //last date is changed do someting
        })
      }
    }
  })
  .factory('calView', function (dateLang) {
    return {
      createMonthDays: function (date,firstRange,lastRange) {
console.log(date,firstRange,lastRange)
        function mod(n, m) {
          return ((n % m) + m) % m;
        }


        var today = new Date().toDateString();
        var year = dateLang.format(date, 'yyyy'), month = dateLang.format(date, 'mm');
        var firstDayOfMonth = new Date(year, month - 1, 1);
        //The 1 is de start week !
        var firstDayOfWeek = new Date(+firstDayOfMonth - mod(firstDayOfMonth.getDay() - 1, 7) * 864e5);
        var offsetDayOfMonth = firstDayOfMonth.getTimezoneOffset();
        var offsetDayOfweek = firstDayOfWeek.getTimezoneOffset();
        if (offsetDayOfMonth !== offsetDayOfweek) {
          firstDayOfWeek = new Date(+firstDayOfWeek + (offsetDayOfweek - offsetDayOfMonth) * 60e3);
        }
        var daysToDraw = dateLang.daysInMonth(date) + dateLang.daysBetween(firstDayOfWeek, firstDayOfMonth);
        if (daysToDraw % 7 !== 0) {
          daysToDraw += 7 - (daysToDraw % 7);
        }

        var days = [];
        for (var i = 0; i < daysToDraw; i++) {
          var day = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate() + i);
          days.push({date: day, isToday: day.toDateString() === today,range:dateLang.inRange(day,firstRange,lastRange), label: dateLang.format(day, 'dd')});
        }

        return dateLang.splitRow(days, 7);
      }
    }
  })
  .provider('$datepicker', function () {
    var defaults = this.defaults = {
      template: 'templates/datepicker.tpl.html'
    };
    this.$get = function ($templateCache, $q, $http, $compile, $rootScope, $animate) {

      // --- init variables. //
      var fetchPromises = {}, $datepicker = {}, templateHtml, templateElem, elemScope;
      // --- function to retrieve the templates. //
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

      // --- init function for startup //
      function init(template) {
        // --- retrieve template //
        $datepicker.$promise = haalTemplateOp(template);
        // --- when the data is loaded //
        $datepicker.$promise.then(function (template) {
          if (angular.isObject(template)) template = template.data;
          // --- store the html we retrieved //
          templateHtml = String.prototype.trim.apply(template);
          // --- compile the html into a real angular object //
          // --- this is needed to make ng annotations to work //
          templateElem = $compile(template);
        });
      };


      function DatepickerFactory(element, controller, config) {
        // --- Load the template and compile it //
        init(defaults.template);
        // --- function for when we need to show the template //
        $datepicker.show = function () {
          // --- check if the template is loaded //
          if (angular.isDefined(templateElem)) {
            // --- create a new scope for the template //
            $datepicker.$scope = config.scope && config.scope.$new() || $rootScope.$new();
            // --- add the new scope//
            $datepicker.$element = templateElem($datepicker.$scope, function (clonedElement, clone) {
            });
            // --- add the css to show the element //
            $datepicker.$element.css({
              top: '-9999px',
              left: '-9999px',
              display: 'block',
              position: 'aboslute',
              visibility: 'visible'
            });
            // --- add the element after the main element //
            $animate.enter($datepicker.$element, null, element);


          }


        }

        $datepicker.destroy = function () {
          if ($datepicker.$scope) {
            $datepicker.$scope.$destroy();
            $datepicker.$scope = null;
          }

          if (templateElem) {
            $datepicker.$element.remove();
            $datepicker.$element = null;
          }
        }


        return $datepicker;

      }

      DatepickerFactory.defaults = defaults;
      return DatepickerFactory;

    };

  })
  .factory('dateLang', function () {
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
      inRange: function (date,first,last) {
        if(first && last){
          if(date> first.date && date< last.date ){
            return true;
          }else{
            return false;
          }
        }else return false;


      },
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
