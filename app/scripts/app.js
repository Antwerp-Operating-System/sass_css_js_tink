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
    'tink.datepickerRange',
    'tink.header'

    // 'tink.datepicker'
  ])
  	.config(function ($routeProvider) { /*, $locationProvider */
		$routeProvider
			.when('/', {
				templateUrl: 'views/main.html',
				// controller: 'MainCtrl'
			})
			.when('/datepicker', {
				templateUrl: 'views/datepickertest.html'
			})
			.when('/:page', {
			    templateUrl: 'views/home.html',
			    controller: 'LocationCtrl'
			  })
			.when('/:page/:subpage', {
			    templateUrl: 'views/home.html',
			    controller: 'LocationCtrl'
			  })
			.otherwise({
				redirectTo: '/'
			});

	});
