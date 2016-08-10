import Projects from '/imports/api/project/project';
import Ideas from '/imports/api/ideas/idea';
import Requests from '/imports/api/ideas/requests';
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
        this.currentUserId = Meteor.userId();
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
            parentEntity() {
                this.getReactively('idea');
                var me = this;

                if (me.idea &&
                    me.idea.related &&
                    me.idea.related.length > 0) {
                    var parentRelationEntity = me.idea.related.find((rel) => {
                        return rel.relation === 'Based On';
                    });

                    if (!parentRelationEntity) return;

                    switch (parentRelationEntity.entity) {
                        case 'Idea':
                            return Ideas.findOne(parentRelationEntity.id);
                        case 'Ask':
                            return Asks.findOne(parentRelationEntity.id);
                        case 'Task':
                            return Tasks.findOne(parentRelationEntity.id);
                    }
                }
            },
            grandparentEntity() {
                this.getReactively('parentEntity');
                var me = this;

                if (me.parentEntity &&
                    me.parentEntity.related &&
                    me.parentEntity.related.length > 0) {
                    var parentRelationEntity = me.parentEntity.related.find((rel) => {
                        return rel.relation === 'Based On';
                    });

                    if (!parentRelationEntity) return;

                    switch (parentRelationEntity.entity) {
                        case 'Idea':
                            return Ideas.findOne(parentRelationEntity.id);
                        case 'Ask':
                            return Asks.findOne(parentRelationEntity.id);
                        case 'Task':
                            return Tasks.findOne(parentRelationEntity.id);
                    }
                }
            },
            relatedIdeas() {
                this.getReactively('idea');
                var me = this;

                if (me.idea &&
                    me.idea.related &&
                    me.idea.related.length > 0) {

                    var ideasIds = me.idea.related.filter((rel) => {
                        return rel.entity === 'Idea' &&
                            rel.relation !== 'Based On';
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
                        return rel.entity === 'Task' &&
                            rel.relation !== 'Based On';
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
                        return rel.entity === 'Ask' &&
                            rel.relation !== 'Based On';
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
                    return Projects.findOne(this.idea.project);                    
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
            requests() {
                this.getReactively('idea');
                if (!this.idea) return;

                return Requests.find({
                    idea: this.idea._id,
                    resultId: 1 // Waiting
                });
            }
        });
    }

    getDescriptionForChild(child) {
        if (!child) return;

        const name = child.getEntityName();

        switch (name) {
            case 'Idea':
                return 'Sub-Idea';
            case 'Ask':
                return 'Discussion In'
            case 'Task':
                return 'Working In'
        }
    }

    getEntityColor(entity) {
        if (!entity) return;

        const name = entity.getEntityName();

        switch (name) {
            case 'Idea':
                return 'orange';
            case 'Ask':
                return 'green'
            case 'Task':
                return 'blue'
        }
    }

    alreadyRequestedThis(requestTypeId) {
        if (this.requests)
            return this.requests.some(
                (req) => req.requestTypeId === requestTypeId);
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

    userIsOwner() {
        if (this.idea)
            return this.idea.createdBy === Meteor.userId();
    }

    requestDesc(requestTypeId) {
        return Requests.requestTypes[requestTypeId];
    }

    controlVisibility(btn, request) {
        if (!this.idea) return;
        var status = this.idea.status;

        if (!this.userIsOwner() && !request)
            return false;

        switch (btn) {
            case 5: //***Defer***
                return status === 1 || //New
                    status === 2 || //Working
                    status === 6 || //Consider
                    status === 8; //Discussed
            case 4: //***Reject***
                return status === 1 || //New
                    status === 2 || //Working
                    status === 6 || //Consider
                    status === 5 || //Deferred
                    status === 8; //Discussed
            case 3: //***Close***
                return status === 7;//Implemented
            case -1: //***Reopen*** 
                return status === 5
                    || status === 4;//Deferred || Rejected
            case 1: //***Task First***
                return (status === 2 || //Working
                    status === 6 || //Consider
                    status === 7 || //Implemented
                    status === 8) && //Discussed
                    ((!this.relatedTasks ||
                        this.relatedTasks.length === 0) &&
                        !this.idea.voting);
            case 11: //***Task***
                return (status === 2 || //Working
                    status === 6 || //Consider
                    status === 7 || //Implemented
                    status === 8) && //Discussed
                    ((this.relatedTasks &&
                        this.relatedTasks.length > 0) ||
                        !!this.idea.voting);
            case 2: //***Ask First***
                return status === 6 && ((!this.relatedAsks ||
                    this.relatedAsks.length === 0) &&
                    !this.idea.voting);
            case 22: //***Ask***
                return status === 6 && (this.relatedAsks &&
                    this.relatedAsks.length > 0 ||
                    !!this.idea.voting);
        }
    }

    startVoting(votingType) {
        Meteor.call('ideas.startVoting',
            this.idea._id, votingType, (err, res) => {
                if (err) window.alert(err);
            });
    }

    // need to pass value to modal 
    triggerRejectReqModal(reqId) {
        this.rejectingReqId = reqId;
    }

    cancelRequest(reqId) {
        Meteor.call('ideas.cancelRequest',
            reqId, (err, res) => {
                if (err) window.alert(err);
            });
    }

    directlyRejectRequest(explanation) {
        Meteor.call('ideas.directlyRejectRequest',
            this.rejectingReqId, explanation, (err, res) => {
                if (err) window.alert(err);
            });
        this.rejectReqExplanation = null;
        this.rejectingReqId = null;
    }

    makeRequest(requestType, explanation) {
        Meteor.call('ideas.makeRequest',
            this.idea._id, requestType, explanation, (err, res) => {
                if (err) window.alert(err);
            });
        this.request = null;
        this.requestExplanation = null;
    }

    setStatus(_status, msg, vote) {
        //For statuses status and votingType are the same
        if (vote && !this.idea.voting) {
            this.startVoting(vote);
        } else {
            Meteor.call('ideas.setStatus', _status,
                this.idea._id, msg, (err, res) => {
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