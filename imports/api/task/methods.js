import { Meteor } from 'meteor/meteor';
import Ideas from '/imports/api/ideas/idea';
import Tasks from '/imports/api/task/task';

function createTask(task) {
    task.createdBy = this.userId;
    task.creationDate = new Date();

    const relationSpecified = typeof task.ideaId === 'string' ||
        typeof task.taskId === 'string';

    if (!relationSpecified) {
        return Tasks.insert(task);
    } else {
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
    }
}

Meteor.methods({
    'tasks.createTask': createTask
});