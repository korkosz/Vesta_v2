import Projects from '/imports/api/project/project';
import Tasks from '/imports/api/task/task';
import Comments from '/imports/api/task/comment';
import Metadata from '/imports/api/metadata/metadata';

import pill from '/imports/components/lib/pill/pill';
import './task.html';

class TaskCtrl {
    constructor($scope, $routeParams, $sce, $location, $timeout) {
        $scope.viewModel(this);

        this.descriptionEdited = false;
        this.$routeParams = $routeParams;
        this.$timeout = $timeout;
        this.$location = $location;

        this.helpers({
            task() {
                return Tasks.findOne({ _id: this.$routeParams.id });
            },
            taskStatuses() {
                return Metadata.findOne({ metadataName: 'TaskStatuses' });
            },
            taskTypes() {
                return Metadata.findOne({ metadataName: 'TaskType' });
            },
            taskPriorities() {
                return Metadata.findOne({ metadataName: 'TaskPriority' });
            },
            comments() {
                this.getReactively('task');
                if(this.task) {
                    var x = this.task.getComments();
                    return x;
                }
            }
        });
    }
    
    addComment() {
        Comments.insert({
            content: this.comment,
            taskId: this.task._id,
            createdAt: new Date()
        });
        this.comment = '';
    }
    
    saveDescription() {
         Tasks.update(this.task._id, {
            $set: {
                description: this.task.description
            }
        });        
        this.stopEditDescription();
    };

    selectListChanged(property) {
        var updateObj = {};
        updateObj[property] = this.task[property];
        Tasks.update(this.task._id, {
            $set: updateObj
        });
    }

    removeTask() {
        $('#deleteTaskModal').modal('hide');
        Tasks.remove(this.task._id, true);
        this.$timeout(() => {
            this.$location.url('/');
        }, 500);
    }
};
TaskCtrl.$inject = ['$scope', '$routeParams', '$sce', '$location', '$timeout'];

export default angular.module('task')
    .directive('task', function () {
        return {
            templateUrl: 'imports/components/tasks/task/task.html',
            controller: TaskCtrl,
            controllerAs: "$ctrl",
            link
        }
    });
    
function link(scope, el, attr, ctrl) {
    // hide toolbar
    el.find('[text-angular-toolbar]').css('display', 'none');

    ctrl.editDescription = function () {
        el.find('[text-angular-toolbar]').css('display', 'block');
        ctrl.descriptionEdited = true;
    };

    ctrl.stopEditDescription = function () {
        el.find('[text-angular-toolbar]').css('display', 'none');
        ctrl.descriptionEdited = false;
    };
}