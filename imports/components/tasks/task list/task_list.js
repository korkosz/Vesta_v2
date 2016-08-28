import Projects from '/imports/api/project/project';
import Tasks from '/imports/api/task/task';

import './task_list.html';

class TaskListCtrl {
    constructor($scope, $location) {
        $scope.viewModel(this);

        this.moment = moment;
        this.title = !!this.title ? this.title : 'Tasks';
        this.$location = $location;
        this.helpers({
            tasks() {
                if (Meteor.user())
                    return Tasks.find({
                        status: {
                            $in: [1, 2]
                        },
                        project: {
                            $in: Meteor.user().profile.projects
                        }
                    }).map((task) => {
                        task.isNew = moment.utc().diff(task.creationDate, 'days') === 0;
                        return task;
                    });
            },
            project() {
                return Projects.findOne({ name: 'Vesta' });
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
            case 3:
                return 3;
            case 5:
                return 2;
            default:
                return 1;
        }
    }

    getStatusColor(status) {
        switch (status) {
            case 3:
                return '0.5';
            case 5:
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
