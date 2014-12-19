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


	var nodelistToArray = function(obj) {
		  return [].map.call(obj, function(element) {
		    return element;
		  })
		};

	function findByNode(nodeList,node){
		node = node.toUpperCase();
		var array = nodelistToArray(nodeList);

		var elementPos = array.map(function(x) {return x.nodeName; }).indexOf(node);

		return array[elementPos];
	}

	// Check if the element has the class
	function elemHasClass(elem,classStr){
		var elem  = convertToElement(elem);
		if(elem && elem.className){
			if(elem.className.indexOf(classStr) !== -1){
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
	}

	function addCassToElem(elem,classStr){
		if(!elemHasClass(elem,classStr)){
			elem.className  = elem.className + ' ' + classStr;
		}
	}
	function removeCassToElem(elem,classStr){
		if(elemHasClass(elem,classStr)){
			elem.className = elem.className.replace(classStr,'');
		}
	}

	function isMobile() {
  	var check = false;
  	(function(a,b){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  	return check;
	}

	/*
	*	If a string is given it will search for a domElement !
	*	with the querySelector
	*	if a domelement is given it wil return that domElement
	*/
	function convertToElement(str){
		if(str === undefined || str === null){
			return null;
		}
		if((typeof str === 'object') && str.nodeType===1 && (typeof str.style === 'object') && (typeof str.ownerDocument === 'object')){
			return str;
		}else if(typeof str === 'string'){
			return document.querySelector(str);
		}else{
			return null;
		}

	}

	function addEvent(elem, type, eventHandle) {
	    if (elem == null || typeof(elem) == 'undefined') return;
	    if ( elem.addEventListener ) {
	        elem.addEventListener( type, eventHandle, false );
	    } else if ( elem.attachEvent ) {
	        elem.attachEvent( "on" + type, eventHandle );
	    } else {
	        elem["on"+type]=eventHandle;
	    }
	};

		function getClosest (elem, selector) {

	    var firstChar = selector.charAt(0);

	    // Get closest match
	    for ( ; elem && elem !== document; elem = elem.parentNode ) {

	        // If selector is a class
	        if ( firstChar === '.' ) {
	            if ( elem.classList.contains( selector.substr(1) ) ) {
	                return elem;
	            }
	        }

	        // If selector is an ID
	        if ( firstChar === '#' ) {
	            if ( elem.id === selector.substr(1) ) {
	                return elem;
	            }
	        } 

	        // If selector is a data attribute
	        if ( firstChar === '[' ) {
	            if ( elem.hasAttribute( selector.substr(1, selector.length - 2) ) ) {
	                return elem;
	            }
	        }

	        // If selector is a tag
	        if ( elem.tagName.toLowerCase() === selector ) {
	            return elem;
	        }

	    }

	    return false;

	};

	tinkApi.sideNavigation = function(options){

		var options = {
			toggleClass :'nav-left-open',
			toggleMenu: 'html',
			mobileAutoClose:true,
			menuStr:'aside[data-tink-nav-aside]',
			activeCss:'active',
			navHeader:'nav.nav-top',
			openCss:'open',
			accordion:true,
			gotoPage:false
		};

		options.menuStr = convertToElement(options.menuStr);



		(function registerClick(){
			$( ".nav-aside-list li a" ).each(function( index ) {
				$(this).on("click",function(){
					setActiveElemnt($(this).parent())
				});
			});	
		})();

		var calculateHeight = function(){
			
			$( ".nav-aside-list > li" ).each(function( index ) {
				//$(this).css( "height",$(this).find('a').height());
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
					currentTogggleElem.find('a').each(function( index ) {
						totalHeight += $(this).outerHeight();
					});
					//currentTogggleElem.css('height',totalHeight);
				}
			});
		}
		

		var currentTogggleElem = null;

		var openAccordion = function(el){
			el.find('ul').slideDown( "slow", function() {});
			el.addClass(options.openCss);
			currentTogggleElem = el;
		}

		var closeAccordion = function(el){
			var Aelem = el.find('a:first');

			el.find('ul').slideUp( "slow", function() {});
			el.removeClass(options.openCss);
			currentTogggleElem = null;
		}

		var toggleAccordion = function(el){
			if(currentTogggleElem !== null){
				currentTogggleElem.removeClass(options.openCss);
			}	

			if(el !== null){

				var height = 0;


				if(currentTogggleElem && el[0] === currentTogggleElem[0]){
					closeAccordion(el);
				}else{
					if(currentTogggleElem !== null){
						closeAccordion(currentTogggleElem)
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

			
		}



		var urlDomMap = {};
		// map urls with elements
		(function mapUrls(){
			var aMap = options.menuStr.querySelectorAll('li a[href]');

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
				activeElem = $(urlDomMap[location.href]).parent();
			}

			if(activeElem && activeElem.hasClass('can-open')){
				toggleAccordion(activeElem);
				
			}else if(activeElem.parent().parent().hasClass('can-open')){
				if(currentTogggleElem === null || activeElem.parent().parent()[0] !== currentTogggleElem[0]){
					toggleAccordion(activeElem.parent().parent());
				}	
			}else if(currentTogggleElem){
				toggleAccordion(currentTogggleElem)
			}

			if(!(options.accordion && activeElem.hasClass('can-open') )){
				if(currentActiveElement !== null){
					currentActiveElement.removeClass(options.activeCss);
				}
				activeElem.addClass(options.activeCss);
				currentActiveElement = activeElem;
			}		
			
		}
	
		calculateHeight();
		setActiveElemnt();
		var openMenu = function(){
			var menu = convertToElement(options.toggleMenu);
				if(!elemHasClass(menu,options.toggleClass)){
					menu.className  = menu.className + ' ' + options.toggleClass;
				};
		};

		var closeMenu = function(){
				var menu = convertToElement(options.toggleMenu);
				if(elemHasClass(menu,options.toggleClass)){
					menu.className = menu.className.replace(options.toggleClass,'');
				}	
		}


		return {
			openMenu:function(){
					openMenu();
			},
			closeMenu : function(){
				closeMenu();
			},
			toggleMenu:function(){
				if(elemHasClass(options.toggleMenu,options.toggleClass)){
					closeMenu();
				}else{
					openMenu();
				}
			},
			reloadActive:function(){
				setActiveElemnt();
			}
		};
	};


//Call functions for startup
window.onload = function(){
	tinkApi.sideNavigation()
}
root.tinkApi = tinkApi;
}).call(this);