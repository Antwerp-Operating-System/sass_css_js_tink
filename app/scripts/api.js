'use strict';
(function(){
	var root = this;

	var tinkApi;
	if (typeof exports !== 'undefined') {
		tinkApi = exports;
	} else {
		tinkApi = {};
	}

	tinkApi.VERSION = '1.0.0';

	tinkApi.util = {
	    getCurrentURL: function () {
	        return window.location.href;
	    }
	};

	tinkApi.topNavigation = function(){
		var defaults = {
			menuStr:'nav[data-tink-top-header]'
		};

		var calculateHeight = function(){
			if($(defaults.menuStr).length === 1 ){
				var height = $(defaults.menuStr)[0].clientHeight;
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

	tinkApi.sideNavigation = function(opts){

		var defaults = {
			toggleClass :'nav-left-open',
			toggleMenu: 'html',
			mobileAutoClose:true,
			menuStr:'aside[data-tink-nav-aside]',
			activeCss:'active',
			topNav:'nav.nav-top',
			openCss:'open',
			accordion:false,
			gotoPage:false
		};

    var options = $.extend( {}, defaults, opts );

		options.menuStr = $(options.menuStr);

		if(options.gotoPage){
			options.accordion = true;
		}

		var registerClick = function(){
			$( '.nav-aside-list li a' ).each(function() {
				$(this).on('click',function(){
					setActiveElemnt($(this).parent());
				});
			});	
		};

		var calculateHeight = function(){
			
			$( '.nav-aside-list > li' ).each(function() {
				//$(this).css( 'height',$(this).find('a').height());
				var ulHelper = $(this).find('ul');
			  if(ulHelper.length){
					$(this).addClass('can-open');
					if(options.accordion){
						$(this).find('a')[0].href ='javascript:void(0);';
					}

				}else{
					//$(this).css('height',$(this).find('a').outerHeight());
				}
				if(currentTogggleElem){
					
					var totalHeight = 0;
					currentTogggleElem.find('a').each(function() {
						totalHeight += $(this).outerHeight();
					});
					//currentTogggleElem.css('height',totalHeight);
				}
			});
		};
		

		var currentTogggleElem = null;

		var openAccordion = function(el){
			el.find('ul').slideDown( 'slow', function() {});
			el.addClass(options.openCss);
			currentTogggleElem = el;
		};

		var closeAccordion = function(el){
			el.find('ul').slideUp( 'slow', function() {});
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
		// map urls with elements
		(function mapUrls(){
			var aMap = options.menuStr.find('li a[href]');
			[].forEach.call(aMap,function (el) {
			        urlDomMap[el.href] = el;
			    }
			);
		})();

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

                    $(options.menuStr).css('top',$(options.topNav).outerHeight());
                }

        };

        var watchForPadding = function(){
            window.addEventListener('resize', function(){
                calculateTop();
            });
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
			init:function(){
				calculateHeight();
				setActiveElemnt();
				registerClick();
				watchForPadding();				
				calculateTop();
			},
			reloadActive:function(){
				setActiveElemnt();
			}
		};
	};


root.tinkApi = tinkApi;
}).call(window);