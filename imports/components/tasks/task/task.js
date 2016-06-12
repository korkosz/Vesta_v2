import Projects from '/imports/api/project/project';
import Tasks from '/imports/api/task/task';
import Ideas from '/imports/api/ideas/idea';
import Comments from '/imports/api/task/comment';
import Metadata from '/imports/api/metadata/metadata';

import pill from '/imports/components/lib/pill/pill';
import comment from '/imports/components/tasks/comment/comment';

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
                return Tasks.findOne({ number: parseInt(this.$routeParams.number) });
            },
            idea() {
                this.getReactively('task');
                if(this.task) return Ideas.findOne(this.task.ideaId);                  
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
            relationsTypes() {
                var metadata = Metadata.findOne({ metadataName: 'EntitiesRelations' });
                if(metadata) {
                    return metadata.value['task_task'];       
                } else {
                    return [];
                }    
            },
            comments() {
                this.getReactively('task');
                if (this.task) {
                    var x = this.task.getComments();
                    return x;
                }
            }
        });
    }

    addComment() {
         var notify = {
            assignedUser: this.task.assigned,
            provider: Meteor.userId(),
            id: this.task.id,
            when: new Date(),
            entityCreator: this.task.createdBy
        };

        Comments.insert({
            content: this.comment,
            taskId: this.task._id,
            createdBy: Meteor.userId(),
            createdAt: new Date()
        }, null, notify);
        this.comment = '';
    }

    saveDescription() {
        var notify = {
            assignedUser: this.task.assigned,
            provider: Meteor.userId(),
            id: this.task.id,
            when: new Date(),
            entityCreator: this.task.createdBy
        };

        Tasks.update(this.task._id, {
            $set: {
                description: this.task.description
            }
        }, null, notify);
        this.stopEditDescription();
    };

    selectListChanged(property) {
        var updateObj = {};
        updateObj[property] = this.task[property];

        var notify = {
            assignedUser: this.task.assigned,
            provider: Meteor.userId(),
            id: this.task.id,
            when: new Date(),
            entityCreator: this.task.createdBy
        };

        Tasks.update(this.task._id, {
            $set: updateObj
        }, null, notify);
    }

    removeTask() {
        $('#deleteTaskModal').modal('hide');
        Tasks.remove(this.task._id, true);
        this.$timeout(() => {
            this.$location.url('/');
        }, 500);
    }
    
    goDetails(entityName, number) {
        this.$location.path('/' + entityName + '/' + number);
    };
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