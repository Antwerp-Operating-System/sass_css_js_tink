'use strict';
/*
 * http://mgcrea.github.io/angular-strap/##datepickers-usage
 * V2.14
 * */

angular.module('tink.datepicker', []);
angular.module('tink.datepicker')
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
  .provider('$dateTooltip', function () {

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

    this.$get = function ($window, $rootScope, $compile, $q, $templateCache, $http, $animate, $sce, dimensions, $$rAF, $timeout) {

      var trim = String.prototype.trim;
      var isTouch = 'createTouch' in $window.document;
      var htmlReplaceRegExp = /ng-bind="/ig;
      var $body = angular.element($window.document);

      function TooltipFactory(element, config) {
        //console.log(element)
        var $dateTooltip = {};

        // Common vars
        var nodeName = element[0].nodeName.toLowerCase();
        var options = $dateTooltip.$options = angular.extend({}, defaults, config);
        $dateTooltip.$promise = fetchTemplate(options.template);
        var scope = $dateTooltip.$scope = options.scope && options.scope.$new() || $rootScope.$new();
        if (options.delay && angular.isString(options.delay)) {
          var split = options.delay.split(',').map(parseFloat);
          options.delay = split.length > 1 ? {show: split[0], hide: split[1]} : split[0];
        }

        // Support scope as string options
        if (options.title) {
          scope.title = $sce.trustAsHtml(options.title);
        }

        // Provide scope helpers
        scope.$setEnabled = function (isEnabled) {
          scope.$$postDigest(function () {
            $dateTooltip.setEnabled(isEnabled);
          });
        };
        scope.$hide = function () {
          scope.$$postDigest(function () {
            $dateTooltip.hide();
          });
        };
        scope.$show = function () {
          scope.$$postDigest(function () {
            $dateTooltip.show();
          });
        };
        scope.$toggle = function () {
          scope.$$postDigest(function () {
            $dateTooltip.toggle();
          });
        };
        $dateTooltip.$isShown = scope.$isShown = false;

        // Private vars
        var timeout, hoverState;

        // Support contentTemplate option
        if (options.contentTemplate) {
          $dateTooltip.$promise = $dateTooltip.$promise.then(function (template) {
            var templateEl = angular.element(template);
            return fetchTemplate(options.contentTemplate)
              .then(function (contentTemplate) {
                var contentEl = findElement('[ng-bind="content"]', templateEl[0]);
                if (!contentEl.length) {
                  contentEl = findElement('[ng-bind="title"]', templateEl[0]);
                }
                contentEl.removeAttr('ng-bind').html(contentTemplate);
                return templateEl[0].outerHTML;
              });
          });
        }

        // Fetch, compile then initialize tooltip
        var tipLinker, tipElement, tipTemplate, tipContainer, tipScope;
        $dateTooltip.$promise.then(function (template) {
          if (angular.isObject(template)) {
            template = template.data;
          }
          if (options.html) {
            template = template.replace(htmlReplaceRegExp, 'ng-bind-html="');
          }
          template = trim.apply(template);
          tipTemplate = template;
          tipLinker = $compile(template);
          $dateTooltip.init();
        });

        $dateTooltip.init = function () {

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
          if (options.container === 'self') {
            tipContainer = element;
          } else if (angular.isElement(options.container)) {
            tipContainer = options.container;
          } else if (options.container) {
            tipContainer = findElement(options.container);
          }

          // Options: trigger
          bindTriggerEvents();

          // Options: target
          if (options.target) {
            options.target = (angular.isElement(options.target) ? options.target : findElement(options.target));
          }

          // Options: show
          if (options.show) {
            scope.$$postDigest(function () {
              options.trigger = ('focus' ? element[0].focus() : $dateTooltip.show());
            });
          }

        };

        $dateTooltip.destroy = function () {

          // Unbind events
          unbindTriggerEvents();

          // Remove element
          destroyTipElement();

          // Destroy scope
          scope.$destroy();

        };

        $dateTooltip.enter = function () {

          clearTimeout(timeout);
          hoverState = 'in';
          if (!options.delay || !options.delay.show) {
            return $dateTooltip.show();
          }

          timeout = setTimeout(function () {
            if (hoverState === 'in'){ $dateTooltip.show();}
          }, options.delay.show);

        };

        $dateTooltip.show = function () {
          if (!options.bsEnabled) {return;}

          scope.$emit(options.prefixEvent + '.show.before', $dateTooltip);
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
          if (tipElement) {destroyTipElement();}
          // Fetch a cloned element linked from template
          tipScope = $dateTooltip.$scope.$new();
          tipElement = $dateTooltip.$element = tipLinker(tipScope, function () {});

          // Set the initial positioning.  Make the tooltip invisible
          // so IE doesn't try to focus on it off screen.
          tipElement.css({top: '-9999px', left: '-9999px', display: 'block', visibility: 'hidden'});

          // Options: animation
          if (options.animation) {tipElement.addClass(options.animation);}
          // Options: type
          if (options.type) {tipElement.addClass(options.prefixClass + '-' + options.type);}
          // Options: custom classes
          if (options.customClass){ tipElement.addClass(options.customClass);}

          // Support v1.3+ $animate
          // https://github.com/angular/angular.js/commit/bf0f5502b1bbfddc5cdd2f138efd9188b8c652a9
          var promise = $animate.enter(tipElement, parent, after, enterAnimateCallback);
          if (promise && promise.then) {promise.then(enterAnimateCallback);}

          $dateTooltip.$isShown = scope.$isShown = true;
          safeDigest(scope);
          $$rAF(function () {
            $dateTooltip.$applyPlacement();

            // Once placed, make the tooltip visible
            if (tipElement){tipElement.css({visibility: 'visible'});}
          }); // var a = bodyEl.offsetWidth + 1; ?

          // Bind events
          if (options.keyboard) {
            if (options.trigger !== 'focus') {
              $dateTooltip.focus();
            }
            bindKeyboardEvents();
          }

          if (options.autoClose) {
            bindAutoCloseEvents();
          }

        };

        function enterAnimateCallback() {
          //scope.$emit(options.prefixEvent + '.show', $dateTooltip);
        }

        $dateTooltip.leave = function () {

          clearTimeout(timeout);
          hoverState = 'out';
          if (!options.delay || !options.delay.hide) {
            return $dateTooltip.hide();
          }
          timeout = setTimeout(function () {
            if (hoverState === 'out') {
              $dateTooltip.hide();
            }
          }, options.delay.hide);

        };

        var _blur;
        $dateTooltip.hide = function (blur) {

          if (!$dateTooltip.$isShown) {return;}
          scope.$emit(options.prefixEvent + '.hide.before', $dateTooltip);

          // store blur value for leaveAnimateCallback to use
          _blur = blur;

          // Support v1.3+ $animate
          // https://github.com/angular/angular.js/commit/bf0f5502b1bbfddc5cdd2f138efd9188b8c652a9
          var promise = $animate.leave(tipElement, leaveAnimateCallback);
          if (promise && promise.then) {promise.then(leaveAnimateCallback);}

          $dateTooltip.$isShown = scope.$isShown = false;
          safeDigest(scope);

          // Unbind events
          if (options.keyboard && tipElement !== null) {
            unbindKeyboardEvents();
          }

          if (options.autoClose && tipElement !== null) {
            unbindAutoCloseEvents();
          }
        };

        function leaveAnimateCallback() {
          scope.$emit(options.prefixEvent + '.hide', $dateTooltip);
          // Allow to blur the input when hidden, like when pressing enter key
          if (_blur && options.trigger === 'focus') {
            return element[0].blur();
          }

          // clean up child scopes
          destroyTipElement();
        }

        $dateTooltip.toggle = function () {
          if($dateTooltip.$isShown){
            $dateTooltip.leave();
          }else{
            $dateTooltip.enter();
          }
        };

        $dateTooltip.focus = function () {
          tipElement[0].focus();
        };

        $dateTooltip.setEnabled = function (isEnabled) {
          options.bsEnabled = isEnabled;
        };

        // Protected methods

        $dateTooltip.$applyPlacement = function () {
          if (!tipElement) {return;}

          // Determine if we're doing an auto or normal placement
          var placement = options.placement,
            autoToken = /\s?auto?\s?/i,
            autoPlace = autoToken.test(placement);

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

        $dateTooltip.$onKeyUp = function (evt) {
          if (evt.which === 27 && $dateTooltip.$isShown) {
            $dateTooltip.hide();
            evt.stopPropagation();
          }
        };

        $dateTooltip.$onFocusKeyUp = function (evt) {
          if (evt.which === 27) {
            element[0].blur();
            evt.stopPropagation();
          }
        };

        $dateTooltip.$onFocusElementMouseDown = function (evt) {
          evt.preventDefault();
          evt.stopPropagation();
          // Some browsers do not auto-focus buttons (eg. Safari)
          if($dateTooltip.$isShown){
            element[0].blur();
          }else{
            element[0].focus();
          }
         
        };
        // bind/unbind events
        function bindTriggerEvents() {
          //console.log(triggers)
          var triggers = options.trigger.split(' ');
          angular.forEach(triggers, function (trigger) {
            //console.log(trigger)
            if (trigger === 'click') {
              element.on('click', $dateTooltip.toggle);
            } else if (trigger !== 'manual') {
              element.on(trigger === 'hover' ? 'mouseenter' : 'focus', $dateTooltip.enter);
              element.on(trigger === 'hover' ? 'mouseleave' : 'blur', $dateTooltip.leave);
              /*jshint expr: true*/
              nodeName === 'button' && trigger !== 'hover' && element.on(isTouch ? 'touchstart' : 'mousedown', $dateTooltip.$onFocusElementMouseDown);
            }
          });
        }

        function unbindTriggerEvents() {
          var triggers = options.trigger.split(' ');
          for (var i = triggers.length; i--;) {
            var trigger = triggers[i];
            if (trigger === 'click') {
              element.off('click', $dateTooltip.toggle);
            } else if (trigger !== 'manual') {
              element.off(trigger === 'hover' ? 'mouseenter' : 'focus', $dateTooltip.enter);
              element.off(trigger === 'hover' ? 'mouseleave' : 'blur', $dateTooltip.leave);
              /*jshint expr: true*/
              nodeName === 'button' && trigger !== 'hover' && element.off(isTouch ? 'touchstart' : 'mousedown', $dateTooltip.$onFocusElementMouseDown);
            }
          }
        }

        function bindKeyboardEvents() {
          if (options.trigger !== 'focus') {
            tipElement.on('keyup', $dateTooltip.$onKeyUp);
          } else {
            element.on('keyup', $dateTooltip.$onFocusKeyUp);
          }
        }

        function unbindKeyboardEvents() {
          if (options.trigger !== 'focus') {
            tipElement.off('keyup', $dateTooltip.$onKeyUp);
          } else {
            element.off('keyup', $dateTooltip.$onFocusKeyUp);
          }
        }

        var _autoCloseEventsBinded = false;

        function bindAutoCloseEvents() {
          // use timeout to hookup the events to prevent
          // event bubbling from being processed imediately.
          $timeout(function () {
            // Stop propagation when clicking inside tooltip
            tipElement.on('click', stopEventPropagation);

            // Hide when clicking outside tooltip
            $body.on('click', $dateTooltip.hide);

            _autoCloseEventsBinded = true;
          }, 0, false);
        }

        function unbindAutoCloseEvents() {
          if (_autoCloseEventsBinded) {
            tipElement.off('click', stopEventPropagation);
            $body.off('click', $dateTooltip.hide);
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
            elRect = angular.extend({}, elRect, {
              width: elRect.right - elRect.left,
              height: elRect.bottom - elRect.top
            });
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

          if (!split[1]) {
            return offset;
          }

          // Add support for corners @todo css
          if (split[0] === 'top' || split[0] === 'bottom') {
            switch (split[1]) {
              case 'left':
                offset.left = position.left;
                break;
              case 'right':
                offset.left = position.left + position.width - actualWidth;
            }
          } else if (split[0] === 'left' || split[0] === 'right') {
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
          tipElement.css({top: top + 'px', left: left + 'px'});
        }

        function destroyTipElement() {
          // Cancel pending callbacks
          clearTimeout(timeout);

          if ($dateTooltip.$isShown && tipElement !== null) {
            if (options.autoClose) {
              unbindAutoCloseEvents();
            }

            if (options.keyboard) {
              unbindKeyboardEvents();
            }
          }

          if (tipScope) {
            tipScope.$destroy();
            tipScope = null;
          }

          if (tipElement) {
            tipElement.remove();
            tipElement = $dateTooltip.$element = null;
          }
        }

        return $dateTooltip;

      }

      // Helper functions

      function safeDigest(scope) {
        /*jshint expr: true*/
        scope.$$phase || (scope.$root && scope.$root.$$phase) || scope.$digest();
      }

      function findElement(query, element) {
        return angular.element((element || document).querySelectorAll(query));
      }

      var fetchPromises = {};

      function fetchTemplate(template) {
        if (fetchPromises[template]) {return fetchPromises[template];}
        return (fetchPromises[template] = $q.when($templateCache.get(template) || $http.get(template))
          .then(function (res) {
            if (angular.isObject(res)) {
              $templateCache.put(template, res.data);
              return res.data;
            }
            return res;
          }));
      }

      return TooltipFactory;

    };

  })
  .provider('$datepicker', function () {

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
      startWeek: 1,
      daysOfWeekDisabled: '',
      iconLeft: 'glyphicon glyphicon-chevron-left',
      iconRight: 'glyphicon glyphicon-chevron-right'
    };

    this.$get = function ($window, $document, $rootScope, $sce, dateCalculator, datepickerViews, $dateTooltip, $timeout) {

      var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
      var isTouch = ('createTouch' in $window.document) && isNative;
      if (!defaults.lang) {defaults.lang = 'nl';}

      //console.log(dateCalculator.getDefaultLocale())
      function DatepickerFactory(element, controller, config) {

        var $datepicker = $dateTooltip(element, angular.extend({}, defaults, config));
        var parentScope = config.scope;
        var options = $datepicker.$options;
        var scope = $datepicker.$scope;
        if (options.startView) {options.startView -= options.minView;}

        // View vars

        var pickerViews = datepickerViews($datepicker);
        $datepicker.$views = pickerViews.views;
        var viewDate = pickerViews.viewDate;
        scope.$mode = options.startView;
        scope.$iconLeft = options.iconLeft;
        scope.$iconRight = options.iconRight;
        var $picker = $datepicker.$views[scope.$mode];

        // Scope methods

        scope.$select = function (date) {
          $datepicker.select(date);
        };
        scope.$selectPane = function (value) {
          $datepicker.$selectPane(value);
        };
        scope.$toggleMode = function () {
          $datepicker.setMode((scope.$mode + 1) % $datepicker.$views.length);
        };

        // Public methods

        $datepicker.update = function (date) {
          // console.warn('$datepicker.update() newValue=%o', date);
          if (angular.isDate(date) && !isNaN(date.getTime())) {
            $datepicker.$date = date;
            $picker.update.call($picker, date);
          }
          // Build only if pristine
          $datepicker.$build(true);
        };

        $datepicker.updateDisabledDates = function (dateRanges) {
          options.disabledDateRanges = dateRanges;
          for (var i = 0, l = scope.rows.length; i < l; i++) {
            angular.forEach(scope.rows[i], $datepicker.$setDisabledEl);
          }
        };

        $datepicker.select = function (date, keep) {
          // console.warn('$datepicker.select', date, scope.$mode);
          if (!angular.isDate(controller.$dateValue)) {controller.$dateValue = new Date(date);}
          if (!scope.$mode || keep) {
            controller.$setViewValue(angular.copy(date));
            controller.$render();
            if (options.autoclose && !keep) {
              $timeout(function () {
                $datepicker.hide(true);
              });
            }
          } else {
            angular.extend(viewDate, {year: date.getFullYear(), month: date.getMonth(), date: date.getDate()});
            $datepicker.setMode(scope.$mode - 1);
            $datepicker.$build();
          }
        };

        $datepicker.setMode = function (mode) {
          // console.warn('$datepicker.setMode', mode);
          scope.$mode = mode;
          $picker = $datepicker.$views[scope.$mode];
          $datepicker.$build();
        };

        // Protected methods

        $datepicker.$build = function (pristine) {
          // console.warn('$datepicker.$build() viewDate=%o', viewDate);
          if (pristine === true && $picker.built) {return;}
          if (pristine === false && !$picker.built) {return;}
          $picker.build.call($picker);
        };

        $datepicker.$updateSelected = function () {
          for (var i = 0, l = scope.rows.length; i < l; i++) {
            angular.forEach(scope.rows[i], updateSelected);
          }
        };

        $datepicker.$isSelected = function (date) {
          return $picker.isSelected(date);
        };

        $datepicker.$setDisabledEl = function (el) {
          el.disabled = $picker.isDisabled(el.date);
        };

        $datepicker.$selectPane = function (value) {
          var steps = $picker.steps;
          // set targetDate to first day of month to avoid problems with
          // date values rollover. This assumes the viewDate does not
          // depend on the day of the month
          var targetDate = new Date(Date.UTC(viewDate.year + ((steps.year || 0) * value), viewDate.month + ((steps.month || 0) * value), 1));
          angular.extend(viewDate, {
            year: targetDate.getUTCFullYear(),
            month: targetDate.getUTCMonth(),
            date: targetDate.getUTCDate()
          });
          $datepicker.$build();
        };

        $datepicker.$onMouseDown = function (evt) {
          // Prevent blur on mousedown on .dropdown-menu
          evt.preventDefault();
          evt.stopPropagation();
          // Emulate click for mobile devices
          if (isTouch) {
            var targetEl = angular.element(evt.target);
            if (targetEl[0].nodeName.toLowerCase() !== 'button') {
              targetEl = targetEl.parent();
            }
            targetEl.triggerHandler('click');
          }
        };

        $datepicker.$onKeyDown = function (evt) {
          if (!/(38|37|39|40|13)/.test(evt.keyCode) || evt.shiftKey || evt.altKey) {return;}
          evt.preventDefault();
          evt.stopPropagation();

          if (evt.keyCode === 13) {
            if (!scope.$mode) {
              return $datepicker.hide(true);
            } else {
              return scope.$apply(function () {
                $datepicker.setMode(scope.$mode - 1);
              });
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
        $datepicker.init = function () {
          if (isNative && options.useNative) {
            element.prop('type', 'date');
            element.css('-webkit-appearance', 'textfield');
            return;
          } else if (isTouch) {
            element.prop('type', 'text');
            element.attr('readonly', 'true');
            element.on('click', focusElement);
          }
          _init();
        };

        var _destroy = $datepicker.destroy;
        $datepicker.destroy = function () {
          if (isNative && options.useNative) {
            element.off('click', focusElement);
          }
          _destroy();
        };

        var _show = $datepicker.show;
        $datepicker.show = function () {
          _show();
          // use timeout to hookup the events to prevent
          // event bubbling from being processed imediately.
          $timeout(function () {
            $datepicker.$element.on(isTouch ? 'touchstart' : 'mousedown', $datepicker.$onMouseDown);
            if (options.keyboard) {
              element.on('keydown', $datepicker.$onKeyDown);
            }
          }, 0, false);
        };

        var _hide = $datepicker.hide;
        $datepicker.hide = function (blur) {
          if (!$datepicker.$isShown) {return;}
          $datepicker.$element.off(isTouch ? 'touchstart' : 'mousedown', $datepicker.$onMouseDown);
          if (options.keyboard) {
            element.off('keydown', $datepicker.$onKeyDown);
          }
          _hide(blur);
        };

        return $datepicker;

      }

      DatepickerFactory.defaults = defaults;
      return DatepickerFactory;

    };

  })
  .directive('tinkDatepicker',['$window','$parse','$q','dateCalculator','$dateParser','$datepicker', function ($window, $parse, $q, dateCalculator, $dateParser, $datepicker) {

   var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);

    return {
      restrict: 'EAC',
      require: 'ngModel',
      priority:80,
      link: function postLink(scope, element, attr, controller) {

        // Directive options
        var options = {scope: scope, controller: controller};
        angular.forEach(['placement', 'container', 'delay', 'trigger', 'keyboard', 'html', 'animation', 'template', 'autoclose', 'dateType', 'dateFormat', 'modelDateFormat', 'dayFormat', 'strictFormat', 'startWeek', 'startDate', 'useNative', 'lang', 'startView', 'minView', 'iconLeft', 'iconRight', 'daysOfWeekDisabled'], function (key) {
          if (angular.isDefined(attr[key])){options[key] = attr[key];}
        });

        // Visibility binding support
        /*jshint expr: true*/
        attr.bsShow && scope.$watch(attr.bsShow, function (newValue) {
          if (!datepicker || !angular.isDefined(newValue)) {return;}
          if (angular.isString(newValue)) {newValue = !!newValue.match(/true|,?(datepicker),?/i);}
          /*jshint expr: true*/
          newValue === true ? datepicker.show() : datepicker.hide();
        });

        // Initialize datepicker
        var datepicker = $datepicker(element, controller, options);
        options = datepicker.$options;
        // Set expected iOS format
        if (isNative && options.useNative) {options.dateFormat = 'yyyy-MM-dd';}

        var lang = options.lang;
        //console.log("lang", lang)

        var formatDate = function (date, format) {
          return dateCalculator.formatDate(date, format, lang);
        };

        var dateParser = $dateParser({format: options.dateFormat, lang: lang, strict: options.strictFormat});

        // Observe attributes for changes
        angular.forEach(['minDate', 'maxDate'], function (key) {
          // console.warn('attr.$observe(%s)', key, attr[key]);
          angular.isDefined(attr[key]) && attr.$observe(key, function (newValue) {
            // console.warn('attr.$observe(%s)=%o', key, newValue);
            datepicker.$options[key] = dateParser.getDateForAttribute(key, newValue);
            // Build only if dirty
            !isNaN(datepicker.$options[key]) && datepicker.$build(false);
            validateAgainstMinMaxDate(controller.$dateValue);
          });
        });

        // Watch model for changes
        scope.$watch(attr.ngModel, function () {
          datepicker.update(controller.$dateValue);
        }, true);

        // Normalize undefined/null/empty array,
        // so that we don't treat changing from undefined->null as a change.
        function normalizeDateRanges(ranges) {
          if (!ranges || !ranges.length) {return null;}
          return ranges;
        }

        if (angular.isDefined(attr.disabledDates)) {
          scope.$watch(attr.disabledDates, function (disabledRanges, previousValue) {
            disabledRanges = normalizeDateRanges(disabledRanges);
            previousValue = normalizeDateRanges(previousValue);

            if (disabledRanges) {
              datepicker.updateDisabledDates(disabledRanges);
            }
          });
        }

        function validateAgainstMinMaxDate(parsedDate) {
          if (!angular.isDate(parsedDate)){return;}
          var isMinValid = isNaN(datepicker.$options.minDate) || parsedDate.getTime() >= datepicker.$options.minDate;
          var isMaxValid = isNaN(datepicker.$options.maxDate) || parsedDate.getTime() <= datepicker.$options.maxDate;
          var isValid = isMinValid && isMaxValid;
          controller.$setValidity('date', isValid);
          controller.$setValidity('min', isMinValid);
          controller.$setValidity('max', isMaxValid);
          // Only update the model when we have a valid date
          if (isValid) {controller.$dateValue = parsedDate;}
        }

        // viewValue -> $parsers -> modelValue
        controller.$parsers.unshift(function (viewValue) {
          // console.warn('$parser("%s"): viewValue=%o', element.attr('ng-model'), viewValue);
          // Null values should correctly reset the model value & validity
          if (!viewValue) {
            controller.$setValidity('date', true);
            // BREAKING CHANGE:
            // return null (not undefined) when input value is empty, so angularjs 1.3
            // ngModelController can go ahead and run validators, like ngRequired
            return null;
          }
          var parsedDate = dateParser.parse(viewValue, controller.$dateValue);
          if (!parsedDate || isNaN(parsedDate.getTime())) {
            controller.$setValidity('date', false);
            // return undefined, causes ngModelController to
            // invalidate model value
            return;
          } else {
            validateAgainstMinMaxDate(parsedDate);
          }
          if (options.dateType === 'string') {
            return formatDate(parsedDate, options.modelDateFormat || options.dateFormat);
          } else if (options.dateType === 'number') {
            return controller.$dateValue.getTime();
          } else if (options.dateType === 'iso') {
            return controller.$dateValue.toISOString();
          } else {
            return new Date(controller.$dateValue);
          }
        });

        // modelValue -> $formatters -> viewValue
        controller.$formatters.push(function (modelValue) {
          // console.warn('$formatter("%s"): modelValue=%o (%o)', element.attr('ng-model'), modelValue, typeof modelValue);
          var date;
          if (angular.isUndefined(modelValue) || modelValue === null) {
            date = NaN;
          } else if (angular.isDate(modelValue)) {
            date = modelValue;
          } else if (options.dateType === 'string') {
            date = dateParser.parse(modelValue, null, options.modelDateFormat);
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
        controller.$render = function () {
          // console.warn('$render("%s"): viewValue=%o', element.attr('ng-model'), controller.$viewValue);
          element.val(getDateFormattedString());
        };

        function getDateFormattedString() {
          return !controller.$dateValue || isNaN(controller.$dateValue.getTime()) ? '' : formatDate(controller.$dateValue, options.dateFormat);
        }

        // Garbage collection
        scope.$on('$destroy', function () {
          if (datepicker){datepicker.destroy();}
          options = null;
          datepicker = null;
        });

      }
    };

  }])
  .provider('datepickerViews', function () {


    // Split array into smaller arrays
    function split(arr, size) {
      //console.log(arr, size)
      var arrays = [];
      while (arr.length > 0) {
        arrays.push(arr.splice(0, size));
      }
      return arrays;
    }

    // Modulus operator
    function mod(n, m) {
      return ((n % m) + m) % m;
    }

    this.$get = function (dateCalculator, $dateParser, $sce) {

      return function (picker) {

        var scope = picker.$scope;
        var options = picker.$options;

        var lang = options.lang;
        var formatDate = function (date, format) {
          return dateCalculator.formatDate(date, format, lang);
        };
        var dateParser = $dateParser({format: options.dateFormat, lang: lang, strict: options.strictFormat});

        var weekDaysMin = dateCalculator.getShortDays(lang);
        var weekDaysLabels = weekDaysMin.slice(options.startWeek).concat(weekDaysMin.slice(0, options.startWeek));
        var weekDaysLabelsHtml = $sce.trustAsHtml('<th class="dow text-center">' + weekDaysLabels.join('</th><th class="dow text-center">') + '</th>');

        var startDate = picker.$date || (options.startDate ? dateParser.getDateForAttribute('startDate', options.startDate) : new Date());
        var viewDate = {year: startDate.getFullYear(), month: startDate.getMonth(), date: startDate.getDate()};

        var views = [
          {
            format: options.dayFormat,
            split: 7,
            steps: {month: 1},
            update: function (date, force) {
              if (!this.built || force || date.getFullYear() !== viewDate.year || date.getMonth() !== viewDate.month) {
                angular.extend(viewDate, {
                  year: picker.$date.getFullYear(),
                  month: picker.$date.getMonth(),
                  date: picker.$date.getDate()
                });
                picker.$build();
              } else if (date.getDate() !== viewDate.date) {
                viewDate.date = picker.$date.getDate();
                picker.$updateSelected();
              }
            },
            build: function () {
              var firstDayOfMonth = new Date(viewDate.year, viewDate.month, 1), firstDayOfMonthOffset = firstDayOfMonth.getTimezoneOffset();
              var firstDate = new Date(+firstDayOfMonth - mod(firstDayOfMonth.getDay() - options.startWeek, 7) * 864e5), firstDateOffset = firstDate.getTimezoneOffset();
              //console.log(firstDate)
              var today = new Date().toDateString();

              // Handle daylight time switch
              if (firstDateOffset !== firstDayOfMonthOffset) {firstDate = new Date(+firstDate + (firstDateOffset - firstDayOfMonthOffset) * 60e3);}
              var daysToDraw = dateCalculator.daysInMonth(viewDate.month + 1, viewDate.year) + dateCalculator.daysBetween(firstDate, firstDayOfMonth);
              if (daysToDraw % 7 !== 0) {
                daysToDraw += 7 - (daysToDraw % 7);
              }
              //console.log(dateCalculator.daysInMonth(viewDate.month + 1, viewDate.year), dateCalculator.daysBetween(firstDate, firstDayOfMonth), 7 - (daysToDraw % 7))
              var days = [], day;
              for (var i = 0; i < daysToDraw; i++) { // < 7 * 6
                day = dateParser.daylightSavingAdjust(new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + i));
                days.push({
                  date: day,
                  isToday: day.toDateString() === today,
                  label: formatDate(day, this.format),
                  selected: picker.$date && this.isSelected(day),
                  muted: day.getMonth() !== viewDate.month,
                  disabled: this.isDisabled(day)
                });
              }
              scope.title = formatDate(firstDayOfMonth, options.monthTitleFormat);
              scope.showLabels = true;
              scope.labels = weekDaysLabelsHtml;
              scope.rows = split(days, this.split);
              this.built = true;
            },
            isSelected: function (date) {
              return picker.$date && date.getFullYear() === picker.$date.getFullYear() && date.getMonth() === picker.$date.getMonth() && date.getDate() === picker.$date.getDate();
            },
            isDisabled: function (date) {
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
            onKeyDown: function (evt) {
              if (!picker.$date) {
                return;
              }
              var actualTime = picker.$date.getTime();
              var newDate;

              if (evt.keyCode === 37){newDate = new Date(actualTime - 1 * 864e5);}
              else if (evt.keyCode === 38) {newDate = new Date(actualTime - 7 * 864e5);}
              else if (evt.keyCode === 39) {newDate = new Date(actualTime + 1 * 864e5);}
              else if (evt.keyCode === 40) {newDate = new Date(actualTime + 7 * 864e5);}

              if (!this.isDisabled(newDate)) {picker.select(newDate, true);}
            }
          },
          {
            name: 'month',
            format: options.monthFormat,
            split: 4,
            steps: {year: 1},
            update: function (date) {
              if (!this.built || date.getFullYear() !== viewDate.year) {
                angular.extend(viewDate, {
                  year: picker.$date.getFullYear(),
                  month: picker.$date.getMonth(),
                  date: picker.$date.getDate()
                });
                picker.$build();
              } else if (date.getMonth() !== viewDate.month) {
                angular.extend(viewDate, {month: picker.$date.getMonth(), date: picker.$date.getDate()});
                picker.$updateSelected();
              }
            },
            build: function () {
              var months = [], month;
              for (var i = 0; i < 12; i++) {
                month = new Date(viewDate.year, i, 1);
                months.push({
                  date: month,
                  label: dateCalculator.getShortMonths(lang)[i],
                  selected: picker.$isSelected(month),
                  disabled: this.isDisabled(month)
                });
              }
              scope.title = formatDate(month, options.yearTitleFormat);
              scope.showLabels = false;
              scope.rows = split(months, this.split);
              this.built = true;
            },
            isSelected: function (date) {
              return picker.$date && date.getFullYear() === picker.$date.getFullYear() && date.getMonth() === picker.$date.getMonth();
            },
            isDisabled: function (date) {
              var lastDate = +new Date(date.getFullYear(), date.getMonth() + 1, 0);
              return lastDate < options.minDate || date.getTime() > options.maxDate;
            },
            onKeyDown: function (evt) {
              if (!picker.$date) {
                return;
              }
              var actualMonth = picker.$date.getMonth();
              var newDate = new Date(picker.$date);

              if (evt.keyCode === 37) {newDate.setMonth(actualMonth - 1);}
              else if (evt.keyCode === 38){newDate.setMonth(actualMonth - 4);}
              else if (evt.keyCode === 39) {newDate.setMonth(actualMonth + 1);}
              else if (evt.keyCode === 40) {newDate.setMonth(actualMonth + 4);}

              if (!this.isDisabled(newDate)) {picker.select(newDate, true);}
            }
          },
          {
            name: 'year',
            format: options.yearFormat,
            split: 4,
            steps: {year: 12},
            update: function (date, force) {
              if (!this.built || force || parseInt(date.getFullYear() / 20, 10) !== parseInt(viewDate.year / 20, 10)) {
                angular.extend(viewDate, {
                  year: picker.$date.getFullYear(),
                  month: picker.$date.getMonth(),
                  date: picker.$date.getDate()
                });
                picker.$build();
              } else if (date.getFullYear() !== viewDate.year) {
                angular.extend(viewDate, {
                  year: picker.$date.getFullYear(),
                  month: picker.$date.getMonth(),
                  date: picker.$date.getDate()
                });
                picker.$updateSelected();
              }
            },
            build: function () {
              var firstYear = viewDate.year - viewDate.year % (this.split * 3);
              var years = [], year;
              for (var i = 0; i < 12; i++) {
                year = new Date(firstYear + i, 0, 1);
                years.push({
                  date: year,
                  label: formatDate(year, this.format),
                  selected: picker.$isSelected(year),
                  disabled: this.isDisabled(year)
                });
              }
              scope.title = years[0].label + '-' + years[years.length - 1].label;
              scope.showLabels = false;
              scope.rows = split(years, this.split);
              this.built = true;
            },
            isSelected: function (date) {
              return picker.$date && date.getFullYear() === picker.$date.getFullYear();
            },
            isDisabled: function (date) {
              var lastDate = +new Date(date.getFullYear() + 1, 0, 0);
              return lastDate < options.minDate || date.getTime() > options.maxDate;
            },
            onKeyDown: function (evt) {
              if (!picker.$date) {
                return;
              }
              var actualYear = picker.$date.getFullYear(),
                newDate = new Date(picker.$date);

              if (evt.keyCode === 37) {newDate.setYear(actualYear - 1);}
              else if (evt.keyCode === 38) {newDate.setYear(actualYear - 4);}
              else if (evt.keyCode === 39) {newDate.setYear(actualYear + 1);}
              else if (evt.keyCode === 40) {newDate.setYear(actualYear + 4);}

              if (!this.isDisabled(newDate)) {picker.select(newDate, true);}
            }
          }
        ];

        return {
          views: options.minView ? Array.prototype.slice.call(views, options.minView) : views,
          viewDate: viewDate
        };

      };

    };

  })
  .provider('$dateParser', [function () {

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

    ParseDate.prototype.setMilliseconds = function (value) {
      this.milliseconds = value;
    };
    ParseDate.prototype.setSeconds = function (value) {
      this.seconds = value;
    };
    ParseDate.prototype.setMinutes = function (value) {
      this.minutes = value;
    };
    ParseDate.prototype.setHours = function (value) {
      this.hours = value;
    };
    ParseDate.prototype.getHours = function () {
      return this.hours;
    };
    ParseDate.prototype.setDate = function (value) {
      this.day = value;
    };
    ParseDate.prototype.setMonth = function (value) {
      this.month = value;
    };
    ParseDate.prototype.setFullYear = function (value) {
      this.year = value;
    };
    ParseDate.prototype.fromDate = function (value) {
      this.year = value.getFullYear();
      this.month = value.getMonth();
      this.day = value.getDate();
      this.hours = value.getHours();
      this.minutes = value.getMinutes();
      this.seconds = value.getSeconds();
      this.milliseconds = value.getMilliseconds();
      return this;
    };

    ParseDate.prototype.toDate = function () {
      return new Date(this.year, this.month, this.day, this.hours, this.minutes, this.seconds, this.milliseconds);
    };

    var proto = ParseDate.prototype;

    function noop() {
    }

    function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function indexOfCaseInsensitive(array, value) {
      var len = array.length, str = value.toString().toLowerCase();
      for (var i = 0; i < len; i++) {
        if (array[i].toLowerCase() === str) {
          return i;
        }
      }
      return -1; // Return -1 per the "Array.indexOf()" method.
    }

    var defaults = this.defaults = {
      format: 'shortDate',
      strict: false
    };

    this.$get = function ($locale, dateFilter) {

      var DateParserFactory = function (config) {

        var options = angular.extend({}, defaults, config);

        var $dateParser = {};

        var regExpMap = {
          'sss': '[0-9]{3}',
          'ss': '[0-5][0-9]',
          's': options.strict ? '[1-5]?[0-9]' : '[0-9]|[0-5][0-9]',
          'mm': '[0-5][0-9]',
          'm': options.strict ? '[1-5]?[0-9]' : '[0-9]|[0-5][0-9]',
          'HH': '[01][0-9]|2[0-3]',
          'H': options.strict ? '1?[0-9]|2[0-3]' : '[01]?[0-9]|2[0-3]',
          'hh': '[0][1-9]|[1][012]',
          'h': options.strict ? '[1-9]|1[012]' : '0?[1-9]|1[012]',
          'a': 'AM|PM',
          'EEEE': $locale.DATETIME_FORMATS.DAY.join('|'),
          'EEE': $locale.DATETIME_FORMATS.SHORTDAY.join('|'),
          'dd': '0[1-9]|[12][0-9]|3[01]',
          'd': options.strict ? '[1-9]|[1-2][0-9]|3[01]' : '0?[1-9]|[1-2][0-9]|3[01]',
          'MMMM': $locale.DATETIME_FORMATS.MONTH.join('|'),
          'MMM': $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
          'MM': '0[1-9]|1[012]',
          'M': options.strict ? '[1-9]|1[012]' : '0?[1-9]|1[012]',
          'yyyy': '[1]{1}[0-9]{3}|[2]{1}[0-9]{3}',
          'yy': '[0-9]{2}',
          'y': options.strict ? '-?(0|[1-9][0-9]{0,3})' : '-?0*[0-9]{1,4}',
        };

        var setFnMap = {
          'sss': proto.setMilliseconds,
          'ss': proto.setSeconds,
          's': proto.setSeconds,
          'mm': proto.setMinutes,
          'm': proto.setMinutes,
          'HH': proto.setHours,
          'H': proto.setHours,
          'hh': proto.setHours,
          'h': proto.setHours,
          'EEEE': noop,
          'EEE': noop,
          'dd': proto.setDate,
          'd': proto.setDate,
          'a': function (value) {
            var hours = this.getHours() % 12;
            return this.setHours(value.match(/pm/i) ? hours + 12 : hours);
          },
          'MMMM': function (value) {
            return this.setMonth(indexOfCaseInsensitive($locale.DATETIME_FORMATS.MONTH, value));
          },
          'MMM': function (value) {
            return this.setMonth(indexOfCaseInsensitive($locale.DATETIME_FORMATS.SHORTMONTH, value));
          },
          'MM': function (value) {
            return this.setMonth(1 * value - 1);
          },
          'M': function (value) {
            return this.setMonth(1 * value - 1);
          },
          'yyyy': proto.setFullYear,
          'yy': function (value) {
            return this.setFullYear(2000 + 1 * value);
          },
          'y': proto.setFullYear
        };

        var regex, setMap;

        $dateParser.init = function () {
          $dateParser.$format = $locale.DATETIME_FORMATS[options.format] || options.format;
          regex = regExpForFormat($dateParser.$format);
          setMap = setMapForFormat($dateParser.$format);
        };

        $dateParser.isValid = function (date) {
          if (angular.isDate(date)) {return !isNaN(date.getTime());}
          return regex.test(date);
        };

        $dateParser.parse = function (value, baseDate, format) {
          // check for date format special names
          if (format) {format = $locale.DATETIME_FORMATS[format] || format;}
          if (angular.isDate(value)) {value = dateFilter(value, format || $dateParser.$format);}
          var formatRegex = format ? regExpForFormat(format) : regex;
          var formatSetMap = format ? setMapForFormat(format) : setMap;
          var matches = formatRegex.exec(value);
          if (!matches){return false;}
          // use custom ParseDate object to set parsed values
          var date = baseDate && !isNaN(baseDate.getTime()) ? new ParseDate().fromDate(baseDate) : new ParseDate().fromDate(new Date(1970, 0, 1, 0));
          for (var i = 0; i < matches.length - 1; i++) {
            /*jshint expr: true*/
            formatSetMap[i] && formatSetMap[i].call(date, matches[i + 1]);
          }
          // convert back to native Date object
          return date.toDate();
        };

        $dateParser.getDateForAttribute = function (key, value) {
          var date;

          if (value === 'today') {
            var today = new Date();
            date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (key === 'maxDate' ? 1 : 0), 0, 0, 0, (key === 'minDate' ? 0 : -1));
          } else if (angular.isString(value) && value.match(/^".+"$/)) { // Support {{ dateObj }}
            date = new Date(value.substr(1, value.length - 2));
          } else if (isNumeric(value)) {
            date = new Date(parseInt(value, 10));
          } else if (angular.isString(value) && 0 === value.length) { // Reset date
            date = key === 'minDate' ? -Infinity : +Infinity;
          } else {
            date = new Date(value);
          }

          return date;
        };

        $dateParser.getTimeForAttribute = function (key, value) {
          var time;

          if (value === 'now') {
            time = new Date().setFullYear(1970, 0, 1);
          } else if (angular.isString(value) && value.match(/^".+"$/)) {
            time = new Date(value.substr(1, value.length - 2)).setFullYear(1970, 0, 1);
          } else if (isNumeric(value)) {
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
        $dateParser.daylightSavingAdjust = function (date) {
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
          for (i = 0; i < keys.length; i++) {
            if (format.split(keys[i]).length > 1) {
              var index = clonedFormat.search(keys[i]);
              format = format.split(keys[i]).join('');
              if (setFnMap[keys[i]]) {
                map[index] = setFnMap[keys[i]];
              }
            }
          }
          // Sort result map
          angular.forEach(map, function (v) {
            // conditional required since angular.forEach broke around v1.2.21
            // related pr: https://github.com/angular/angular.js/pull/8525
            if (v) {sortedMap.push(v);}
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
          for (i = 0; i < keys.length; i++) {
            re = re.split(keys[i]).join('${' + i + '}');
          }
          // Replace abstracted values
          for (i = 0; i < keys.length; i++) {
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

  }]);
 ;'use strict';
    angular.module('tink.datepickerRange', ['tink.dateHelper','tink.safeApply'])
    .directive('tinkDatepickerRange',['$q', '$templateCache', '$http', 'calView', '$sce','$compile','dateCalculator','$window','safeApply', function ($q, $templateCache, $http, calView, $sce,$compile,dateCalculator,$window,safeApply) {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'templates/tinkDatePickerRangeInputs.html',
        scope: {
          firstDate: '=',
          lastDate: '='
        },
        link: function postLink(scope, element) {

             // -- check if we are using a touch device  --/
             var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
             var isTouch = ('createTouch' in $window.document) && isNative;

            // labels for the days you can make this variable //
            var dayLabels = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
             // -- create the labels  --/
             scope.dayLabels = $sce.trustAsHtml('<th>' + dayLabels.join('</th><th>') + '</th>');
            // Add a watch to know when input changes from the outside //

            scope.$watch('firstDate', function (newDate, oldDate) {
              var date;
              if (newDate !== oldDate && angular.isDefined(newDate) && newDate !== null) {
                if (angular.isDate(newDate)) {
                  date = newDate;
                  setViewDate(newDate);
                } else {
                  try {
                    date = dateCalculator.getDate(newDate, config.dateFormat);
                    scope.firstDate = date;
                    //setViewDate(date);
                  } catch (e) {
                    scope.firstDate = null;
                  }
                }
                stopWatch();
                scope.firstDateModel = dateCalculator.format(date, config.dateFormat);
                startWatch();
              }else{
                stopWatch();
                scope.firstDateModel = '';
                refreshView();
                startWatch();
              }

            });

            // Add a watch to know when input changes from the outside //
            scope.$watch('lastDate', function (newDate, oldDate) {
              if (newDate !== oldDate && angular.isDefined(newDate) && newDate !== null) {
                if (angular.isDate(newDate)) {
                 setViewDate(newDate);
               } else {
                try {
                  var date = dateCalculator.getDate(newDate, config.dateFormat);
                  scope.lastDate = date;
                  setViewDate(date);
                } catch (e) {
                  scope.lastDate = null;
                }
              }
              stopWatch();
              scope.lastDateModel = dateCalculator.format(scope.lastDate, config.dateFormat);
              startWatch();
            }else{
              stopWatch();
              scope.lastDateModel = '';
              buildView();
              startWatch();
            }
          });

            var firstDateWatch=null,lastDateWatch = null;


            function startWatch(){
              firstDateWatch =  scope.$watch('firstDateModel',function(newDate,oldDate){
                if(newDate !== oldDate){
                  scope.$select(newDate,config.dateFormat,true);
                }
              });

              lastDateWatch = scope.$watch('lastDateModel',function(newDate,oldDate){
               if(newDate !== oldDate){
                  scope.$select(newDate,config.dateFormat,true);
                }
            });

            }
startWatch();
            function stopWatch(){
              firstDateWatch();
              lastDateWatch();
            }

              // -- the config is for the devolopers to change ! for in the future  --/
              // -- the $directive is four the directive hehehe ;) to keep track of stuff --/
    var
    config = {
      dateFormat: 'dd/mm/yyyy'
    },
    $directive = {
      open: false,
      focused: {firstDateElem: element[0].children[0], lastDateElem: element[0].children[1]},
      tbody:{firstDateElem:null,lastDateElem:null},
      focusedModel: null,
      selectedDates: {first: scope.firstDate, last: scope.lastDate},
      valid:{firstDateElem:false,lastDateElem:false},
      mouse: 0,
      viewDate: new Date(),
      hardCodeFocus: false
    },
    fetchPromises = {};
          /*angular.element($directive.focused.firstDateElem).bind('input',function(){
            scope.$apply(function(date){
              scope.firstDate = date.firstDateModel;
            });
          });
          angular.element($directive.focused.lastDateElem).bind('input',function(){
            scope.$apply(function(date){
              scope.lastDate = date.lastDateModel;
            });
          });*/

            // -- This builds the view --/
            function buildView() {

               // -- Retrieve the elements we want to change ! we have to do this because we replace the tbodys !  --/
               $directive.tbody.firstDateElem = element.find('tbody')[0];
               $directive.tbody.lastDateElem = element.find('tbody')[1];

              // -- Create the first calendar --/
              var htmlFirst = calView.createMonthDays($directive.viewDate, scope.firstDate, scope.lastDate);
               // -- Replace and COMPILE the nieuw calendar view  --/
               angular.element($directive.tbody.firstDateElem).replaceWith($compile( htmlFirst)( scope ));

               // -- Copy the viewDate ! COPY otherwhise you got problems, because of refenties and stuff ;-)  --/
    var copyViewDate = new Date($directive.viewDate);
               // -- add a month  --/
               copyViewDate.setMonth(copyViewDate.getMonth() + 1);

               // -- place the right titles in the scope  --/
               scope.firstTitle = dateCalculator.format($directive.viewDate, 'mmmm yyyy');
               scope.lastTitle = dateCalculator.format(copyViewDate, 'mmmm yyyy');

              // -- create the second view   --/
              var htmlLast = calView.createMonthDays(copyViewDate, scope.firstDate, scope.lastDate);
               // -- compile and replace the second view   --/
               angular.element($directive.tbody.lastDateElem).replaceWith($compile( htmlLast)( scope ));

             }

            // -- refresh the view --/
            function refreshView() {
              buildView();
            }

            // -- to change the month of the calender --/
            function nextMonth() {
              // -- add one month to the viewDate --/
              $directive.viewDate.setMonth($directive.viewDate.getMonth() + 1);
              // -- reload the viewdate :P  --/
              setViewDate($directive.viewDate);
            }
            // -- to change the month of the calender --/
            function prevMonth() {
              // -- remove one month from the viewDate --/
              $directive.viewDate.setMonth($directive.viewDate.getMonth() - 1);
               // -- reload the viewdate woopwoop  --/
               setViewDate($directive.viewDate);
             }

             // -- function to build the view again  --/
             function setViewDate(viewDate) {
             // try {
               // -- check if there is a date given  --/
               if (angular.isDate(viewDate) && viewDate !== null) {
                if (angular.isDate(viewDate)) {

                  var hulpDate = new Date(viewDate.getTime());
                  hulpDate.setMonth(hulpDate.getMonth()-1);

                  if(!dateCalculator.isSameMonth(viewDate,$directive.viewDate) && !dateCalculator.isSameMonth(hulpDate,$directive.viewDate)){
                        // -- change the global variable  --/
                        $directive.viewDate = new Date(viewDate);
                      }
                       // -- build the entire view  --/
                       buildView();

                     } else {
                      console.logerror('Wrong date');
                    }
                  }else {

                  }
            //  } catch (e) {
             //   console.log(e);
             // }
           }

            // -- To load the template for the popup but we can change this ! no html file is better
            // if it is finished we can but it in the javascript file with $cacheTemplate --/
            function haalTemplateOp(template) {
              // --- if the template already is in our app cache return it. //
              if (fetchPromises[template]){
                return fetchPromises[template];
              }
              // --- If not get the template from templatecache or http. //
              return (fetchPromises[template] = $q.when($templateCache.get(template) || $http.get(template))
                .then(function (res) {
                  // --- When the template is retrieved return it. //
                  if (angular.isObject(res)) {
                    $templateCache.put(template, res.data);
                    return res.data;
                  }
                  return res;
                }));
            }
            var templateElem;
            var promise = haalTemplateOp('templates/tinkDatePickerRange.html');
            // --- when the data is loaded //
            promise.then(function (template) {
              if (angular.isObject(template)){
                template = template.data;
              }
              // --- store the html we retrieved //
              templateElem = $compile(template);
              templateElem = templateElem(scope, function () {});
              templateElem.css({position: 'absolute', display: 'none'});
              element.append(templateElem);
              init();
            });

            function init() {
              if (isTouch) {
                angular.element($directive.focused.firstDateElem).attr('readonly', 'true');
                angular.element($directive.focused.lastDateElem).attr('readonly', 'true');
              }
              bindEvents();
            }

            scope.$select = function (el,format,clear) {
              if(!angular.isDefined(format)){
                  format = 'yyyy/mm/dd';
              }
              var date = dateCalculator.getDate(el,format);
              if ($directive.focusedModel !== null) {
                if ($directive.focusedModel === 'firstDateElem') {
                  scope.firstDate = date;
                  if(!angular.isDate(scope.lastDate)){
                    $directive.focused.lastDateElem.focus();
                  }else{
                    if(!clear && dateCalculator.dateBeforeOther(scope.firstDate,scope.lastDate)){
                      scope.lastDate = null;
                      $directive.focused.lastDateElem.focus();
                    }
                  }   

                } else if ($directive.focusedModel === 'lastDateElem') {
                  scope.lastDate = date;
                  if(!angular.isDate(scope.firstDate)){
                    $directive.focused.firstDateElem.focus();
                  }else{
                    if(!clear && dateCalculator.dateBeforeOther(scope.firstDate,scope.lastDate)){
                      scope.firstDate = null;
                      $directive.focused.firstDateElem.focus();
                    }
                  }

                }

              }
            };

            function $onMouseDown (evt) {
              if (evt.target.nodeName === 'INPUT') {
                evt.target.focus();
                if(isTouch){
                  evt.preventDefault();
                  evt.stopPropagation();
                }
              }else{
                evt.preventDefault();
                evt.stopPropagation();
              }

              if(isTouch){
                var targetEl = angular.element(evt.target);

                if (targetEl[0].nodeName.toLowerCase() !== 'button') {
                  targetEl = targetEl.parent();
                }
                targetEl.triggerHandler('click');
              }
            }

            scope.$selectPane = function (value) {

              if (value) {
                nextMonth();
              } else {
                prevMonth();
              }
            };

            function hide(evt) {
              if(!(evt.relatedTarget && evt.relatedTarget.nodeName === 'INPUT')){
                templateElem.css({display: 'none'});
                $directive.open = false;
                $directive.focusedModel = null;
              }
            }

            // -- event liseners to know if you are hitting the right elements --/
            element.on('mouseleave', function () {
              $directive.mouse = 0;
            });
            element.on('mouseenter', function () {
              $directive.mouse = 1;
            });

            function bindEvents() {
              element.bind('click', function (evt) {
                evt.stopPropagation();
              });


              element.bind('touchstart mousedown',$onMouseDown);

              angular.element($directive.focused.firstDateElem).on('blur', hide);
              angular.element($directive.focused.lastDateElem).on('blur', hide);

              angular.element($directive.focused.firstDateElem).on('focus', function () {
                $directive.focusedModel = 'firstDateElem';
                safeApply(scope,show);

              });
              angular.element($directive.focused.lastDateElem).on('focus', function () {
                $directive.focusedModel = 'lastDateElem';
                safeApply(scope,show);

              });
            }


            function show() {
              if (!$directive.open) {
              // -- check if there is an input field focused --/
              if ($directive.focusedModel !== null) {

                // -- if firstelement is focused and we have an corret date show that date --/
                if ($directive.focusedModel === 'firstDateElem' && angular.isDate(scope.firstDate)) {
                 setViewDate(scope.firstDate);
               }else if($directive.focusedModel === 'firstDateElem' && angular.isDate(scope.lastDate)){
                 setViewDate(scope.lastDate);
               } else if($directive.focusedModel === 'lastDateElem' && angular.isDate(scope.lastDate)){
                 setViewDate(scope.lastDate);
               } else if($directive.focusedModel === 'lastDateElem' && angular.isDate(scope.firstDate)){
                 setViewDate(scope.firstDate);
               }else{
                setViewDate(new Date());
              }

            }else{
                // -- no inputfield focused ! so take the date of today --/
                setViewDate(new Date());
              }




              $directive.open = true;
              templateElem.css({display: 'block'});
            }

          }

        }
      };
    }]);;  'use strict';
  angular.module('tink.header', []);
  angular.module('tink.header')
  .provider('tinkApi', function () {
  var _options = {};

  return {
    setOptions: function (options) {
      angular.extend(_options, options);
    },
    getOptions: function () {
      return angular.copy(_options);
    },
    $get: ['$window', function ($window) {
      console.log($window)
      if($window.tinkApi){
        return $window.tinkApi;
      }
      
    }]
  };
}).directive('navHeader',['$document','$window','tinkApi',function($document,$window,tinkApi){

   return {
    restrict:'AE',
    priority:99,
    link:function(scope,elem){
     var changeHeight = function(){
      var height = elem[0].clientHeight;
      angular.element($document[0].body).css({ 'padding-top': height+'px' });
    };
    var toggle = angular.element(elem[0].querySelector('li.toggle'))
      angular.element(toggle[0].querySelector('a'))[0].href = 'javascript:void(0)';
     
      toggle.bind("click", function(){
        tinkApi.sideNavigation().toggleMenu();
        console.log("go go")
      });
    changeHeight();
    angular.element($window).bind('resize',changeHeight);

  }
};
}]);;;'use strict';
angular.module('tink.popOver', ['tink.tooltip'])
.directive( 'tinkPopoverPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'templates/popover.html'
  };
})
.directive( 'tinkPopover', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'tinkPopover', 'tinkPopover', 'click' );
}]);;'use strict';
angular.module('tink.tooltip', [])
.provider( '$tooltip', function () {
  // The default options tooltip and popover.
  var defaultOptions = {
    placement: 'top',
    animation: true,
    popupDelay: 0
  };

  // Default hide triggers for each show trigger
  var triggerMap = {
    'mouseenter': 'mouseleave',
    'click': 'click',
    'focus': 'blur'
  };

  // The options specified to the provider globally.
  var globalOptions = {};

  /**
   * `options({})` allows global configuration of all tooltips in the
   * application.
   *
   *   var app = angular.module( 'App', ['ui.bootstrap.tooltip'], function( $tooltipProvider ) {
   *     // place tooltips left instead of top by default
   *     $tooltipProvider.options( { placement: 'left' } );
   *   });
   */
	this.options = function( value ) {
		angular.extend( globalOptions, value );
	};

  /**
   * This allows you to extend the set of trigger mappings available. E.g.:
   *
   *   $tooltipProvider.setTriggers( 'openTrigger': 'closeTrigger' );
   */
  this.setTriggers = function setTriggers ( triggers ) {
    angular.extend( triggerMap, triggers );
  };

  /**
   * This is a helper function for translating camel-case to snake-case.
   */
   /*jshint camelcase: false */
  function snake_case(name){
    var regexp = /[A-Z]/g;
    var separator = '-';
    return name.replace(regexp, function(letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  }

  /**
   * Returns the actual instance of the $tooltip service.
   * TODO support multiple triggers
   */
  this.$get = [ '$window', '$compile', '$timeout', '$document', '$position', '$interpolate', function ( $window, $compile, $timeout, $document, $position, $interpolate ) {
    return function $tooltip ( type, prefix, defaultTriggerShow ) {
      var options = angular.extend( {}, defaultOptions, globalOptions );
      /**
       * Returns an object of show and hide triggers.
       *
       * If a trigger is supplied,
       * it is used to show the tooltip; otherwise, it will use the `trigger`
       * option passed to the `$tooltipProvider.options` method; else it will
       * default to the trigger supplied to this directive factory.
       *
       * The hide trigger is based on the show trigger. If the `trigger` option
       * was passed to the `$tooltipProvider.options` method, it will use the
       * mapped trigger from `triggerMap` or the passed trigger if the map is
       * undefined; otherwise, it uses the `triggerMap` value of the show
       * trigger; else it will just use the show trigger.
       */
      function getTriggers ( trigger ) {
        var show = trigger || options.trigger || defaultTriggerShow;
        var hide = triggerMap[show] || show;
        return {
          show: show,
          hide: hide
        };
      }

      var directiveName = snake_case( type );

      var startSym = $interpolate.startSymbol();
      var endSym = $interpolate.endSymbol();
      var template =
        '<div '+ directiveName +'-popup '+
          'title="'+startSym+'title'+endSym+'" '+
          'content="'+startSym+'content'+endSym+'" '+
          'placement="'+startSym+'placement'+endSym+'" '+
          'animation="animation" '+
          'is-open="isOpen"'+
          '>'+
        '</div>';

      return {
        restrict: 'EA',
        compile: function () {
          var tooltipLinker = $compile( template );

          return function link ( scope, element, attrs ) {
            var tooltip;
            var tooltipLinkedScope;
            var transitionTimeout;
            var popupTimeout;
            var appendToBody = angular.isDefined( options.appendToBody ) ? options.appendToBody : false;
            var triggers = getTriggers( undefined );
            var hasEnableExp = angular.isDefined(attrs[prefix+'Enable']);
            var ttScope = scope.$new(true);

            var positionTooltip = function () {

              var ttPosition = $position.positionElements(element, tooltip, ttScope.placement, appendToBody);
              ttPosition.top += 'px';
              ttPosition.left += 'px';

              // Now set the calculated positioning.
              tooltip.css( ttPosition );
            };

            // By default, the tooltip is not open.
            // TODO add ability to start tooltip opened
            ttScope.isOpen = false;

            function toggleTooltipBind () {
              if ( ! ttScope.isOpen ) {
                showTooltipBind();
              } else {
                hideTooltipBind();
              }
            }

            // Show the tooltip with delay if specified, otherwise show it immediately
            function showTooltipBind() {
              if(hasEnableExp && !scope.$eval(attrs[prefix+'Enable'])) {
                return;
              }

              prepareTooltip();

              if ( ttScope.popupDelay ) {
                // Do nothing if the tooltip was already scheduled to pop-up.
                // This happens if show is triggered multiple times before any hide is triggered.
                if (!popupTimeout) {
                  popupTimeout = $timeout( show, ttScope.popupDelay, false );
                  popupTimeout.then(function(reposition){reposition();});
                }
              } else {
                show()();
              }
            }

            function hideTooltipBind () {
              scope.$apply(function () {
                hide();
              });
            }

            // Show the tooltip popup element.
            function show() {

              popupTimeout = null;

              // If there is a pending remove transition, we must cancel it, lest the
              // tooltip be mysteriously removed.
              if ( transitionTimeout ) {
                $timeout.cancel( transitionTimeout );
                transitionTimeout = null;
              }

              // Don't show empty tooltips.
              if ( ! ttScope.content ) {
                return angular.noop;
              }

              createTooltip();

              // Set the initial positioning.
              tooltip.css({ top: 0, left: 0, display: 'block' });

              // Now we add it to the DOM because need some info about it. But it's not
              // visible yet anyway.
              if ( appendToBody ) {
                  $document.find( 'body' ).append( tooltip );
              } else {
                element.after( tooltip );
              }

              positionTooltip();

              // And show the tooltip.
              ttScope.isOpen = true;
              ttScope.$digest(); // digest required as $apply is not called

              // Return positioning function as promise callback for correct
              // positioning after draw.
              return positionTooltip;
            }

            // Hide the tooltip popup element.
            function hide() {
              // First things first: we don't show it anymore.
              ttScope.isOpen = false;

              //if tooltip is going to be shown after delay, we must cancel this
              $timeout.cancel( popupTimeout );
              popupTimeout = null;

              // And now we remove it from the DOM. However, if we have animation, we
              // need to wait for it to expire beforehand.
              // FIXME: this is a placeholder for a port of the transitions library.
              if ( ttScope.animation ) {
                if (!transitionTimeout) {
                  transitionTimeout = $timeout(removeTooltip, 500);
                }
              } else {
                removeTooltip();
              }
            }

            function createTooltip() {
              // There can only be one tooltip element per directive shown at once.
              if (tooltip) {
                removeTooltip();
              }
              tooltipLinkedScope = ttScope.$new();
              tooltip = tooltipLinker(tooltipLinkedScope, angular.noop);
            }

            function removeTooltip() {
              transitionTimeout = null;
              if (tooltip) {
                tooltip.remove();
                tooltip = null;
              }
              if (tooltipLinkedScope) {
                tooltipLinkedScope.$destroy();
                tooltipLinkedScope = null;
              }
            }

            function prepareTooltip() {
              prepPlacement();
              prepPopupDelay();
            }

            /**
             * Observe the relevant attributes.
             */
            attrs.$observe( type, function ( val ) {
              ttScope.content = val;

              if (!val && ttScope.isOpen ) {
                hide();
              }
            });

            attrs.$observe( prefix+'Title', function ( val ) {
              ttScope.title = val;
            });

            function prepPlacement() {
              var val = attrs[ prefix + 'Placement' ];
              ttScope.placement = angular.isDefined( val ) ? val : options.placement;
            }

            function prepPopupDelay() {
              var val = attrs[ prefix + 'PopupDelay' ];
              var delay = parseInt( val, 10 );
              ttScope.popupDelay = ! isNaN(delay) ? delay : options.popupDelay;
            }

            var unregisterTriggers = function () {
              element.unbind(triggers.show, showTooltipBind);
              element.unbind(triggers.hide, hideTooltipBind);
            };

            function prepTriggers() {
              var val = attrs[ prefix + 'Trigger' ];
              unregisterTriggers();

              triggers = getTriggers( val );

              if ( triggers.show === triggers.hide ) {
                element.bind( triggers.show, toggleTooltipBind );
              } else {
                element.bind( triggers.show, showTooltipBind );
                element.bind( triggers.hide, hideTooltipBind );
              }
            }
            prepTriggers();

            var animation = scope.$eval(attrs[prefix + 'Animation']);
            ttScope.animation = angular.isDefined(animation) ? !!animation : options.animation;

            var appendToBodyVal = scope.$eval(attrs[prefix + 'AppendToBody']);
            appendToBody = angular.isDefined(appendToBodyVal) ? appendToBodyVal : appendToBody;

            // if a tooltip is attached to <body> we need to remove it on
            // location change as its parent scope will probably not be destroyed
            // by the change.
            if ( appendToBody ) {
              scope.$on('$locationChangeSuccess', function closeTooltipOnLocationChangeSuccess () {
              if ( ttScope.isOpen ) {
                hide();
              }
            });
            }

            // Make sure tooltip is destroyed and removed.
            scope.$on('$destroy', function onDestroyTooltip() {
              $timeout.cancel( transitionTimeout );
              $timeout.cancel( popupTimeout );
              unregisterTriggers();
              removeTooltip();
              ttScope = null;
            });
          };
        }
      };
    };
  }];
})
 .factory('$position', ['$document', '$window', function ($document, $window) {

    function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl !== $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
        };
      },

      /**
       * Provides coordinates for the targetEl in relation to hostEl
       */
      positionElements: function (hostEl, targetEl, positionStr, appendToBody) {

        var positionStrParts = positionStr.split('-');
        var pos0 = positionStrParts[0], pos1 = positionStrParts[1] || 'center';

        var hostElPos,
          targetElWidth,
          targetElHeight,
          targetElPos;

        hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

        targetElWidth = targetEl.prop('offsetWidth');
        targetElHeight = targetEl.prop('offsetHeight');

        var shiftWidth = {
          center: function () {
            return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
          },
          left: function () {
            return hostElPos.left;
          },
          right: function () {
            return hostElPos.left + hostElPos.width;
          }
        };

        var shiftHeight = {
          center: function () {
            return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
          },
          top: function () {
            return hostElPos.top;
          },
          bottom: function () {
            return hostElPos.top + hostElPos.height;
          }
        };

        switch (pos0) {
          case 'right':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: shiftWidth[pos0]()
            };
            break;
          case 'left':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: hostElPos.left - targetElWidth
            };
            break;
          case 'bottom':
            targetElPos = {
              top: shiftHeight[pos0](),
              left: shiftWidth[pos1]()
            };
            break;
          default:
            targetElPos = {
              top: hostElPos.top - targetElHeight,
              left: shiftWidth[pos1]()
            };
            break;
        }

        return targetElPos;
      }
    };
  }])
.directive( 'tinkTooltipPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'templates/tooltip.html'
  };
})

.directive( 'tinkTooltip', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'tinkTooltip', 'tinkTooltip', 'mouseenter' );
}])

.directive( 'tinkTooltipHtmlUnsafePopup', function ($sce) {
  return {
    restrict: 'EA',
    replace: true,
    scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: 'templates/tooltip.html',
    link:function($scope){
      $scope.content = $sce.trustAsHtml($scope.content);
    }  
  };
})

.directive( 'tinkTooltipHtmlUnsafe', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'tinkTooltipHtmlUnsafe', 'tinkTooltip', 'mouseenter' );
}]);;  'use strict';
  angular.module('tink.datepicker',['tink.dateHelper','tink.safeApply'])
  .directive('tinkValidDate', ['$timeout', '$filter','dateCalculator','safeApply', function ($timeout, $filter,dateCalculator,safeApply) {
    return {
      require: 'ngModel',
      priority: 99,
      link: function ($scope, $element, $attrs, ctrl) {

        var format = $attrs.format;

        function checkForValid(viewValue) {
          ctrl.$setValidity('date', validFormat(viewValue,format));
          return viewValue;
        }

        function validFormat(date,format){
          if(angular.isDefined(date) && date !== null){

            if(date.length !== 10){ return false; }

            var dateObject = dateCalculator.getDate(date, format);

            if(dateObject !== 'INVALID DATE'){
              return true;
            }
            return false;
          }          
        }

        $element.unbind('input').unbind('keydown').unbind('change');
        $element.bind('blur', function() {

          safeApply($scope,function() {
            if(checkForValid($element.val(),format)){
              ctrl.$setViewValue($element.val());
            }else{
             ctrl.$setViewValue(undefined);
           }
           
         });         
        });
           //format text going to user (model to view)
           ctrl.$formatters.push(checkForValid);

           ctrl.$parsers.unshift(checkForValid);
         }
       };
     }]);;'use strict';
angular.module('tink', [
		'tink.datepicker',
		'tink.datepickerRange',
		'tink.popOver',
		'tink.tooltip',
		'tink.datepicker',
		'tink.topNav'
	]);;'use strict';
angular.module('tink.dateHelper', []);
angular.module('tink.dateHelper')
.factory('dateCalculator', function () {
  var nl = {
    'DAY': ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
    'MONTH': ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
    'SHORTDAY': ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
    'SHORTMONTH': ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.','sep.', 'okt.', 'nov.', 'dec.']
  },
  dateFormat = (function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
    timezoneClip = /[^-+\dA-Z]/g,
    pad = function (val, len) {
      val = String(val);
      len = len || 2;
      while (val.length < len) {
        val = '0' + val;
      }
      return val;
    };

        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc, lang) {
          var dF = dateFormat;

          // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
          if (arguments.length === 1 && Object.prototype.toString.call(date) === '[object String]' && !/\d/.test(date)) {
            mask = date;
            date = undefined;
          }

          // Passing date through Date applies Date.parse, if necessary
          date = date ? new Date(date) : new Date();
          if (isNaN(date)) { 
            throw new SyntaxError('invalid date');
          }

          mask = String(dF.masks[mask] || mask || dF.masks['default']).toLowerCase();
          // Allow setting the utc argument via the mask
          if (mask.slice(0, 4) === 'UTC:') {
            mask = mask.slice(4);
            utc = true;
          }

          var _ = utc ? 'getUTC' : 'get',
          d = date[_ + 'Date'](),
          D = date[_ + 'Day'](),
          m = date[_ + 'Month'](),
          y = date[_ + 'FullYear'](),
          H = date[_ + 'Hours'](),
          M = date[_ + 'Minutes'](),
          s = date[_ + 'Seconds'](),
          L = date[_ + 'Milliseconds'](),
          o = utc ? 0 : date.getTimezoneOffset(),
          flags = {
            d: d,
            dd: pad(d),
            ddd: lang.SHORTDAY[D],
            dddd: lang.DAY[D],
            m: m + 1,
            mm: pad(m + 1),
            mmm: lang.SHORTMONTH[m],
            mmmm: lang.MONTH[m],
            yy: String(y).slice(2),
            yyyy: y,
            h: H % 12 || 12,
            hh: pad(H % 12 || 12),
            H: H,
            HH: pad(H),
            M: M,
            MM: pad(M),
            s: s,
            ss: pad(s),
            l: pad(L, 3),
            L: pad(L > 99 ? Math.round(L / 10) : L),
            t: H < 12 ? 'a' : 'p',
            tt: H < 12 ? 'am' : 'pm',
            T: H < 12 ? 'A' : 'P',
            TT: H < 12 ? 'AM' : 'PM',
            Z: utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
            o: (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
            S: ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
          };

          return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
          });
        };
      }());

  // Some common format strings
  dateFormat.masks = {
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

  function stringToDate(_date, _format) {
    var _delimiter;
    if (_format.indexOf('/') !== -1) {
      _delimiter = '/';
    } else if (_format.indexOf('-') !== -1) {
      _delimiter = '-';
    } else if (_format.indexOf('.') !== -1) {
      _delimiter = '.';
    }
    var formatLowerCase = _format.toLowerCase();
    var formatItems = formatLowerCase.split(_delimiter);
    var dateItems = _date.split(_delimiter);
    var monthIndex = formatItems.indexOf('mm');
    var dayIndex = formatItems.indexOf('dd');
    var yearIndex = formatItems.indexOf('yyyy');
    var month = parseInt(dateItems[monthIndex]);
    month -= 1;
    var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
    return formatedDate;
  }

  return {
    dateBeforeOther: function (first, last) {
      if (new Date(first).getTime() > new Date(last).getTime()) {
        return true;
      } else {
        return false;
      }
    },
    splitRow: function (arr, size) {
      var arrays = [];
      while (arr.length > 0) {
        arrays.push(arr.splice(0, size));
      }
      return arrays;
    },
    daysBetween: function (first, last) {
      return Math.round(Math.abs((first.getTime() - last.getTime()) / (24 * 60 * 60 * 1000)));
    },
    isSameDate:function (a, b) {
      if (angular.isDate(a) && angular.isDate(b)) {
        a.setHours(0,0,0,0);
        b.setHours(0,0,0,0);
        return a.getTime() === b.getTime();
      } else {
        return false;
      }
    },
    isSameMonth:function (a, b) {
      if (angular.isDate(a) && angular.isDate(b)) {
        a.setHours(0,0,0,0);
        b.setHours(0,0,0,0);
        return (a.getMonth() === b.getMonth()) && (a.getFullYear() === b.getFullYear()) ;
      } else {
        return false;
      }
    },
    getDate: function (date, format) {
      if(!angular.isDefined(date) || !angular.isDefined(format) || date.length !== format.length){
        return null;
      }      
      return stringToDate(date, format);
    },
    daysInMonth: function (month,year) {
      if(angular.isDate(month)){
        return new Date(month.getYear(), month.getMonth() + 1, 0).getDate();
      }else{
        return new Date(year, month, 0).getDate();
      }      
    },
    daysInMonthNodays: function (month,year) {
  
      return new Date(year, month, 0).getDate();
    },
    format: function (date, format) {
      return dateFormat(date, format, null, nl);
    },
    formatDate: function (date, format) {
        return dateFormat(date, format,null,nl);
    },
    getShortDays: function (lang) {

      if (lang !== angular.isDefined(lang)) {
        lang = '';
      }
      switch (lang.toLowerCase()) {
        case 'nl':
        return nl.SHORTDAY;
      }
    },
    getShortMonths: function (lang) {
      if (lang !== angular.isDefined(lang)) {
        lang = '';
      }
      switch (lang.toLowerCase()) {
        case 'nl':
        return nl.SHORTMONTH;
      }
    },
    getDays: function (lang) {
      if (lang !== angular.isDefined(lang)) {
        lang = '';
      }
      switch (lang.toLowerCase()) {
        case 'nl':
        return nl.DAY;
      }
    },
    getMonths: function (lang) {
      if (lang !== angular.isDefined(lang)) {
        lang = '';
      }
      switch (lang.toLowerCase()) {
        case 'nl':
        return nl.MONTH;
      }
    }
  };
})
.factory('safeApply', [function() {
  return function($scope, fn) {
    var phase = $scope.$root.$$phase;
    if(phase === '$apply' || phase === '$digest') {
      if (fn) {
        $scope.$eval(fn);
      }
    } else {
      if (fn) {
        $scope.$apply(fn);
      } else {
        $scope.$apply();
      }
    }
  };
}])
.factory('calView',['dateCalculator',function (dateCalculator) {
  function isSameDate(a, b) {
    if (angular.isDate(a) && angular.isDate(b)) {
      a.setHours(0,0,0,0);
      b.setHours(0,0,0,0);
      return a.getTime() === b.getTime();
    } else {
      return false;
    }
  }
  function inRange(date, first, last) {

    if (angular.isDate(first) && angular.isDate(last) && angular.isDate(date)) {
      date.setHours(0,0,0,0);
      first.setHours(0,0,0,0);
      last.setHours(0,0,0,0);
      if (date > first && date < last) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  function mod(n, m) {
    return ((n % m) + m) % m;
  }
  function callCullateData(date) {

    var year = date.getFullYear(),
    month = date.getMonth();

    var firstDayOfMonth = new Date(year, month, 1);
    var firstDayOfWeek = new Date(+firstDayOfMonth - mod(firstDayOfMonth.getDay() - 1, 7) * 864e5);


    var offsetDayOfMonth = firstDayOfMonth.getTimezoneOffset();
    var offsetDayOfweek = firstDayOfWeek.getTimezoneOffset();

    if (offsetDayOfMonth !== offsetDayOfweek) {
      firstDayOfWeek = new Date(+firstDayOfWeek + (offsetDayOfweek - offsetDayOfMonth) * 60e3);
    }

    var daysToDraw = dateCalculator.daysInMonth(date) + dateCalculator.daysBetween(firstDayOfWeek, firstDayOfMonth);
    if (daysToDraw % 7 !== 0) {
      daysToDraw += 7 - (daysToDraw % 7);
    }

    return {days: daysToDraw, firstDay: firstDayOfWeek};
  }

  function createLabels(date, firstRange, lastRange) {
    var label = '',cssClass = '';
    if (label !== null && angular.isDate(date)) {
      label = date.getDate();
      if (isSameDate(date, firstRange) || isSameDate(date, lastRange)) {
        cssClass = 'btn-primary';
      } else if (inRange(date, firstRange, lastRange)) {
        cssClass = 'btn-info';
      } else if (isSameDate(date, new Date())) {
        cssClass = 'btn-warning';
      }
      var month = ('0' + (date.getMonth() + 1)).slice(-2);
      var day = ('0' + (date.getDate())).slice(-2);
      return '<td><button ng-click="$select(\''+date.getFullYear()+'/'+month+'/'+day+'\')" class="' + cssClass + '"><span>' + label + '</span></button></td>';
    } else{
      return '<td></td>';
    }

        /* var td = document.createElement("td");
         var button = document.createElement("button");
         button.class=cssClass;
         var span = document.createElement("span");
         span.innerHTML = document.createTextNode(label).textContent;
         button.appendChild(span);
         td.appendChild(button);
         return td;*/

       }

      return {
        createMonthDays: function (date, firstRange, lastRange) {
          var domElem = '', monthCall = callCullateData(date), label;
          //var tr = createTR();
          var tr = '<tr>';
          for (var i = 0; i < monthCall.days; i++) {
            var day = new Date(monthCall.firstDay.getFullYear(), monthCall.firstDay.getMonth(), monthCall.firstDay.getDate() + i);
            if(day.getMonth() !== date.getMonth()){
              label = createLabels(null);
            }else{
              label = createLabels(day, firstRange, lastRange);
            }

            //tr.appendChild(label);
            tr += label;
            if ((i + 1) % 7 === 0) {
              tr += '</tr>';
              domElem += tr;
              tr = '<tr>';
              //tr = createTR();
            }
          }
          domElem = '<tbody id="secondCal">' + domElem + '</tbody>';
          return domElem;


        }
      };
    }]);;'use strict';
angular.module('tink.safeApply', [])
.factory('safeApply', [function() {
    return function($scope, fn) {
        var phase = $scope.$root.$$phase;
        if(phase === '$apply' || phase === '$digest') {
            if (fn) {
                $scope.$eval(fn);
            }
        } else {
            if (fn) {
                $scope.$apply(fn);
            } else {
                $scope.$apply();
            }
        }
    };
}]);