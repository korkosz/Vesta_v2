import '/imports/pages/home.html'

angular.module('simple-todos')
    .config(function($routeProvider) {
        $routeProvider.
	        when('/', {
	            templateUrl: 'imports/pages/home.html'
	        });
    });
