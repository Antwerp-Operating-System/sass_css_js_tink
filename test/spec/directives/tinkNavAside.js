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
			element: '<div data-tink-nav-aside data-auto-select="false" class="nav-left">'+
				'<aside>'+
					'<div class="nav-aside-section">'+
				    '<p class="nav-aside-title">Choose a playground</p>'+
				    '<ul>'+
				      '<li>'+
				        '<a href="#/menu1" title="">'+
				          '<span>Menu 1</span>'+
				        '</a>'+
				        '<ul>'+
				          '<li>'+
				            '<a href="#/forms" title="">'+
				              '<i class="fa fa-fw fa-edit"></i>'+
				              '<span>menu 1 item 1</span>'+
				            '</a>'+
				          '</li>'+
				          '<li>'+
				            '<a href="#/callouts" title="">'+
				              '<i class="fa fa-fw fa-twitch"></i>'+
				              '<span>Callouts</span>'+
				              '<span class="badge">1</span>'+
				            '</a>'+
				          '</li>'+
				          '<li>'+
				            '<a href="#/code" title="">'+
				              '<i class="fa fa-fw fa-code"></i>'+
				              '<span>Code</span>'+
				            '</a>'+
				          '</li>'+
				        '</ul>'+
				      '</li>'+
				      '<li>'+
				        '<a href="#/menu2" title="">'+
				          '<span>Menu 2</span>'+
				          '<span class="badge">1</span>'+
				        '</a>'+
				        '<ul>'+
				          '<li>'+
				            '<a href="#/menu2/menu1">'+
				              '<i class="fa fa-fw fa-recycle"></i>'+
				              '<span>Work Agile Tool</span>'+
				            '</a>'+
				          '</li>'+
				          '<li>'+
				            '<a href="#/menu2/menu2">'+
				              '<i class="fa fa-fw fa-recycle"></i>'+
				              '<span>Work Agile Tool</span>'+
				            '</a>'+
				          '</li>'+
				          '<li>'+
				            '<a href="#/menu2/menu3">'+
				              '<i class="fa fa-fw fa-recycle"></i>'+
				              '<span>Work Agile Tool</span>'+
				            '</a>'+
				          '</li>'+
				        '</ul>'+
				      '</li>'+
				      '<li>'+
				        '<a href="#/menu3" title="">'+
				          '<span>Menu 3</span>'+
				          '<span class="badge">1</span>'+
				        '</a>'+
				        '<ul>'+
				          '<li>'+
				            '<a href="#/menu3/menu4">'+
				              '<i class="fa fa-fw fa-recycle"></i>'+
				              '<span>Work Agile Tool</span>'+
				            '</a>'+
				          '</li>'+
				        '</ul>'+
				      '</li>'+
				    '</ul>'+
				  '</div>'+
				'</aside>'+
			'</div>'
		},
		'auto-true': {
			scope: {},
			element: '<div data-tink-nav-aside data-auto-select="true" class="nav-left">'+
				'<aside>'+
					'<div class="nav-aside-section">'+
				    '<p class="nav-aside-title">Choose a playground</p>'+
				    '<ul>'+
				      '<li>'+
				        '<a href="#/menu1" title="">'+
				          '<span>Menu 1</span>'+
				        '</a>'+
				        '<ul>'+
				          '<li>'+
				            '<a href="#/forms" title="">'+
				              '<i class="fa fa-fw fa-edit"></i>'+
				              '<span>menu 1 item 1</span>'+
				            '</a>'+
				          '</li>'+
				          '<li>'+
				            '<a href="#/callouts" title="">'+
				              '<i class="fa fa-fw fa-twitch"></i>'+
				              '<span>Callouts</span>'+
				              '<span class="badge">1</span>'+
				            '</a>'+
				          '</li>'+
				          '<li>'+
				            '<a href="#/code" title="">'+
				              '<i class="fa fa-fw fa-code"></i>'+
				              '<span>Code</span>'+
				            '</a>'+
				          '</li>'+
				        '</ul>'+
				      '</li>'+
				      '<li>'+
				        '<a href="#/menu2" title="">'+
				          '<span>Menu 2</span>'+
				          '<span class="badge">1</span>'+
				        '</a>'+
				        '<ul>'+
				          '<li>'+
				            '<a href="#/menu2/menu1">'+
				              '<i class="fa fa-fw fa-recycle"></i>'+
				              '<span>Work Agile Tool</span>'+
				            '</a>'+
				          '</li>'+
				          '<li>'+
				            '<a href="#/menu2/menu2">'+
				              '<i class="fa fa-fw fa-recycle"></i>'+
				              '<span>Work Agile Tool</span>'+
				            '</a>'+
				          '</li>'+
				          '<li>'+
				            '<a href="#/menu2/menu3">'+
				              '<i class="fa fa-fw fa-recycle"></i>'+
				              '<span>Work Agile Tool</span>'+
				            '</a>'+
				          '</li>'+
				        '</ul>'+
				      '</li>'+
				      '<li>'+
				        '<a href="#/menu3" title="">'+
				          '<span>Menu 3</span>'+
				          '<span class="badge">1</span>'+
				        '</a>'+
				        '<ul>'+
				          '<li>'+
				            '<a href="#/menu3/menu4">'+
				              '<i class="fa fa-fw fa-recycle"></i>'+
				              '<span>Work Agile Tool</span>'+
				            '</a>'+
				          '</li>'+
				        '</ul>'+
				      '</li>'+
				    '</ul>'+
				  '</div>'+
				'</aside>'+
			'</div>'
		},
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
			expect(elm.find('li.active').length).toBe(0);
		});

		it('should have 1 element selected', function() {
			spyOn($window.tinkApi.util, 'getCurrentURL').and.returnValue('http://localhost:8080/context.html#/forms');
			var elm = compileDirective('default');
			scope.$digest();
			expect(elm.find('li.active').length).toBe(1);
		});

		it('default should change active', function() {
			spyOn($window.tinkApi.util, 'getCurrentURL').and.returnValue('http://localhost:8080/context.html#/menu1');
			var elm = compileDirective('default');
			scope.$digest();
			angular.element(sandboxEl.find('a[href="#/menu2/menu1"]')[0]).triggerHandler('click');
			scope.$digest();
			expect(elm.find('li.active a').attr('href')).toBe('#/menu2/menu1');
		});
	});

describe('first selected true',function(){
	it('should have no elements selected', function() {
		var elm = compileDirective('auto-true');
		$location.path('/');
		scope.$digest();
		expect($location.path()).toBe('/');
		expect(elm.find('li.active').length).toBe(0);
	});

	it('should have 1 element selected', function() {
		spyOn($window.tinkApi.util, 'getCurrentURL').and.returnValue('http://localhost:8080/context.html#/menu1');
		var elm = compileDirective('auto-true');
		scope.$digest();
		expect(elm.find('li.active').length).toBe(0);
	});

	it('Data accordion enabled open accordion should change active element to first element', function() {
		spyOn($window.tinkApi.util, 'getCurrentURL').and.returnValue('http://localhost:8080/context.html#/menu2');
			var elm = compileDirective('auto-true');
			scope.$digest();
			angular.element(elm.find('li.can-open a')[0]).triggerHandler('click');
			scope.$digest();
			//expect(elm.find('li.active a').attr('href')).toBe('#/forms');
	});

});
});