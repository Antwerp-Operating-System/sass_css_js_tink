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
    'tink.dateHelper',
    'tink.datepickerRange'
  ])
	.config(function ($routeProvider) { /*, $locationProvider */
		$routeProvider
			.when('/', {
				templateUrl: 'views/main.html',
        controllers:'mainCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});

	});
