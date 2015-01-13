'use strict';

describe('tinkaccordion', function() {
  beforeEach(module('tink'));

  var bodyEl = $('body'), sandboxEl,today,scope,$compile,$templateCache,dateCalculator;

  beforeEach(inject(function (_$rootScope_, _$compile_, _$templateCache_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
    $templateCache = _$templateCache_;
    dateCalculator = _dateCalculator_;
    today = new Date();
    bodyEl.html('');
    sandboxEl = $('<div>').attr('id', 'sandbox').appendTo(bodyEl);
  }));

  afterEach(function() {
    scope.$destroy();
    sandboxEl.remove();
  });

  var templates = {
    'default': {
      scope: {dates: {first:new Date(2014,11,30),last:null}},
      element: '<tink-accordion data-one-at-a-time="false">'+
      '<tink-accordion-group toggle-var="togle" heading="head 1">hier is wat content</tink-accordion-group>'+
      '<tink-accordion-group toggle-var="togle" heading="head 2">hier is wat content</tink-accordion-group>'+
      '<tink-accordion-group heading="head 3">hier is wat content</tink-accordion-group>'+
      '<tink-accordion-group data-onclick="group1go" heading="head 4">'+
      'nu gaan we effe heel veel content plaatsen<br/>'+
      'hier komt dus super veel<br/>'+
      'om dit goed te kunnen testen<br/>'+
      '<table>'+
        '<thead>'+
          '<tr>'+
            '<th># </th>'+
            '<th>First Name </th>'+
            '<th>Last Name </th>'+
            '<th>Username </th>'+
          '</tr>'+
        '</thead>'+
        '<tbody>'+
          '<tr>'+
            '<td>1 </td>'+
            '<td>Mark </td>'+
            '<td>Otto </td>'+
            '<td>@mdo </td>'+
          '</tr>'+
          '<tr>'+
            '<td>2 </td>'+
            '<td>Jacob </td>'+
            '<td>Thornton </td>'+
            '<td>@fat </td>'+
          '</tr>'+
          '<tr>'+
            '<td>3 </td>'+
            '<td>Larry </td>'+
            '<td>the Bird </td>'+
            '<td>@twitter </td>'+
          '</tr>'+
        '</tbody>'+
        '<tfoot>'+
          '<tr>'+
            '<th> </th>'+
            '<th colspan="3">Footer info can be put here </th>'+
          '</tr>'+
        '</tfoot>'+
      '</table>'+
      '</tink-accordion-group>'+
      '</tink-accordion>'
    }
  };

  function compileDirective(template, locals) {
    template = templates[template];
    angular.extend(scope, angular.copy(template.scope || templates['default'].scope), locals);
    var element = $(template.element).appendTo(sandboxEl);
    element = $compile(element)(scope);
    scope.$digest();
    return jQuery(element[0]);
  }

});