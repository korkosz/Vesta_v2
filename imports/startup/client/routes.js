import '/imports/pages/dashboard/dashboard.html';
import '/imports/pages/temp.html';
import '/imports/pages/project/project.html';
import '/imports/pages/bookmark/bookmark.html'

angular.module('simple-todos')
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
			when('/', {
				templateUrl: 'imports/pages/dashboard/dashboard.html'
			}).
			when('/temp', {
				templateUrl: 'imports/pages/temp.html',
				controller: 'globalCtrl',
				controllerAs: 'vm'
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

					if (!Number.isSafeInteger(Number.parseInt(_id)))
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
				template: '<idea></idea>'
			}).
            when('/task/:number', {
				template: '<task></task>'
			}).
			when('/ask/:number', {
				template: '<ask></ask>'
			}).
			when('/project/:name', {
				templateUrl: 'imports/pages/project/project.html'
			}).
			when('/bookmark/:name', {
				templateUrl: 'imports/pages/bookmark/bookmark.html'
			});
    }]);
