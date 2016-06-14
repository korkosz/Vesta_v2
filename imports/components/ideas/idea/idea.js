import Projects from '/imports/api/project/project';
import Ideas from '/imports/api/ideas/idea';
import Metadata from '/imports/api/metadata/metadata';
import Tasks from '/imports/api/task/task';
import Asks from '/imports/api/ask/ask';
import pill from '/imports/components/lib/pill/pill';
import './review';
import './review.html';
import './idea.html';

class IdeaCtrl {
    constructor($scope, $routeParams, $location, $timeout) {
        $scope.viewModel(this);

        this.descriptionEdited = false;
        this.$routeParams = $routeParams;
        this.$location = $location;
        this.$timeout = $timeout;
        this.moment = moment;
        this.reviewers = [];
        this.statusImplementedAlreadyChanged = false;
        this.statusWorkingAlreadyChanged = false;

        function clearArray(arr) {
            for (var i = 0, len = arr.length; i < len; i++)
                arr.pop();
            return arr;
        }

        this.helpers({
            idea() {
                var idea = Ideas.findOne({ number: parseInt(this.$routeParams.number) });
                if (idea) {
                    var vm = this;
                    let reviewers = Meteor.users.find({
                        _id: {
                            $in: idea.reviewers
                        }
                    }).map(function (rev) {
                        return rev.profile.fullname;
                    });

                    clearArray(vm.reviewers);

                    reviewers.forEach((rev) => {
                        vm.reviewers.push(rev);
                    });
                }
                return idea;
            },
            ideaStatuses() {
                return Metadata.findOne({ metadataName: 'IdeaStatuses' });
            },
            project() {
                this.getReactively('idea');
                if (this.idea) {
                    var project = Projects.findOne(this.idea.project);
                    if (project) {
                        project.sprints = project.sprints.filter((sprint) => {
                            return sprint >= project.currentSprint;
                        });
                        return project;
                    }
                }
            },
            users() {
                this.getReactively('reviewers.length');
                if (this.idea) {
                    return Meteor.users.find({
                        _id: {
                            $nin: this.idea.reviewers
                        }
                    });
                }
            },
            tasks() {
                this.getReactively('idea');
                if (this.idea) {
                    return Tasks.find({
                        ideaId: this.idea._id,
                        isDeleted: false
                    });
                }
            },
            asks() {
                this.getReactively('idea');
                if (this.idea) {
                    return Asks.find({
                        ideaId: this.idea._id,
                        isDeleted: false
                    });
                }
            },
            setDiscussed() {
                this.getReactively('asks.length');
                if (!this.asks ||
                    this.asks.length < 1 ||
                    this.tasks.length > 0) return;

                if (this.idea.status === 'Consider') {
                    Ideas.update(this.idea._id, {
                        $set: {
                            status: 'Discussed'
                        }
                    });
                }
            },
            setWorkingStatus() {
                this.getReactively('tasks.length');
                if (!this.tasks || this.tasks.length < 1) return;

                if (this.idea.status === 'Consider' ||
                    this.idea.status === 'Discussed') {
                    Ideas.update(this.idea._id, {
                        $set: {
                            status: 'Working'
                        }
                    });
                }
            },
            setImplemented() {
                this.getReactively('tasks');
                if (!this.tasks || this.tasks.length < 1) return;

                if (this.idea.status === 'Working' ||
                    this.idea.status === 'Implemented') {

                    var notify = {
                        reviewers: this.idea.reviewers,
                        provider: Meteor.userId(),
                        id: this.idea.id,
                        when: new Date(),
                        entityCreator: this.idea.createdBy
                    };

                    var allTasksDone = true;
                    this.tasks.forEach((task) => {
                        if (task.status !== "Closed")
                            allTasksDone = false;
                    });

                    if (allTasksDone) {
                        if (this.idea.status === 'Implemented') return;
                        if (this.statusImplementedAlreadyChanged) return;
                        Ideas.update(this.idea._id, {
                            $set: {
                                status: 'Implemented'
                            }
                        }, null, notify);
                        this.statusImplementedAlreadyChanged = true;
                        this.statusWorkingAlreadyChanged = false;
                    } else if (this.idea.status === 'Implemented') {
                        if (this.statusWorkingAlreadyChanged) return;

                        Ideas.update(this.idea._id, {
                            $set: {
                                status: 'Working'
                            }
                        }, null, notify);

                        this.statusImplementedAlreadyChanged = false;
                        this.statusWorkingAlreadyChanged = true;
                    }
                }
            }
        });
    }

    removeIdea() {
        $('#deleteIdeaModal').modal('hide');
        Ideas.remove(this.idea._id, true);
        this.$timeout(() => {
            this.$location.url('/');
        }, 500);
    }

    reviewerSelected() {
        var notify = {
            reviewers: this.idea.reviewers,
            provider: Meteor.userId(),
            id: this.idea.id,
            when: new Date(),
            entityCreator: this.idea.createdBy
        };

        Ideas.update(this.idea._id, {
            $push: {
                reviewers: this.reviewer._id
            }
        }, null, notify);
    }

    changeStatusBtnsVisibility(btn) {
        if (!this.idea) return;
        var status = this.idea.status.toUpperCase();

        switch (btn) {
            case 'Defer':
            case 'Reject':
                return status === 'NEW' ||
                    status === 'CONSIDER' ||
                    status === 'DISCUSSED';
            case 'Close':
                return status === 'IMPLEMENTED';
        }
    }

    saveDescription() {
        var notify = {
            reviewers: this.idea.reviewers,
            provider: Meteor.userId(),
            id: this.idea.id,
            when: new Date(),
            entityCreator: this.idea.createdBy
        };

        Ideas.update(this.idea._id, {
            $set: {
                description: this.idea.description
            }
        }, null, notify);
        this.stopEditDescription();
    }

    setStatus(_status) {
        var notify = {
            reviewers: this.idea.reviewers,
            provider: Meteor.userId(),
            id: this.idea.id,
            when: new Date(),
            entityCreator: this.idea.createdBy
        };

        var updateObj = {
            status: _status
        };

        if ((_status === 'Rejected' ||
            _status === 'Deferred') &&
            this.reason && this.reason.length > 0) {
            angular.extend(updateObj, {
                reason: this.reason
            });
        }

        Ideas.update(this.idea._id, {
            $set: updateObj
        }, null, notify);
    }

    goDetails(entityName, number) {
        this.$location.path('/' + entityName + '/' + number);
    }

    setSprint() {
        Ideas.update(this.idea._id, {
            $set: { sprint: this.sprint }
        });
    }
};
IdeaCtrl.$inject = ['$scope', '$routeParams', '$location', '$timeout'];
export default angular.module('idea')
    .directive('idea', function () {
        return {
            templateUrl: 'imports/components/ideas/idea/idea.html',
            controller: IdeaCtrl,
            controllerAs: '$ctrl',
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