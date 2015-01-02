'use strict';

describe('navAside', function() {
	beforeEach(module('tink'));

	var bodyEl = $('body'), sandboxEl,today,scope,$compile,$templateCache,dateCalculator,$location,$window;

	beforeEach(inject(function(_$rootScope_, _$compile_, _$templateCache_,_dateCalculator_,_$location_,_$window_) {
		scope = _$rootScope_.$new();
		$compile = _$compile_;
		$templateCache = _$templateCache_;
		dateCalculator = _dateCalculator_;
		today = new Date();
		bodyEl.html('');
		sandboxEl = $('<div>').attr('id', 'sandbox').appendTo(bodyEl);
		$location = _$location_;
		$window = _$window_;
	}));

	afterEach(function() {
		scope.$destroy();
		sandboxEl.remove();
	});
	
	var templates = {
		'default': {
			scope: {},
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
		},
		'accordion': {
			scope: {},
			element: '<aside data-tink-nav-aside data-accordion="true" data-accordion-first="false" class="nav-left">'+
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
		},
		'firstSelected': {
			scope: {},
			element: '<aside data-tink-nav-aside data-accordion="false" data-accordion-first="true" class="nav-left">'+
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
		},
		'AccordionfirstSelected': {
			scope: {},
			element: '<aside data-tink-nav-aside data-accordion="true" data-accordion-first="true" class="nav-left">'+
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

	function compileDirective(template, locals) {
		template = templates[template];
		angular.extend(scope, angular.copy(template.scope || templates['default'].scope), locals);
		var element = $(template.element).appendTo(sandboxEl);
		element = $compile(element)(scope);
		scope.$digest();
		return jQuery(element[0]);
	}

	describe('default',function(){
		it('should have no elements selected', function() {
			var elm = compileDirective('default');
			$location.path('/');
			scope.$digest();
			expect($location.path()).toBe('/');
			expect(sandboxEl.find('li.active').length).toBe(0);
		});

		it('should have 1 element selected', function() {
			spyOn($window.tinkApi.util, 'getCurrentURL').and.returnValue('http://localhost:8080/context.html#/menu1');
			var elm = compileDirective('default');
			scope.$digest();
			expect(sandboxEl.find('li.active').length).toBe(1);
		});

		it('default should change active', function() {
			spyOn($window.tinkApi.util, 'getCurrentURL').and.returnValue('http://localhost:8080/context.html#/menu1');
			var elm = compileDirective('default');
			scope.$digest();
			angular.element(sandboxEl.find('li.can-open:first a')[0]).triggerHandler('click');
			scope.$apply();
			expect(sandboxEl.find('li.active a').attr('href')).toBe('#/menu2');
		});

		it('When clicked on a eleml with no accordion should change active', function() {
			spyOn($window.tinkApi.util, 'getCurrentURL').and.returnValue('http://localhost:8080/context.html#/menu1');
			var elm = compileDirective('default');
			scope.$digest();
			angular.element(elm.find('a[href="#/menu3"]')[0]).triggerHandler('click');
			scope.$digest();
			expect(sandboxEl.find('li.active a').attr('href')).toBe('#/menu3');
		});
	})

describe('accrodion true',function(){
	it('should have no elements selected', function() {
		var elm = compileDirective('accordion');
		$location.path('/');
		scope.$digest();
		expect($location.path()).toBe('/');
		expect(sandboxEl.find('li.active').length).toBe(0);
	});

	it('should have 1 element selected', function() {
		spyOn($window.tinkApi.util, 'getCurrentURL').and.returnValue('http://localhost:8080/context.html#/menu1');
		var elm = compileDirective('accordion');
		scope.$digest();
		expect(sandboxEl.find('li.active').length).toBe(1);
	});

	it('Data accordion enabled open accordion should not change active element', function() {
		spyOn($window.tinkApi.util, 'getCurrentURL').and.returnValue('http://localhost:8080/context.html#/menu1');
		var elm = compileDirective('accordion');
		scope.$digest();
		angular.element(sandboxEl.find('li.can-open:first a')[0]).triggerHandler('click');
		scope.$apply();
		expect(sandboxEl.find('li.active a').attr('href')).toBe('#/menu1');
	});

	it('When clicked on a elem with no accordion should change active', function() {
		spyOn($window.tinkApi.util, 'getCurrentURL').and.returnValue('http://localhost:8080/context.html#/menu1');
		var elm = compileDirective('accordion');
		scope.$digest();
		angular.element(elm.find('a[href="#/menu3"]')[0]).triggerHandler('click');
		scope.$digest();
		expect(sandboxEl.find('li.active a').attr('href')).toBe('#/menu3');
	});
})

describe('first selected true',function(){
	it('should have no elements selected', function() {
		var elm = compileDirective('firstSelected');
		$location.path('/');
		scope.$digest();
		expect($location.path()).toBe('/');
		expect(sandboxEl.find('li.active').length).toBe(0);
	});

	it('should have 1 element selected', function() {
		spyOn($window.tinkApi.util, 'getCurrentURL').and.returnValue('http://localhost:8080/context.html#/menu1');
		var elm = compileDirective('firstSelected');
		scope.$digest();
		expect(sandboxEl.find('li.active').length).toBe(1);
	});

	it('Data accordion enabled open accordion should change active element to first element', function() {
		spyOn($window.tinkApi.util, 'getCurrentURL').and.returnValue('http://localhost:8080/context.html#/menu1');
		var elm = compileDirective('firstSelected');
		scope.$digest();
		angular.element(sandboxEl.find('li.can-open:first a')[0]).triggerHandler('click');
		scope.$apply();
		expect(sandboxEl.find('li.active a').attr('href')).toBe('#/menu2/menu1');
	});

	it('When clicked on a elem with no accordion should change active', function() {
		spyOn($window.tinkApi.util, 'getCurrentURL').and.returnValue('http://localhost:8080/context.html#/menu1');
		var elm = compileDirective('firstSelected');
		scope.$digest();
		angular.element(elm.find('a[href="#/menu3"]')[0]).triggerHandler('click');
		scope.$digest();
		expect(sandboxEl.find('li.active a').attr('href')).toBe('#/menu3');
	});
})
});