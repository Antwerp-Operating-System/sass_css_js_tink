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
    'tink.datepicker1'
  ])
	.config(function ($routeProvider) { /*, $locationProvider */
		$routeProvider
			.when('/', {
				templateUrl: 'views/main.html',
				controller: 'MainCtrl'
			})
			.when('/start', {
				templateUrl: 'views/start.html'
			})
			.when('/docs', {
				templateUrl: 'views/docs.html',
				controller: 'DocsCtrl'
			})
			.when('/docs/ui', {
				redirectTo: '/docs/ui/typography'
			})
			.when('/docs/forms', {
				redirectTo: '/docs/forms/elements'
			})
			.when('/docs/:subpage', {
				templateUrl: 'views/docs.html',
				controller: 'DocsCtrl'
			})
			.when('/docs/:subpage/:subsubpage', {
				templateUrl: 'views/docs.html',
				controller: 'DocsCtrl'
			})
			.when('/changelog', {
				templateUrl: 'views/changelog.html'
			})
			.when('/datepicker', {
				templateUrl: 'views/datepickertest.html',
        controller:'DateCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});
	});
