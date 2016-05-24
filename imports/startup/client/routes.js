import '/imports/pages/home.html';
import '/imports/pages/idea/idea_view.html';
import '/imports/pages/task/task_view.html';
import '/imports/pages/ask/ask.html';

angular.module('simple-todos')
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.
	        when('/', {
	            templateUrl: 'imports/pages/home.html'               
	        }).
            when('/idea/:number', {
	            templateUrl: 'imports/pages/idea/idea_view.html'
	        }).
            when('/task/:id', {
	            templateUrl: 'imports/pages/task/task_view.html'
	        }).
			 when('/ask/:number', {
	            templateUrl: 'imports/pages/ask/ask.html'
	        });
    }]);
