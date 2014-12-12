'use strict';

/**
 * @ngdoc overview
 * @name frameworkApp
 * @description
 * # frameworkApp
 *
 * Main module of the application.
 */
angular.module('tink.controllers',[]);
angular.module('tink', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'tink.controllers',
    'tink.datepicker',
    'tink.dateHelper',
    'tink.popOver',
    'tink.tooltip',
    'tink.datepickerRange'

    // 'tink.datepicker'
  ])
  	.config(function ($routeProvider) { /*, $locationProvider */
		$routeProvider
			.when('/', {
				templateUrl: 'views/main.html',
				// controller: 'MainCtrl'
			})
			.when('/datepicker', {
				templateUrl: 'views/datepickertest.html',
				controller: 'DateCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});

	});
