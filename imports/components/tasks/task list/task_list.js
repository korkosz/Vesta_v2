import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';
import Tasks from '/imports/api/task/task';
import Metadata from '/imports/api/metadata/metadata';

import './task_list.html';

class TaskListCtrl {
	constructor($scope, $location) {
		$scope.viewModel(this);
        
        this.$location = $location;
        this.helpers({
            tasks() {                
                return Tasks.find().map(function (task) {
                	var project = Projects.findOne({_id: task.projectId});
                    var user = Meteor.users.findOne({_id: task.createdBy});
                    
                	task.projectName = project.name;
                    task.createdBy = user.profile.fullname;
                	return task;
                });
            }     
        });  
	}
    
    details(id) {
        this.$location.path('/task/' + id);    
    }
}

export default angular.module("task")
    .component('taskList', {
        templateUrl: "imports/components/tasks/task list/task_list.html",
        controller: TaskListCtrl
    });