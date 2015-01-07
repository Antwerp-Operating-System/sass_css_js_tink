'use strict';
angular.module('tink.datepicker', [])
  .provider('$dateTooltip', function() {

    var defaults = this.defaults = {
      animation: 'am-fade',
      customClass: '',
      prefixClass: 'tooltip',
      prefixEvent: 'tooltip',
      container: false,
      target: false,
      placement: 'top',
      template: 'tooltip/tooltip.tpl.html',
      contentTemplate: false,
      trigger: 'hover focus',
      keyboard: false,
      html: false,
      show: false,
      title: '',
      type: '',
      delay: 0,
      autoClose: false,
      bsEnabled: true
    };

    this.$get = function($window, $rootScope, $compile, $q, $templateCache, $http, $animate, $sce, dimensions, $$rAF, $timeout) {

      var trim = String.prototype.trim;
      var isTouch = 'createTouch' in $window.document;
      var htmlReplaceRegExp = /ng-bind="/ig;
      var $body = angular.element($window.document);

      function TooltipFactory(element, config) {

        var $tooltip = {};

        // Common vars
        var nodeName = element[0].nodeName.toLowerCase();
        var options = $tooltip.$options = angular.extend({}, defaults, config);
        $tooltip.$promise = fetchTemplate(options.template);
        var scope = $tooltip.$scope = options.scope && options.scope.$new() || $rootScope.$new();
        if(options.delay && angular.isString(options.delay)) {
          var split = options.delay.split(',').map(parseFloat);
          options.delay = split.length > 1 ? {show: split[0], hide: split[1]} : split[0];
        }

        // Support scope as string options
        if(options.title) {
          scope.title = $sce.trustAsHtml(options.title);
        }

        // Provide scope helpers
        scope.$setEnabled = function(isEnabled) {
          scope.$$postDigest(function() {
            $tooltip.setEnabled(isEnabled);
          });
        };
        scope.$hide = function() {
          scope.$$postDigest(function() {
            $tooltip.hide();
          });
        };
        scope.$show = function() {
          scope.$$postDigest(function() {
            $tooltip.show();
          });
        };
        scope.$toggle = function() {
          scope.$$postDigest(function() {
            $tooltip.toggle();
          });
        };
        // Publish isShown as a protected var on scope
        $tooltip.$isShown = scope.$isShown = false;

        // Private vars
        var timeout, hoverState;

        // Support contentTemplate option
        if(options.contentTemplate) {
          $tooltip.$promise = $tooltip.$promise.then(function(template) {
            var templateEl = angular.element(template);
            return fetchTemplate(options.contentTemplate)
            .then(function(contentTemplate) {
              var contentEl = findElement('[ng-bind="content"]', templateEl[0]);
              if(!contentEl.length) {contentEl = findElement('[ng-bind="title"]', templateEl[0]);}
              contentEl.removeAttr('ng-bind').html(contentTemplate);
              return templateEl[0].outerHTML;
            });
          });
        }

        // Fetch, compile then initialize tooltip
        var tipLinker, tipElement, tipTemplate, tipContainer, tipScope;
        $tooltip.$promise.then(function(template) {
          if(angular.isObject(template)){ template = template.data;}
          if(options.html){template = template.replace(htmlReplaceRegExp, 'ng-bind-html="');}
          template = trim.apply(template);
          tipTemplate = template;
          tipLinker = $compile(template);
          $tooltip.init();
        });

        $tooltip.init = function() {

          // Options: delay
          if (options.delay && angular.isNumber(options.delay)) {
            options.delay = {
              show: options.delay,
              hide: options.delay
            };
          }

          // Replace trigger on touch devices ?
          // if(isTouch && options.trigger === defaults.trigger) {
          //   options.trigger.replace(/hover/g, 'click');
          // }

          // Options : container
          if(options.container === 'self') {
            tipContainer = element;
          } else if(angular.isElement(options.container)) {
            tipContainer = options.container;
          } else if(options.container) {
            tipContainer = findElement(options.container);
          }

          // Options: trigger
          bindTriggerEvents();

          // Options: target
          if(options.target) {
            options.target = angular.isElement(options.target) ? options.target : findElement(options.target);
          }

          // Options: show
          if(options.show) {
            scope.$$postDigest(function() {
              if(options.trigger === 'focus') {
                element[0].focus();
              } else {
                $tooltip.show();
              }
            });
          }

        };

        $tooltip.destroy = function() {

          // Unbind events
          unbindTriggerEvents();

          // Remove element
          destroyTipElement();

          // Destroy scope
          scope.$destroy();

        };

        $tooltip.enter = function() {

          clearTimeout(timeout);
          hoverState = 'in';
          if (!options.delay || !options.delay.show) {
            return $tooltip.show();
          }

          timeout = setTimeout(function() {
            if (hoverState ==='in') {$tooltip.show();}
          }, options.delay.show);

        };

        $tooltip.show = function() {
          if (!options.bsEnabled || $tooltip.$isShown) {return;}

          scope.$emit(options.prefixEvent + '.show.before', $tooltip);
          var parent, after;
          if (options.container) {
            parent = tipContainer;
            if (tipContainer[0].lastChild) {
              after = angular.element(tipContainer[0].lastChild);
            } else {
              after = null;
            }
          } else {
            parent = null;
            after = element;
          }


          // Hide any existing tipElement
          if(tipElement){destroyTipElement();}
          // Fetch a cloned element linked from template
          tipScope = $tooltip.$scope.$new();
          /*jshint -W030 */
          tipElement = $tooltip.$element = tipLinker(tipScope, function() {});

          // Set the initial positioning.  Make the tooltip invisible
          // so IE doesn't try to focus on it off screen.
          tipElement.css({top: '-9999px', left: '-9999px', display: 'block', visibility: 'hidden'});

          // Options: animation
          if(options.animation) {tipElement.addClass(options.animation);}
          // Options: type
          if(options.type) {tipElement.addClass(options.prefixClass + '-' + options.type);}
          // Options: custom classes
          if(options.customClass) {tipElement.addClass(options.customClass);}

          // Support v1.3+ $animate
          // https://github.com/angular/angular.js/commit/bf0f5502b1bbfddc5cdd2f138efd9188b8c652a9
          var promise = $animate.enter(tipElement, parent, after, enterAnimateCallback);
          if(promise && promise.then) {promise.then(enterAnimateCallback);}

          $tooltip.$isShown = scope.$isShown = true;
          safeDigest(scope);
          $$rAF(function () {
            $tooltip.$applyPlacement();

            // Once placed, make the tooltip visible
            if(tipElement) {tipElement.css({visibility: 'visible'});}
          }); // var a = bodyEl.offsetWidth + 1; ?

          // Bind events
          if(options.keyboard) {
            if(options.trigger !== 'focus') {
              $tooltip.focus();
            }
            bindKeyboardEvents();
          }

          if(options.autoClose) {
            bindAutoCloseEvents();
          }

        };

        function enterAnimateCallback() {
          scope.$emit(options.prefixEvent + '.show', $tooltip);
        }

        $tooltip.leave = function() {

          clearTimeout(timeout);
          hoverState = 'out';
          if (!options.delay || !options.delay.hide) {
            return $tooltip.hide();
          }
          timeout = setTimeout(function () {
            if (hoverState === 'out') {
              $tooltip.hide();
            }
          }, options.delay.hide);

        };

        var _blur;
        $tooltip.hide = function(blur) {

          if(!$tooltip.$isShown) {return;}
          scope.$emit(options.prefixEvent + '.hide.before', $tooltip);

          // store blur value for leaveAnimateCallback to use
          _blur = blur;

          // Support v1.3+ $animate
          // https://github.com/angular/angular.js/commit/bf0f5502b1bbfddc5cdd2f138efd9188b8c652a9
          var promise = $animate.leave(tipElement, leaveAnimateCallback);
          if(promise && promise.then) {promise.then(leaveAnimateCallback);}

          $tooltip.$isShown = scope.$isShown = false;
          safeDigest(scope);

          // Unbind events
          if(options.keyboard && tipElement !== null) {
            unbindKeyboardEvents();
          }

          if(options.autoClose && tipElement !== null) {
            unbindAutoCloseEvents();
          }
        };

        function leaveAnimateCallback() {
          scope.$emit(options.prefixEvent + '.hide', $tooltip);
          // Allow to blur the input when hidden, like when pressing enter key
          if(_blur && options.trigger === 'focus') {
            return element[0].blur();
          }

          // clean up child scopes
          destroyTipElement();
        }

        $tooltip.toggle = function() {
          if($tooltip.$isShown){
            $tooltip.leave() ;
          } else{
            $tooltip.enter();
          }
        };

        $tooltip.focus = function() {
          tipElement[0].focus();
        };

        $tooltip.setEnabled = function(isEnabled) {
          options.bsEnabled = isEnabled;
        };

        // Protected methods

        $tooltip.$applyPlacement = function() {
          if(!tipElement) {
            return;
          }

          // Determine if we're doing an auto or normal placement
          var placement = options.placement,
              autoToken = /\s?auto?\s?/i,
              autoPlace  = autoToken.test(placement);

          if (autoPlace) {
            placement = placement.replace(autoToken, '') || defaults.placement;
          }

          // Need to add the position class before we get
          // the offsets
          tipElement.addClass(options.placement);

          // Get the position of the target element
          // and the height and width of the tooltip so we can center it.
          var elementPosition = getPosition(),
              tipWidth = tipElement.prop('offsetWidth'),
              tipHeight = tipElement.prop('offsetHeight');

          // If we're auto placing, we need to check the positioning
          if (autoPlace) {
            var originalPlacement = placement;
            var container = options.container ? angular.element(document.querySelector(options.container)) : element.parent();
            var containerPosition = getPosition(container);

            // Determine if the vertical placement
            if (originalPlacement.indexOf('bottom') >= 0 && elementPosition.bottom + tipHeight > containerPosition.bottom) {
              placement = originalPlacement.replace('bottom', 'top');
            } else if (originalPlacement.indexOf('top') >= 0 && elementPosition.top - tipHeight < containerPosition.top) {
              placement = originalPlacement.replace('top', 'bottom');
            }

            // Determine the horizontal placement
            // The exotic placements of left and right are opposite of the standard placements.  Their arrows are put on the left/right
            // and flow in the opposite direction of their placement.
            if ((originalPlacement === 'right' || originalPlacement === 'bottom-left' || originalPlacement === 'top-left') &&
                elementPosition.right + tipWidth > containerPosition.width) {

              placement = originalPlacement === 'right' ? 'left' : placement.replace('left', 'right');
            } else if ((originalPlacement === 'left' || originalPlacement === 'bottom-right' || originalPlacement === 'top-right') &&
                elementPosition.left - tipWidth < containerPosition.left) {

              placement = originalPlacement === 'left' ? 'right' : placement.replace('right', 'left');
            }

            tipElement.removeClass(originalPlacement).addClass(placement);
          }

          // Get the tooltip's top and left coordinates to center it with this directive.
          var tipPosition = getCalculatedOffset(placement, elementPosition, tipWidth, tipHeight);
          applyPlacementCss(tipPosition.top, tipPosition.left);
        };

        $tooltip.$onKeyUp = function(evt) {
          if (evt.which === 27 && $tooltip.$isShown) {
            $tooltip.hide();
            evt.stopPropagation();
          }
        };

        $tooltip.$onFocusKeyUp = function(evt) {
          if (evt.which === 27) {
            element[0].blur();
            evt.stopPropagation();
          }
        };

        $tooltip.$onFocusElementMouseDown = function(evt) {
          evt.preventDefault();
          evt.stopPropagation();
          // Some browsers do not auto-focus buttons (eg. Safari)
          if($tooltip.$isShown) {
            element[0].blur();
          } else {
            element[0].focus();
          }
        };

        // bind/unbind events
        function bindTriggerEvents() {
          var triggers = options.trigger.split(' ');
          angular.forEach(triggers, function(trigger) {
            if(trigger === 'click') {
              element.on('click', $tooltip.toggle);
            } else if(trigger !== 'manual') {
              element.on(trigger === 'hover' ? 'mouseenter' : 'focus', $tooltip.enter);
              element.on(trigger === 'hover' ? 'mouseleave' : 'blur', $tooltip.leave);
              if(nodeName === 'button' && trigger !== 'hover'){
                element.on(isTouch ? 'touchstart' : 'mousedown', $tooltip.$onFocusElementMouseDown);
              }
            }
          });
        }

        function unbindTriggerEvents() {
          var triggers = options.trigger.split(' ');
          for (var i = triggers.length; i--;) {
            var trigger = triggers[i];
            if(trigger === 'click') {
              element.off('click', $tooltip.toggle);
            } else if(trigger !== 'manual') {
              element.off(trigger === 'hover' ? 'mouseenter' : 'focus', $tooltip.enter);
              element.off(trigger === 'hover' ? 'mouseleave' : 'blur', $tooltip.leave);
              if(nodeName === 'button' && trigger !== 'hover'){
                element.off(isTouch ? 'touchstart' : 'mousedown', $tooltip.$onFocusElementMouseDown);
              }            }
          }
        }

        function bindKeyboardEvents() {
          if(options.trigger !== 'focus') {
            tipElement.on('keyup', $tooltip.$onKeyUp);
          } else {
            element.on('keyup', $tooltip.$onFocusKeyUp);
          }
        }

        function unbindKeyboardEvents() {
          if(options.trigger !== 'focus') {
            tipElement.off('keyup', $tooltip.$onKeyUp);
          } else {
            element.off('keyup', $tooltip.$onFocusKeyUp);
          }
        }

        var _autoCloseEventsBinded = false;
        function bindAutoCloseEvents() {
          // use timeout to hookup the events to prevent
          // event bubbling from being processed imediately.
          $timeout(function() {
            // Stop propagation when clicking inside tooltip
            tipElement.on('click', stopEventPropagation);

            // Hide when clicking outside tooltip
            $body.on('click', $tooltip.hide);

            _autoCloseEventsBinded = true;
          }, 0, false);
        }

        function unbindAutoCloseEvents() {
          if (_autoCloseEventsBinded) {
            tipElement.off('click', stopEventPropagation);
            $body.off('click', $tooltip.hide);
            _autoCloseEventsBinded = false;
          }
        }

        function stopEventPropagation(event) {
          event.stopPropagation();
        }

        // Private methods

        function getPosition($element) {
          $element = $element || (options.target || element);

          var el = $element[0];

          var elRect = el.getBoundingClientRect();
          if (elRect.width === null) {
            // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
            elRect = angular.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top });
          }

          var elPos;
          if (options.container === 'body') {
            elPos = dimensions.offset(el);
          } else {
            elPos = dimensions.position(el);
          }

          return angular.extend({}, elRect, elPos);
        }

        function getCalculatedOffset(placement, position, actualWidth, actualHeight) {
          var offset;
          var split = placement.split('-');

          switch (split[0]) {
          case 'right':
            offset = {
              top: position.top + position.height / 2 - actualHeight / 2,
              left: position.left + position.width
            };
            break;
          case 'bottom':
            offset = {
              top: position.top + position.height,
              left: position.left + position.width / 2 - actualWidth / 2
            };
            break;
          case 'left':
            offset = {
              top: position.top + position.height / 2 - actualHeight / 2,
              left: position.left - actualWidth
            };
            break;
          default:
            offset = {
              top: position.top - actualHeight,
              left: position.left + position.width / 2 - actualWidth / 2
            };
            break;
          }

          if(!split[1]) {
            return offset;
          }

          // Add support for corners @todo css
          if(split[0] === 'top' || split[0] === 'bottom') {
            switch (split[1]) {
            case 'left':
              offset.left = position.left;
              break;
            case 'right':
              offset.left =  position.left + position.width - actualWidth;
            }
          } else if(split[0] === 'left' || split[0] === 'right') {
            switch (split[1]) {
            case 'top':
              offset.top = position.top - actualHeight;
              break;
            case 'bottom':
              offset.top = position.top + position.height;
            }
          }

          return offset;
        }

        function applyPlacementCss(top, left) {
          tipElement.css({ top: top + 'px', left: left + 'px' });
        }

        function destroyTipElement() {
          // Cancel pending callbacks
          clearTimeout(timeout);

          if($tooltip.$isShown && tipElement !== null) {
            if(options.autoClose) {
              unbindAutoCloseEvents();
            }

            if(options.keyboard) {
              unbindKeyboardEvents();
            }
          }

          if(tipScope) {
            tipScope.$destroy();
            tipScope = null;
          }

          if(tipElement) {
            tipElement.remove();
            tipElement = $tooltip.$element = null;
          }
        }

        return $tooltip;

      }

      // Helper functions

      function safeDigest(scope) {
        /*jshint -W030 */
        scope.$$phase || (scope.$root && scope.$root.$$phase) || scope.$digest();
      }

      function findElement(query, element) {
        return angular.element((element || document).querySelectorAll(query));
      }

      var fetchPromises = {};
      function fetchTemplate(template) {
        if(fetchPromises[template]){
          return fetchPromises[template];
        }
        return (fetchPromises[template] = $q.when($templateCache.get(template) || $http.get(template))
        .then(function(res) {
          if(angular.isObject(res)) {
            $templateCache.put(template, res.data);
            return res.data;
          }
          return res;
        }));
      }

      return TooltipFactory;

    };

  })
  .directive('bsTooltip', function($window, $location, $sce, $tooltip, $$rAF) {

    return {
      restrict: 'EAC',
      scope: true,
      link: function postLink(scope, element, attr) {

        // Directive options
        var options = {scope: scope};
        angular.forEach(['template', 'contentTemplate', 'placement', 'container', 'target', 'delay', 'trigger', 'keyboard', 'html', 'animation', 'backdropAnimation', 'type', 'customClass'], function(key) {
          if(angular.isDefined(attr[key])) {
            options[key] = attr[key];
          }
        });

        // overwrite inherited title value when no value specified
        // fix for angular 1.3.1 531a8de72c439d8ddd064874bf364c00cedabb11
        if (!scope.hasOwnProperty('title')){
          scope.title = '';
        }

        // Observe scope attributes for change
        attr.$observe('title', function(newValue) {
          if (angular.isDefined(newValue) || !scope.hasOwnProperty('title')) {
            var oldValue = scope.title;
            scope.title = $sce.trustAsHtml(newValue);
            /*jshint -W030 */
            angular.isDefined(oldValue) && $$rAF(function() {
              if(tooltip) {
                tooltip.$applyPlacement();
              }
            });
          }
        });

        // Support scope as an object
        /*jshint -W030 */
        attr.bsTooltip && scope.$watch(attr.bsTooltip, function(newValue, oldValue) {
          if(angular.isObject(newValue)) {
            angular.extend(scope, newValue);
          } else {
            scope.title = newValue;
          }
          /*jshint -W030 */
          angular.isDefined(oldValue) && $$rAF(function() {
            /*jshint -W030 */
            tooltip && tooltip.$applyPlacement();
          });
        }, true);

        // Visibility binding support
        /*jshint -W030 */
        attr.bsShow && scope.$watch(attr.bsShow, function(newValue) {
          if(!tooltip || !angular.isDefined(newValue)) {return;}
          if(angular.isString(newValue)) {newValue = !!newValue.match(/true|,?(tooltip),?/i);}
          /*jshint -W030 */
          newValue === true ? tooltip.show() : tooltip.hide();
        });

        // Enabled binding support
        attr.bsEnabled && scope.$watch(attr.bsEnabled, function(newValue) {
          // console.warn('scope.$watch(%s)', attr.bsEnabled, newValue, oldValue);
          if(!tooltip || !angular.isDefined(newValue)) {return;}
          if(angular.isString(newValue)){newValue = !!newValue.match(/true|1|,?(tooltip),?/i);}
          /*jshint -W030 */
          newValue === false ? tooltip.setEnabled(false) : tooltip.setEnabled(true);
        });

        // Initialize popover
        var tooltip = $tooltip(element, options);

        // Garbage collection
        scope.$on('$destroy', function() {
          if(tooltip) {tooltip.destroy();}
          options = null;
          tooltip = null;
        });

      }
    };

  })
  .factory('dimensions', [function () {
    var fn = {};

    /**
     * Test the element nodeName
     * @param element
     * @param name
     */
    var nodeName = fn.nodeName = function (element, name) {
      return element.nodeName && element.nodeName.toLowerCase() === name.toLowerCase();
    };

    /**
     * Returns the element computed style
     * @param element
     * @param prop
     * @param extra
     */
    fn.css = function (element, prop, extra) {
      var value;
      if (element.currentStyle) { //IE
        value = element.currentStyle[prop];
      } else if (window.getComputedStyle) {
        value = window.getComputedStyle(element)[prop];
      } else {
        value = element.style[prop];
      }
      return extra === true ? parseFloat(value) || 0 : value;
    };

    /**
     * Provides read-only equivalent of jQuery's offset function:
     * @required-by bootstrap-tooltip, bootstrap-affix
     * @url http://api.jquery.com/offset/
     * @param element
     */
    fn.offset = function (element) {
      var boxRect = element.getBoundingClientRect();
      var docElement = element.ownerDocument;
      return {
        width: boxRect.width || element.offsetWidth,
        height: boxRect.height || element.offsetHeight,
        top: boxRect.top + (window.pageYOffset || docElement.documentElement.scrollTop) - (docElement.documentElement.clientTop || 0),
        left: boxRect.left + (window.pageXOffset || docElement.documentElement.scrollLeft) - (docElement.documentElement.clientLeft || 0)
      };
    };

    /**
     * Provides read-only equivalent of jQuery's position function
     * @required-by bootstrap-tooltip, bootstrap-affix
     * @url http://api.jquery.com/offset/
     * @param element
     */
    fn.position = function (element) {

      var offsetParentRect = {top: 0, left: 0},
        offsetParentElement,
        offset;

      // Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
      if (fn.css(element, 'position') === 'fixed') {

        // We assume that getBoundingClientRect is available when computed position is fixed
        offset = element.getBoundingClientRect();

      } else {

        // Get *real* offsetParentElement
        offsetParentElement = offsetParent(element);

        // Get correct offsets
        offset = fn.offset(element);
        if (!nodeName(offsetParentElement, 'html')) {
          offsetParentRect = fn.offset(offsetParentElement);
        }

        // Add offsetParent borders
        offsetParentRect.top += fn.css(offsetParentElement, 'borderTopWidth', true);
        offsetParentRect.left += fn.css(offsetParentElement, 'borderLeftWidth', true);
      }

      // Subtract parent offsets and element margins
      return {
        width: element.offsetWidth,
        height: element.offsetHeight,
        top: offset.top - offsetParentRect.top - fn.css(element, 'marginTop', true),
        left: offset.left - offsetParentRect.left - fn.css(element, 'marginLeft', true)
      };

    };

    /**
     * Returns the closest, non-statically positioned offsetParent of a given element
     * @required-by fn.position
     * @param element
     */
    var offsetParent = function offsetParentElement(element) {
      var docElement = element.ownerDocument;
      var offsetParent = element.offsetParent || docElement;
      if (nodeName(offsetParent, '#document')) {
        return docElement.documentElement;
      }
      while (offsetParent && !nodeName(offsetParent, 'html') && fn.css(offsetParent, 'position') === 'static') {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docElement.documentElement;
    };

    /**
     * Provides equivalent of jQuery's height function
     * @required-by bootstrap-affix
     * @url http://api.jquery.com/height/
     * @param element
     * @param outer
     */
    fn.height = function (element, outer) {
      var value = element.offsetHeight;
      if (outer) {
        value += fn.css(element, 'marginTop', true) + fn.css(element, 'marginBottom', true);
      } else {
        value -= fn.css(element, 'paddingTop', true) + fn.css(element, 'paddingBottom', true) + fn.css(element, 'borderTopWidth', true) + fn.css(element, 'borderBottomWidth', true);
      }
      return value;
    };

    /**
     * Provides equivalent of jQuery's width function
     * @required-by bootstrap-affix
     * @url http://api.jquery.com/width/
     * @param element
     * @param outer
     */
    fn.width = function (element, outer) {
      var value = element.offsetWidth;
      if (outer) {
        value += fn.css(element, 'marginLeft', true) + fn.css(element, 'marginRight', true);
      } else {
        value -= fn.css(element, 'paddingLeft', true) + fn.css(element, 'paddingRight', true) + fn.css(element, 'borderLeftWidth', true) + fn.css(element, 'borderRightWidth', true);
      }
      return value;
    };

    return fn;

  }])
  .provider('$datepicker', function() {

    var defaults = this.defaults = {
      animation: 'am-fade',
      prefixClass: 'datepicker',
      placement: 'bottom-left',
      template: 'templates/tinkDatePicker.html',
      trigger: 'focus',
      container: false,
      keyboard: true,
      html: false,
      delay: 0,
      // lang: $locale.id,
      useNative: false,
      dateType: 'date',
      dateFormat: 'shortDate',
      modelDateFormat: null,
      dayFormat: 'dd',
      monthFormat: 'MMM',
      yearFormat: 'yyyy',
      monthTitleFormat: 'MMMM yyyy',
      yearTitleFormat: 'yyyy',
      strictFormat: false,
      autoclose: false,
      minDate: -Infinity,
      maxDate: +Infinity,
      startView: 0,
      minView: 0,
      startWeek: 0,
      daysOfWeekDisabled: '',
      iconLeft: 'glyphicon glyphicon-chevron-left',
      iconRight: 'glyphicon glyphicon-chevron-right'
    };

    this.$get = function($window, $document, $rootScope, $sce, dateCalculator, datepickerViews, $dateTooltip, $timeout) {

      //var bodyEl = angular.element($window.document.body);
      var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
      var isTouch = ('createTouch' in $window.document) && isNative;
      if(!defaults.lang) {defaults.lang = 'nl';}

      function DatepickerFactory(element, controller, config) {

        var $datepicker = $dateTooltip(element, angular.extend({}, defaults, config));
        var parentScope = config.scope;
        var options = $datepicker.$options;
        var scope = $datepicker.$scope;
        if(options.startView) {options.startView -= options.minView;}

        // View vars

        var pickerViews = datepickerViews($datepicker);
        $datepicker.$views = pickerViews.views;
        var viewDate = pickerViews.viewDate;
        scope.$mode = options.startView;
        scope.$iconLeft = options.iconLeft;
        scope.$iconRight = options.iconRight;
        var $picker = $datepicker.$views[scope.$mode];

        // Scope methods

        scope.$select = function(date) {
          $datepicker.select(date);
        };
        scope.$selectPane = function(value) {
          $datepicker.$selectPane(value);
        };
        scope.$toggleMode = function() {
          $datepicker.setMode((scope.$mode + 1) % $datepicker.$views.length);
        };

        // Public methods

        $datepicker.update = function(date) {
          // console.warn('$datepicker.update() newValue=%o', date);
          if(angular.isDate(date) && !isNaN(date.getTime())) {
            $datepicker.$date = date;
            $picker.update.call($picker, date);
          }
          // Build only if pristine
          $datepicker.$build(true);
        };

        $datepicker.updateDisabledDates = function(dateRanges) {
          options.disabledDateRanges = dateRanges;
          for(var i = 0, l = scope.rows.length; i < l; i++) {
            angular.forEach(scope.rows[i], $datepicker.$setDisabledEl);
          }
        };

        $datepicker.select = function(date, keep) {
          // console.warn('$datepicker.select', date, scope.$mode);
          if(!angular.isDate(controller.$dateValue)) {controller.$dateValue = new Date(date);}
          if(!scope.$mode || keep) {
            controller.$setViewValue(angular.copy(date));
            controller.$render();
            if(options.autoclose && !keep) {
              $timeout(function() { $datepicker.hide(true); });
            }
          } else {
            angular.extend(viewDate, {year: date.getFullYear(), month: date.getMonth(), date: date.getDate()});
            $datepicker.setMode(scope.$mode - 1);
            $datepicker.$build();
          }
        };

        $datepicker.setMode = function(mode) {
          // console.warn('$datepicker.setMode', mode);
          scope.$mode = mode;
          $picker = $datepicker.$views[scope.$mode];
          $datepicker.$build();
        };

        // Protected methods

        $datepicker.$build = function(pristine) {
          // console.warn('$datepicker.$build() viewDate=%o', viewDate);
          if(pristine === true && $picker.built) {return;}
          if(pristine === false && !$picker.built) {return;}
          $picker.build.call($picker);
        };

        $datepicker.$updateSelected = function() {
          for(var i = 0, l = scope.rows.length; i < l; i++) {
            angular.forEach(scope.rows[i], updateSelected);
          }
        };

        $datepicker.$isSelected = function(date) {
          return $picker.isSelected(date);
        };

        $datepicker.$setDisabledEl = function(el) {
          el.disabled = $picker.isDisabled(el.date);
        };

        $datepicker.$selectPane = function(value) {
          var steps = $picker.steps;
          // set targetDate to first day of month to avoid problems with
          // date values rollover. This assumes the viewDate does not
          // depend on the day of the month
          var targetDate = new Date(Date.UTC(viewDate.year + ((steps.year || 0) * value), viewDate.month + ((steps.month || 0) * value), 1));
          angular.extend(viewDate, {year: targetDate.getUTCFullYear(), month: targetDate.getUTCMonth(), date: targetDate.getUTCDate()});
          $datepicker.$build();
        };

        $datepicker.$onMouseDown = function(evt) {
          // Prevent blur on mousedown on .dropdown-menu
          evt.preventDefault();
          evt.stopPropagation();
          // Emulate click for mobile devices
          if(isTouch) {
            var targetEl = angular.element(evt.target);
            if(targetEl[0].nodeName.toLowerCase() !== 'button') {
              targetEl = targetEl.parent();
            }
            targetEl.triggerHandler('click');
          }
        };

        $datepicker.$onKeyDown = function(evt) {
          if (!/(38|37|39|40|13)/.test(evt.keyCode) || evt.shiftKey || evt.altKey) {return;}
          evt.preventDefault();
          evt.stopPropagation();

          if(evt.keyCode === 13) {
            if(!scope.$mode) {
              return $datepicker.hide(true);
            } else {
              return scope.$apply(function() { $datepicker.setMode(scope.$mode - 1); });
            }
          }

          // Navigate with keyboard
          $picker.onKeyDown(evt);
          parentScope.$digest();
        };

        // Private

        function updateSelected(el) {
          el.selected = $datepicker.$isSelected(el.date);
        }

        function focusElement() {
          element[0].focus();
        }

        // Overrides

        var _init = $datepicker.init;
        $datepicker.init = function() {
          if(isNative && options.useNative) {
            element.prop('type', 'date');
            element.css('-webkit-appearance', 'textfield');
            return;
          } else if(isTouch) {
            element.prop('type', 'text');
            element.attr('readonly', 'true');
            element.on('click', focusElement);
          }
          _init();
        };

        var _destroy = $datepicker.destroy;
        $datepicker.destroy = function() {
          if(isNative && options.useNative) {
            element.off('click', focusElement);
          }
          _destroy();
        };

        var _show = $datepicker.show;
        $datepicker.show = function() {
          _show();
          // use timeout to hookup the events to prevent
          // event bubbling from being processed imediately.
          $timeout(function() {
            $datepicker.$element.on(isTouch ? 'touchstart' : 'mousedown', $datepicker.$onMouseDown);
            if(options.keyboard) {
              element.on('keydown', $datepicker.$onKeyDown);
            }
          }, 0, false);
        };

        var _hide = $datepicker.hide;
        $datepicker.hide = function(blur) { // TH comment out to inspect element
          // if(!$datepicker.$isShown) {return;}
          // $datepicker.$element.off(isTouch ? 'touchstart' : 'mousedown', $datepicker.$onMouseDown);
          // if(options.keyboard) {
          //   element.off('keydown', $datepicker.$onKeyDown);
          // }
          // _hide(blur);
        };

        return $datepicker;

      }

      DatepickerFactory.defaults = defaults;
      return DatepickerFactory;

    };

  })

.provider('$dateParser', function() {

  // define a custom ParseDate object to use instead of native Date
  // to avoid date values wrapping when setting date component values
  function ParseDate() {
    this.year = 1970;
    this.month = 0;
    this.day = 1;
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.milliseconds = 0;
  }

  ParseDate.prototype.setMilliseconds = function(value) { this.milliseconds = value; };
  ParseDate.prototype.setSeconds = function(value) { this.seconds = value; };
  ParseDate.prototype.setMinutes = function(value) { this.minutes = value; };
  ParseDate.prototype.setHours = function(value) { this.hours = value; };
  ParseDate.prototype.getHours = function() { return this.hours; };
  ParseDate.prototype.setDate = function(value) { this.day = value; };
  ParseDate.prototype.setMonth = function(value) { this.month = value; };
  ParseDate.prototype.setFullYear = function(value) { this.year = value; };
  ParseDate.prototype.fromDate = function(value) {
    this.year = value.getFullYear();
    this.month = value.getMonth();
    this.day = value.getDate();
    this.hours = value.getHours();
    this.minutes = value.getMinutes();
    this.seconds = value.getSeconds();
    this.milliseconds = value.getMilliseconds();
    return this;
  };

  ParseDate.prototype.toDate = function() {
    return new Date(this.year, this.month, this.day, this.hours, this.minutes, this.seconds, this.milliseconds);
  };

  var proto = ParseDate.prototype;

  function noop() {
  }

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function indexOfCaseInsensitive(array, value) {
    var len = array.length, str=value.toString().toLowerCase();
    for (var i=0; i<len; i++) {
      if (array[i].toLowerCase() === str) { return i; }
    }
    return -1; // Return -1 per the "Array.indexOf()" method.
  }

  var defaults = this.defaults = {
    format: 'shortDate',
    strict: false
  };

  this.$get = function($locale, dateFilter,dateCalculator) {

    var DateParserFactory = function(config) {

      var options = angular.extend({}, defaults, config);

      var $dateParser = {};

      var regExpMap = {
        'sss'   : '[0-9]{3}',
        'ss'    : '[0-5][0-9]',
        's'     : options.strict ? '[1-5]?[0-9]' : '[0-9]|[0-5][0-9]',
        'HH'    : '[01][0-9]|2[0-3]',
        'H'     : options.strict ? '1?[0-9]|2[0-3]' : '[01]?[0-9]|2[0-3]',
        'hh'    : '[0][1-9]|[1][012]',
        'h'     : options.strict ? '[1-9]|1[012]' : '0?[1-9]|1[012]',
        'a'     : 'AM|PM',
        'EEEE'  : dateCalculator.getDays().join('|'),
        'EE'   : dateCalculator.getShortDays().join('|'),
        'dd'    : '0[1-9]|[12][0-9]|3[01]',
        'd'     : options.strict ? '[1-9]|[1-2][0-9]|3[01]' : '0?[1-9]|[1-2][0-9]|3[01]',
        'MMMM'  : dateCalculator.getMonths().join('|'),
        'MMM'   : dateCalculator.getShortMonths().join('|'),
        'MM'    : '0[1-9]|1[012]',
        'M'     : options.strict ? '[1-9]|1[012]' : '0?.getDays()[1-9]|1[012]',
        'mm'    : '[0-5][0-9]',
        'm'     : options.strict ? '[1-5]?[0-9]' : '[0-9]|[0-5][0-9]',
        'yyyy'  : '[1]{1}[0-9]{3}|[2]{1}[0-9]{3}',
        'yy'    : '[0-9]{2}',
        'y'     : options.strict ? '-?(0|[1-9][0-9]{0,3})' : '-?0*[0-9]{1,4}',
      };

      var setFnMap = {
        'sss'   : proto.setMilliseconds,
        'ss'    : proto.setSeconds,
        's'     : proto.setSeconds,
        'HH'    : proto.setHours,
        'H'     : proto.setHours,
        'hh'    : proto.setHours,
        'h'     : proto.setHours,
        'EEEE'  : noop,
        'EE'    : noop,
        'dd'    : proto.setDate,
        'd'     : proto.setDate,
        'a'     : function(value) { var hours = this.getHours() % 12; return this.setHours(value.match(/pm/i) ? hours + 12 : hours); },
        'MMMM'  : function(value) { return this.setMonth(indexOfCaseInsensitive(dateCalculator.getMonths(), value)); },
        'MMM'   : function(value) { return this.setMonth(indexOfCaseInsensitive(dateCalculator.getShortMonths(), value)); },
        'MM'    : function(value) { return this.setMonth(1 * value - 1); },
        'M'     : function(value) { return this.setMonth(1 * value - 1); },
        'mm'    : proto.setMinutes,
        'm'     : proto.setMinutes,
        'yyyy'  : proto.setFullYear,
        'yy'    : function(value) { return this.setFullYear(2000 + 1 * value); },
        'y'     : proto.setFullYear
      };

      var regex, setMap,regexFormat;

      $dateParser.init = function() {

          var masks = {
          'default': 'ddd mmm dd yyyy HH:MM:ss',
          shortDate: 'dd/mm/yyyy',
          mediumDate: 'mmm d, yyyy',
          longDate: 'mmmm d, yyyy',
          fullDate: 'dddd, mmmm d, yyyy',
          shortTime: 'h:MM TT',
          mediumTime: 'h:MM:ss TT',
          longTime: 'h:MM:ss TT Z',
          isoDate: 'yyyy-mm-dd',
          isoTime: 'HH:MM:ss',
          isoDateTime: 'yyyy-mm-dd\'T\'HH:MM:ss',
          isoUtcDateTime: 'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\''
        };

        if(options.format && masks[options.format]){
          $dateParser.$format = masks[options.format];
        }else{
          $dateParser.$format = $locale.DATETIME_FORMATS[options.format] || options.format;
        }
        /*jshint -W030 */
        regexFormat = $dateParser.$format.replace('dddd', 'EEEE').replace('DDDD', 'EEEE').replace('ddd', 'EE').replace('DDD', 'EE').replace('mmmm', 'MMMM').replace('mmm', 'MMM').replace('mm', 'MM');
        regex = regExpForFormat(regexFormat);
        setMap = setMapForFormat(regexFormat);
      };

      $dateParser.isValid = function(date) {
        if(angular.isDate(date)) {return !isNaN(date.getTime());}
        return regex.test(date);
      };

      $dateParser.parse = function(value, baseDate, format) {
        // check for date format special names
        /*jshint -W030 */
        if(format) {format = $locale.DATETIME_FORMATS[format] || format.replace('dddd', 'EEEE').replace('DDDD', 'EEEE').replace('ddd', 'EE').replace('DDD', 'EE').replace('mmmm', 'MMMM').replace('mmm', 'MMM').replace('mm', 'MM');}
        if(angular.isDate(value)){value = dateCalculator.format(value, format || $dateParser.$format);}
        var formatRegex = format ? regExpForFormat(format) : regex;
        var formatSetMap = format ? setMapForFormat(format) : setMap;
        var matches = formatRegex.exec(value);

        if(!matches) {return false;}
        // use custom ParseDate object to set parsed values
        var date = baseDate && !isNaN(baseDate.getTime()) ? new ParseDate().fromDate(baseDate) : new ParseDate().fromDate(new Date(1970, 0, 1, 0));
        for(var i = 0; i < matches.length - 1; i++) {
          formatSetMap[i] && formatSetMap[i].call(date, matches[i+1]);
        }
        // convert back to native Date object
        var newDate = date.toDate();

        // check new native Date object for day values overflow
        if (parseInt(date.day, 10) !== newDate.getDate()) {
          return false;
        }

        return newDate;
      };

      $dateParser.getDateForAttribute = function(key, value) {
        var date;

        if(value === 'today') {
          var today = new Date();
          date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (key === 'maxDate' ? 1 : 0), 0, 0, 0, (key === 'minDate' ? 0 : -1));
        } else if(angular.isString(value) && value.match(/^".+"$/)) { // Support {{ dateObj }}
          date = new Date(value.substr(1, value.length - 2));
        } else if(isNumeric(value)) {
          date = new Date(parseInt(value, 10));
        } else if (angular.isString(value) && 0 === value.length) { // Reset date
          date = key === 'minDate' ? -Infinity : +Infinity;
        } else {
          date = new Date(value);
        }

        return date;
      };

      $dateParser.getTimeForAttribute = function(key, value) {
        var time;

        if(value === 'now') {
          time = new Date().setFullYear(1970, 0, 1);
        } else if(angular.isString(value) && value.match(/^".+"$/)) {
          time = new Date(value.substr(1, value.length - 2)).setFullYear(1970, 0, 1);
        } else if(isNumeric(value)) {
          time = new Date(parseInt(value, 10)).setFullYear(1970, 0, 1);
        } else if (angular.isString(value) && 0 === value.length) { // Reset time
          time = key === 'minTime' ? -Infinity : +Infinity;
        } else {
          time = $dateParser.parse(value, new Date(1970, 0, 1, 0));
        }

        return time;
      };

      /* Handle switch to/from daylight saving.
      * Hours may be non-zero on daylight saving cut-over:
      * > 12 when midnight changeover, but then cannot generate
      * midnight datetime, so jump to 1AM, otherwise reset.
      * @param  date  (Date) the date to check
      * @return  (Date) the corrected date
      *
      * __ copied from jquery ui datepicker __
      */
      $dateParser.daylightSavingAdjust = function(date) {
        if (!date) {
          return null;
        }
        date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
        return date;
      };

      // Private functions

      function setMapForFormat(format) {
        var keys = Object.keys(setFnMap), i;
        var map = [], sortedMap = [];
        // Map to setFn
        var clonedFormat = format;
        for(i = 0; i < keys.length; i++) {
          if(format.split(keys[i]).length > 1) {
            var index = clonedFormat.search(keys[i]);
            format = format.split(keys[i]).join('');
            if(setFnMap[keys[i]]) {
              map[index] = setFnMap[keys[i]];
            }
          }
        }
        // Sort result map
        angular.forEach(map, function(v) {
          // conditional required since angular.forEach broke around v1.2.21
          // related pr: https://github.com/angular/angular.js/pull/8525
          if(v) {sortedMap.push(v);}
        });
        return sortedMap;
      }

      function escapeReservedSymbols(text) {
        return text.replace(/\//g, '[\\/]').replace('/-/g', '[-]').replace(/\./g, '[.]').replace(/\\s/g, '[\\s]');
      }

      function regExpForFormat(format) {
        var keys = Object.keys(regExpMap), i;

        var re = format;
        // Abstract replaces to avoid collisions
        for(i = 0; i < keys.length; i++) {
          re = re.split(keys[i]).join('${' + i + '}');
        }
        // Replace abstracted values
        for(i = 0; i < keys.length; i++) {
          re = re.split('${' + i + '}').join('(' + regExpMap[keys[i]] + ')');
        }
        format = escapeReservedSymbols(format);

        return new RegExp('^' + re + '$', ['i']);
      }

      $dateParser.init();
      return $dateParser;

    };

    return DateParserFactory;

  };

})
  .directive('tinkDatepicker', function($window, $parse, $q, dateCalculator, $datepicker,$dateParser) {

    //var defaults = $datepicker.defaults;
    var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);

    return {
      restrict: 'EAC',
      require: 'ngModel',
      priority:80,
      link: function postLink(scope, element, attr, controller) {

        // Directive options
        var options = {scope: scope, controller: controller};
        angular.forEach(['placement', 'container', 'delay', 'trigger', 'keyboard', 'html', 'animation', 'template', 'autoclose', 'dateType', 'dateFormat', 'modelDateFormat', 'dayFormat', 'strictFormat', 'startWeek', 'startDate', 'useNative', 'lang', 'startView', 'minView', 'iconLeft', 'iconRight', 'daysOfWeekDisabled'], function(key) {
          if(angular.isDefined(attr[key])) {options[key] = attr[key];}
        });

        // Visibility binding support
        /*jshint -W030 */
        attr.bsShow && scope.$watch(attr.bsShow, function(newValue) {
          if(!datepicker || !angular.isDefined(newValue)) {return;}
          if(angular.isString(newValue)){newValue = !!newValue.match(/true|,?(datepicker),?/i);}
          /*jshint -W030 */
          newValue === true ? datepicker.show() : datepicker.hide();
        });

        // Initialize datepicker
        var datepicker = $datepicker(element, controller, options);
        options = datepicker.$options;
        // Set expected iOS format
        if(isNative && options.useNative) {options.dateFormat = 'yyyy-MM-dd';}

        var lang = options.lang;

        var formatDate = function(date, format) {
          return dateCalculator.formatDate(date, format, lang);
        };

        var dateParser = $dateParser({format: options.dateFormat, lang: lang, strict: options.strictFormat});

        // Observe attributes for changes
        angular.forEach(['minDate', 'maxDate'], function(key) {
          // console.warn('attr.$observe(%s)', key, attr[key]);
          angular.isDefined(attr[key]) && attr.$observe(key, function(newValue) {
            // console.warn('attr.$observe(%s)=%o', key, newValue);
            datepicker.$options[key] = dateParser.getDateForAttribute(key, newValue);
            // Build only if dirty
            !isNaN(datepicker.$options[key]) && datepicker.$build(false);
            validateAgainstMinMaxDate(controller.$dateValue);
          });
        });

        // Watch model for changes
        scope.$watch(attr.ngModel, function() {
          datepicker.update(controller.$dateValue);
        }, true);

        // Normalize undefined/null/empty array,
        // so that we don't treat changing from undefined->null as a change.
        function normalizeDateRanges(ranges) {
          if (!ranges || !ranges.length) {return null;}
          return ranges;
        }

        if (angular.isDefined(attr.disabledDates)) {
          scope.$watch(attr.disabledDates, function(disabledRanges, previousValue) {
            disabledRanges = normalizeDateRanges(disabledRanges);
            previousValue = normalizeDateRanges(previousValue);

            if (disabledRanges) {
              datepicker.updateDisabledDates(disabledRanges);
            }
          });
        }

        function validateAgainstMinMaxDate(parsedDate) {
          if (!angular.isDate(parsedDate)) {return;}
          var isMinValid = isNaN(datepicker.$options.minDate) || parsedDate.getTime() >= datepicker.$options.minDate;
          var isMaxValid = isNaN(datepicker.$options.maxDate) || parsedDate.getTime() <= datepicker.$options.maxDate;
          var isValid = isMinValid && isMaxValid;
          controller.$setValidity('date', isValid);
          controller.$setValidity('min', isMinValid);
          controller.$setValidity('max', isMaxValid);
          // Only update the model when we have a valid date
          if(isValid) {controller.$dateValue = parsedDate;}
        }

        // viewValue -> $parsers -> modelValue
        controller.$parsers.unshift(function(viewValue) {
          // console.warn('$parser("%s"): viewValue=%o', element.attr('ng-model'), viewValue);
          // Null values should correctly reset the model value & validity
          if(!viewValue) {
            controller.$setValidity('date', true);
            // BREAKING CHANGE:
            // return null (not undefined) when input value is empty, so angularjs 1.3
            // ngModelController can go ahead and run validators, like ngRequired
            return null;
          }
          var parsedDate = dateParser.parse(viewValue, controller.$dateValue);

          if(!parsedDate || isNaN(parsedDate.getTime())) {
            controller.$setValidity('date', false);
            // return undefined, causes ngModelController to
            // invalidate model value
            return;
          } else {
            validateAgainstMinMaxDate(parsedDate);
          }
          if(options.dateType === 'string') {
            return formatDate(parsedDate, options.modelDateFormat || options.dateFormat);
          } else if(options.dateType === 'number') {
            return controller.$dateValue.getTime();
          } else if(options.dateType === 'unix') {
            return controller.$dateValue.getTime() / 1000;
          } else if(options.dateType === 'iso') {
            return controller.$dateValue.toISOString();
          } else {
            return new Date(controller.$dateValue);
          }
        });

        // modelValue -> $formatters -> viewValue
        controller.$formatters.push(function(modelValue) {
          // console.warn('$formatter("%s"): modelValue=%o (%o)', element.attr('ng-model'), modelValue, typeof modelValue);
          var date;
          if(angular.isUndefined(modelValue) || modelValue === null) {
            date = NaN;
          } else if(angular.isDate(modelValue)) {
            date = modelValue;
          } else if(options.dateType === 'string') {
            date = dateParser.parse(modelValue, null, options.modelDateFormat);
          } else if(options.dateType === 'unix') {
            date = new Date(modelValue * 1000);
          } else {
            date = new Date(modelValue);
          }
          // Setup default value?
          // if(isNaN(date.getTime())) {
          //   var today = new Date();
          //   date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
          // }
          controller.$dateValue = date;
          return getDateFormattedString();
        });

        // viewValue -> element
        controller.$render = function() {
          // console.warn('$render("%s"): viewValue=%o', element.attr('ng-model'), controller.$viewValue);
          element.val(getDateFormattedString());
        };

        function getDateFormattedString() {
          return !controller.$dateValue || isNaN(controller.$dateValue.getTime()) ? '' : formatDate(controller.$dateValue, options.dateFormat);
        }

        // Garbage collection
        scope.$on('$destroy', function() {
          if(datepicker) {datepicker.destroy();}
          options = null;
          datepicker = null;
        });

      }
    };

  })

  .provider('datepickerViews', function() {

    /*var defaults = this.defaults = {
      dayFormat: 'dd',
      daySplit: 7
    };*/

    // Split array into smaller arrays
    function split(arr, size) {
      var arrays = [];
      while(arr.length > 0) {
        arrays.push(arr.splice(0, size));
      }
      return arrays;
    }

    // Modulus operator
    function mod(n, m) {
      return ((n % m) + m) % m;
    }

    this.$get = function(dateCalculator, $sce,$dateParser) {

      return function(picker) {

        var scope = picker.$scope;
        var options = picker.$options;

        var lang = options.lang;
        var formatDate = function(date, format) {
          return dateCalculator.formatDate(date, format, lang);
        };
        var dateParser = $dateParser({format: options.dateFormat, lang: lang, strict: options.strictFormat});

        var weekDaysMin = dateCalculator.getShortDays(lang);
        var weekDaysLabels = weekDaysMin.slice(options.startWeek).concat(weekDaysMin.slice(0, options.startWeek));
        var weekDaysLabelsHtml = $sce.trustAsHtml('<th class="dow text-center">' + weekDaysLabels.join('</th><th class="dow text-center">') + '</th>');

        var startDate = picker.$date || (options.startDate ? dateParser.getDateForAttribute('startDate', options.startDate) : new Date());
        var viewDate = {year: startDate.getFullYear(), month: startDate.getMonth(), date: startDate.getDate()};
        //var timezoneOffset = startDate.getTimezoneOffset() * 6e4;

        var views = [{
            format: options.dayFormat,
            split: 7,
            steps: { month: 1 },
            update: function(date, force) {
              if(!this.built || force || date.getFullYear() !== viewDate.year || date.getMonth() !== viewDate.month) {
                angular.extend(viewDate, {year: picker.$date.getFullYear(), month: picker.$date.getMonth(), date: picker.$date.getDate()});
                picker.$build();
              } else if(date.getDate() !== viewDate.date) {
                viewDate.date = picker.$date.getDate();
                picker.$updateSelected();
              }
            },
            build: function() {
              var firstDayOfMonth = new Date(viewDate.year, viewDate.month, 1), firstDayOfMonthOffset = firstDayOfMonth.getTimezoneOffset();
              var firstDate = new Date(+firstDayOfMonth - mod(firstDayOfMonth.getDay() - options.startWeek, 7) * 864e5), firstDateOffset = firstDate.getTimezoneOffset();
              var today = new Date().toDateString();
              // Handle daylight time switch
              if(firstDateOffset !== firstDayOfMonthOffset) {firstDate = new Date(+firstDate + (firstDateOffset - firstDayOfMonthOffset) * 60e3);}
              var days = [], day;
              for(var i = 0; i < 42; i++) { // < 7 * 6
                day = dateParser.daylightSavingAdjust(new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + i));
                days.push({date: day, isToday: day.toDateString() === today, label: formatDate(day, this.format), selected: picker.$date && this.isSelected(day), muted: day.getMonth() !== viewDate.month, disabled: this.isDisabled(day)});
              }
              scope.title = formatDate(firstDayOfMonth, options.monthTitleFormat);
              scope.showLabels = true;
              scope.labels = weekDaysLabelsHtml;
              scope.rows = split(days, this.split);
              this.built = true;
            },
            isSelected: function(date) {
              return picker.$date && date.getFullYear() === picker.$date.getFullYear() && date.getMonth() === picker.$date.getMonth() && date.getDate() === picker.$date.getDate();
            },
            isDisabled: function(date) {
              var time = date.getTime();

              // Disabled because of min/max date.
              if (time < options.minDate || time > options.maxDate) {return true;}

              // Disabled due to being a disabled day of the week
              if (options.daysOfWeekDisabled.indexOf(date.getDay()) !== -1) {return true;}

              // Disabled because of disabled date range.
              if (options.disabledDateRanges) {
                for (var i = 0; i < options.disabledDateRanges.length; i++) {
                  if (time >= options.disabledDateRanges[i].start && time <= options.disabledDateRanges[i].end) {
                    return true;
                  }
                }
              }

              return false;
            },
            onKeyDown: function(evt) {
              if (!picker.$date) {
                return;
              }
              var actualTime = picker.$date.getTime();
              var newDate;

              if(evt.keyCode === 37) {newDate = new Date(actualTime - 1 * 864e5);}
              else if(evt.keyCode === 38) {newDate = new Date(actualTime - 7 * 864e5);}
              else if(evt.keyCode === 39) {newDate = new Date(actualTime + 1 * 864e5);}
              else if(evt.keyCode === 40) {newDate = new Date(actualTime + 7 * 864e5);}

              if (!this.isDisabled(newDate)) {picker.select(newDate, true);}
            }
          }, {
            name: 'month',
            format: options.monthFormat,
            split: 4,
            steps: { year: 1 },
            update: function(date) {
              if(!this.built || date.getFullYear() !== viewDate.year) {
                angular.extend(viewDate, {year: picker.$date.getFullYear(), month: picker.$date.getMonth(), date: picker.$date.getDate()});
                picker.$build();
              } else if(date.getMonth() !== viewDate.month) {
                angular.extend(viewDate, {month: picker.$date.getMonth(), date: picker.$date.getDate()});
                picker.$updateSelected();
              }
            },
            build: function() {
              //var firstMonth = new Date(viewDate.year, 0, 1);
              var months = [], month;
              for (var i = 0; i < 12; i++) {
                month = new Date(viewDate.year, i, 1);
                months.push({date: month, label: formatDate(month, this.format), selected: picker.$isSelected(month), disabled: this.isDisabled(month)});
              }
              scope.title = formatDate(month, options.yearTitleFormat);
              scope.showLabels = false;
              scope.rows = split(months, this.split);
              this.built = true;
            },
            isSelected: function(date) {
              return picker.$date && date.getFullYear() === picker.$date.getFullYear() && date.getMonth() === picker.$date.getMonth();
            },
            isDisabled: function(date) {
              var lastDate = +new Date(date.getFullYear(), date.getMonth() + 1, 0);
              return lastDate < options.minDate || date.getTime() > options.maxDate;
            },
            onKeyDown: function(evt) {
              if (!picker.$date) {
                return;
              }
              var actualMonth = picker.$date.getMonth();
              var newDate = new Date(picker.$date);

              if(evt.keyCode === 37) {newDate.setMonth(actualMonth - 1);}
              else if(evt.keyCode === 38) {newDate.setMonth(actualMonth - 4);}
              else if(evt.keyCode === 39) {newDate.setMonth(actualMonth + 1);}
              else if(evt.keyCode === 40) {newDate.setMonth(actualMonth + 4);}

              if (!this.isDisabled(newDate)) {picker.select(newDate, true);}
            }
          }, {
            name: 'year',
            format: options.yearFormat,
            split: 4,
            steps: { year: 12 },
            update: function(date, force) {
              if(!this.built || force || parseInt(date.getFullYear()/20, 10) !== parseInt(viewDate.year/20, 10)) {
                angular.extend(viewDate, {year: picker.$date.getFullYear(), month: picker.$date.getMonth(), date: picker.$date.getDate()});
                picker.$build();
              } else if(date.getFullYear() !== viewDate.year) {
                angular.extend(viewDate, {year: picker.$date.getFullYear(), month: picker.$date.getMonth(), date: picker.$date.getDate()});
                picker.$updateSelected();
              }
            },
            build: function() {
              var firstYear = viewDate.year - viewDate.year % (this.split * 3);
              var years = [], year;
              for (var i = 0; i < 12; i++) {
                year = new Date(firstYear + i, 0, 1);
                years.push({date: year, label: formatDate(year, this.format), selected: picker.$isSelected(year), disabled: this.isDisabled(year)});
              }
              scope.title = years[0].label + '-' + years[years.length - 1].label;
              scope.showLabels = false;
              scope.rows = split(years, this.split);
              this.built = true;
            },
            isSelected: function(date) {
              return picker.$date && date.getFullYear() === picker.$date.getFullYear();
            },
            isDisabled: function(date) {
              var lastDate = +new Date(date.getFullYear() + 1, 0, 0);
              return lastDate < options.minDate || date.getTime() > options.maxDate;
            },
            onKeyDown: function(evt) {
              if (!picker.$date) {
                return;
              }
              var actualYear = picker.$date.getFullYear(),
                  newDate = new Date(picker.$date);

              if(evt.keyCode === 37) {newDate.setYear(actualYear - 1);}
              else if(evt.keyCode === 38) {newDate.setYear(actualYear - 4);}
              else if(evt.keyCode === 39) {newDate.setYear(actualYear + 1);}
              else if(evt.keyCode === 40) {newDate.setYear(actualYear + 4);}

              if (!this.isDisabled(newDate)) {picker.select(newDate, true);}
            }
          }];

        return {
          views: options.minView ? Array.prototype.slice.call(views, options.minView) : views,
          viewDate: viewDate
        };

      };

    };

  });