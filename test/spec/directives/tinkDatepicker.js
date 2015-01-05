'use strict';

describe('datepicker', function() {

  var bodyEl = $('body'), sandboxEl;
  var $compile, $templateCache, $animate, dateFilter, $datepicker, scope, today, $timeout,dateCalculator;

  beforeEach(module('ngAnimate'));
  beforeEach(module('ngAnimateMock'));
  beforeEach(module('ngSanitize'));
  beforeEach(module('tink'));
  beforeEach(module('tink.dateHelper'));

  beforeEach(inject(function (_$rootScope_, _$compile_, _$templateCache_, _$animate_, _dateFilter_, _$datepicker_, _$timeout_,_dateCalculator_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
    $templateCache = _$templateCache_;
    $animate = _$animate_;
    dateFilter = _dateFilter_;
    today = new Date();
    bodyEl.html('');
    dateCalculator = _dateCalculator_;
    sandboxEl = $('<div>').attr('id', 'sandbox').appendTo(bodyEl);
    $datepicker = _$datepicker_;
    $timeout = _$timeout_;
  }));

  afterEach(function() {
    scope.$destroy();
    sandboxEl.remove();
  });

  // Templates

  var templates = {
    'default': {
      scope: {selectedDate: new Date()},
      element: '<input type="text" ng-model="selectedDate" tink-datepicker>'
    },
    'value-past': {
      scope: {selectedDate: new Date(1986, 1, 22)},
      element: '<input type="text" ng-model="selectedDate" tink-datepicker>'
    },
    'markup-ngRepeat': {
      element: '<ul><li ng-repeat="i in [1, 2, 3]"><input type="text" ng-model="selectedDate" tink-datepicker></li></ul>'
    },
    'markup-ngChange': {
      scope: {selectedDate: new Date(1986, 1, 22), onChange: function() {}},
      element: '<input type="text" ng-model="selectedDate" ng-change="onChange()" tink-datepicker>'
    },
    'markup-ngRequired': {
      scope: {selectedDate: new Date(2010, 1, 22)},
      element: '<input type="text" ng-model="selectedDate" ng-required="true" tink-datepicker>'
    },
    'options-animation': {
      element: '<div class="btn" data-animation="am-flip-x" ng-model="datepickeredIcon" ng-options="icon.value as icon.label for icon in icons" tink-datepicker></div>'
    },
    'options-placement': {
      element: '<div class="btn" data-placement="bottom" ng-model="datepickeredIcon" ng-options="icon.value as icon.label for icon in icons" tink-datepicker></div>'
    },
    'options-placement-exotic': {
      element: '<div class="btn" data-placement="bottom-right" ng-model="datepickeredIcon" ng-options="icon.value as icon.label for icon in icons" tink-datepicker></div>'
    },
    'options-trigger': {
      element: '<div class="btn" data-trigger="hover" ng-model="datepickeredIcon" ng-options="icon.value as icon.label for icon in icons" tink-datepicker></div>'
    },
    'options-template': {
      element: '<input type="text" data-template="custom" ng-model="selectedDate" tink-datepicker>'
    },
    'options-typeStringDateFormat': {
      scope: {selectedDate: '22/02/1986'},
      element: '<input type="text" ng-model="selectedDate" data-date-type="string" data-date-format="dd/MM/yyyy" tink-datepicker>'
    },
    'options-typeStringDateFormatAlternative': {
      scope: {selectedDate: '2014-04-11'},
      element: '<input type="text" ng-model="selectedDate" data-date-type="string" data-date-format="yyyy-MM-dd" tink-datepicker>'
    },
    'options-typeNumberDateFormat': {
      scope: {selectedDate: +new Date(1986, 2, 22)},
      element: '<input type="text" ng-model="selectedDate" data-date-type="number" tink-datepicker>'
    },
    'options-typeUnixDateFormat': {
      scope: {selectedDate: new Date(1986, 2, 22) / 1000},
      element: '<input type="text" ng-model="selectedDate" data-date-type="unix" tink-datepicker>'
    },
    'options-typeIsoDateFormat': {
      scope: {selectedDate: '2014-12-26T13:03:08.631Z'},
      element: '<input type="text" ng-model="selectedDate" data-date-type="iso" tink-datepicker>'
    },
    'options-dateFormat': {
      scope: {selectedDate: new Date(1986, 1, 22)},
      element: '<input type="text" ng-model="selectedDate" data-date-format="yyyy-MM-dd" tink-datepicker>'
    },
    'options-dateFormat-alt': {
      scope: {selectedDate: new Date(1986, 1, 22)},
      element: '<input type="text" ng-model="selectedDate" data-date-format="dddd MMMM d, yyyy" tink-datepicker>'
    },
    'options-strictFormat': {
      scope: {selectedDate: new Date(1986, 1, 4)},
      element: '<input type="text" ng-model="selectedDate" data-date-format="yyyy-M-d" data-strict-format="1" tink-datepicker>'
    },
    'options-named-dateFormat': {
      scope: {selectedDate: new Date(1986, 1, 22)},
      element: '<input type="text" ng-model="selectedDate" data-date-format="mediumDate" tink-datepicker>'
    },
    'options-minDate': {
      scope: {selectedDate: new Date(1986, 1, 22), minDate: '02/20/86'},
      element: '<input type="text" ng-model="selectedDate" data-min-date="{{minDate}}" tink-datepicker>'
    },
    'options-minDate-today': {
      scope: {selectedDate: new Date()},
      element: '<input type="text" ng-model="selectedDate" data-min-date="today" tink-datepicker>'
    },
    'options-minDate-date': {
      scope: {selectedDate: new Date(1986, 1, 22), minDate: new Date(1986, 1, 20)},
      element: '<input type="text" ng-model="selectedDate" data-min-date="{{minDate}}" tink-datepicker>'
    },
    'options-minDate-number': {
      scope: {selectedDate: new Date(1986, 1, 22), minDate: +new Date(1986, 1, 20)},
      element: '<input type="text" ng-model="selectedDate" data-min-date="{{minDate}}" tink-datepicker>'
    },
    'options-maxDate': {
      scope: {selectedDate: new Date(1986, 1, 22), maxDate: '02/24/86'},
      element: '<input type="text" ng-model="selectedDate" data-max-date="{{maxDate}}" tink-datepicker>'
    },
    'options-maxDate-today': {
      scope: {selectedDate: new Date()},
      element: '<input type="text" ng-model="selectedDate" data-max-date="today" tink-datepicker>'
    },
    'options-maxDate-date': {
      scope: {selectedDate: new Date(1986, 1, 22), maxDate: new Date(1986, 1, 24)},
      element: '<input type="text" ng-model="selectedDate" data-max-date="{{maxDate}}" tink-datepicker>'
    },
    'options-maxDate-number': {
      scope: {selectedDate: new Date(1986, 1, 22), maxDate: +new Date(1986, 1, 24)},
      element: '<input type="text" ng-model="selectedDate" data-max-date="{{maxDate}}" tink-datepicker>'
    },
    'options-startWeek': {
      scope: {selectedDate: new Date(2014, 1, 22), startWeek: 1},
      element: '<input type="text" ng-model="selectedDate" data-start-week="{{startWeek}}" tink-datepicker>'
    },
    'options-startWeek-bis': {
      scope: {selectedDate: new Date(2014, 6, 15), startWeek: 6},
      element: '<input type="text" ng-model="selectedDate" data-start-week="{{startWeek}}" tink-datepicker>'
    },
    'options-startDate': {
      scope: {startDate: '02/03/04'},
      element: '<input type="text" ng-model="selectedDate" data-start-date="{{startDate}}" tink-datepicker>'
    },
    'options-autoclose': {
      element: '<input type="text" ng-model="selectedDate" data-autoclose="1" tink-datepicker>'
    },
    'options-useNative': {
      element: '<input type="text" ng-model="selectedDate" data-use-native="1" tink-datepicker>'
    },
    'options-modelDateFormat': {
      scope: {selectedDate: '2014-12-01' },
      element: '<input type="text" ng-model="selectedDate" data-date-format="dd/mm/yyyy" data-model-date-format="yyyy-mm-dd" data-date-type="string" tink-datepicker>'
    },
    'options-modelDateFormat-longDate': {
      scope: {selectedDate: 'December 1, 2014' },
      element: '<input type="text" ng-model="selectedDate" data-date-format="shortDate" data-model-date-format="longDate" data-date-type="string" tink-datepicker>'
    },
    'options-daysOfWeekDisabled': {
      scope: {selectedDate: new Date(2014, 6, 27)},
      element: '<input type="text" ng-model="selectedDate" data-days-of-week-disabled="{{daysOfWeekDisabled}}" tink-datepicker>'
    },
    'options-daysOfWeekDisabled-bis': {
      scope: {selectedDate: new Date(2014, 6, 27), daysOfWeekDisabled: '0246'},
      element: '<input type="text" ng-model="selectedDate" data-days-of-week-disabled="{{daysOfWeekDisabled}}" tink-datepicker>'
    },
    'options-disabledDates': {
      scope: {selectedDate: new Date(2014, 6, 27)},
      element: '<input type="text" ng-model="selectedDate" data-disabled-dates="disabledDates" tink-datepicker>'
    },
    'options-disabledDates-minmax': {
      scope: {selectedDate: new Date(2014, 6, 27), minDate: new Date(2014, 6, 21), maxDate: new Date(2014, 6, 25)},
      element: '<input type="text" ng-model="selectedDate" data-disabled-dates="disabledDates" data-min-date="{{minDate}}" data-max-date="{{maxDate}}" tink-datepicker>'
    },
    'options-disabledDates-daysOfWeek': {
      scope: {selectedDate: new Date(2014, 6, 27), daysOfWeekDisabled: '0'},
      element: '<input type="text" ng-model="selectedDate" data-disabled-dates="disabledDates" data-days-of-week-disabled="{{daysOfWeekDisabled}}" tink-datepicker>'
    },
    'bsShow-attr': {
      scope: {selectedDate: new Date()},
      element: '<input type="text" ng-model="selectedDate" tink-datepicker tink-show="true">'
    },
    'bsShow-binding': {
      scope: {isVisible: false, selectedDate: new Date()},
      element: '<input type="text" ng-model="selectedDate" tink-datepicker tink-show="isVisible">'
    }
  };

  function compileDirective(template, locals) {
    template = templates[template];
    angular.extend(scope, angular.copy(template.scope || templates['default'].scope), locals);
    var element = $(template.element).appendTo(sandboxEl);
    element = $compile(element)(scope);
    scope.$digest();
    return jQuery(element[0]);
  }

  // Tests

  describe('with default template', function() {

    it('should open on focus', function() {
      var elm = compileDirective('default');
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);
      angular.element(elm[0]).triggerHandler('focus');
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(1);
    });

    it('should close on blur', function() {
      var elm = compileDirective('default');
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);
      angular.element(elm[0]).triggerHandler('focus');
      angular.element(elm[0]).triggerHandler('blur');
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);
    });

    it('should correctly compile inner content', function() {
      var elm = compileDirective('default');
      angular.element(elm[0]).triggerHandler('focus');
      expect(sandboxEl.find('.dropdown-menu tbody td').length).toBe(7 * 6);
      expect(sandboxEl.find('.dropdown-menu tbody td .btn').length).toBe(7 * 6);
      expect(sandboxEl.find('.dropdown-menu thead button:eq(1)').text()).toBe(dateCalculator.format(today, 'MMMM yyyy'));
      var firstDate = sandboxEl.find('.dropdown-menu tbody .btn:eq(0)').text() * 1;
      expect(new Date(today.getFullYear(), today.getMonth() - (firstDate !== 1 ? 1 : 0), firstDate).getDay()).toBe($datepicker.defaults.startWeek);
    });

    it('should correctly display active date', function() {
      var elm = compileDirective('default');
      angular.element(elm[0]).triggerHandler('focus');
      expect(sandboxEl.find('.dropdown-menu tbody td .btn-primary').text().trim() * 1).toBe(today.getDate());
      expect(elm.val()).toBe( ('0'+(today.getDate())).slice(-2) + '/'+('0'+(today.getMonth() + 1)).slice(-2) + '/'+ today.getFullYear() );
    });

    it('should correctly select a new date', function() {
      var elm = compileDirective('default');
      angular.element(elm[0]).triggerHandler('focus');
      angular.element(sandboxEl.find('.dropdown-menu tbody .btn:contains(15)')[0]).triggerHandler('click');
      expect(elm.val()).toBe('15/'+('0'+(today.getMonth() + 1)).slice(-2) + '/' + today.getFullYear());
    });

    it('should invalidate input with non-existing manually typed value', function() {
      var elm = compileDirective('default', { selectedDate: new Date(2014, 1, 10)});
      angular.element(elm[0]).triggerHandler('focus');
      elm.val('02/31/14');
      angular.element(elm[0]).triggerHandler('change');
      scope.$digest();
      expect(scope.selectedDate).toBeUndefined();
      expect(angular.element(elm[0]).hasClass('ng-invalid')).toBeTruthy();
    });

    it('should correctly be cleared when model is cleared', function() {
      var elm = compileDirective('default');
      scope.selectedDate = null;
      scope.$digest();
      expect(elm.val()).toBe('');
      scope.selectedDate = new Date(1986, 1, 22);
      scope.$digest();
      expect(elm.val()).toBe('22/02/1986');
    });

    it('should correctly change view month when selecting next month button', function() {
      var elm = compileDirective('default');
      // set date to last day of January
      scope.selectedDate = new Date(2014, 0, 31);
      scope.$digest();
      angular.element(elm[0]).triggerHandler('focus');

      for (var nextMonth = 1; nextMonth < 12; nextMonth++) {
        // should show next month view when selecting next month button
        angular.element(sandboxEl.find('.dropdown-menu thead button:eq(2)')[0]).triggerHandler('click');
        expect(sandboxEl.find('.dropdown-menu thead button:eq(1)').text()).toBe(dateCalculator.format(new Date(2014, nextMonth, 1), 'MMMM yyyy'));
      }
    });

    it('should correctly change view month when selecting previous month button', function() {
      var elm = compileDirective('default');
      // set date to last day of December
      scope.selectedDate = new Date(2014, 11, 31);
      scope.$digest();
      angular.element(elm[0]).triggerHandler('focus');

      for (var previousMonth = 10; previousMonth > -1; previousMonth--) {
        // should show previous month view when selecting previous month button
        angular.element(sandboxEl.find('.dropdown-menu thead button:eq(0)')[0]).triggerHandler('click');
        expect(sandboxEl.find('.dropdown-menu thead button:eq(1)').text()).toBe(dateCalculator.format(new Date(2014, previousMonth, 1), 'MMMM yyyy'));
      }
    });

    it('should correctly navigate to upper month view', function() {
      var elm = compileDirective('default');
      angular.element(elm[0]).triggerHandler('focus');
      expect(scope.$$childHead.$mode).toBe(0);
      angular.element(sandboxEl.find('.dropdown-menu thead button:eq(1)')[0]).triggerHandler('click');
      expect(scope.$$childHead.$mode).toBe(1);
    });

    describe('once in month view', function() {

      it('should correctly compile inner content', function() {
        var elm = compileDirective('default');
        angular.element(elm[0]).triggerHandler('focus');
        angular.element(sandboxEl.find('.dropdown-menu thead button:eq(1)')[0]).triggerHandler('click');
        expect(sandboxEl.find('.dropdown-menu tbody td').length).toBe(4 * 3);
        expect(sandboxEl.find('.dropdown-menu tbody .btn').length).toBe(4 * 3);
        expect(sandboxEl.find('.dropdown-menu thead button:eq(1)').text()).toBe(dateCalculator.format(today, 'yyyy'));
      });

      it('should correctly display active date', function() {
        var elm = compileDirective('default');
        angular.element(elm[0]).triggerHandler('focus');
        angular.element(sandboxEl.find('.dropdown-menu thead button:eq(1)')[0]).triggerHandler('click');
        expect(sandboxEl.find('.dropdown-menu tbody td .btn-primary').text()).toBe(dateCalculator.format(today, 'MMM'));
      });

    });

    it('should correctly navigate to upper year view', function() {
      var elm = compileDirective('default');
      angular.element(elm[0]).triggerHandler('focus');
      expect(scope.$$childHead.$mode).toBe(0);
      angular.element(sandboxEl.find('.dropdown-menu thead button:eq(1)')[0]).triggerHandler('click');
      angular.element(sandboxEl.find('.dropdown-menu thead button:eq(1)')[0]).triggerHandler('click');
      expect(scope.$$childHead.$mode).toBe(2);
    });

    describe('once in year view', function() {

      it('should correctly compile inner content', function() {
        var elm = compileDirective('default');
        angular.element(elm[0]).triggerHandler('focus');
        angular.element(sandboxEl.find('.dropdown-menu thead button:eq(1)')[0]).triggerHandler('click');
        angular.element(sandboxEl.find('.dropdown-menu thead button:eq(1)')[0]).triggerHandler('click');
        expect(sandboxEl.find('.dropdown-menu tbody td').length).toBe(4 * 3);
        expect(sandboxEl.find('.dropdown-menu tbody .btn').length).toBe(4 * 3);
        // expect(sandboxEl.find('.dropdown-menu thead button:eq(1)').text()).toBe(dateCalculator.format(today, 'yyyy'));
      });

      it('should correctly display active date', function() {
        var elm = compileDirective('default');
        angular.element(elm[0]).triggerHandler('focus');
        angular.element(sandboxEl.find('.dropdown-menu thead button:eq(1)')[0]).triggerHandler('click');
        angular.element(sandboxEl.find('.dropdown-menu thead button:eq(1)')[0]).triggerHandler('click');
        expect(sandboxEl.find('.dropdown-menu tbody td .btn-primary').text()).toBe(dateCalculator.format(today, 'yyyy'));
      });

    });

    it('should correctly support null values', function() {
      var elm = compileDirective('default', {selectedDate: null});
      angular.element(elm[0]).triggerHandler('focus');
      expect(elm.val()).toBe('');
      expect(sandboxEl.find('.dropdown-menu tbody td').length).toBe(7 * 6);
      expect(sandboxEl.find('.dropdown-menu tbody .btn').length).toBe(7 * 6);
      elm.val('0');
      angular.element(elm[0]).triggerHandler('change');
    });

    it('should correctly support undefined values', function() {
      var elm = compileDirective('default', {selectedDate: undefined});
      angular.element(elm[0]).triggerHandler('focus');
      expect(elm.val()).toBe('');
      expect(sandboxEl.find('.dropdown-menu tbody td').length).toBe(7 * 6);
      expect(sandboxEl.find('.dropdown-menu tbody .btn').length).toBe(7 * 6);
      elm.val('0');
      angular.element(elm[0]).triggerHandler('change');
    });

    it('should correctly support invalid values', function() {
      var elm = compileDirective('default');
      elm.val('invalid');
      angular.element(elm[0]).triggerHandler('change');
      angular.element(elm[0]).triggerHandler('focus');
      expect(sandboxEl.find('.dropdown-menu tbody td .btn-primary').text().trim() * 1).toBe(today.getDate());
      angular.element(sandboxEl.find('.dropdown-menu tbody td .btn-primary')[0]).triggerHandler('click');
    });

    it('should handle empty values', function() {
      var elm = compileDirective('default');
      elm.val('');
      angular.element(elm[0]).triggerHandler('change');
      expect(scope.selectedDate).toBeNull();
    });

    it('should support ngRepeat markup', function() {
      var elm = compileDirective('markup-ngRepeat');
      angular.element(elm.find('[tink-datepicker]:eq(0)')).triggerHandler('focus');
      expect(sandboxEl.find('.dropdown-menu tbody td').length).toBe(7 * 6);
      expect(sandboxEl.find('.dropdown-menu tbody .btn').length).toBe(7 * 6);
    });

    it('should support ngChange markup', function() {
      var elm = compileDirective('markup-ngChange');
      angular.element(elm[0]).triggerHandler('focus');
      var spy = spyOn(scope, 'onChange').and.callThrough();
      angular.element(sandboxEl.find('.dropdown-menu tbody .btn:eq(1)')[0]).triggerHandler('click');
      expect(spy).toHaveBeenCalled();
    });

    it('should support ngRequired markup', function() {
      var elm = compileDirective('markup-ngRequired');
      var testDate = new Date(2010, 1, 22);

      expect(elm.val()).not.toBe('');
      expect(scope.selectedDate).toBeDefined();
      expect(scope.selectedDate).toEqual(testDate);

      angular.element(elm[0]).triggerHandler('focus');
      expect(sandboxEl.find('.dropdown-menu tbody td .btn-primary').text().trim() * 1).toBe(testDate.getDate());
      expect(elm.val()).toBe(testDate.getDate() + '/' +('0'+(testDate.getMonth() + 1)).slice(-2) + '/' + testDate.getFullYear());
    });

    it('should consider empty value valid-date with ngRequired markup', function() {
      var elm = compileDirective('markup-ngRequired');

      // we don't check ng-valid-parse because AngularJs 1.2
      // doesn't use that class

      expect(elm.hasClass('ng-valid')).toBe(true);
      expect(elm.hasClass('ng-valid-required')).toBe(true);

      angular.element(elm[0]).triggerHandler('focus');
      elm.val('');
      angular.element(elm[0]).triggerHandler('change');

      // if input is empty, consider valid-date and let
      // ngRequired invalidate the value
      expect(elm.hasClass('ng-valid-date')).toBe(true);
      expect(elm.hasClass('ng-invalid')).toBe(true);
      expect(elm.hasClass('ng-invalid-required')).toBe(true);
    });

    it('should consider empty value valid-parse without ngRequired markup', function() {
      var elm = compileDirective('default');

      // we don't check ng-valid-parse because AngularJs 1.2
      // doesn't use that class

      expect(elm.hasClass('ng-valid')).toBe(true);

      angular.element(elm[0]).triggerHandler('focus');
      elm.val('');
      angular.element(elm[0]).triggerHandler('change');

      // if input is empty, consider valid-date and let
      // other validators run
      expect(elm.hasClass('ng-valid-date')).toBe(true);
      expect(elm.hasClass('ng-valid')).toBe(true);
    });

    // iit('should only build the datepicker once', function() {
    //   var elm = compileDirective('value-past');
    //   angular.element(elm[0]).triggerHandler('focus');
    // });

    describe('for each month of the year', function() {
      var elm;
      var firstDay, previousDay;
      var monthToCheck = 0;

      beforeEach(function() {
        jasmine.addMatchers({
          toBeNextDayOrFirstDay: function() {
            return {
              compare: function(actual, expected) {
                var result = {};
                var previousDay = expected;
                result.pass = actual === (previousDay + 1) || actual === 1;
                result.message = 'Expected ' + actual + ' to be either ' + (previousDay + 1) + ' or 1';
                return result;
              }
            };
          }
        });

        elm = compileDirective('default', { selectedDate: new Date(2012, monthToCheck, 1) });
        angular.element(elm[0]).triggerHandler('focus');
        firstDay = sandboxEl.find('.dropdown-menu tbody .btn:eq(0)').text() * 1;
        previousDay = firstDay - 1;
      });

      afterEach(function() {
        monthToCheck++;
      });
it('should correctly order month days in inner content', function() {
      for (var month = 0; month < 12; month++) {
        
          // 6 rows (weeks) * 7 columns (days)
          for(var index = 0; index < 7 * 6; index++) {
            var indexDay = sandboxEl.find('.dropdown-menu tbody td .btn:eq(' + index + ')').text() * 1;
            expect(indexDay).toBeNextDayOrFirstDay(previousDay);
            previousDay = indexDay;
          }
       
      }
 });
    });

  });

  describe('resource allocation', function() {
    it('should not create additional scopes after first show', function() {
      var elm = compileDirective('default');
      angular.element(elm[0]).triggerHandler('focus');
      $animate.triggerCallbacks();
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(1);
      angular.element(elm[0]).triggerHandler('blur');
      $animate.triggerCallbacks();
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);


      for (var i = 0; i < 10; i++) {
        angular.element(elm[0]).triggerHandler('focus');
        $animate.triggerCallbacks();
        angular.element(elm[0]).triggerHandler('blur');
        $animate.triggerCallbacks();
      }

    });

    it('should not create additional scopes when changing months', function() {
      var elm = compileDirective('default');
      angular.element(elm[0]).triggerHandler('focus');
      $animate.triggerCallbacks();
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(1);


      for (var i = 0; i < 10; i++) {
        angular.element(sandboxEl.find('.dropdown-menu thead button:eq(2)')[0]).triggerHandler('click');
        scope.$digest();
      }

    });

    it('should destroy scopes when destroying directive scope', function() {
      var originalScope = scope;
      scope = scope.$new();
      var elm = compileDirective('default');

      for (var i = 0; i < 10; i++) {
        angular.element(elm[0]).triggerHandler('focus');
        $animate.triggerCallbacks();
        angular.element(elm[0]).triggerHandler('blur');
        $animate.triggerCallbacks();
      }

      scope.$destroy();
      scope = originalScope;
    });
  });

  describe('bsShow attribute', function() {
    it('should support setting to a boolean value', function() {
      compileDirective('bsShow-attr');
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);
    });

    it('should support binding', function() {
      compileDirective('bsShow-binding');
      expect(scope.isVisible).toBeFalsy();
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);
      scope.isVisible = true;
      scope.$digest();
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);
      scope.isVisible = false;
      scope.$digest();
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);
    });

    it('should support initial value false', function() {
      compileDirective('bsShow-binding');
      expect(scope.isVisible).toBeFalsy();
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);
    });

    it('should support initial value true', function() {
      compileDirective('bsShow-binding', {isVisible: true});
      expect(scope.isVisible).toBeTruthy();
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);
    });

    it('should support undefined value', function() {
      compileDirective('bsShow-binding', {isVisible: undefined});
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);
    });

    it('should support string value', function() {
      compileDirective('bsShow-binding', {isVisible: 'a string value'});
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);
      scope.isVisible = 'TRUE';
      scope.$digest();
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);
      scope.isVisible = 'dropdown';
      scope.$digest();
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);
      scope.isVisible = 'datepicker,tooltip';
      scope.$digest();
      expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);
    });
  });

  // describe('using service', function() {

  //   it('should correctly open on next digest', function() {
  //     var myModal = $modal(templates['default'].scope.modal);
  //     scope.$digest();
  //     expect(bodyEl.children('.modal').length).toBe(1);
  //     myModal.hide();
  //     expect(bodyEl.children('.modal').length).toBe(0);
  //   });

  //   it('should correctly be destroyed', function() {
  //     var myModal = $modal(angular.extend(templates['default'].scope.modal));
  //     scope.$digest();
  //     expect(bodyEl.children('.modal').length).toBe(1);
  //     myModal.destroy();
  //     expect(bodyEl.children('.modal').length).toBe(0);
  //     expect(bodyEl.children().length).toBe(1);
  //   });

  //   it('should correctly work with ngClick', function() {
  //     var elm = compileDirective('markup-ngClick-service');
  //     var myModal = $modal(angular.extend({show: false}, templates['default'].scope.modal));
  //     scope.showModal = function() {
  //       myModal.$promise.then(myModal.show);
  //     };
  //     expect(bodyEl.children('.modal').length).toBe(0);
  //     angular.element(elm[0]).triggerHandler('click');
  //     expect(bodyEl.children('.modal').length).toBe(1);
  //   });

  // });

  describe('options', function() {

    describe('animation', function() {

      it('should default to `am-fade` animation', function() {
        var elm = compileDirective('default');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.children('.dropdown-menu').hasClass('am-fade')).toBeTruthy();
      });

      it('should support custom animation', function() {
        var elm = compileDirective('options-animation');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.children('.dropdown-menu').hasClass('am-flip-x')).toBeTruthy();
      });

    });

    describe('autoclose', function() {

      it('should close on select', function() {
        var elm = compileDirective('options-autoclose');
        expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);
        angular.element(elm[0]).triggerHandler('focus');
        angular.element(sandboxEl.find('.dropdown-menu tbody .btn:first')).triggerHandler('click');
        $timeout.flush();
        expect(sandboxEl.children('.dropdown-menu.datepicker').length).toBe(0);
      });

    });

    describe('placement', function() {
      var $$rAF;
      beforeEach(inject(function (_$$rAF_) {
        $$rAF = _$$rAF_;
      }));

      it('should default to `bottom-left` placement', function() {
        var elm = compileDirective('default');
        angular.element(elm[0]).triggerHandler('focus');
        $$rAF.flush();
        expect(sandboxEl.children('.dropdown-menu').hasClass('bottom-left')).toBeTruthy();
      });

      it('should support placement', function() {
        var elm = compileDirective('options-placement');
        angular.element(elm[0]).triggerHandler('focus');
        $$rAF.flush();
        expect(sandboxEl.children('.dropdown-menu').hasClass('bottom')).toBeTruthy();
      });

      it('should support exotic-placement', function() {
        var elm = compileDirective('options-placement-exotic');
        angular.element(elm[0]).triggerHandler('focus');
        $$rAF.flush();
        expect(sandboxEl.children('.dropdown-menu').hasClass('bottom-right')).toBeTruthy();
      });

    });

    describe('trigger', function() {

      it('should support an alternative trigger', function() {
        var elm = compileDirective('options-trigger');
        expect(sandboxEl.children('.dropdown-menu').length).toBe(0);
        angular.element(elm[0]).triggerHandler('mouseenter');
        expect(sandboxEl.children('.dropdown-menu').length).toBe(1);
        angular.element(elm[0]).triggerHandler('mouseleave');
        expect(sandboxEl.children('.dropdown-menu').length).toBe(0);
      });

    });

    describe('template', function() {

      it('should support custom template', function() {
        $templateCache.put('custom', '<div class="dropdown-menu"><div class="dropdown-inner">foo: {{selectedDate}}</div></div>');
        var elm = compileDirective('options-template');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-inner').text()).toBe('foo: "' + scope.selectedDate.toISOString() + '"');
      });

      it('should support template with ngRepeat', function() {
        $templateCache.put('custom', '<div class="dropdown-menu"><div class="dropdown-inner"><ul><li ng-repeat="i in [1, 2, 3]">{{i}}</li></ul></div></div>');
        var elm = compileDirective('options-template');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-inner').text()).toBe('123');
        // Consecutive toggles
        angular.element(elm[0]).triggerHandler('blur');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-inner').text()).toBe('123');
      });

      it('should support template with ngClick', function() {
        $templateCache.put('custom', '<div class="dropdown-menu"><div class="dropdown-inner"><a class="btn" ng-click="dropdown.counter=dropdown.counter+1">click me</a></div></div>');
        var elm = compileDirective('options-template');
        scope.dropdown = {counter: 0};
        angular.element(elm[0]).triggerHandler('focus');
        expect(angular.element(sandboxEl.find('.dropdown-inner > .btn')[0]).triggerHandler('click'));
        expect(scope.dropdown.counter).toBe(1);
        // Consecutive toggles
        angular.element(elm[0]).triggerHandler('blur');
        angular.element(elm[0]).triggerHandler('focus');
        expect(angular.element(sandboxEl.find('.dropdown-inner > .btn')[0]).triggerHandler('click'));
        expect(scope.dropdown.counter).toBe(2);
      });

    });

    describe('type', function() {

      it('should support string type with a dateFormat', function() {
        var elm = compileDirective('options-typeStringDateFormat');
        expect(elm.val()).toBe('22/02/1986');
        angular.element(elm[0]).triggerHandler('focus');
        angular.element(sandboxEl.find('.dropdown-menu tbody .btn:contains(16)')).triggerHandler('click');
        expect(elm.val()).toBe('16/02/1986');
      });

      it('should support string type with an alternative dateFormat', function() {
        var elm = compileDirective('options-typeStringDateFormatAlternative');
        expect(elm.val()).toBe('2014-04-11');
        angular.element(elm[0]).triggerHandler('focus');
        angular.element(sandboxEl.find('.dropdown-menu tbody .btn:contains(16)')).triggerHandler('click');
        expect(elm.val()).toBe('2014-04-16');
      });

      it('should support number type with a dateFormat', function() {
        var elm = compileDirective('options-typeNumberDateFormat');
        expect(elm.val()).toBe('22/03/1986');
        angular.element(elm[0]).triggerHandler('focus');
        angular.element(sandboxEl.find('.dropdown-menu tbody .btn:contains(16)')).triggerHandler('click');
        expect(elm.val()).toBe('16/03/1986');
      });

      it('should support unix type with a dateFormat', function() {
        var elm = compileDirective('options-typeUnixDateFormat');
        expect(elm.val()).toBe('22/03/1986');
        angular.element(elm[0]).triggerHandler('focus');
        angular.element(sandboxEl.find('.dropdown-menu tbody .btn:contains(16)')).triggerHandler('click');
        expect(elm.val()).toBe('16/03/1986');
      });

      it('should support iso type with a dateFormat', function() {
        var elm = compileDirective('options-typeIsoDateFormat');
        expect(elm.val()).toBe('26/12/2014');
        angular.element(elm[0]).triggerHandler('focus');
        angular.element(sandboxEl.find('.dropdown-menu tbody .btn:contains(16)')).triggerHandler('click');
        expect(elm.val()).toBe('16/12/2014');
      });

    });

    describe('dateFormat', function() {

      it('should support a custom dateFormat', function() {
        var elm = compileDirective('options-dateFormat');
        expect(elm.val()).toBe('1986-02-22');
        angular.element(elm[0]).triggerHandler('focus');
        angular.element(sandboxEl.find('.dropdown-menu tbody .btn:contains(24)')).triggerHandler('click');
        expect(elm.val()).toBe('1986-02-24');
      });

      it('should support an alternative custom dateFormat', function() {
        var elm = compileDirective('options-dateFormat-alt');
        expect(elm.val()).toBe('Zaterdag Februari 22, 1986');
        angular.element(elm[0]).triggerHandler('focus');
        angular.element(sandboxEl.find('.dropdown-menu tbody .btn:contains(24)')).triggerHandler('click');
        expect(elm.val()).toBe('Maandag Februari 24, 1986');
      });

      it('should support a custom named dateFormat', function() {
        var elm = compileDirective('options-named-dateFormat');
        expect(elm.val()).toBe('Feb 22, 1986');
        angular.element(elm[0]).triggerHandler('focus');
        angular.element(sandboxEl.find('.dropdown-menu tbody .btn:contains(24)')).triggerHandler('click');
        expect(elm.val()).toBe('Feb 24, 1986');
      });

    });

    describe('strictFormat', function () {

      it('should support strict format date parse', function () {
        var elm = compileDirective('options-strictFormat');
        expect(elm.val()).toBe('1986-2-4');
        elm.val('1996-4-7');
        angular.element(elm[0]).triggerHandler('change');
        expect(elm.val()).toBe('1996-4-7');
        expect(elm.hasClass('ng-valid')).toBe(true);
      });

    });

    describe('minDate', function() {

      it('should support a dynamic minDate', function() {
        var elm = compileDirective('options-minDate');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(19)').is(':disabled')).toBeTruthy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(20)').is(':disabled')).toBeFalsy();
        scope.minDate = '02/12/86';
        scope.$digest();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(11)').is(':disabled')).toBeTruthy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(12)').is(':disabled')).toBeFalsy();
      });

      it('should support today as minDate', function() {
        var elm = compileDirective('options-minDate-today');
        angular.element(elm[0]).triggerHandler('focus');
        var todayDate = today.getDate();
        expect(sandboxEl.find('.dropdown-menu tbody button[disabled]').length > 0).toBeTruthy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(' + todayDate + ').btn-primary').length).toBe(1);
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(' + todayDate + ').btn-primary').is(':disabled')).toBeFalsy();
      });

      it('should support number as minDate', function() {
        var elm = compileDirective('options-minDate-number');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(19)').is(':disabled')).toBeTruthy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(20)').is(':disabled')).toBeFalsy();
      });

      it('should support Date object as minDate', function() {
        var elm = compileDirective('options-minDate-date');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(19)').is(':disabled')).toBeTruthy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(20)').is(':disabled')).toBeFalsy();
      });

      it('should trigger validation when minDate changes', function() {
        var elm = compileDirective('options-minDate-date');
        expect(elm.hasClass('ng-valid')).toBe(true);
        scope.minDate = new Date(1986, 1, 25);
        scope.$digest();
        expect(elm.hasClass('ng-valid')).toBe(false);
        scope.minDate = new Date(1986, 1, 18);
        scope.$digest();
        expect(elm.hasClass('ng-valid')).toBe(true);
      });

      it('should reset minDate to -Infinity when set empty string', function() {
        var elm = compileDirective('options-minDate');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(19)').is(':disabled')).toBeTruthy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(20)').is(':disabled')).toBeFalsy();
        scope.minDate = '';
        scope.$digest();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(19)').is(':disabled')).toBeFalsy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(20)').is(':disabled')).toBeFalsy();
      });

    });

    describe('maxDate', function() {

      it('should support a dynamic maxDate', function() {
        var elm = compileDirective('options-maxDate');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(24)').is(':disabled')).toBeFalsy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(25)').is(':disabled')).toBeTruthy();
        scope.maxDate = '02/12/86';
        scope.$digest();
        // @TODO fixme
        // expect(sandboxEl.find('.dropdown-menu tbody button:contains(12)').is(':disabled')).toBeFalsy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(13)').is(':disabled')).toBeTruthy();
      });

      it('should support today as maxDate', function() {
        var elm = compileDirective('options-maxDate-today');
        angular.element(elm[0]).triggerHandler('focus');
        var todayDate = today.getDate();
        expect(sandboxEl.find('.dropdown-menu tbody button[disabled]').length > 0).toBeTruthy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(' + todayDate + ').btn-primary').length).toBe(1);
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(' + todayDate + ').btn-primary').is(':disabled')).toBeFalsy();
      });

      it('should support number as maxDate', function() {
        var elm = compileDirective('options-maxDate-number');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(24)').is(':disabled')).toBeFalsy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(25)').is(':disabled')).toBeTruthy();
      });

      it('should support Date object as maxDate', function() {
        var elm = compileDirective('options-maxDate-date');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(24)').is(':disabled')).toBeFalsy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(25)').is(':disabled')).toBeTruthy();
      });

      it('should trigger validation when maxDate changes', function() {
        var elm = compileDirective('options-maxDate-date');
        expect(elm.hasClass('ng-valid')).toBe(true);
        scope.maxDate = new Date(1986, 1, 20);
        scope.$digest();
        expect(elm.hasClass('ng-valid')).toBe(false);
        scope.maxDate = new Date(1986, 1, 26);
        scope.$digest();
        expect(elm.hasClass('ng-valid')).toBe(true);
      });

      it('should reset maxDate to +Infinity when set empty string', function() {
        var elm = compileDirective('options-maxDate');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(24)').is(':disabled')).toBeFalsy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(25)').is(':disabled')).toBeTruthy();
        scope.maxDate = '';
        scope.$digest();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(24)').is(':disabled')).toBeFalsy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(25)').is(':disabled')).toBeFalsy();
      });

    });

    describe('startWeek', function() {

      it('should support a dynamic startWeek', function() {
        var elm = compileDirective('options-startWeek');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-menu thead tr:eq(1) th:eq(0)').text()).toBe('Ma');
        expect(sandboxEl.find('.dropdown-menu tbody button:eq(0)').text()).toBe('27');
      });

      it('should support a negative gap induced by startWeek', function() {
        var elm = compileDirective('options-startWeek-bis');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-menu thead tr:eq(1) th:eq(0)').text()).toBe('Za');
        expect(sandboxEl.find('.dropdown-menu tbody button:eq(0)').text()).toBe('28');
      });

    });

    describe('startDate', function() {

      it('should support a dynamic startDate', function() {
        var elm = compileDirective('options-startDate');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-menu thead button:eq(1)').text()).toBe(dateCalculator.format(new Date(scope.startDate), 'MMMM yyyy'));
      });

      it('should support a dynamic startDate from date object', function() {
        var elm = compileDirective('options-startDate', {startDate: new Date(2014, 2, 2)});
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-menu thead button:eq(1)').text()).toBe(dateCalculator.format(scope.startDate, 'MMMM yyyy'));
      });

    });

    describe('useNative', function() {

      it('should correctly compile template according to useNative', function() {
        var elm = compileDirective('options-useNative');
        angular.element(elm[0]).triggerHandler('focus');
        // @TODO ?
      });


    });

  });

  describe('dateModelFormat', function() {

    it('should support a custom modelDateFormat', function() {
      var elm = compileDirective('options-modelDateFormat');
  scope.$digest();
      // Should have the predefined value
      expect(elm.val()).toBe('01/12/2014');

      // Should correctly set the model value if set via the datepicker
      angular.element(elm[0]).triggerHandler('focus');
      angular.element(sandboxEl.find('.dropdown-menu tbody .btn:contains(24)')).triggerHandler('click');
      expect(elm.val()).toBe('24/12/2014');
      expect(scope.selectedDate).toBe('2014-12-24');

      // Should correctly set the model if the date is manually typed into the input
      elm.val('20/11/2014');
      angular.element(elm[0]).triggerHandler('change');
      scope.$digest();
      expect(scope.selectedDate).toBe('2014-11-20');
    });


    it('should support longDate modelDateFormat', function() {
      var elm = compileDirective('options-modelDateFormat-longDate');

      // Should have the predefined value
      expect(elm.val()).toBe('01/12/2014');

      // Should correctly set the model value if set via the datepicker
      angular.element(elm[0]).triggerHandler('focus');
      angular.element(sandboxEl.find('.dropdown-menu tbody .btn:contains(24)')).triggerHandler('click');
      expect(elm.val()).toBe('24/12/2014');
      expect(scope.selectedDate).toBe('December 24, 2014');

      // Should correctly set the model if the date is manually typed into the input
      elm.val('20/11/2014');
      angular.element(elm[0]).triggerHandler('change');
      scope.$digest();
      expect(scope.selectedDate).toBe('November 20, 2014');
    });

  });

  describe('daysOfWeekDisabled', function() {

      it('should enable all days of the week by default', function() {
        var elm = compileDirective('options-daysOfWeekDisabled');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(20)').is(':disabled')).toBeFalsy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(21)').is(':disabled')).toBeFalsy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(22)').is(':disabled')).toBeFalsy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(23)').is(':disabled')).toBeFalsy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(24)').is(':disabled')).toBeFalsy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(25)').is(':disabled')).toBeFalsy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(26)').is(':disabled')).toBeFalsy();
      });

      it('should allow disabling some days of the week', function() {
        var elm = compileDirective('options-daysOfWeekDisabled-bis');
        angular.element(elm[0]).triggerHandler('focus');
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(20)').is(':disabled')).toBeTruthy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(21)').is(':disabled')).toBeFalsy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(22)').is(':disabled')).toBeTruthy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(23)').is(':disabled')).toBeFalsy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(24)').is(':disabled')).toBeTruthy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(25)').is(':disabled')).toBeFalsy();
        expect(sandboxEl.find('.dropdown-menu tbody button:contains(26)').is(':disabled')).toBeTruthy();
      });

    });

  describe('disabledDates', function() {

    it('should not disable any dates by default', function() {
      var disabledScopeProperty = {
        disabledDates: []
      };
      var elem = compileDirective('options-disabledDates', disabledScopeProperty);
      angular.element(elem[0]).triggerHandler('focus');
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(20)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(21)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(22)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(23)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(24)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(25)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(26)').is(':disabled')).toBeFalsy();
    });

    it('should disable a single date range', function() {
      var disabledScopeProperty = {
        disabledDates: [
          { start: new Date(2014, 6, 22), end: new Date(2014, 6, 25)}
        ]
      };
      var elem = compileDirective('options-disabledDates', disabledScopeProperty);
      angular.element(elem[0]).triggerHandler('focus');
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(20)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(21)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(22)').is(':disabled')).toBeTruthy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(23)').is(':disabled')).toBeTruthy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(24)').is(':disabled')).toBeTruthy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(25)').is(':disabled')).toBeTruthy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(26)').is(':disabled')).toBeFalsy();
    });

    it('should disable multiple sorted date ranges', function() {
      var disabledScopeProperty = {
        disabledDates: [
          { start: new Date(2014, 6, 21), end: new Date(2014, 6, 22) },
          { start: new Date(2014, 6, 24), end: new Date(2014, 6, 24) }
        ]
      };
      var elem = compileDirective('options-disabledDates', disabledScopeProperty);
      angular.element(elem[0]).triggerHandler('focus');
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(20)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(21)').is(':disabled')).toBeTruthy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(22)').is(':disabled')).toBeTruthy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(23)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(24)').is(':disabled')).toBeTruthy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(25)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(26)').is(':disabled')).toBeFalsy();
    });

    it('should disable multiple sorted date ranges out of order', function() {
      var disabledScopeProperty = {
        disabledDates: [
          { start: new Date(2014, 6, 24), end: new Date(2014, 6, 24) },
          { start: new Date(2014, 6, 21), end: new Date(2014, 6, 22) }
        ]
      };
      var elem = compileDirective('options-disabledDates', disabledScopeProperty);
      angular.element(elem[0]).triggerHandler('focus');
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(20)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(21)').is(':disabled')).toBeTruthy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(22)').is(':disabled')).toBeTruthy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(23)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(24)').is(':disabled')).toBeTruthy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(25)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(26)').is(':disabled')).toBeFalsy();
    });

    it('should work combined with minDate/maxDate', function() {
      var disabledScopeProperty = {
        disabledDates: [
          { start: new Date(2014, 6, 23), end: new Date(2014, 6, 24) }
        ]
      };
      var elem = compileDirective('options-disabledDates-minmax', disabledScopeProperty);
      angular.element(elem[0]).triggerHandler('focus');
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(20)').is(':disabled')).toBeTruthy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(21)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(22)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(23)').is(':disabled')).toBeTruthy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(24)').is(':disabled')).toBeTruthy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(25)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(26)').is(':disabled')).toBeTruthy();
    });

    it('should work combined with daysOfWeekDisabled', function() {
      var disabledScopeProperty = {
        disabledDates: [
          { start: new Date(2014, 6, 22), end: new Date(2014, 6, 22) }
        ]
      };
      var elem = compileDirective('options-disabledDates-daysOfWeek', disabledScopeProperty);
      angular.element(elem[0]).triggerHandler('focus');
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(20)').is(':disabled')).toBeTruthy(); // July 25, 2014 is a Sunday, disabled
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(21)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(22)').is(':disabled')).toBeTruthy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(23)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(24)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(25)').is(':disabled')).toBeFalsy();
      expect(sandboxEl.find('.dropdown-menu tbody button:contains(26)').is(':disabled')).toBeFalsy();
    });

  });

  describe('datepickerViews', function () {
    var picker;

    beforeEach(inject(function () {
      picker = {
        select: function () {},
        $options: {
          startWeek: 0,
          daysOfWeekDisabled: '',
          dateFormat: 'shortDate'
        },
        $date: null
      };

      spyOn(picker, 'select');
    }));

    it('should change the day when navigating with the keyboard in the day view', inject(function (_datepickerViews_) {
      var datepickerViews = _datepickerViews_(picker);

      picker.$date = new Date(2014, 0, 6);
      datepickerViews.views[0].onKeyDown({ keyCode: 37 });
      //expect(picker.select).toHaveBeenCalledWith(new Date(2014, 0, 5), true);

      //picker.select.calls.reset();
      picker.$date = new Date(2014, 0, 6);
      datepickerViews.views[0].onKeyDown({ keyCode: 38 });
      //expect(picker.select).toHaveBeenCalledWith(new Date(2013, 11, 30), true);

      //picker.select.calls.reset();
      picker.$date = new Date(2014, 0, 6);
      datepickerViews.views[0].onKeyDown({ keyCode: 39 });
      //expect(picker.select).toHaveBeenCalledWith(new Date(2014, 0, 7), true);

      //picker.select.calls.reset();
      picker.$date = new Date(2014, 0, 6);
      datepickerViews.views[0].onKeyDown({ keyCode: 40 });
      //expect(picker.select).toHaveBeenCalledWith(new Date(2014, 0, 13), true);

      //picker.select.calls.reset();
      picker.$date = null;
      datepickerViews.views[0].onKeyDown({ keyCode: 40 });
    //  expect(picker.select).not.toHaveBeenCalled();
    }));

    it('should change the month when navigating with the keyboard in the month view', inject(function (_datepickerViews_) {
      var datepickerViews = _datepickerViews_(picker);

      picker.$date = new Date(2014, 0, 6);
      datepickerViews.views[1].onKeyDown({ keyCode: 37 });
      expect(picker.select).toHaveBeenCalledWith(new Date(2013, 11, 6), true);

      //picker.select.calls.reset();
      picker.$date = new Date(2014, 0, 6);
      datepickerViews.views[1].onKeyDown({ keyCode: 38 });
      expect(picker.select).toHaveBeenCalledWith(new Date(2013, 8, 6), true);

      //picker.select.calls.reset();
      picker.$date = new Date(2014, 0, 6);
      datepickerViews.views[1].onKeyDown({ keyCode: 39 });
      expect(picker.select).toHaveBeenCalledWith(new Date(2014, 1, 6), true);

      //picker.select.calls.reset();
      picker.$date = new Date(2014, 0, 6);
      datepickerViews.views[1].onKeyDown({ keyCode: 40 });
      expect(picker.select).toHaveBeenCalledWith(new Date(2014, 4, 6), true);

      //picker.select.calls.reset();
      picker.$date = null;
      datepickerViews.views[1].onKeyDown({ keyCode: 40 });
     // expect(picker.select).not.toHaveBeenCalled();
    }));

    it('should change the year when navigating with the keyboard in the year view', inject(function (_datepickerViews_) {
      var datepickerViews = _datepickerViews_(picker);

      picker.$date = new Date(2014, 0, 6);
      datepickerViews.views[2].onKeyDown({ keyCode: 37 });
      expect(picker.select).toHaveBeenCalledWith(new Date(2013, 0, 6), true);

      //picker.select.calls.reset();
      picker.$date = new Date(2014, 0, 6);
      datepickerViews.views[2].onKeyDown({ keyCode: 38 });
      expect(picker.select).toHaveBeenCalledWith(new Date(2010, 0, 6), true);

      //picker.select.calls.reset();
      picker.$date = new Date(2014, 0, 6);
      datepickerViews.views[2].onKeyDown({ keyCode: 39 });
      expect(picker.select).toHaveBeenCalledWith(new Date(2015, 0, 6), true);

      //picker.select.calls.reset();
      picker.$date = new Date(2014, 0, 6);
      datepickerViews.views[2].onKeyDown({ keyCode: 40 });
      expect(picker.select).toHaveBeenCalledWith(new Date(2018, 0, 6), true);

     // picker.select.calls.reset();
      picker.$date = null;
      datepickerViews.views[2].onKeyDown({ keyCode: 40 });
      //expect(picker.select).not.toHaveBeenCalled();
    }));
  });
});