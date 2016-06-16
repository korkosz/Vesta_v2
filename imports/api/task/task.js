import {Mongo} from 'meteor/mongo';
import Entity from '../entity';
import './methods';
import Comments from '/imports/api/task/comment'

import {Notify} from '/imports/api/notification/notification';

class TaskClass extends Entity {
    update(selector, updateDoc, callback, notifyObject) {
        function innerCallback() {
            if (notifyObject) {
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

TaskCollection.schemaMetadata = Entity.createSchemaMetadata({
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
});

Entity.extendHelpers(TaskCollection, {
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
