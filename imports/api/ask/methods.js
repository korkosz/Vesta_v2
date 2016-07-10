import { Meteor } from 'meteor/meteor';
import Ideas from '/imports/api/ideas/idea';
import Asks from '/imports/api/ask/ask';
import Responses from '/imports/api/ask/response';
import {handlePendingRequests} from '/imports/api/ideas/requests';

Meteor.methods({
    'asks.createAsk': createAsk,
    'asks.updateDesciprion': updateDesciprion,
    'asks.addPost': addPost,
    'asks.updatePost': updatePost,
    'asks.removePost': removePost,
    'asks.addGoodPoint': addGoodPoint,
    'asks.removeGoodPoint': removeGoodPoint,
    'asks.closeAsk': closeAsk
});

function closeAsk(askId) {
    Asks.update(askId, {
        $set: {
            status: 3
        }
    }, null, null, this.userId);
}

function removeGoodPoint(askId, goodPoint) {
    Asks.update(askId, {
        $pull: { goodPoints: goodPoint }
    }, null, null, this.userId);
}

function addGoodPoint(askId, goodPoint) {
    Asks.update(askId, {
        $push: { goodPoints: goodPoint }
    }, null, null, this.userId);
}

function updateDesciprion(askId, desc) {
    Asks.update(askId, {
        $set: {
            description: desc
        }
    }, null, null, this.userId);
}

function removePost(askId, postId, postNb) {
    var ask = Asks.findOne(askId);
    Responses.remove(postId, null, ask, this.userId, postNb);
}

function updatePost(askId, postId, postNb, desc, title) {
    var ask = Asks.findOne(askId);
    var post = Responses.findOne(postId);

    Responses.update(postId, {
        $set: {
            description: desc,
            title: title
        }
    }, null, ask, this.userId, postNb);
}

function addPost(askId, post) {
    var ask = Asks.findOne(askId);

    post.createdBy = this.userId;
    post.ask = askId;

    Responses.insert(post, (err, res) => {
        if (ask.status === 1) {
            Asks.update(ask._id, {
                $set: {
                    status: 2
                }
            }, null, ask, this.userId);
        }
    }, ask, this.userId);
}

function createAsk(ask) {
    const relatedIdeaSpecified =
        typeof ask.ideaId === 'string';

    ask.createdBy = this.userId;

    if (relatedIdeaSpecified) {
        createAskWithRelation.call(this, ask);
    } else {
        return Asks.insert(ask);
    }
}

///
function createAskWithRelation(ask) {
    var me = this;

    var parentIdea = Ideas.findOne(ask.ideaId);

    if (typeof parentIdea === 'undefined')
        throw new Meteor.Error('wrong-parentId',
            'There is no Idea with Id specified as parent Id');

    const relationObj = {
        entity: 'Idea',
        id: parentIdea._id,
        relation: 'Based On'
    };
    ask.related = [relationObj];

    Asks.insert(ask, (err, newAskId) => {
        const relationObj = {
            entity: 'Ask',
            id: newAskId,
            relation: 'Discussion In'
        };

        var updateObj = {
            $push: {
                related: relationObj
            }
        };

        if (canBecameDiscussed(parentIdea)) {
            updateObj.$set = {
                status: 8
            };
        }

        const additionalParams = {
            relatedId: ask.id
        };

        Ideas.update(parentIdea._id, updateObj, () => {
            handlePendingRequests(parentIdea._id, updateObj.$set.status);
        }, parentIdea, me.userId, additionalParams);
    });
}

function canBecameDiscussed(idea) {
    return idea.status === 6;
}