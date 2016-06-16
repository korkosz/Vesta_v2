import { Meteor } from 'meteor/meteor';
import Ideas from '/imports/api/ideas/idea';
import Asks from '/imports/api/ask/ask';

function createAsk(ask) {
    ask.createdBy = this.userId;
    ask.creationDate = new Date();

    const relatedIdeaSpecified = typeof ask.ideaId === 'string';

    if (relatedIdeaSpecified) {
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
                    status: 'Discussed'
                };
            }
            Ideas.update(parentIdea._id, updateObj);
        });
    } else {
        return Asks.insert(ask);
    }
}

Meteor.methods({
    'asks.createAsk': createAsk
});

function canBecameDiscussed(idea) {
    return idea.status === 'Consider';
}