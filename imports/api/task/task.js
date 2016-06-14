import {Mongo} from 'meteor/mongo';
import Entity from '../entity';

import Modules from '/imports/api/module/module';
import Projects from '/imports/api/project/project';

import Comments from '/imports/api/task/comment'

import {Notify} from '/imports/api/notification/notification';

class TaskClass extends Entity {
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
}

export default TaskCollection = new TaskClass('Tasks');

var RelationSchema = new SimpleSchema({
    entity: {
        type: 'String'
    },
    id: {
        type: 'String'
    },
    relation: {
        type: 'String'
    }
});

TaskCollection.schema = Entity.createSchema({
    priority: {
        type: String
    },
    progress: {
        type: Number,
        defaultValue: 0
    },
    related: {
        type: [RelationSchema],
        optional: true
    },
    type: {
        type: String
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
    }
});

TaskCollection.schemaMetadata = {
    creationDate: {
        type: Date,
        transform(value) {
            return moment(value).fromNow();
        }
    },
    updatedAt: {
        type: Date,
        transform(value) {
            return moment(value).fromNow();
        }
    },
    createdBy: {
        type: 'id',
        transform(value) {
            var user = Meteor.users.findOne(value);
            if (user) {
                return user.profile.firstname[0] + '.' + ' ' +
                    user.profile.lastname;
            }
        }
    },
    assigned: {
        type: 'id',
        transform(value) {
            var user = Meteor.users.findOne(value);
            if (user) {
                return user.profile.firstname[0] + '.' + ' ' +
                    user.profile.lastname;
            }
        }
    }
};

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
    projectName() {
        var project = Projects.findOne(this.project);
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