import { Meteor } from 'meteor/meteor';
import Ideas from '/imports/api/ideas/idea';
import Tasks from '/imports/api/task/task';
import Asks from '/imports/api/ask/ask';
import Reviews from '/imports/api/ideas/review';

Meteor.methods({
    'ideas.createIdea': createIdea,
    'ideas.setStatus': setStatus,
    'ideas.setSprint': setSprint,
    'ideas.addReview': addReview
});

function addReview(review, ideaId) {
    var idea = Ideas.findOne(ideaId);

    Reviews.insert(review, (err, res) => {
        if (err) return;

        if (idea.status === 1) {
            Ideas.update(idea._id, {
                $set: {
                    status: 6 //consider
                }
            }, null, idea, this.userId);
        }
    }, idea, this.userId);
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
        case 4://rejected
            rejectIdea.call(this, ideaId, msg);
            break;
        case 5://deferred
            setDeferred.call(this, ideaId);
            break;
        case 8://discussed
            setDiscussed.call(this, ideaId);
            break;
        default:
            setStatus.call(this, ideaId, statusId, msg);
            break;
    }
}

function createIdea(idea) {
    idea.createdBy = this.userId;
    //idea.creationDate = new Date();
    idea.reviews = [];

    if (idea.sprint === -1) {
        idea.status = 5;
    }

    const relatedIdeaSpecified = typeof idea.ideaId === 'string';

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
            Ideas.update(parentIdea._id, {
                $push: {
                    related: relationObj
                }
            });
        });
    } else {
        return Ideas.insert(idea);
    }
}

function setDiscussed(ideaId) {
    var idea = Ideas.find(ideaId);

    if (idea.status === 6) {
        Ideas.update(ideaId, {
            $set: {
                status: 8
            }
        }, null, idea, this.userId);
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
                reason: msg
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
            reason: msg
        }
    }, null, idea, this.userId);
}

function setWorking(ideaId) {
    var idea = Ideas.find(ideaId);

    if (idea.status === 6 ||
        idea.status === 8) {
        Ideas.update(ideaId, {
            $set: {
                status: 2
            }
        }, null, idea, this.userId);
    }
}

function setDeferred(ideaId) {
    Ideas.update(ideaId, {
        $set: {
            status: 5,
            sprint: -1
        }
    }, null, null, this.userId);
}