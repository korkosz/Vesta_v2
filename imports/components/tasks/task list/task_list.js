import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';
import Tasks from '/imports/api/task/task';
import Metadata from '/imports/api/metadata/metadata';

import './task_list.html';

class TaskListCtrl {
	constructor($scope, $location) {
		$scope.viewModel(this);
        
        this.title = !!this.title ? this.title : 'Tasks';
        this.$location = $location;
        this.helpers({
            tasks() {  
                ///Musi byc tutaj bo helper refreshuje sie 
                ///po zmianie kolekcji
                this.filter = !!this.filter ? this.filter : {};              
                return Tasks.find(this.filter);
            }     
        });  
	}
    
    details(id) {
        this.$location.path('/task/' + id);    
    }
}
TaskListCtrl.$inject = ['$scope', '$location'];

export default angular.module("task")
    .component('taskList', {
        templateUrl: "imports/components/tasks/task list/task_list.html",
        controller: TaskListCtrl,
        bindings: {
            filter: '<',
            title: '@'    
        }
    });