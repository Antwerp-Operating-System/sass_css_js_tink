'use strict';
(function(){
	var root = this;

	var tinkApi;
	if (typeof exports !== 'undefined') {
		tinkApi = exports;
	} else {
		tinkApi = {};
	}

	tinkApi.VERSION = '1.0.1';

	tinkApi.util = {
		getCurrentURL: function () {
			return window.location.href;
		}
	};

	tinkApi.topNavigation = function(element){
		var defaults = {
			menuStr:element
		};

		var calculateHeight = function(){
			if($(defaults.menuStr).length === 1){
				var height = $(defaults.menuStr)[0].getBoundingClientRect().height;
				$($(document)[0].body).css('padding-top',height+'px');
			}
		};

		var startLisener = function(){
			$(window).bind('resize',calculateHeight);
		};

		return {
			init:function(){
				calculateHeight();
				startLisener();
			}
		};
	};

	tinkApi.accordion = function(){
		var defaults = {
			speed:200,
			loadingCallback:true,
			oneAtTime:true,
			openGroupCss:'group-open',
			groupLoadingCss:'group-loading',
			contentCss:'accordion-panel-body',
			loadingCss:'accordion-spinner',
			startOpen:false,
			accordionLoadedContent:'accordion-loaded-content',
			noCallBack:'no-call-back'
		};

		var accordion = null;

		var init = function(element,opts){
			accordion = element;
			if(opts){
				Object.extend(defaults, opts);
			}
		};

		var groups=[];

		var addGroup = function(elem){
			if(!accordion){
				return;
			}
			groups.push(elem.get(0));

			if(elem.hasClass(defaults.noCallBack)){
				findEl(elem,defaults.loadingCss).css('opacity',0);
				findEl(elem,defaults.contentCss).css('height','auto');
			}
				findEl(elem,defaults.contentCss).css('display','none');
		};

		var getGroupAt = function(index){
			return $(groups[index]);
		};

		var findEl = function(elem,classStr){
			return elem.find('.'+classStr);
		};


		var openGroup = function(elem){
			if(!accordion){
				return;
			}
			var index = groups.indexOf(elem.get(0));
			if(index >= 0){
				elem = getGroupAt(index);
				//If collapse is loading, we have to stop the visual and open de div
				if(elem.hasClass(defaults.groupLoadingCss)){
					if(findEl(elem,defaults.loadingCss).css('opacity') === '1' ){
						findEl(elem,defaults.loadingCss).css('opacity',0);
						findEl(elem,defaults.contentCss).slideDown(defaults.speed);
						elem.removeClass(defaults.groupLoadingCss);
						elem.addClass(defaults.openGroupCss);
					}
				//If accordion is not open and doesnt have loading
				}else if(!elem.hasClass(defaults.openGroupCss)){
					/*If the collapse has a callback and its not loading
					* If the collapse is loading we add loading visual.
					*/
					if(!elem.hasClass(defaults.noCallBack) && !elem.hasClass(defaults.groupLoadingCss)){
						findEl(elem,defaults.loadingCss).css('opacity',1);
						elem.addClass(defaults.groupLoadingCss);
						//In al other cases we just want to open the collapse.
					}else{
						findEl(elem,defaults.contentCss).css('height','auto');
						findEl(elem,defaults.contentCss).slideDown(defaults.speed);
						elem.removeClass(defaults.groupLoadingCss);
						elem.addClass(defaults.openGroupCss);
					}
				}
			}
		};

		var closeGroup = function(elem){
			if(!accordion){
				return;
			}
			var index = groups.indexOf(elem.get(0));
			if(index >= 0){
				elem = getGroupAt(index);
				if(elem.hasClass(defaults.openGroupCss) || elem.hasClass(defaults.groupLoadingCss)){
					elem.find('.'+defaults.contentCss).slideUp(defaults.speed);
					elem.removeClass(defaults.openGroupCss);
					elem.removeClass(defaults.groupLoadingCss);
				}
			}
		};

		return{
			init:function(element,opts){
				init(element,opts);
			},
			addGroup:function(element){
				addGroup(element);
			},
			openGroup:function(element){
				openGroup(element);
			},
			closeGroup:function(element){
				closeGroup(element);
			}
		};

	};

	tinkApi.sideNavigation = function(element){

		var defaults = {
			toggleClass :'nav-left-open',
			toggleMenu: 'html',
			mobileAutoClose:true,
			menuStr:'aside[data-tink-nav-aside]',
			activeCss:'active',
			topNav:'nav.nav-top',
			openCss:'open',
			accordion:false,
			gotoPage:false,
			speed:200
		};

		var options;

		var registerClick = function(){
			$( '.nav-aside-list li a' ).each(function() {
				$(this).on('click',function(){
					setActiveElemnt($(this).parent());
				});
			});
		};

		var calculateHeight = function(){

			$( '.nav-aside-list > li' ).each(function() {
				var ulHelper = $(this).find('ul');
				if(ulHelper.length){
					$(this).addClass('can-open');
					if(options.accordion){
						$(this).find('a')[0].href ='javascript:void(0);';
					}
				}
				/*if(currentTogggleElem){
					var totalHeight = 0;
					currentTogggleElem.find('a').each(function() {
						totalHeight += $(this)[0].getBoundingClientRect().height;
					});
		}*/
	});
		};


		var currentTogggleElem = null;

		var openAccordion = function(el){
			el.find('ul').slideDown(options.speed, function() {});
			el.addClass(options.openCss);
			currentTogggleElem = el;
		};

		var closeAccordion = function(el){
			el.find('ul').slideUp(options.speed, function() {});
			el.removeClass(options.openCss);
			currentTogggleElem = null;
		};

		var toggleAccordion = function(el){
			if(currentTogggleElem !== null){
				currentTogggleElem.removeClass(options.openCss);
			}

			if(el !== null){

				if(currentTogggleElem && el[0] === currentTogggleElem[0]){
					closeAccordion(el);
				}else{
					if(currentTogggleElem !== null){
						closeAccordion(currentTogggleElem);
					}
					openAccordion(el);

					if(options.gotoPage && currentActiveElement && currentActiveElement.parent().parent()[0] !== el[0]){
						var firstA = el.find('ul a:first');
						document.location.href = firstA[0].href;
						setActiveElemnt(el.find('ul li:first'));
					}

				}

			}else{
				currentTogggleElem = null;
			}


		};


		var urlDomMap = {};


		var currentActiveElement = null;

		var setActiveElemnt = function(el){
			var activeElem;
			if(el){
				activeElem = el;
			}else{
				activeElem = $(urlDomMap[tinkApi.util.getCurrentURL()]).parent();
			}

			if(activeElem && activeElem.hasClass('can-open')){
				toggleAccordion(activeElem);

			}else if(activeElem.parent().parent().hasClass('can-open')){
				if(currentTogggleElem === null || activeElem.parent().parent()[0] !== currentTogggleElem[0]){
					toggleAccordion(activeElem.parent().parent());
				}
			}else if(currentTogggleElem){
				toggleAccordion(currentTogggleElem);
			}

			if(!(options.accordion && activeElem.hasClass('can-open') )){
				if(currentActiveElement !== null){
					currentActiveElement.removeClass(options.activeCss);
				}
				activeElem.addClass(options.activeCss);
				currentActiveElement = activeElem;
			}

		};
		var openMenu = function(){
			$(options.toggleMenu).toggleClass(options.toggleClass);
		};

		var closeMenu = function(){
			$(options.toggleMenu).toggleClass(options.toggleClass);
		};

		var calculateTop = function(){

			if($(options.topNav).length === 1){
				$(options.menuStr).css('top',$(options.topNav)[0].getBoundingClientRect().height);
			}

		};

		var watchForPadding = function(){
			window.addEventListener('resize', function(){
				setTimeout(calculateTop, 150);
			});
		};

		var init = function(opts){
			options = $.extend( {}, defaults, opts );

			options.menuStr = $(element);

			if(options.gotoPage){
				options.accordion = true;
			}

			// map urls with elements
			(function mapUrls(){
				var aMap = options.menuStr.find('li a[href]');
				[].forEach.call(aMap,function (el) {
					urlDomMap[el.href] = el;
				}
				);
			})();

			calculateHeight();
			setActiveElemnt();
			registerClick();
			watchForPadding();
			calculateTop();
		};


		return {
			openMenu:function(){
				openMenu();
			},
			closeMenu : function(){
				closeMenu();
			},
			toggleMenu:function(){
				if($(options.toggleMenu).hasClass(options.toggleClass)){
					closeMenu();
				}else{
					openMenu();
				}
			},
			init:function(opts){
				init(opts);
			},
			reloadActive:function(){
				setActiveElemnt();
			}
		};
	};


	root.tinkApi = tinkApi;
}).call(window);
