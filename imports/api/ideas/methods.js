import { Meteor } from 'meteor/meteor';
import Ideas from '/imports/api/ideas/idea';
import Requests from '/imports/api/ideas/requests';
import {handlePendingRequests} from '/imports/api/ideas/requests';
import Tasks from '/imports/api/task/task';
import Asks from '/imports/api/ask/ask';
import Reviews from '/imports/api/ideas/review';
import Projects from '/imports/api/project/project';

Meteor.methods({
    'ideas.createIdea': createIdea,
    'ideas.updateDesciprion': updateDesciprion,
    'ideas.setStatus': setStatus,
    'ideas.setSprint': setSprint,
    'ideas.addReview': addReview,
    'ideas.removeReview': removeReview,
    'ideas.updateReview': updateReview,
    'ideas.startVoting': startVoting,
    'ideas.vote': vote,
    'ideas.makeRequest': makeRequest,
    'ideas.directlyRejectRequest': directlyRejectRequest,
    'ideas.cancelRequest': cancelRequest
});

function cancelRequest(reqId) {
    Requests.update(reqId, {
        $set: {
            resultId: 5 //Canceled
        }
    }, (err, res) => {
        if (err) throw new Meteor.Error('cancelRequest',
            err.message);
    });
}

function directlyRejectRequest(reqId, reason) {
    Requests.update(reqId, {
        $set: {
            resultId: 3, //Rejected
            rejectReason: reason  //optional
        }
    }, (err, res) => {
        if (err) throw new Meteor.Error('directlyRejectRequest',
            err.message);
    });
}

function makeRequest(ideaId, requestType, explanation) {
    var idea = Ideas.findOne(ideaId, { id: 1 });
    Requests.insert({
        creator: this.userId,
        idea: ideaId,
        ideaId: idea.id,
        requestTypeId: requestType,
        explanation: explanation
    }, (err, res) => {
        if (err) throw new Meteor.Error('makeRequest', err.message);
    });
}

function vote(ideaId, value) {
    var idea = Ideas.findOne(ideaId);
    var user = Meteor.users.findOne(this.userId);
    var shortName = user.profile.firstname[0];
    shortName += '. ' + user.profile.lastname;

    /*********************************
     ** Check if user already voted **
     *********************************/
    if (!Array.isArray(idea.votes)) {//0) nobody voted yet
        Ideas.update(ideaId, {
            $push: {
                votes: {
                    value: value,
                    userId: this.userId,
                    userName: shortName
                }
            }
        }, (err, res) => {
            if (err) throw new Meteor.Error('vote', err.message);
        });
        return;
    }

    var userVote = idea.votes.find(
        (vote) => vote.userId === this.userId);

    if (userVote) { //1) user already voted 
        Ideas.update(ideaId, {
            $pull: {
                votes: userVote
            }
        }, (err, res) => {
            if (err) throw new Meteor.Error('vote', err.message);

            Ideas.update(ideaId, {
                $push: {
                    votes: {
                        value: value,
                        userId: this.userId,
                        userName: shortName
                    }
                }
            }, (err, res) => {
                if (err) throw new Meteor.Error('vote', err.message);
            });
        });
    } else { //2) user didn't vote yet
        Ideas.update(ideaId, {
            $push: {
                votes: {
                    value: value,
                    userId: this.userId,
                    userName: shortName
                }
            }
        }, (err, res) => {
            if (err) throw new Meteor.Error('vote', err.message);
        });
    }
}

function startVoting(ideaId, votingType) {
    var idea = Ideas.findOne(ideaId);
    Ideas.update(ideaId, {
        $set: {
            voting: parseInt(votingType)
        }
    }, (err, res) => {
        if (err) throw new Meteor.Error('startVoting', err.message);
    });
}

function updateReview(revId, merits, drawbacks,
    comment, relatedIdeaId) {
    var idea = Ideas.findOne(relatedIdeaId);
    Reviews.update(revId, {
        $set: {
            merits: merits,
            drawbacks: drawbacks,
            comment: comment
        }
    }, null, idea, this.userId);
}

function updateDesciprion(ideaId, desc) {
    Ideas.update(ideaId, {
        $set: {
            description: desc
        }
    }, null, null, this.userId);
}

function addReview(review, ideaId) {
    var idea = Ideas.findOne(ideaId);
    var me = this;

    Reviews.insert(review, (err, res) => {
        if (err) return;

        var updateObj = {
            $push: { reviews: res }
        };

        //if first Review for this Idea, then
        //change status to Consider
        if (idea.status === 1) {
            updateObj = Object.assign(updateObj, {
                $set: {
                    status: 6, //consider
                    voting: null
                }
            });
        }

        Ideas.update(idea._id, updateObj, () => {
            handlePendingRequests(ideaId, updateObj.$set.status);
        }, idea, me.userId);
    }, idea, me.userId);
}

function removeReview(reviewId, ideaId) {
    var idea = Ideas.findOne(ideaId);
    var me = this;

    Reviews.remove(reviewId, (err, res) => {
        if (err) return;

        var updateObj = {
            $pull: { reviews: reviewId }
        };

        //check if removed Review isn't last Review
        //for this Idea - if so, change status to New
        var reviews = idea.reviews.filter((rev) => {
            return rev !== reviewId;
        });
        if (reviews.length === 0
            && idea.status === 6) {//consider
            updateObj = Object.assign(updateObj, {
                $set: {
                    status: 1
                }
            });
        }

        Ideas.update(ideaId, updateObj, () => {
            handlePendingRequests(ideaId, updateObj.$set.status);
        }, idea, me.userId);
    }, idea, me.userId);
}

function setSprint(sprintId, ideaId) {
    Ideas.update(ideaId, {
        $set: { sprint: sprintId }
    }, null, null, this.userId);
}

function setStatus(statusId, ideaId, msg) {
    switch (statusId) {
        case 2://working
            setWorking.call(this, ideaId);
            break;
        case 3://closed
            closeIdea.call(this, ideaId, msg);
            break;
        case 4://rejected
            rejectIdea.call(this, ideaId, msg);
            break;
        case 5://deferred
            setDeferred.call(this, ideaId, msg);
            break;
        case 8://discussed
            setDiscussed.call(this, ideaId);
            break;
        default:
            computeProperStatus.call(this, ideaId);
            break;
    }
}

function createIdea(idea) {
    var me = this;
    idea.reviews = [];
    //must be here because we need this value
    //to watchers
    idea.createdBy = this.userId;

    if (idea.sprint === -1) {
        idea.status = 5;
    }

    const relatedIdeaSpecified = typeof idea.ideaId === 'string';
    const relatedAskSpecified = typeof idea.askId === 'string';

    if (relatedIdeaSpecified) {
        var parentIdea = Ideas.findOne(idea.ideaId);

        if (typeof parentIdea === 'undefined')
            throw new Meteor.Error('wrong-parentId',
                'There is no Idea with Id specified as parent Id');

        let relationObj = {
            entity: 'Idea',
            id: idea.ideaId,
            relation: 'Based On'
        };
        idea.related = [relationObj];

        Ideas.insert(idea, (err, newIdeaId) => {
            let relationObj = {
                entity: 'Idea',
                id: newIdeaId,
                relation: 'Sub-Idea'
            };
            const additionalParams = {
                relatedId: idea.id
            };

            Ideas.update(parentIdea._id, {
                $push: {
                    related: relationObj
                }
            }, null, parentIdea, me.userId, additionalParams);
        });
    } else if (relatedAskSpecified) {
        var parentAsk = Asks.findOne(idea.askId);

        if (typeof parentAsk === 'undefined')
            throw new Meteor.Error('wrong-parentId',
                'There is no Ask with Id specified as parent Id');

        let relationObj = {
            entity: 'Ask',
            id: idea.askId,
            relation: 'Based On'
        };
        idea.related = [relationObj];

        Ideas.insert(idea, (err, newIdeaId) => {
            let relationObj = {
                entity: 'Idea',
                id: newIdeaId,
                relation: 'Sub-Idea'
            };
            const additionalParams = {
                relatedId: idea.id
            };

            Asks.update(parentAsk._id, {
                $push: {
                    related: relationObj
                }
            }, null, parentAsk, me.userId, additionalParams);
        });
    } else {
        return Ideas.insert(idea);
    }
}

function setDiscussed(ideaId) {
    var idea = Ideas.findOne(ideaId);

    if (idea.status === 6) {
        Ideas.update(ideaId, {
            $set: {
                status: 8,
                voting: null
            }
        }, () => {
            handlePendingRequests(ideaId, 8);
        }, idea, this.userId);
    }
}

function closeIdea(ideaId) {
    var idea = Ideas.findOne(ideaId);

    if (idea.status === 7) { //implemented
        Ideas.update(ideaId, {
            $set: {
                status: 3,
                voting: null
            }
        }, () => {
            handlePendingRequests(ideaId, 2);
        }, idea, this.userId);
    }
}

function rejectIdea(ideaId, msg) {
    //every related Ask and Task should
    //be closed or rejected

    var idea = Ideas.findOne(ideaId);

    if (!idea.related || idea.related.length === 0) {
        Ideas.update(ideaId, {
            $set: {
                status: 4,
                reason: msg,
                voting: null
            }
        }, null, idea, this.userId);
        return;
    }

    var relatedAsks = idea.related.filter(
        (rel) => rel.entity === 'Ask');

    var relatedTasks = idea.related.filter(
        (rel) => rel.entity === 'Task');

    if (relatedAsks.length > 0) {
        const relatedAsksIds = relatedAsks.map((ask) => ask.id);
        let asks = Asks.find({
            _id: {
                $in: relatedAsksIds
            }
        }).fetch();

        let openAsk = asks.find((ask) =>
            ask.status !== 3)

        if (openAsk) throw new Meteor.Error('Can\'t Reject',
            'Please close all related Tasks and Asks first !');
    }

    if (relatedTasks.length > 0) {
        const relatedTasksIds = relatedTasks.map((task) => task.id);
        let tasks = Tasks.find({
            _id: {
                $in: relatedTasksIds
            }
        }).fetch();

        let openTask = tasks.find((task) =>
            task.status !== 3 &&
            task.status !== 4);

        if (openTask) throw new Meteor.Error('Can\'t Reject',
            'Please close all related Tasks and Asks first !');
    }

    Ideas.update(ideaId, {
        $set: {
            status: 4,
            reason: msg,
            voting: null
        }
    }, null, idea, this.userId);
}

function setWorking(ideaId) {
    var idea = Ideas.find(ideaId);

    if (idea.status === 6 ||
        idea.status === 8) {
        Ideas.update(ideaId, {
            $set: {
                status: 2,
                voting: null
            }
        }, () => {
            handlePendingRequests(ideaId, 2);
        }, idea, this.userId);
    }
}

function setDeferred(ideaId, msg) {
    Ideas.update(ideaId, {
        $set: {
            status: 5,
            sprint: -1,
            voting: null,
            votes: [],
            reason: msg
        }
    }, () => {
        handlePendingRequests(ideaId, 5);
    }, null, this.userId);
}

function computeProperStatus(ideaId) {
    var idea = Ideas.findOne(ideaId);

    var modifier = {
        $set: {}
    };

    var wasDeferred = idea.sprint === -1;
    if (wasDeferred) {
        let project = Projects.findOne(idea.project);
        modifier.$set.sprint = project.currentSprint;
    }

    if (!idea.related) {
        let reviews = idea.reviews;
        if (reviews && reviews.length > 0) {
            modifier.$set.status = 6; //consider
            Ideas.update(ideaId, modifier, null,
                idea, this.userId);
            return;
        }

        modifier.$set.status = 1; //new
        Ideas.update(ideaId, modifier, null,
            idea, this.userId);
        return;
    }

    var tasksRel_Ids = idea.related
        .filter((rel) => rel.entity === 'Task')
        .map((rel) => rel.id);

    if (tasksRel_Ids.length > 0) {
        let tasksDb = Tasks.find({
            _id: {
                $in: tasksRel_Ids
            }
        }).fetch();

        let allTasksCompleted = tasksDb.every(
            (task) => task.status === 3);

        if (allTasksCompleted) {
            modifier.$set.status = 7; //implemented
            Ideas.update(ideaId, modifier, null,
                idea, this.userId);
            return;
        } else {
            modifier.$set.status = 2; //working
            Ideas.update(ideaId, modifier, null,
                idea, this.userId);
            return;
        }
    }

    var asksRel_Ids = idea.related
        .filter((rel) => rel.entity === 'Ask')
        .map((rel) => rel.id);

    if (asksRel_Ids.length > 0) {
        modifier.$set.status = 8; //discussed
        Ideas.update(ideaId, modifier, null,
            idea, this.userId);
        return;
    }

    var reviews = idea.reviews;
    if (reviews && reviews.length > 0) {
        modifier.$set.status = 6; //consider
        Ideas.update(ideaId, modifier, null,
            idea, this.userId);
        return;
    }

    modifier.$set.status = 1; //new
    Ideas.update(ideaId, modifier, null,
        idea, this.userId);
}
