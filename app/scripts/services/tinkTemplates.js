'use strict';
angular.module('tink.templates', [])
    .run(['$templateCache', function($templateCache) {
      $templateCache.put('templates/popover.html',
        '<div class="popover {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">'+
            '<div class="arrow"></div>'+
            '<div class="popover-inner">'+
            '<h3 class="popover-title" ng-bind="title" ng-show="title"></h3>'+
            '<div class="popover-content" ng-bind="content"></div>'+
           '</div>'+
        '</div>');

      $templateCache.put('templates/tinkDatePicker.html',
        '<div class="dropdown-menu datepicker" ng-class="\'datepicker-mode-\' + $mode">'+
        '<table style="table-layout: fixed; height: 100%; width: 100%;">'+
        '<thead>'+
        '<tr class="text-center">'+
            '<th>'+
                '<button tabindex="-1" type="button" class="btn pull-left" ng-click="$selectPane(-1)">'+
                    '<i class="fa fa-chevron-left"></i>'+
                '</button>'+
            '</th>'+
            '<th colspan="{{ rows[0].length - 2 }}">'+
                '<button tabindex="-1" type="button" class="btn btn-default btn-block text-strong"  ng-click="$toggleMode()">'+
                    '<strong style="text-transform: capitalize;" ng-bind="title"></strong>'+
                '</button>'+
            '</th>'+
            '<th>'+
                '<button tabindex="-1" type="button" class="btn pull-right" ng-click="$selectPane(+1)">'+
                    '<i class="fa fa-chevron-right"></i>'+
                '</button>'+
            '</th>'+
        '</tr>'+
        '<tr ng-show="showLabels" class="days" ng-bind-html="labels"></tr>'+
        '</thead>'+
        '<tbody>'+
        '<tr ng-repeat="(i, row) in rows" height="{{ 100 / rows.length }}%">'+
            '<td class="text-center" ng-repeat="(j, el) in row">'+
                '<button tabindex="-1" type="button" class="btn btn-default" style="width: 100%" ng-class="{\'btn-primary\': el.selected, \'btn-today\': el.isToday && !el.selected}" ng-click="$select(el.date)" ng-disabled="el.disabled">'+
                                    '<span ng-class="{\'text-muted\': el.muted}" ng-bind="el.label"></span>'+
                '</button>'+
            '</td>'+
        '</tr>'+
        '</tbody>'+
    '</table>'+
'</div>');

$templateCache.put('templates/tinkDatePickerRange.html',
        '<div class="datepickerrange">'+
  '<div class="pull-left datepickerrange-left">'+
    '<div class="datepickerrange-header-left">'+
      '<div class="pull-left">'+
        '<button tabindex="-1" type="button" class="btn pull-left" ng-click="$selectPane(0)">'+
          '<i class="fa fa-chevron-left"></i>'+
        '</button>'+
      '</div>'+
      '<div class="text-center clearfix">'+
        '<label ng-bind="firstTitle"></label>'+
      '</div>'+
    '</div>'+
    '<div class="table-responsive">'+
      '<table >'+
        '<thead>'+
        '<tr ng-bind-html="dayLabels" >'+
        '</tr>'+
        '</thead>'+
        '<tbody  id="firstCal" ng-bind-html="firstCal">'+
        '</tbody>'+
      '</table>'+
    '</div>'+
  '</div>'+
  '<div class="pull-right datepickerrange-right">'+
    '<div class="datepickerrange-header-right">'+
     ' <div class="pull-right">'+
        '<button tabindex="-1" type="button" class="btn pull-left" ng-click="$selectPane(1)">'+
          '<i class="fa fa-chevron-right"></i>'+
        '</button>'+
      '</div>'+
      '<div class="text-center clearfix">'+
        '<label ng-bind="lastTitle"></label>'+
      '</div>'+
    '</div>'+
    '<div class="table-responsive">'+
      '<table>'+
        '<thead>'+
        '<tr class="days" ng-bind-html="dayLabels"></tr>'+
        '</thead>'+
        '<tbody id="secondCal" ng-bind-html="secondCal">'+
        '</tbody>'+
      '</table>'+
    '</div>'+
'</div>'+
  '</div>');

$templateCache.put('templates/tinkDatePickerRangeInputs.html',
  '<div class="tink-datepickerrange-input-fields">'+
  '<div class="input-group col-sm-6">'+
    '<input type="text" id="firstDateElem" data-date data-format="00/00/0000" data-placeholder="mm/dd/jjjj" dynamic-name="dynamicName" tink-format-input ng-model="firstDate" valid-name="first">'+
    '<span class="input-group-addon">'+
      '<i class="fa fa-calendar"></i>'+
    '</span>'+
  '</div>'+
  '<div class="input-group col-sm-6">'+
    '<input type="text" id="lastDateElem" data-date data-format="00/00/0000" data-placeholder="mm/dd/jjjj" tink-format-input ctrl-model="dynamicName" valid-name="last"  ng-model="lastDate">'+
    '<span class="input-group-addon">'+
      '<i class="fa fa-calendar"></i>'+
    '</span>'+
  '</div>'+
'</div>');

$templateCache.put('templates/tooltip.html',
    '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">'+
      '<div class="tooltip-arrow"></div>'+
      '<div class="tooltip-inner" ng-bind="content"></div>'+
    '</div>');

$templateCache.put('templates/tinkDatePickerInput.html',
  '<div class="tink-datepickerrange-input-fields">'+
  '<div class="input-group">'+
  '<span class="input-group-addon">'+
  '<i class="fa fa-calendar"></i>'+
  '</span>'+
  '</div>'+
  '</div>');



$templateCache.put('templates/tinkDatePickerField.html',
        '<div class="dropdown-menu datepicker" ng-class="\'datepicker-mode-\' + $mode">'+
        '<table style="table-layout: fixed; height: 100%; width: 100%;">'+
        '<thead>'+
        '<tr class="text-center">'+
            '<th>'+
                '<button tabindex="-1" type="button" class="btn pull-left" ng-click="$selectPane(-1)">'+
                    '<i class="fa fa-chevron-left"></i>'+
                '</button>'+
            '</th>'+
            '<th colspan="{{ rows[0].length - 2 }}">'+
                '<button tabindex="-1" type="button" class="btn btn-default btn-block text-strong"  ng-click="$toggleMode()">'+
                    '<strong style="text-transform: capitalize;" ng-bind="title"></strong>'+
                '</button>'+
            '</th>'+
            '<th>'+
                '<button tabindex="-1" type="button" class="btn pull-right" ng-click="$selectPane(+1)">'+
                    '<i class="fa fa-chevron-right"></i>'+
                '</button>'+
            '</th>'+
        '</tr>'+
        '<tr ng-show="showLabels" class="days" ng-bind-html="labels"></tr>'+
        '</thead>'+
        '<tbody>'+
        '<tr ng-repeat="(i, row) in rows" height="{{ 100 / rows.length }}%">'+
            '<td class="text-center" ng-repeat="(j, el) in row">'+
                '<button tabindex="-1" type="button" class="btn btn-default" style="width: 100%" ng-class="{\'btn-primary\': el.selected, \'btn-today\': el.isToday && !el.selected}" ng-click="$select(el.date)" ng-disabled="el.disabled">'+
                                    '<span ng-class="{\'text-muted\': el.muted}" ng-bind="el.label"></span>'+
                '</button>'+
            '</td>'+
        '</tr>'+
        '</tbody>'+
    '</table>'+
'</div>');

$templateCache.put('templates/tinkAccordionGroup.html',
  '<section class="accordion-panel">'+
  '<a href class="accordion-toggle" ng-click="toggleOpen()">'+
    '<div class="accordion-panel-heading">'+
      '<i class="fa fa-th-large"></i>'+
      '<h4 class="panel-title">'+
        '<span>{{heading}}</span>'+
      '</h4>'+
    '</div>'+
  '</a>'+
  '<div class="accordion-panel-body">'+
    '<div class="accordion-spinner"><i class="fa fa-rotate-right fa-spin"></i></div>'+
    '<div class="accordion-loaded-content" ng-transclude>'+
        '<p>New DOM content comes here</p>'+
    '</div>'+
  '</div>'+
'</section>');
}]);
