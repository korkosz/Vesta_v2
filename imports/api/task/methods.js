import { Meteor } from 'meteor/meteor';
import Ideas from '/imports/api/ideas/idea';
import Tasks from '/imports/api/task/task';
import Comments from '/imports/api/task/comment';

Meteor.methods({
    'tasks.createTask': createTask,
    'tasks.changeStatus': changeStatus,
    'tasks.changePriority': changePriority,
    'tasks.updateDescription': updateDescription,
    'tasks.addComment': addComment,
    'tasks.removeComment': removeComment,
    'tasks.updateComment': updateComment
});

function updateComment(taskId, commentId, commentContent) {
    var task = Tasks.findOne(taskId);

    Comments.update(commentId, {
        $set: {
            content: commentContent
        }
    }, null, task, this.userId);
}

function removeComment(taskId, commentId) {
    var task = Tasks.findOne(taskId);

    Comments.remove(commentId,
        null, task, this.userId);
}

function addComment(taskId, comment) {
    var task = Tasks.findOne(taskId);
       
    Comments.insert(comment,
        null, task, this.userId);
}

function updateDescription(taskId, desc) {
    Tasks.update(taskId, {
        $set: {
            description: desc
        }
    }, null, null, this.userId);
}

function changeStatus(taskId, statusId) {
    switch (statusId) {
        case 2://working
            setWorking.call(this, taskId);
            break;
        case 3://closed
            closeTask.call(this, taskId);
            break;
        default:
            setStatus.call(this, taskId, statusId);
            break;
    }
}

function createTask(task) {
    task.createdBy = this.userId;

    const relationSpecified = typeof task.ideaId === 'string' ||
        typeof task.taskId === 'string';

    if (!relationSpecified) {
        return Tasks.insert(task);
    } else {
        if (typeof task.ideaId === 'string') {
            createTaskFromIdea.call(this, task);
        }

        if (typeof task.taskId === 'string') {
            createTaskFromTask.call(this, task);
        }
    }
}

function changePriority(taskId, priority) {
    Tasks.update(taskId, { $set: { priority: priority } },
        null, null, this.userId)
}

///inner
function setStatus(taskId, statusId) {
    Tasks.update(taskId, {
        $set: {
            status: statusId
        }
    }, null, null, this.userId);
}
function setWorking(taskId) {
    //if subtask set working on main task
    //else just set working  
    var task = Tasks.findOne(taskId);
    var me = this;

    // 0)
    if (!task.related || task.related.length === 0) {
        Tasks.update(taskId, {
            $set: {
                status: 2
            }
        }, null, task, me.userId);
        return;
    }

    // 1)
    if (task.type === 3) {
        Tasks.update(taskId, {
            $set: {
                status: 2
            }
        }, (err, res) => {
            if (err) return;

            var parentTask = task.related.find(
                (res) => res.entity === 'Task' &&
                    res.relation === 'Based On')

            Tasks.update(parentTask.id, {
                $set: {
                    status: 2
                }
            }, null, task, me.userId);
        });
        return;
    }

    Tasks.update(taskId, {
        $set: {
            status: 2
        }
    }, null, task, me.userId);
}

function closeTask(taskId) {
    //0. Task doesn't have relation with any Entity
    //1. SubTask can't have related entities - just close Task
    //2. Check if Task's Sub-Tasks are closed
    //3. If related Idea - check if set Implemented
    var task = Tasks.findOne(taskId);
    var me = this;
    //0 
    if (!task.related || task.related.length === 0) {
        Tasks.update(taskId, {
            $set: {
                status: 3
            }
        }, null, task, me.userId);
        return;
    }


    // 1)
    if (task.type === 3) {
        Tasks.update(taskId, {
            $set: {
                status: 3
            }
        }, null, task, me.userId);
        return;
    }


    // 2)
    var relatedSubTasks = task.related.filter(
        (rel) => rel.relation === 'Subtask');

    if (relatedSubTasks.length > 0) {
        const relatedSubTasksIds = relatedSubTasks.map(
            (rel) => rel.id);

        const subTasks = Tasks
            .find({ _id: { $in: relatedSubTasksIds } })
            .fetch();

        var firstOpen = subTasks.find((subtask) => subtask.status !== 3);
        if (firstOpen) throw new Meteor.Error('subtask-open',
            'Exists at least one open SubTask. You can\'t close this Task');
    }


    // 3)
    var relatedIdea = task.related.find(
        (rel) => rel.entity === 'Idea');

    if (relatedIdea) {
        Tasks.update(taskId, {
            $set: {
                status: 3
            }
        }, (err, res) => {
            if (err) return;
            var idea = Ideas.findOne(relatedIdea.id);

            if (idea.status !== 2) return;

            var otherTasksRelatedToIdea_Ids = idea.related
                .filter((rel) => rel.entity === 'Task')
                .map((rel) => rel.id);
            var otherTasksRelatedToIdea = Tasks.find({
                _id: {
                    $in: otherTasksRelatedToIdea_Ids
                }
            }).fetch();

            if (otherTasksRelatedToIdea.every((_task) => _task.status === 3)) {
                Ideas.update(relatedIdea.id, {
                    $set: {
                        status: 7
                    }
                }, null, idea, me.userId);
            }
        }, task, me.userId);
        return;
    }

    Tasks.update(taskId, {
        $set: {
            status: 3
        }
    }, null, task, me.userId);
}

function createTaskFromIdea(task) {
    var me = this;

    task.createdBy = this.userId;

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

    Tasks.insert(task, (err, newTaskId) => {
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

        if (parentIdea.status !== 2) {
            updateObj['$set'] = {
                status: 2
            };
        }

        const additionalParams = {
            relatedId: task.id
        };

        Ideas.update(parentIdea._id, updateObj, null,
            parentIdea, me.userId, additionalParams);
    });
}

function createTaskFromTask(task) {
    var me = this;

    var parentTask = Tasks.findOne(task.taskId);

    task.createdBy = this.userId;

    if (typeof parentTask === 'undefined')
        throw new Meteor.Error('wrong-parentId',
            'There is no Task with Id specified as parent Id');

    const relationObj = {
        entity: 'Task',
        id: parentTask._id,
        relation: 'Based On'
    };
    task.related = [relationObj];

    Tasks.insert(task, (err, newTaskId) => {
        const relationObj = {
            entity: 'Task',
            id: newTaskId,
            relation: 'Subtask'
        };

        const additionalParams = {
            relatedId: task.id
        };

        Tasks.update(parentTask._id, {
            $push: {
                related: relationObj
            }
        }, null, parentTask,
            me.userId, additionalParams);
    });
}

function canBecameWorking(idea) {
    return idea.status === 6 ||
        idea.status === 8;
}