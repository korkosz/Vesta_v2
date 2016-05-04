import '/imports/pages/home.html'
import '/imports/pages/idea/idea_view.html'
import '/imports/pages/task/task_view.html'

angular.module('simple-todos')
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.
	        when('/', {
	            templateUrl: 'imports/pages/home.html'               
	        }).
            when('/idea/:id', {
	            templateUrl: 'imports/pages/idea/idea_view.html'
	        }).
            when('/task/:id', {
	            templateUrl: 'imports/pages/task/task_view.html'
	        });
    }]);
