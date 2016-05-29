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
                if (angular.isUndefined(this.filter)) {
                    this.filter = { isDeleted: false };
                }
                else {
                    angular.extend(this.filter,
                        { isDeleted: false });
                }
                return Tasks.find(this.filter).map((task)=> {
                    task.isNew = moment().diff(task.creationDate, 'days') === 0;
                    return task;   
                });
            }
        });
    }

    details(number) {
        this.$location.path('/task/' + number);
    }

    hasFilter() {
        return !$.isEmptyObject(this.filter);
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

    getStatusColor(status) {
        switch (status) {
            case 'Closed':
                return '0.5';
            case 'Ready for testing':
                return 'aliceblue';
            default:
                return 'White';
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
