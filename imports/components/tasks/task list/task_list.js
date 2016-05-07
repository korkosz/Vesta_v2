import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';
import Tasks from '/imports/api/task/task';
import Metadata from '/imports/api/metadata/metadata';

import './task_list.html';

class TaskListCtrl {
    constructor($scope, $location) {
        $scope.viewModel(this);
        
        this.moment = moment;
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
    //background-color:  - taki gdy Closed ?
    // - taki kolor gdy task ready for testing
    getPriorityColor(priority) {
        switch (priority) {
            case 'High':
                return 'red';
            case 'Low':
                return 'Green';
            default:
                return 'Black';
        }
    }

    getStatusColor(status) {
        switch (status) {
            case 'Closed':
                return '#73FFB2';
            case 'Ready for testing':
                return 'aliceblue';
            default:
                return 'White';
        }
    }
    
    statusFilter(task) {
        switch (task.status) {
            case 'Closed':
                return 3;
            case 'Ready for testing':
                return 2;
            default:
                return 1;
        }
    }
    
    priorityFilter(task) {
        switch (task.priority) {
            case 'High':
                return 1;
            case 'Low':
                return 3;
            default:
                return 2;
        }
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