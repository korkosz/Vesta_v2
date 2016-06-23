import { Meteor } from 'meteor/meteor';
import Ideas from '/imports/api/ideas/idea';
import Asks from '/imports/api/ask/ask';

Meteor.methods({
    'asks.createAsk': createAsk
});

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