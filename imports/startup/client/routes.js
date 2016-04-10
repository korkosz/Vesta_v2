import '/imports/pages/home.html'
import '/imports/pages/idea/idea_view.html'

angular.module('simple-todos')
    .config(function($routeProvider) {
        $routeProvider.
	        when('/', {
	            templateUrl: 'imports/pages/home.html'
	        }).
            when('/idea/:id', {
	            templateUrl: 'imports/pages/idea/idea_view.html'
	        });
    });
