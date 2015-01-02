'use strict';

describe('datepicker range', function() {
	beforeEach(module('tink'));

	var bodyEl = $('body'), sandboxEl,today,scope,$compile,$templateCache,dateCalculator;

	beforeEach(inject(function (_$rootScope_, _$compile_, _$templateCache_,_dateCalculator_) {
		scope = _$rootScope_.$new();
		$compile = _$compile_;
		$templateCache = _$templateCache_;
		dateCalculator = _dateCalculator_;
		today = new Date();
		bodyEl.html('');
		sandboxEl = $('<div>').attr('id', 'sandbox').appendTo(bodyEl);
	}));

	afterEach(function() {
		scope.$destroy();
		sandboxEl.remove();
	});
	
	var templates = {
		'default': {
			scope: {dates: {first:new Date(2014,11,30),last:null}},
			element: '<tink-datepicker-range data-first-date="dates.first" data-last-date="dates.last"></tink-datepicker-range>'
		},
		'no-dates': {
			scope: {dates: {first:null,last:null}},
			element: '<tink-datepicker-range data-first-date="dates.first" data-last-date="dates.last"></tink-datepicker-range>'
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

	describe('with default template', function() {

		it('should open on focus', function() {
			var elm = compileDirective('default');
			expect(sandboxEl.find('.tink-datepickerrange').css("display")).toBe('none');
			angular.element(elm.find('input')[0]).triggerHandler('focus');
			scope.$digest();
			expect(sandboxEl.find('.tink-datepickerrange').css("display")).toBe('block');
		});

		it('should close on blur', function() {
			var elm = compileDirective('default');
			expect(sandboxEl.find('.tink-datepickerrange').css("display")).toBe('none');
			angular.element(elm.find('input')[0]).triggerHandler('focus');
			scope.$digest();
			angular.element(elm.find('input')[0]).triggerHandler('blur');
			scope.$digest();
			expect(sandboxEl.find('.tink-datepickerrange').css("display")).toBe('none');
		});

		it('should open with right months', function() {
			var elm = compileDirective('default');
			angular.element(elm.find('input')[0]).triggerHandler('focus');
			scope.$digest();
			expect(sandboxEl.find('div label')[0].innerText).toBe('December 2014');
			expect(sandboxEl.find('div label')[1].innerText).toBe('Januari 2015');
		});

		 it('should correctly display active date', function() {
      var elm = compileDirective('default');
      angular.element(elm.find('input')[0]).triggerHandler('focus');
      var date = new Date(2014,11,30);
      scope.$digest();
      expect(sandboxEl.find('input:first').val()).toBe(date.getDate() + '/'+("0"+(date.getMonth() + 1)).slice(-2) + '/'+ date.getFullYear() );
    });

		it('should correctly select a new date', function() {
      var elm = compileDirective('default');
      angular.element(elm.find('input')[0]).triggerHandler('focus');
      angular.element(sandboxEl.find("tr td button:contains(18)")[0]).triggerHandler('click');
      var date = new Date(2014,11,18);
      expect(sandboxEl.find('input:first').val()).toBe(date.getDate() + '/'+("0"+(date.getMonth()+1)).slice(-2) + '/'+ date.getFullYear() );
    });

     it('should invalidate input with non-existing manually typed value', function() {
      var elm = compileDirective('default');
      angular.element(elm.find('input')[0]).triggerHandler('focus');
      elm.find('input:first').val('02/31/14');
      angular.element(elm.find('input')[0]).triggerHandler('change');
      angular.element(elm.find('input')[0]).triggerHandler('blur');
      scope.$digest();
      expect(scope.dates.first).toBeNull();
    });

     it('should correctly change when scope changes', function() {
      var elm = compileDirective('default');
      scope.dates.first = new Date(2015,0,20);
      scope.dates.last = new Date(2015,1,20);
      scope.$digest();
      expect(sandboxEl.find('input:first').val()).toBe('20/01/2015');
      expect(sandboxEl.find('input:last').val()).toBe('20/02/2015');
    });

     it('should correctly change when next month is clicked', function() {
      var elm = compileDirective('default');

     	expect(sandboxEl.find('div label')[0].innerText).toBe('December 2014');
			expect(sandboxEl.find('div label')[1].innerText).toBe('Januari 2015');
      elm.find('button.btn.pull-left:last').triggerHandler('click');
      scope.$digest();
      expect(sandboxEl.find('div label')[0].innerText).toBe('Januari 2015');
			expect(sandboxEl.find('div label')[1].innerText).toBe('Februari 2015');
    });


     it('should correctly change view month when selecting next month button', function() {
      var elm = compileDirective('default');
      // set date to last day of January
      scope.dates.first = new Date(2014, 0, 31);

      scope.$digest();
      angular.element(elm.find('input')[0]).triggerHandler('focus');
      for (var nextMonth = 1; nextMonth < 24; nextMonth++) {
        // should show next month view when selecting next month button
        elm.find('button.btn.pull-left:last').triggerHandler('click');
        expect(sandboxEl.find('div label')[0].innerText).toBe(dateCalculator.format(new Date(2014, nextMonth, 1), 'MMMM yyyy'));
				expect(sandboxEl.find('div label')[1].innerText).toBe(dateCalculator.format(new Date(2014, nextMonth+1, 1), 'MMMM yyyy'));
      }
    });

    it('should correctly change view month when selecting previous month button', function() {
      var elm = compileDirective('default');
      // set date to last day of December
      scope.dates.first = new Date(2015, 11, 31);
      scope.$digest();
      angular.element(elm.find('input')[0]).triggerHandler('focus');

      for (var previousMonth = 10; previousMonth > -12; previousMonth--) {
        // should show previous month view when selecting previous month button
       elm.find('button.btn.pull-left:first').triggerHandler('click');
        expect(sandboxEl.find('div label')[0].innerText).toBe(dateCalculator.format(new Date(2015, previousMonth, 1), 'MMMM yyyy'));
				expect(sandboxEl.find('div label')[1].innerText).toBe(dateCalculator.format(new Date(2015, previousMonth+1, 1), 'MMMM yyyy'));
      }
    });

    it('should correctly display today date', function() {
        var elm = compileDirective('default');
        var daybefore = new Date(today);
        daybefore.setDate(today.getDate()-1);
        scope.dates.first = daybefore;
        scope.$digest();
        angular.element(elm.find('input')[0]).triggerHandler('focus');
        expect(today.getDate()+'').toBe(sandboxEl.find('button.btn-warning span').text());
      });

    it('should correctly have number of days in month', function() {
       var elm = compileDirective('default');
      // set date to last day of January
      scope.dates.first = new Date(2014, 0, 1);

      scope.$digest();
      angular.element(elm.find('input')[0]).triggerHandler('focus');
      for (var nextMonth = 1; nextMonth < 24; nextMonth++) {
        // should show next month view when selecting next month button
        elm.find('button.btn.pull-left:last').triggerHandler('click');
       expect(sandboxEl.find('table:first tr span:last').text()).toBe(new Date(2014, nextMonth+1, 0).getDate()+'');
       expect(sandboxEl.find('table:last tr span:last').text()).toBe(new Date(2014, nextMonth+2, 0).getDate()+'');

      }
    });

	})

	describe('with no dates', function() {
			it('should open on focus', function() {
				var elm = compileDirective('no-dates');
				expect(sandboxEl.find('.tink-datepickerrange').css("display")).toBe('none');
				angular.element(elm.find('input')[0]).triggerHandler('focus');
				scope.$digest();
				expect(sandboxEl.find('.tink-datepickerrange').css("display")).toBe('block');
			});

			it('should close on blur', function() {
				var elm = compileDirective('no-dates');
				expect(sandboxEl.find('.tink-datepickerrange').css("display")).toBe('none');
				angular.element(elm.find('input')[0]).triggerHandler('focus');
				scope.$digest();
				angular.element(elm.find('input')[0]).triggerHandler('blur');
				scope.$digest();
				expect(sandboxEl.find('.tink-datepickerrange').css("display")).toBe('none');
			});

			it('should open with right months', function() {
				var elm = compileDirective('no-dates');
				angular.element(elm.find('input')[0]).triggerHandler('focus');
				scope.$digest();
				expect(sandboxEl.find('div label')[0].innerText).toBe(dateCalculator.format(today,"mmmm yyyy"));
				var monthLater = today.setMonth(today.getMonth()+1);
				expect(sandboxEl.find('div label')[1].innerText).toBe(dateCalculator.format(monthLater,"mmmm yyyy"));
			});

		})
});