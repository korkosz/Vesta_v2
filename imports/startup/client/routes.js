import '/imports/pages/home.html';
import '/imports/pages/idea/idea_view.html';
import '/imports/pages/task/task_view.html';
import '/imports/pages/ask/ask.html';

angular.module('simple-todos')
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
			when('/', {
				templateUrl: 'imports/pages/home.html'
			}).
			when('/:id', {
				redirectTo: function (params) {
					var id = params.id;
					//reverse to search from the end
					id = id.split("").reverse().join("");
					var idx = id.search(/[AIT]/);
					var letter = id[idx];
					var _id = id.substring(0, idx);
					_id = _id.split("").reverse().join("");
					
					if(!Number.isSafeInteger(Number.parseInt(_id)))
						return '/';	
						
					switch (letter) {
						case 'A':
							return '/ask/' + _id;
						case 'I':
							return '/idea/' + _id;
						case 'T':
							return '/task/' + _id;
						default:
							return '/';
					}
				}
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
