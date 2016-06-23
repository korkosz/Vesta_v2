import { Meteor } from 'meteor/meteor';
import Ideas from '/imports/api/ideas/idea';
import Asks from '/imports/api/ask/ask';
import Responses from '/imports/api/ask/response';

Meteor.methods({
    'asks.createAsk': createAsk,
    'asks.addPost': addPost,
    'asks.updatePost': updatePost
});

function updatePost(askId, postId, desc, title) {
    var ask = Asks.findOne(askId);
    var post = Responses.findOne(postId);

    Responses.update(postId, {
        $set: {
            description: desc,
            title: title
        }
    }, null, ask, this.userId, post.number);
}

function addPost(askId, post) {
    var ask = Asks.findOne(askId);

    post.createdBy = this.userId;
    post.ask = askId;

    Responses.insert(post, null, ask, this.userId);
}

function createAsk(ask) {
    const relatedIdeaSpecified =
        typeof ask.ideaId === 'string';

    if (relatedIdeaSpecified) {
        createAskWithRelation.call(this, ask);
    } else {
        return Asks.insert(ask);
    }
}

///
function createAskWithRelation(ask) {
    var me = this;

    ask.createdBy = me.userId;

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
            updateObj['$set'] = {
                status: 8
            };
        }

        const additionalParams = {
            relatedId: ask.id
        };

        Ideas.update(parentIdea._id, updateObj,
            null, parentIdea, me.userId, additionalParams);
    });
}

function canBecameDiscussed(idea) {
    return idea.status === 6;
}