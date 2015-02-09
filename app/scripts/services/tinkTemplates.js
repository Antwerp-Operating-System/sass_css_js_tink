angular.module('tink.templates', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/popover.html',
    "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\r" +
    "\n" +
    "  <div class=\"arrow\"></div>\r" +
    "\n" +
    "  <div class=\"popover-inner\">\r" +
    "\n" +
    "   <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\r" +
    "\n" +
    "   <div class=\"popover-content\" ng-bind=\"content\"></div>\r" +
    "\n" +
    " </div>\r" +
    "\n" +
    "</div>"
  );


  $templateCache.put('templates/tinkAccordionGroup.html',
    "<section class=\"accordion-panel\">\r" +
    "\n" +
    "  <a href class=\"accordion-toggle\" ng-click=\"toggleOpen()\">\r" +
    "\n" +
    "    <div class=\"accordion-panel-heading\">\r" +
    "\n" +
    "      <i class=\"fa fa-th-large\"></i>\r" +
    "\n" +
    "      <h4 class=\"panel-title\">\r" +
    "\n" +
    "        <span>{{heading}}</span>\r" +
    "\n" +
    "      </h4>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </a>\r" +
    "\n" +
    "  <div class=\"accordion-panel-body\">\r" +
    "\n" +
    "    <div class=\"accordion-spinner\"><i class=\"fa fa-rotate-right fa-spin\"></i></div>\r" +
    "\n" +
    "    <div class=\"accordion-loaded-content\" ng-transclude>\r" +
    "\n" +
    "        <p>New DOM content comes here</p>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</section>"
  );


  $templateCache.put('templates/tinkDatePicker.html',
    "<div class=\"dropdown-menu datepicker\" ng-class=\"'datepicker-mode-' + $mode\">\r" +
    "\n" +
    "    <table style=\"table-layout: fixed; height: 100%; width: 100%;\">\r" +
    "\n" +
    "        <thead>\r" +
    "\n" +
    "            <tr class=\"text-center\">\r" +
    "\n" +
    "                <th>\r" +
    "\n" +
    "                    <button tabindex=\"-1\" type=\"button\" class=\"btn pull-left\" ng-click=\"$selectPane(-1)\">\r" +
    "\n" +
    "                        <i class=\"fa fa-chevron-left\"></i>\r" +
    "\n" +
    "                    </button>\r" +
    "\n" +
    "                </th>\r" +
    "\n" +
    "                <th colspan=\"{{ rows[0].length - 2 }}\">\r" +
    "\n" +
    "                    <button tabindex=\"-1\" type=\"button\" class=\"btn btn-default btn-block text-strong\"  ng-click=\"$toggleMode()\">\r" +
    "\n" +
    "                        <strong style=\"text-transform: capitalize;\" ng-bind=\"title\"></strong>\r" +
    "\n" +
    "                    </button>\r" +
    "\n" +
    "                </th>\r" +
    "\n" +
    "                <th>\r" +
    "\n" +
    "                    <button tabindex=\"-1\" type=\"button\" class=\"btn pull-right\" ng-click=\"$selectPane(+1)\">\r" +
    "\n" +
    "                        <i class=\"fa fa-chevron-right\"></i>\r" +
    "\n" +
    "                    </button>\r" +
    "\n" +
    "                </th>\r" +
    "\n" +
    "            </tr>\r" +
    "\n" +
    "            <tr ng-show=\"showLabels\" class=\"days\" ng-bind-html=\"labels\"></tr>\r" +
    "\n" +
    "        </thead>\r" +
    "\n" +
    "        <tbody>\r" +
    "\n" +
    "            <tr ng-repeat=\"(i, row) in rows\" height=\"{{ 100 / rows.length }}%\">\r" +
    "\n" +
    "                <td class=\"text-center\" ng-repeat=\"(j, el) in row\">\r" +
    "\n" +
    "                    <button tabindex=\"-1\" type=\"button\" class=\"btn btn-default\" style=\"width: 100%\" ng-class=\"{'btn-primary': el.selected, 'btn-today': el.isToday && !el.elected}\" ng-click=\"$select(el.date)\" ng-disabled=\"el.disabled\">\r" +
    "\n" +
    "                    <span ng-class=\"{'text-muted': el.muted}\" ng-bind=\"el.label\"></span>\r" +
    "\n" +
    "                </button>\r" +
    "\n" +
    "            </td>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "    </tbody>\r" +
    "\n" +
    "</table>\r" +
    "\n" +
    "</div>"
  );


  $templateCache.put('templates/tinkDatePickerField.html',
    "<div class=\"dropdown-menu datepicker\" ng-class=\"'datepicker-mode-' + $mode\">\r" +
    "\n" +
    "        <table style=\"table-layout: fixed; height: 100%; width: 100%;\">\r" +
    "\n" +
    "        <thead>\r" +
    "\n" +
    "        <tr class=\"text-center\">\r" +
    "\n" +
    "            <th>\r" +
    "\n" +
    "                <button tabindex=\"-1\" type=\"button\" class=\"btn pull-left\" ng-click=\"$selectPane(-1)\">\r" +
    "\n" +
    "                    <i class=\"fa fa-chevron-left\"></i>\r" +
    "\n" +
    "                </button>\r" +
    "\n" +
    "            </th>\r" +
    "\n" +
    "            <th colspan=\"{{ rows[0].length - 2 }}\">\r" +
    "\n" +
    "                <button tabindex=\"-1\" type=\"button\" class=\"btn btn-default btn-block text-strong\"  ng-click=\"$toggleMode()\">\r" +
    "\n" +
    "                    <strong style=\"text-transform: capitalize;\" ng-bind=\"title\"></strong>\r" +
    "\n" +
    "                </button>\r" +
    "\n" +
    "            </th>\r" +
    "\n" +
    "            <th>\r" +
    "\n" +
    "                <button tabindex=\"-1\" type=\"button\" class=\"btn pull-right\" ng-click=\"$selectPane(+1)\">\r" +
    "\n" +
    "                    <i class=\"fa fa-chevron-right\"></i>\r" +
    "\n" +
    "                </button>\r" +
    "\n" +
    "            </th>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "        <tr ng-show=\"showLabels\" class=\"days\" ng-bind-html=\"labels\"></tr>\r" +
    "\n" +
    "        </thead>\r" +
    "\n" +
    "        <tbody>\r" +
    "\n" +
    "        <tr ng-repeat=\"(i, row) in rows\" height=\"{{ 100 / rows.length }}%\">\r" +
    "\n" +
    "            <td class=\"text-center\" ng-repeat=\"(j, el) in row\">\r" +
    "\n" +
    "                <button tabindex=\"-1\" type=\"button\" class=\"btn btn-default\" style=\"width: 100%\" ng-class=\"{'btn-primary': el.selected, 'btn-today': el.isToday && !el.elected}\" ng-click=\"$select(el.date)\" ng-disabled=\"el.disabled\">\r" +
    "\n" +
    "                                    <span ng-class=\"{'text-muted': el.muted}\" ng-bind=\"el.label\"></span>\r" +
    "\n" +
    "                </button>\r" +
    "\n" +
    "            </td>\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "        </tbody>\r" +
    "\n" +
    "    </table>\r" +
    "\n" +
    "</div>"
  );


  $templateCache.put('templates/tinkDatePickerInput.html',
    "<div class=\"datepicker-input-fields\">\r" +
    "\n" +
    "  <input tink-format-input data-format=\"00/00/0000\" data-placeholder=\"dd/mm/jjjj\" data-date dynamic-name=\"dynamicName\"  ng-model=\"ngModel\" />\r" +
    "\n" +
    "  <span class=\"datepicker-icon\">\r" +
    "\n" +
    "  <i class=\"fa fa-calendar\"></i>\r" +
    "\n" +
    "  </span>\r" +
    "\n" +
    "  </div>"
  );


  $templateCache.put('templates/tinkDatePickerRange.html',
    "<div class=\"datepickerrange\">\r" +
    "\n" +
    "  <div class=\"pull-left datepickerrange-left\">\r" +
    "\n" +
    "    <div class=\"datepickerrange-header-left\">\r" +
    "\n" +
    "      <div class=\"pull-left\">\r" +
    "\n" +
    "        <button tabindex=\"-1\" type=\"button\" class=\"btn pull-left\" ng-click=\"$selectPane(0)\">\r" +
    "\n" +
    "          <i class=\"fa fa-chevron-left\"></i>\r" +
    "\n" +
    "        </button>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "      <div class=\"text-center clearfix\">\r" +
    "\n" +
    "        <label ng-bind=\"firstTitle\"></label>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"table-responsive\">\r" +
    "\n" +
    "      <table >\r" +
    "\n" +
    "        <thead>\r" +
    "\n" +
    "        <tr ng-bind-html=\"dayLabels\" >\r" +
    "\n" +
    "        </tr>\r" +
    "\n" +
    "        </thead>\r" +
    "\n" +
    "        <tbody  id=\"firstCal\" ng-bind-html=\"firstCal\">\r" +
    "\n" +
    "        </tbody>\r" +
    "\n" +
    "      </table>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div class=\"pull-right datepickerrange-right\">\r" +
    "\n" +
    "    <div class=\"datepickerrange-header-right\">\r" +
    "\n" +
    "      <div class=\"pull-right\">\r" +
    "\n" +
    "        <button tabindex=\"-1\" type=\"button\" class=\"btn pull-left\" ng-click=\"$selectPane(1)\">\r" +
    "\n" +
    "          <i class=\"fa fa-chevron-right\"></i>\r" +
    "\n" +
    "        </button>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "      <div class=\"text-center clearfix\">\r" +
    "\n" +
    "        <label ng-bind=\"lastTitle\"></label>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"table-responsive\">\r" +
    "\n" +
    "      <table>\r" +
    "\n" +
    "        <thead>\r" +
    "\n" +
    "        <tr class=\"days\" ng-bind-html=\"dayLabels\"></tr>\r" +
    "\n" +
    "        </thead>\r" +
    "\n" +
    "        <tbody id=\"secondCal\" ng-bind-html=\"secondCal\">\r" +
    "\n" +
    "        </tbody>\r" +
    "\n" +
    "      </table>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "  </div>"
  );


  $templateCache.put('templates/tinkDatePickerRangeInputs.html',
    " <div class=\"datepicker-input-fields row no-gutter\">\r" +
    "\n" +
    "  <div class=\"col-sm-6\">\r" +
    "\n" +
    "    <input type=\"text\" id=\"firstDateElem\" data-date data-format=\"00/00/0000\" data-placeholder=\"dd/mm/jjjj\" dynamic-name=\"dynamicName\" tink-format-input ng-model=\"firstDate\" alid-name=\"first\">\r" +
    "\n" +
    "    <span class=\"datepicker-icon\">\r" +
    "\n" +
    "      <i class=\"fa fa-calendar\"></i>\r" +
    "\n" +
    "    </span>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div class=\"col-sm-6\">\r" +
    "\n" +
    "    <input type=\"text\" id=\"lastDateElem\" data-date data-format=\"00/00/0000\" data-placeholder=\"dd/mm/jjjj\" tink-format-input ctrl-model=\"dynamicName\" valid-name=\"last\"  ng-model=\"lastDate\">\r" +
    "\n" +
    "    <span class=\"datepicker-icon\">\r" +
    "\n" +
    "      <i class=\"fa fa-calendar\"></i>\r" +
    "\n" +
    "    </span>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>"
  );


  $templateCache.put('templates/tooltip.html',
    "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\r" +
    "\n" +
    "      <div class=\"tooltip-arrow\"></div>\r" +
    "\n" +
    "      <div class=\"tooltip-inner\" ng-bind=\"content\"></div>\r" +
    "\n" +
    "   </div>"
  );

}]);
