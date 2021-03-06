import '/imports/pages/dashboard/dashboard.html';
import '/imports/pages/project/project.html';
import '/imports/pages/project/project_new.html';
import '/imports/pages/project/projectList.html';
import '/imports/pages/bookmark/bookmark.html'
import '/imports/pages/search/search.html'
import '/imports/pages/sprint/sprintPlanning.html'

angular.module('simple-todos')
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
			when('/', {
				templateUrl: 'imports/pages/dashboard/dashboard.html'		
			}).
			when('/search', {
				templateUrl: 'imports/pages/search/search.html',
				controller: 'searchCtrl',
				controllerAs: 'vm'
			}).			
			when('/projects', {
				templateUrl: 'imports/pages/project/projectList.html',
				controller: 'ProjectListCtrl',
				controllerAs: 'vm'
			}).
			when('/sprint/:id', {
				templateUrl: 'imports/pages/sprint/sprintPlanning.html',
				controller: 'SprintPlanningCtrl',
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
			when('/project/new', {
				templateUrl: 'imports/pages/project/project_new.html',
				controller: 'ProjectNewCtrl',
				controllerAs: 'vm'
			}).
			when('/project/:name', {
				templateUrl: 'imports/pages/project/project.html'
			}).
			when('/bookmark/:name', {
				templateUrl: 'imports/pages/bookmark/bookmark.html'
			});
    }]);
