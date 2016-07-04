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
            relatedTasks() {
                this.getReactively('task.related.length');

                var me = this;

                if (me.task &&
                    me.task.related &&
                    me.task.related.length > 0) {

                    var tasksIds = me.task.related.filter((rel) => {
                        return rel.entity === 'Task';
                    }).map((relObj) => {
                        return relObj.id;
                    });

                    return Tasks.find({ _id: { $in: tasksIds } }).map((task) => {
                        task.relation = me.task.related.find((rel) => {
                            return rel.id === task._id;
                        }).relation;

                        return task;
                    });
                }


                if (me.idea) {
                    return Tasks.find({
                        ideaId: me.idea._id
                    });
                }
            },
            relatedIdeas() { //should be one
                this.getReactively('task');
                var me = this;

                if (me.task &&
                    me.task.related &&
                    me.task.related.length > 0) {

                    var ideasIds = me.task.related.filter((rel) => {
                        return rel.entity === 'Idea';
                    }).map((relObj) => {
                        return relObj.id;
                    });

                    return Ideas.find({ _id: { $in: ideasIds } }).map((idea) => {
                        idea.relation = me.task.related.find((rel) => {
                            return rel.id === idea._id;
                        }).relation;

                        return idea;
                    });
                }
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
                if (metadata) {
                    return metadata.value['task_task'];
                } else {
                    return [];
                }
            },
            searchResults() {
                this.getReactively('relation.searchText');
                if (!this.relation ||
                    !this.relation.searchText ||
                    this.relation.searchText.length === 0 ||
                    this.selectedResult) return [];

                return Tasks.find({ number: parseInt(this.relation.searchText) });
            },
            comments() {
                this.getReactively('task');
                if (this.task) {
                    return Comments.find({ task: this.task._id });
                }
            }
        });
    }

    changePriority(priority) {
        Meteor.call('tasks.changePriority', this.task._id, priority, (err, res) => {
            if (err) window.alert(err);
        });
    }

    changeStatus(statusId) {
        Meteor.call('tasks.changeStatus', this.task._id, statusId, (err, res) => {
            if (err) window.alert(err);
        });
    }

    cancelSearchResult() {
        this.selectedResult = null;
        this.relation.searchText = null;
        this.relation.relationType = null;
    }

    selectSearchResult(task) {
        this.selectedResult = task;
    }

    addComment() {
        Meteor.call('tasks.addComment',
            this.task._id, this.comment, (err, res) => {
                if (err) window.alert(err);
            });
        this.comment = '';
    }

    saveDescription() {
        Meteor.call('tasks.updateDescription',
            this.task._id, this.task.description, (err, res) => {
                if (err) window.alert(err);
            });
        this.stopEditDescription();
    };

    removeTask() {
        $('#deleteTaskModal').modal('hide');
        Tasks.remove(this.task._id, true);
        this.$timeout(() => {
            this.$location.url('/');
        }, 500);
    }

    createRelation() {
        var relationObj = {
            entity: 'Task',
            id: this.selectedResult._id,
            relation: this.relation.relationType
        }

        Tasks.update(this.task._id, {
            $push: {
                related: relationObj
            }
        });

        relationObj.id = this.task._id;
        if (relationObj.relation === "Solution In") {
            relationObj.relation = "Solution For";
        }

        Tasks.update(this.selectedResult._id, {
            $push: {
                related: relationObj
            }
        });

        this.cancelSearchResult();
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