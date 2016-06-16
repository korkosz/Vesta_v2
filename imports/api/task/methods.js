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
        if (typeof task.ideaId === 'string') {
            createTaskFromIdea(task);
        }

        if (typeof task.taskId === 'string') {
            createTaskFromTask(task);
        }
    }
}

function closeTask(taskId) {
    var task = Tasks.findOne(taskId);

    var relatedIdea = task.related.find((rel) => {
        return rel.entity === 'Idea';
    });

    if (!relatedIdea) {
        Tasks.update(taskId, {
            $set: {
                status: 'Closed'
            }
        });
    } else {
        Tasks.update(taskId, {
            $set: {
                status: 'Closed'
            }
        }, (err, res) => {
            if (err) return;
            var idea = Ideas.findOne(relatedIdea.id);

            if (idea.status !== 'Working') return;

            var otherTasksRelatedToIdea_Ids = idea.related
                .filter((rel) => rel.entity === 'Task')
                .map((rel) => rel.id);
            var otherTasksRelatedToIdea = Tasks.find({
                _id: {
                    $in: otherTasksRelatedToIdea_Ids
                }
            }).fetch();

            if (otherTasksRelatedToIdea.every((_task) => _task.status === 'Closed')) {
                Ideas.update(relatedIdea.id, {
                    $set: {
                        status: 'Implemented'
                    }
                });
            }
        });
    }
}

Meteor.methods({
    'tasks.createTask': createTask,
    'tasks.closeTask': closeTask
});

///inner
function createTaskFromIdea(task) {
    var parentIdea = Ideas.findOne(task.ideaId);

    if (typeof parentIdea === 'undefined')
        throw new Meteor.Error('wrong-parentId',
            'There is no Idea with Id specified as parent Id');

    let relationObj = {
        entity: 'Idea',
        id: task.ideaId,
        relation: 'Based On'
    };
    task.related = [relationObj];

    Tasks.insert(task, (task, newTaskId) => {
        const relationObj = {
            entity: 'Task',
            id: newTaskId,
            relation: 'Working in'
        };
        var updateObj = {
            $push: {
                related: relationObj
            }
        };
        
        if (parentIdea.status !== 'Working') {
            updateObj['$set'] = {
                status: 'Working'
            };
        }
        Ideas.update(parentIdea._id, updateObj);
    });
}

function createTaskFromTask(task) {
    var parentTask = Tasks.findOne(task.taskId);

    if (typeof parentTask === 'undefined')
        throw new Meteor.Error('wrong-parentId',
            'There is no Task with Id specified as parent Id');

    const relationObj = {
        entity: 'Task',
        id: parentTask._id,
        relation: 'Based On'
    };
    task.related = [relationObj];

    Tasks.insert(task, (task, newTaskId) => {
        const relationObj = {
            entity: 'Task',
            id: newTaskId,
            relation: 'Subtask'
        };

        Tasks.update(parentTask._id, {
            $push: {
                related: relationObj
            }
        });
    });
}

function canBecameWorking(idea) {
    return idea.status === 'Consider' ||
        idea.status === 'Discussed';
}