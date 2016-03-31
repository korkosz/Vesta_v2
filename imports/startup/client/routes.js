import '/imports/components/home.html'

angular.module('simple-todos')
    .config(function($routeProvider) {
        $routeProvider.
	        when('/', {
	            templateUrl: 'imports/components/home.html'
	        });
    });
