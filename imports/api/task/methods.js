import { Meteor } from 'meteor/meteor';
import Ideas from '/imports/api/ideas/idea';
import Tasks from '/imports/api/task/task';

function changeStatus(taskId, statusId) {
    switch (statusId) {
        case 2://working
            setWorking(taskId);
            break;
        case 3://closed
            closeTask(taskId);
            break;
        default:
            setStatus(taskId, statusId);
            break;
    }
}

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
    'tasks.createTask': createTask,
    'tasks.changeStatus': changeStatus
});

///inner
function setStatus(taskId, statusId) {
    Tasks.update(taskId, {
        $set: {
            status: statusId
        }
    });
}
function setWorking(taskId) {
    //if subtask set working on main task
    //else just set working  
    var task = Tasks.findOne(taskId);

    // 0)
    if (!task.related || task.related.length === 0) {
        Tasks.update(taskId, {
            $set: {
                status: 2
            }
        });
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
            });
        });
        return;
    }

    Tasks.update(taskId, {
        $set: {
            status: 2
        }
    });
}

function closeTask(taskId) {
    //0. Task doesn't have relation with any Entity
    //1. SubTask can't have related entities - just close Task
    //2. Check if Task's Sub-Tasks are closed
    //3. If related Idea - check if set Implemented
    var task = Tasks.findOne(taskId);

    //0 
    if (!task.related || task.related.length === 0) {
        Tasks.update(taskId, {
            $set: {
                status: 3
            }
        });
        return;
    }


    // 1)
    if (task.type === 3) {
        Tasks.update(taskId, {
            $set: {
                status: 3
            }
        });
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
                });
            }
        });
        return;
    }

    Tasks.update(taskId, {
        $set: {
            status: 3
        }
    });
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

        if (parentIdea.status !== 2) {
            updateObj['$set'] = {
                status: 2
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
    return idea.status === 6 ||
        idea.status === 8;
}