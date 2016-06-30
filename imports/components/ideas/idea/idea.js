import Projects from '/imports/api/project/project';
import Ideas from '/imports/api/ideas/idea';
import Tasks from '/imports/api/task/task';
import Asks from '/imports/api/ask/ask';
import pill from '/imports/components/lib/pill/pill';
import './_review';
import './_review.html';
import './_statusModal';
import './_firstRelatedModal';
import './_activeVoting.html';
import './_relatedList.html';
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
        this.pendingVoting = false;
        this.deferVoting = false;
        this.votingCb = -1;
        this.descriptionToolbar = `[['h1','h2','h3','pre'],
            ['bold','italics', 'underline', 'strikeThrough', 
            'ul', 'ol', 'clear'],['html', 'insertImage', 
            'insertLink']]`;

        function clearArray(arr) {
            for (var i = 0, len = arr.length; i < len; i++)
                arr.pop();
            return arr;
        }

        this.helpers({
            idea() {
                var vm = this;
                var idea = Ideas.findOne({ number: parseInt(this.$routeParams.number) });
                if (idea) {
                    let reviewers = Meteor.users.find({
                        _id: {
                            $in: idea.reviewers
                        }
                    }).map(function (rev) {
                        return rev.profile.fullname;
                    });

                    clearArray(vm.reviewers);

                    if (idea.voting) {
                        vm.pendingVoting = true;
                        vm.votingCb = idea.voting;

                        if (Array.isArray(idea.votes)) {
                            let voteVal = idea.votes.find((vote) => {
                                return vote.userId === Meteor.userId();
                            });

                            if (voteVal) {
                                vm.voteVal = voteVal.value;
                            }
                        }

                        reviewers.forEach((rev) => {
                            vm.reviewers.push(rev);
                        });
                    } else {
                        vm.pendingVoting = false;
                        vm.voteVal = null;
                        vm.votingCb = -1;
                    }
                }
                return idea;
            },
            relatedIdeas() {
                this.getReactively('idea');
                var me = this;

                if (me.idea &&
                    me.idea.related &&
                    me.idea.related.length > 0) {

                    var ideasIds = me.idea.related.filter((rel) => {
                        return rel.entity === 'Idea';
                    }).map((relObj) => {
                        return relObj.id;
                    });

                    return Ideas.find({ _id: { $in: ideasIds } }).map((idea) => {
                        idea.relation = me.idea.related.find((rel) => {
                            return rel.id === idea._id;
                        }).relation;

                        return idea;
                    });
                }
            },
            relatedTasks() {
                this.getReactively('idea');

                var me = this;

                if (me.idea &&
                    me.idea.related &&
                    me.idea.related.length > 0) {

                    var tasksIds = me.idea.related.filter((rel) => {
                        return rel.entity === 'Task';
                    }).map((relObj) => {
                        return relObj.id;
                    });

                    return Tasks.find({ _id: { $in: tasksIds } }).map((task) => {
                        task.relation = me.idea.related.find((rel) => {
                            return rel.id === task._id;
                        }).relation;

                        return task;
                    });
                }
            },
            relatedAsks() {
                this.getReactively('idea');

                var me = this;

                if (me.idea &&
                    me.idea.related &&
                    me.idea.related.length > 0) {

                    var asksIds = me.idea.related.filter((rel) => {
                        return rel.entity === 'Ask';
                    }).map((relObj) => {
                        return relObj.id;
                    });

                    return Asks.find({ _id: { $in: asksIds } }).map((ask) => {
                        ask.relation = me.idea.related.find((rel) => {
                            return rel.id === ask._id;
                        }).relation;

                        return ask;
                    });
                }
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
            }          
        });
    }

    reviewerSelected() {
        Ideas.update(this.idea._id, {
            $push: {
                reviewers: this.reviewer._id
            }
        }, null, notify);
    }

    vote(_vote) {
        Meteor.call('ideas.vote',
            this.idea._id, _vote, (err, res) => {
                if (err) window.alert(err);
            });
    }

    saveDescription() {
        Meteor.call('ideas.updateDesciprion',
            this.idea._id, this.idea.description, (err, res) => {
                if (err) window.alert(err);
            });
        this.stopEditDescription();
    }

    setSprint(sprint) {
        Meteor.call('ideas.setSprint', sprint,
            this.idea._id, (err, res) => {
                if (err) window.alert(err);
            });
    }

    changeStatusBtnsVisibility(btn) {
        if (!this.idea) return;
        var status = this.idea.status;

        switch (btn) {
            case 'Defer':
            case 'Reject':
                return status === 1 ||
                    status === 2 ||
                    status === 6 ||
                    status === 8;
            case 'Close':
                return status === 7;
        }
    }

 
    setStatus(_status, msg, votingType) {        
        //For statuses _status and votingType are the same
        if(!votingType) votingType = _status;

        if (votingType && !this.ideaVoting) {
            Meteor.call('ideas.startVoting',
                this.ideaId, votingType, (err, res) => {
                    if (err) window.alert(err);
                });
        } else {
            Meteor.call('ideas.setStatus', _status,
                this.ideaId, msg, (err, res) => {
                    if (err) window.alert(err);
                });
        }
        this.reason = '';
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
    }).filter('VoteFilter', VoteFilter);

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

function VoteFilter() {
    return function (arr, voteValue) {
        if (!Array.isArray(arr)) return;
        return arr.filter((vote) => {
            return vote.value === voteValue;
        })
    }
}