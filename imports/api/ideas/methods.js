import { Meteor } from 'meteor/meteor';
import Ideas from '/imports/api/ideas/idea';

function setDiscussed(ideaId) {
    var idea = Ideas.find(ideaId);

    if (idea.status === 'Consider') {
        Ideas.update(ideaId, {
            $set: {
                status: 'Discussed'
            }
        });
    }
}

function setWorking(ideaId) {
    var idea = Ideas.find(ideaId);

    if (idea.status === 'Consider' ||
        idea.status === 'Discussed') {
        Ideas.update(ideaId, {
            $set: {
                status: 'Working'
            }
        });
    }
}

function createIdea(idea) {
    idea.createdBy = this.userId;
    idea.creationDate = new Date();
    idea.reviews = [];
  
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

Meteor.methods({
    'ideas.setDiscussed': setDiscussed,
    'ideas.setWorking': setWorking,
    'ideas.createIdea': createIdea
});