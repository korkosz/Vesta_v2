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

Meteor.methods({
    'tasks.createTask': createTask
});

///inner
function taskRelation(relation) {
    relation.entity === 'Tasks';
}

function canBecameWorking(idea) {
    return idea.status === 'Consider' ||
        idea.status === 'Discussed';
}

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
        //if first related Task change Idea
        //status to "Working"
        if (!parentIdea.related.some(taskRelation) &&
            canBecameWorking(parentIdea)) {
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