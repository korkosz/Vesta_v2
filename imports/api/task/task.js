import {Mongo} from 'meteor/mongo';

import Modules from '/imports/api/module/module';
import Projects from '/imports/api/project/project';
import Comments from '/imports/api/task/comment'

import {Notify} from '/imports/api/notification/notification';

class TaskClass extends Mongo.Collection {
    insert(doc) {
        while (1) {

            var sort = { number: -1 };
            var fields = {
                number: 1
            };

            var cursor = this.findOne({}, { fields: fields, sort: sort });
            var seq = cursor && cursor.number ? cursor.number + 1 : 1;
            doc.number = seq;

            var project = Projects.findOne(doc.projectId);
            var projectPrefix = project ? project.prefix : null;
            var sprint = project ? project.sprint : null;

            if (projectPrefix && sprint) {
                doc.id = projectPrefix.toUpperCase() + sprint +
                    'T' + seq;
            }

            if (doc.assigned !== doc.createdBy) {
                super.insert(doc, function (res) {
                    Notify('Task', doc.id, 'New', doc.assigned,
                        doc.createdBy, doc.creationDate);
                });
            }
            break;
        }
    }

    update(selector, updateDoc, callback, notifyObject) {
        function innerCallback() {
            var usersToNotify = [];
            if (typeof notifyObject.assignedUser === 'string' &&
                notifyObject.assignedUser !==
                notifyObject.provider) {
                usersToNotify.push(notifyObject.assignedUser);
            }

            if (typeof notifyObject.entityCreator === 'string' &&
                notifyObject.entityCreator !== notifyObject.provider &&
                notifyObject.entityCreator !== notifyObject.assignedUser) {
                usersToNotify.push(notifyObject.entityCreator);
            }

            if (usersToNotify.length > 0) {
                Notify('Task', notifyObject.id, 'Update', usersToNotify,
                    notifyObject.provider, notifyObject.when);
            }

            if (typeof callback === 'function') callback();
        }
        super.update(selector, updateDoc, innerCallback);
    }

    remove(taskId) {
        this.update(taskId, {
            $set: {
                isDeleted: true
            }
        });
    }
}

export default TaskCollection = new TaskClass('Tasks');

TaskCollection.schema = new SimpleSchema({
    id: {
        type: String
    },
    title: {
        type: String,
        max: 100
    },
    number: {
        type: Number,
        optional: true
    },
    description: {
        type: String
    },
    module: {
        type: String,
        optional: true
    },
    projectId: {
        type: String
    },
    priority: {
        type: String
    },
    progress: {
        type: Number,
        defaultValue: 0
    },
    type: {
        type: String
    },
    status: {
        type: String,
        defaultValue: "Open"
    },
    assigned: {
        type: String,
        optional: true
    },
    ideaId: {
        type: String,
        optional: true
    },
    comments: {
        type: [String],
        optional: true
    },
    creationDate: {
        type: Date,
        defaultValue: new Date()
    },
    createdBy: {
        type: String,
        defaultValue: this.userId
    },
    updatedAt: {
        type: Date,
        autoValue: function () {
            return new Date();
        },
        optional: true
    },
    isDeleted: {
        type: Boolean,
        defaultValue: false
    }
});
TaskCollection.helpers({
    creator() {
        var user = Meteor.users.findOne(this.createdBy);
        if (user) return user.profile.fullname;
    },
    creatorShort() {
        var user = Meteor.users.findOne(this.createdBy);
        if (user) {
            return user.profile.firstname[0] + '.' + ' ' +
                user.profile.lastname;
        }
    },
    assignedUser() {
        var user = Meteor.users.findOne(this.assigned);
        if (user) return user.profile.fullname;
    },
    assignedUserShort() {
        var user = Meteor.users.findOne(this.assigned);
        if (user) {
            return user.profile.firstname[0] + '.' + ' ' +
                user.profile.lastname;
        }
    },
    project() {
        var project = Projects.findOne(this.projectId);
        if (project) return project.name;
    },
    moduleName() {
        var module = Modules.findOne(this.module);
        if (module) return module.name;
    },
    getComments() {
        var _commentsIds = this.comments;
        if (!Array.isArray(_commentsIds)) return [];
        return Comments.find({
            _id: {
                $in: _commentsIds
            }
        });
    }
});
TaskCollection.attachSchema(TaskCollection.schema);