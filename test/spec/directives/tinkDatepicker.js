'use strict';

describe('datepicker', function() {

  var bodyEl = $('body'), sandboxEl;
  var $compile, $templateCache, $animate, dateFilter, scope, today, $timeout,dateCalculator;

  beforeEach(module('ngAnimate'));
  beforeEach(module('ngAnimateMock'));
  beforeEach(module('ngSanitize'));
  beforeEach(module('tink'));
  beforeEach(module('tink.dateHelper'));

  beforeEach(inject(function (_$rootScope_, _$compile_, _$templateCache_, _$animate_, _dateFilter_,_$timeout_,_dateCalculator_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
    $templateCache = _$templateCache_;
    $animate = _$animate_;
    dateFilter = _dateFilter_;
    today = new Date();
    bodyEl.html('');
    dateCalculator = _dateCalculator_;
    sandboxEl = $('<div>').attr('id', 'sandbox').appendTo(bodyEl);
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
      element: '<input type="text" ng-model="selectedDate" data-tink-datepicker>'
    },'onfocus': {
      scope: {selectedDate: new Date()},
      element: '<input type="text" data-trigger="focus" ng-model="selectedDate" data-tink-datepicker>'
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

    it('standart does not open on focus',function(){
      var elm = compileDirective('default');
      angular.element(elm.find('div.faux-input')[0]).triggerHandler('focus');
      scope.$digest();
      expect(sandboxEl.find('.datepicker').css('display')).toBe(undefined);
    })

    it('standart does open on click',function(){
      var elm = compileDirective('default');
      angular.element(elm.find('.datepicker-icon')[0]).triggerHandler('mousedown');
      scope.$digest();
      expect(sandboxEl.find('.datepicker').css('display')).toBe('block');
    })

    it('with attribute trigger=focus open on focus',function(){
      var elm = compileDirective('onfocus');
      angular.element(elm.find('div.faux-input')[0]).triggerHandler('focus');
      scope.$digest();
      expect(sandboxEl.find('.datepicker').css('display')).toBe('block');
    })

    it('when open select next month',function(){
      var elm = compileDirective('onfocus',{selectedDate:new Date(2015,1,20)});
      angular.element(elm.find('div.faux-input')[0]).triggerHandler('focus');
      scope.$digest();
      //go to next month
      for(var i=2; i< 50; i++ ){
        elm.find('button.btn.pull-right').triggerHandler('click');
        scope.$digest();
        var title = elm.find('button.btn.btn-default.btn-block.text-strong strong');
        expect(title.html()).toBe(dateCalculator.format(new Date(2015, i, 1), 'MMMM yyyy'));
      }
    })

    it('when open select prev month',function(){
      var elm = compileDirective('onfocus',{selectedDate:new Date(2015,1,20)});
      angular.element(elm.find('div.faux-input')[0]).triggerHandler('focus');
      scope.$digest();
      //go to next month
      for(var i=1; i< 50; i++ ){
        elm.find('button.btn.pull-left').triggerHandler('click');
        scope.$digest();
        var title = elm.find('button.btn.btn-default.btn-block.text-strong strong');
        expect(title.html()).toBe(dateCalculator.format(new Date(2015, 1-i, 1), 'MMMM yyyy'));
      }
    })

    it('when open select prev ',function(){
      var elm = compileDirective('onfocus',{selectedDate:new Date(2015,1,20)});
      angular.element(elm.find('div.faux-input')[0]).triggerHandler('focus');
      elm.find('button.btn.btn-default.btn-block.text-strong strong').trigger('click');
      scope.$digest();
      console.log(elm.find('.datepicker button span[ng-bind="el.label"]')[0]);
      expect(elm.find('.datepicker button span [ng-bind="el.label"]').length).toBe(12);
    })


  });
});
