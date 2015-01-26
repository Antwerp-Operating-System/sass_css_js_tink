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
        '<div class="dropdown-menu tink-datepicker" ng-class="\'datepicker-mode-\' + $mode">'+
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
                '<button tabindex="-1" type="button" class="btn btn-default" style="width: 100%" ng-class="{\'btn-primary\': el.selected, \'btn-info btn-today\': el.isToday && !el.selected}" ng-click="$select(el.date)" ng-disabled="el.disabled">'+
                                    '<span ng-class="{\'text-muted\': el.muted}" ng-bind="el.label"></span>'+
                '</button>'+
            '</td>'+
        '</tr>'+
        '</tbody>'+
    '</table>'+
'</div>');

$templateCache.put('templates/tinkDatePickerRange.html',
        '<div class="tink-datepickerrange">'+
  '<div class="pull-left tink-datepickerrange-left">'+
    '<div class="tink-datepickerrange-header-left">'+
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
  '<div class="pull-right tink-datepickerrange-right">'+
    '<div class="tink-datepickerrange-header-right">'+
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

$templateCache.put('templates/tinkDatePickerRangeInputs0.html',
    '<div>'+
  '<input type="text" id="firstDateElem" placeholder="dd/mm/jjjj"  ng-model="firstDateModel" ng-model-options="{ updateOn: \'blur\' }"  tink-valid-date data-format="dd/mm/yyyy" style="width: 200px;float: left;">'+
  '<input type="text" id="lastDateElem" placeholder="dd/mm/jjjj" ng-model="lastDateModel" ng-model-options="{ debounce: 1000 }" tink-valid-date data-format="dd/mm/yyyy" style="width: 200px;" >'+
  '</div>');

$templateCache.put('templates/tooltip.html',
    '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">'+
      '<div class="tooltip-arrow"></div>'+
      '<div class="tooltip-inner" ng-bind="content"></div>'+
    '</div>');
}]);
