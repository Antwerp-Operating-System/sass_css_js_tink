'use strict';
describe('popover', function() {

  var bodyEl = $('body'), sandboxEl;
  var $compile, $templateCache, scope,$window;

  beforeEach(module('tink'));


  beforeEach(inject(function (_$rootScope_, _$compile_, _$templateCache_, _$animate_, _dateFilter_, _$timeout_,_dateCalculator_,_$window_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
    $templateCache = _$templateCache_;
    bodyEl.html('<script type="text/ng-template" id="popContent.html">'+
        '<h1>This is pop 1</h1>'+
      '</script>');
    $compile(bodyEl)(scope);
    sandboxEl = $('<div>').attr('id', 'sandbox').appendTo(bodyEl);
    $window = _$window_;
  }));

  afterEach(function() {
    scope.$destroy();
    sandboxEl.remove();
  });

  function compileDirective(template, locals) {
    template = templates[template];
    angular.extend(scope, angular.copy(template.scope || templates['default'].scope), locals);
    var element = $(template.element).appendTo(sandboxEl);
    element = $compile(element)(scope);
    scope.$digest();
    return jQuery(element[0]);
  }

  var templates = {
    'default': {
      scope: {selectedDate: new Date()},
      element: '<button popover-placement="left" tink-popover tink-popover-group="g1"  tink-popover-template="popContent.html">top</button>'
    },
    
  };


  describe('default', function() {
    it('On start it should be closed',function(){
      compileDirective('default');
      scope.$digest();
      expect(sandboxEl.find('.popover').length).toBe(0);
    });
    it('on click it should open',function(){
      var elm = compileDirective('default');
      angular.element(elm[0]).click();
      scope.$digest();
      expect(sandboxEl.find('.popover').length).toBe(1);
    });
    it('On double click it should be closed',function(){
      var elm = compileDirective('default');
      angular.element(elm[0]).click();
      angular.element(elm[0]).click();
      scope.$digest();
      expect(sandboxEl.find('.popover').length).toBe(0);
    });
  });
 });