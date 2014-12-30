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
      expect(scope.dates.first).toBeUndefined();

    });		

	})

	describe('with no dates', function() {
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
				expect(sandboxEl.find('div label')[0].innerText).toBe(dateCalculator.format(today,"mmmm yyyy"));
				var monthLater = today.setMonth(today.getMonth()+1);
				expect(sandboxEl.find('div label')[1].innerText).toBe(dateCalculator.format(monthLater,"mmmm yyyy"));
			});

		})
});