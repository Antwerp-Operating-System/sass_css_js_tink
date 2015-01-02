describe('TopNavigation', function() {

  var bodyEl = $('body'), sandboxEl;
  var $compile, $templateCache, $animate, dateFilter, $datepicker, scope, today, $timeout,dateCalculator,$window;

  beforeEach(module('tink'));


  beforeEach(inject(function (_$rootScope_, _$compile_, _$templateCache_, _$animate_, _dateFilter_, _$datepicker_, _$timeout_,_dateCalculator_,_$window_) {
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
      element: '<nav data-tink-top-header nav-header class="nav-top">'+
        '<ul class="nav-top-branding">'+
          '<li class="logo">'+
            '<a href="#" title=""><img src="images/playground/tink-logo.svg" alt="" /></a>'+
          '</li>'+
          '<li class="toggle">'+
            '<a href="#" title="Open menu" data-ng-click="sidenav.open = !sidenav.open"><i class="fa fa-bars"><span class="sr-only">Open menu</span></i></a>'+
          '</li>'+
          '<li class="app">'+
           ' <h1><a href="#">My App</a></h1>'+
          '</li>'+
        '</ul>'+
        '<section class="nav-top-section">'+
          '<ul class="nav-top-section-left">'+
           '<li>'+
              '<a href="#">Menu L1</a>'+
            '</li>'+
          '</ul>'+
          '<div class="nav-top-section-center">'+
            '<input type="search" class="input-search" placeholder="Zoeken" />'+
          '</div>'+
          '<ul class="nav-top-section-right">'+
            '<li class="active">'+
             '<a href="#">Menu R1</a>'+
            '</li>'+
            '<li>'+
              '<a href="#">Menu R2</a>'+
            '</li>'+
          '</ul>'+
        '</section>'+
      '</nav>'
    },
    'withSidenav': {
      scope: {selectedDate: new Date()},
      element: '<aside data-tink-nav-aside class="nav-left">'+
      '<ul class="nav-aside-list" role="sidenav">'+
      '<li> <a href="#/menu1"> <i class="fa fa-fw fa-dashboard"></i> <span>Menu item 1</span> <span class="badge">479</span> </a> </li>'+
      '<li class="can-open"> <a href="#/menu2"> <i class="fa fa-fw fa-dashboard"></i> <span>Menu item 2</span> <span class="badge">479</span> </a> <ul>'+
      '<li> <a href="#/menu2/menu1"> <span>Sub menu item 1</span> <span class="badge">479</span> </a> </li>'+
      '<li> <a href="#/menu2/menu2"> <span>Sub menu item 2</span> </a> </li>'+
      '<li> <a href="#/menu2/menu3"> <span>Sub menu item 3 als dat geen probleem is</span> <span class="badge">479</span> </a>'+
      '</li>'+
      '</ul> </li>'+
      '<li> <a href="#/menu4"> <!-- <i class="fa fa-fw fa-dashboard"></i> --> <span>Menu item 4<span class="badge">479</span></span> </a>'+
      '<ul>'+
      '<li> <a href="#/menu4/menu1"> <span>Sub menu item 14<span class="badge">479</span></span> </a> </li>'+
      '<li> <a href="#/menu4/menu2"> <span>Sub menu item14</span> </a> </li>'+
      '<li> <a href="#/menu4/menu3"> <span> Sub menu item 54 <span class="badge">479</span> </span> </a> </li>'+
      '</ul> </li>'+
      '<li> <a href="#/menu3"> <i class="fa fa-fw fa-dashboard"></i> <span>Menu item 3</span> </a> </li>'+
      '<li> <a href="#/menu3/menu4"> <i class="fa fa-fw fa-dashboard"></i> <span>Menu item 4</span> </a> </li> </ul> </aside>'
    }
  };

  it('resize when window resizes ',function(){
    var elm = compileDirective('default');
    var bodyStart = bodyEl.css('padding-top');
    bodyEl.css('width', '50px');
    $(window).trigger('resize');
    scope.$digest();
     expect(bodyEl.css('padding-top')).toBeGreaterThan(bodyStart);
  });

});