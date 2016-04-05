import '/imports/pages/home.html'
//import '/imports/pages/globalCtrl';

angular.module('simple-todos')
    .config(function($routeProvider) {
        $routeProvider.
	        when('/', {
	            templateUrl: 'imports/pages/home.html'
	        });
    });
