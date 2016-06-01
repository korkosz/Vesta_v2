import { Mongo } from 'meteor/mongo';

import Tasks from '/imports/api/task/task';

import {Notify} from '/imports/api/notification/notification';

class CommentsCollection extends Mongo.Collection {
    insert(comment, callback, notify) {
        comment.number = performance.now()
            .toString().slice(0, 4).replace('.', 1);
        super.insert(comment, function (err, res) {
            Tasks.update(comment.taskId, {
                $push: {
                    comments: res
                }
            }, null, notify);
        });
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
}

export default Comments = new CommentsCollection('Tasks.Comments');

CommentsCollection.schema = new SimpleSchema({
    content: {
        type: String
    },
    taskId: {
        type: String
    },
    number: {
        type: String
    },
    createdBy: {
        type: String,
        defaultValue: this.userId,
        optional: true
    },
    createdAt: {
        type: Date,
        optional: true
    },
    updatedAt: {
        type: Date,
        autoValue: function () {
            if (this.isUpdate) {
                return new Date();
            }
        },
        denyInsert: true,
        optional: true
    }
});

Comments.helpers({
    creator() {
        var user = Meteor.users.findOne(this.createdBy);
        if (user) return user.profile.fullname;
    }
});

Comments.attachSchema(CommentsCollection.schema);