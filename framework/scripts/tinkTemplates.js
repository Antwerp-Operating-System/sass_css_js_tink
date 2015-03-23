angular.module('tink.templates', []).run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/tinkAccordionGroup.html',
    "<section class=accordion-panel> <a href class=accordion-toggle ng-click=toggleOpen()> <div class=accordion-panel-heading> <i class=\"fa fa-th-large\"></i> <h4 class=panel-title> <span>{{heading}}</span> </h4> </div> </a> <div class=accordion-panel-body> <div class=accordion-loaded-content ng-transclude> <p>New DOM content comes here</p> </div> </div> </section>"
  );


  $templateCache.put('templates/tinkDatePicker.html',
    "<div class=\"dropdown-menu datepicker\" ng-class=\"'datepicker-mode-' + $mode\"> <table style=\"table-layout: fixed; height: 100%; width: 100%\"> <thead> <tr class=text-center> <th> <button tabindex=-1 type=button ng-disabled=pane.prev class=\"btn pull-left\" ng-click=$selectPane(-1)> <i class=\"fa fa-chevron-left\"></i> </button> </th> <th colspan=\"{{ rows[0].length - 2 }}\"> <button tabindex=-1 type=button class=\"btn btn-block text-strong\" ng-click=$toggleMode()> <strong style=\"text-transform: capitalize\" ng-bind=title></strong> </button> </th> <th> <button tabindex=-1 type=button ng-disabled=pane.next class=\"btn pull-right\" ng-click=$selectPane(+1)> <i class=\"fa fa-chevron-right\"></i> </button> </th> </tr> <tr ng-show=showLabels class=datepicker-days ng-bind-html=labels></tr> </thead> <tbody> <tr ng-repeat=\"(i, row) in rows\" height=\"{{ 100 / rows.length }}%\"> <td class=text-center ng-repeat=\"(j, el) in row\"> <button tabindex=-1 type=button class=btn style=\"width: 100%\" ng-class=\"{'btn-selected': el.selected, 'btn-today': el.isToday && !el.elected}\" ng-click=$select(el.date) ng-disabled=el.disabled> <span ng-class=\"{'text-muted': el.muted}\" ng-bind=el.label></span> </button> </td> </tr> </tbody> </table> </div>"
  );


  $templateCache.put('templates/tinkDatePickerField.html',
    "<div class=\"dropdown-menu datepicker\" ng-class=\"'datepicker-mode-' + $mode\"> <table style=\"table-layout: fixed; height: 100%; width: 100%\"> <thead> <tr class=text-center> <th> <button tabindex=-1 type=button ng-disabled=pane.prev class=\"btn pull-left\" ng-click=$selectPane(-1)> <i class=\"fa fa-chevron-left\"></i> </button> </th> <th colspan=\"{{ rows[0].length - 2 }}\"> <button tabindex=-1 type=button class=\"btn btn-block text-strong\" ng-click=$toggleMode()> <strong style=\"text-transform: capitalize\" ng-bind=title></strong> </button> </th> <th> <button tabindex=-1 type=button ng-disabled=pane.next class=\"btn pull-right\" ng-click=$selectPane(+1)> <i class=\"fa fa-chevron-right\"></i> </button> </th> </tr> <tr class=datepicker-days ng-bind-html=labels ng-if=showLabels></tr> </thead> <tbody> <tr ng-repeat=\"(i, row) in rows\" height=\"{{ 100 / rows.length }}%\"> <td class=text-center ng-repeat=\"(j, el) in row\"> <button tabindex=-1 type=button class=btn style=\"width: 100%\" ng-class=\"{'btn-selected': el.selected, 'btn-today': el.isToday && !el.elected}\" ng-click=$select(el.date) ng-disabled=el.disabled> <span ng-class=\"{'text-muted': el.muted}\" ng-bind=el.label></span> </button> </td> </tr> </tbody> </table> </div>"
  );


  $templateCache.put('templates/tinkDatePickerInput.html',
    "<div class=datepicker-input-fields> <input tink-format-input data-format=00/00/0000 data-placeholder=dd/mm/jjjj data-date dynamic-name=dynamicName data-max-date=maxDate data-min-date=minDate ng-model=\"ngModel\">\n" +
    "<span class=datepicker-icon> <i class=\"fa fa-calendar\"></i> </span> </div>"
  );


  $templateCache.put('templates/tinkDatePickerRange.html',
    "<div class=datepickerrange> <div class=\"pull-left datepickerrange-left\"> <div class=datepickerrange-header-left> <div class=pull-left> <button tabindex=-1 type=button class=\"btn pull-left\" ng-click=$selectPane(0)> <i class=\"fa fa-chevron-left\"></i> </button> </div> <div class=\"text-center clearfix\"> <label ng-bind=firstTitle></label> </div> </div> <div class=table-responsive> <table> <thead> <tr class=datepicker-days ng-bind-html=dayLabels> </tr> </thead> <tbody id=firstCal ng-bind-html=firstCal> </tbody> </table> </div> </div> <div class=\"pull-right datepickerrange-right\"> <div class=datepickerrange-header-right> <div class=pull-right> <button tabindex=-1 type=button class=\"btn pull-left\" ng-click=$selectPane(1)> <i class=\"fa fa-chevron-right\"></i> </button> </div> <div class=\"text-center clearfix\"> <label ng-bind=lastTitle></label> </div> </div> <div class=table-responsive> <table> <thead> <tr class=datepicker-days ng-bind-html=dayLabels></tr> </thead> <tbody id=secondCal ng-bind-html=secondCal> </tbody> </table> </div> </div> </div>"
  );


  $templateCache.put('templates/tinkDatePickerRangeInputs.html',
    "<div class=\"datepicker-input-fields row no-gutter\"> <div class=col-sm-6> <input id=firstDateElem class=elem-one data-date data-format=00/00/0000 data-placeholder=dd/mm/jjjj tink-format-input ng-model=firstDate valid-name=first>\n" +
    "<span class=datepicker-icon> <i class=\"fa fa-calendar\"></i> </span> </div> <div class=col-sm-6> <input id=lastDateElem class=elem-two data-date data-format=00/00/0000 data-placeholder=dd/mm/jjjj tink-format-input ctrl-model=dynamicName valid-name=last ng-model=lastDate>\n" +
    "<span class=datepicker-icon> <i class=\"fa fa-calendar\"></i> </span> </div> </div>"
  );


  $templateCache.put('templates/tinkInteractiveTable.html',
    " <div class=bar> <div class=bar-section>  <ul class=bar-section-right> <li> <button data-ng-if=\"viewActions && selectedCheck\" tink-popover tink-popover-group=option-table tink-popover-template=templates/tinkTableAction.html>Acties <i class=\"fa fa-caret-down\"></i></button> </li> <li> <button tink-popover tink-popover-group=option-table tink-popover-template=templates/tinkTableShift.html>Kolommen <i class=\"fa fa-caret-down\"></i></button> </li> </ul> </div> </div>  <table></table> <div class=table-sort-options data-ng-if=\"itemLength > 0\"> <div class=table-sort-info> <strong>{{numFirst}} - {{numLast}}</strong> van {{itemLength}} <div class=select> <select data-ng-change=setItems() data-ng-model=perPage.pages> <option data-ng-repeat=\"items in itemsPerPage\" data-ng-bind=items>{{items}}</option> </select> items per pagina </div> </div> <div class=table-sort-pagination data-ng-if=\"pages > 1\"> <ul class=pagination> <li class=prev data-ng-class=\"{disabled:pageSelected===1}\" data-ng-click=setPrev()><a href=\"\"><span>Vorige</span></a></li> <li data-ng-class=\"{active:pageSelected===1}\" data-ng-click=setFirst()><a href=\"\">1</a></li> <li data-ng-repeat=\"pag in showNums track by $index\" data-ng-class=\"{active:pag===pageSelected}\" data-ng-click=setPage(pag)><a href=\"\" data-ng-if=\"pag !== -1\">{{pag}}</a> <span data-ng-show=\"pag === -1\">...<span></span></span></li> <li class=next data-ng-click=setNext() data-ng-class=\"{disabled:pageSelected===pages}\"><a href=\"\"><span>Volgende</span></a></li> </ul> </div> </div>"
  );


  $templateCache.put('templates/tinkTableAction.html',
    "<ul class=\"popover-list-buttons ng-scope\"> <li data-ng-repeat=\"action in viewActions\"><a href=\"\" data-ng-click=action.callback()>{{action.name}}</a></li> </ul>"
  );


  $templateCache.put('templates/tinkTableShift.html',
    "<div class=table-interactive-options tink-shift-sort>  <div class=table-interactive-sort> <button class=btn-borderless ng-disabled=\"selected<1\" ng-click=omhoog()><i class=\"fa fa-arrow-up\"> </i></button>\n" +
    "<button class=btn-borderless ng-disabled=\"selected<0 || selected === selectedMax\" ng-click=omlaag()><i class=\"fa fa-arrow-down\"></i></button> </div>  <ul ng-model=viewer class=table-interactive-cols> <li ng-repeat=\"header in viewer | filter:{ visible: true }\"> <div class=\"checkbox is-selectable is-draggable\" ng-class=\"{selected:selected===$index}\"> <input type=checkbox ng-model=header.checked ng-change=headerChange() id={{header.alias}} name={{header.alias}} value={{header.alias}} checked> <label for={{header.alias}}><span class=draggable-elem ng-class=\"{selected:selected===$index}\" ng-click=select($event,$index)>{{header.alias}}</span></label> </div> </li> </ul> <div class=table-interactive-sort>  <button class=btn-xs ng-click=close()>Sluiten</button> </div> </div>"
  );


  $templateCache.put('templates/tinkUpload.html',
    "<div class=upload> <div class=upload-zone> <div data-ng-mouseup=browseFiles($event)> <strong translate>Sleep hier een bestand</strong> <span translate>of klik om te bladeren</span>\n" +
    "<input data-ng-if=multiple class=upload-file-input name={{fieldName}} type=file data-ng-file-select=onFileSelect($files) multiple>\n" +
    "<input data-ng-if=!multiple class=upload-file-input name={{fieldName}} type=file data-ng-file-select=\"onFileSelect($files)\"> </div> <span class=help-block data-ng-transclude>Toegelaten bestanden: jpg, gif, png, pdf. Maximum grootte: 2MB</span> </div> <p class=upload-file-change data-ng-if=message.hold>De vorige file werd vervangen. <a data-ng-mouseup=undo($event)>Ongedaan maken.</a></p> <ul class=upload-files> <li data-ng-repeat=\"file in files track by $index\" data-ng-class=\"{'success': !file.error && file.getProgress() === 100, 'error': file.error}\"> <span class=upload-filename>{{file.getFileName()}}</span>\n" +
    "<span class=upload-fileoptions> <button class=upload-btn-delete data-ng-click=del($index) data-ng-if=\"file.getProgress() === 100 || file.error\"><span class=sr-only>Verwijder</span></button>\n" +
    "<span class=upload-feedback data-ng-if=\"!file.error && file.getProgress() !== 100\">{{file.getProgress()}}%</span> </span>\n" +
    "<span class=upload-error data-ng-if=file.error> <span data-ng-if=file.error.type>Dit bestandstype is niet toegelaten.</span>\n" +
    "<span data-ng-if=file.error.size>Dit bestand overschrijdt de toegelaten bestandsgrootte.</span>\n" +
    "<span data-ng-if=\"!file.error.type && !file.error.size\">Er is een fout opgetreden bij het uploaden. Probeer het opnieuw.</span> </span>\n" +
    "<span class=upload-progress style=\"width: {{file.getProgress()}}%\"></span> </li> </ul> </div>"
  );


  $templateCache.put('templates/tooltip.html',
    "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\"> <div class=tooltip-arrow></div> <div class=tooltip-inner ng-bind=content></div> </div>"
  );

}]);
