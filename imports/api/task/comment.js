import { Mongo } from 'meteor/mongo';

import Tasks from '/imports/api/task/task';

import {simpleNotification} from '/imports/api/notification/notification';

class CommentsCollection extends Mongo.Collection {
    insert(comment, callback, relatedTask, userId) {
        var comm = {
            content: comment,
            task: relatedTask._id
        };
        var nbString = (new Date).getTime()
            .toString();
        comm.number = nbString.slice(-4).replace('.', 1);

        super.insert(comm, function (err, res) {
            if (err) {
                if (typeof callback === 'function') {
                    callback(err);
                }
                return;
            }
            const usersToNotify = relatedTask.watchers.filter(
                (user) => user !== userId);

            simpleNotification(usersToNotify, relatedTask.id,
                'Comment', 'added');

            if (typeof callback === 'function') callback(null, res);

            return res;
        });
    }

    update(selector, updateDoc, callback, relatedTask, userId) {
        super.update(selector, updateDoc, function (err, res) {
            if (err) {
                if (typeof callback === 'function') {
                    callback(err);
                }
                return;
            }
            const usersToNotify = relatedTask.watchers.filter(
                (user) => user !== userId);

            simpleNotification(usersToNotify, relatedTask.id,
                'Comment', 'updated');

            if (typeof callback === 'function') callback(null, res);

            return res;
        });
    }

    remove(selector, callback, relatedTask, userId) {
        super.remove(selector, function (err, res) {
            if (err) {
                if (typeof callback === 'function') {
                    callback(err);
                }
                return;
            }
            const usersToNotify = relatedTask.watchers.filter(
                (user) => user !== userId);

            simpleNotification(usersToNotify, relatedTask.id,
                'Comment', 'removed');

            if (typeof callback === 'function') callback(null, res);
        });
    }
}

export default Comments = new CommentsCollection('Tasks.Comments');

CommentsCollection.schema = new SimpleSchema({
    content: {
        type: String
    },
    task: {
        type: String
    },
    number: {
        type: String
    },
    creationDate: {
        type: Date,
        label: 'Created At',
        autoValue() {
            if (this.isInsert) {
                return new Date();
            } else {
                this.unset();
            }
        }
    },
    createdBy: {
        type: String,
        label: 'Created By',
        autoValue() {
            if (this.isInsert) {
                return this.userId;
            } else {
                this.unset();
            }
        }
    },
    updatedAt: {
        type: Date,
        autoValue: function () {
            return new Date();
        },
        optional: true,
        label: 'Updated At'
    },
});

Comments.helpers({
    creator() {
        var user = Meteor.users.findOne(this.createdBy);
        if (user) return user.profile.fullname;
    }
});

Comments.attachSchema(CommentsCollection.schema);