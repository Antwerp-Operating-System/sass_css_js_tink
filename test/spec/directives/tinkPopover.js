describe('popover', function() {
  var elm,
      elmBody,
      scope,
      elmScope,
      tooltipScope;

  // load the popover code
  beforeEach(module('tink'));

  // load the template
  //beforeEach(module('tink.templates'));

  beforeEach(inject(function($rootScope, $compile,dimensions) {
    elmBody = angular.element(
      '<div><span tink-popover="popover text">Selector Text</span></div>'
    );

    scope = $rootScope;
    $compile(elmBody)(scope);
    scope.$digest();
    elm = elmBody.find('span');
    elmScope = elm.scope();
    tooltipScope = elmScope.$$childTail;
  }));

  it('should not be open initially', inject(function() {
    expect( tooltipScope.isOpen ).toBe( false );

    // We can only test *that* the popover-popup element wasn't created as the
    // implementation is templated and replaced.
    expect( elmBody.children().length ).toBe( 1 );
  }));

  it('should open on click', inject(function() {
    elm.trigger( 'click' );
    expect( tooltipScope.isOpen ).toBe( true );

    // We can only test *that* the popover-popup element was created as the
    // implementation is templated and replaced.
    expect( elmBody.children().length ).toBe( 2 );
  }));

  it('should close on second click', inject(function() {
    elm.trigger( 'click' );
    elm.trigger( 'click' );
    expect( tooltipScope.isOpen ).toBe( false );
  }));

  it('should not unbind event handlers created by other directives - issue 456', inject( function( $compile ) {

    scope.click = function() {
      scope.clicked = !scope.clicked;
    };

    elmBody = angular.element(
      '<div><input tink-popover="Hello!" ng-click="click()" tink-popover-trigger="mouseenter"/></div>'
    );
    $compile(elmBody)(scope);
    scope.$digest();

    elm = elmBody.find('input');

    elm.trigger( 'mouseenter' );
    elm.trigger( 'mouseleave' );
    expect(scope.clicked).toBeFalsy();

    elm.click();
    expect(scope.clicked).toBeTruthy();
  }));
});
