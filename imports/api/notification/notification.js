import { Mongo } from 'meteor/mongo';

var Notifications = new Mongo.Collection('notifications');

Notifications.schema = new SimpleSchema({
    userId: { //because one notification per user
        type: String
    },
    entityId: {
        type: String
    },
    field: {
        type: String,
        optional: true
    },
    message: {
        type: String,
        optional: true
    },
    oldValue: {
        type: String,
        optional: true
    },
    newValue: {
        type: String,
        optional: true
    },
    links: {
        //type: [linkSchema],
        type: [Object],
        optional: true,
        blackbox: true
    },
    action: {
        type: String
    },
    actionProvider: {
        type: String,
        autoValue() {
            if (this.isInsert) {
                return this.userId;
            }
        },
        optional: true
    },
    creationDate: {
        type: Number,
        autoValue() {
            if (this.isInsert) {
                return (new Date()).getTime();
            }
        },
        optional: true
    },
    seen: {
        type: Boolean,
        autoValue() {
            if (this.isInsert) {
                return false;
            }
        },
        optional: true
    }
});

Notifications.attachSchema(Notifications.schema);

Notifications.helpers({
    creator() {
        var user = Meteor.users.findOne(this.actionProvider);
        if (user) return user.profile.fullname;
    },
    creatorShort() {
        var user = Meteor.users.findOne(this.actionProvider);
        if (user) {
            return user.profile.firstname[0] + '.' + ' ' +
                user.profile.lastname;
        }
    }
});

export default Notifications;

//ex. V3I15: Status 3 -> 4 updated by M. Korkosz few seconds ago
function oldNewNotification(
    usersIds, entityId, field, oldVal, newVal,
    action) {

    if (Array.isArray(usersIds)) {
        usersIds.forEach((_userId) => {
            Notifications.insert({
                userId: _userId,
                entityId: entityId,
                field: field,
                oldValue: oldVal,
                newValue: newVal,
                action: action
            });
        });
    }
}

//ex. V3I15: Description updated by M. Korkosz few seconds ago
function simpleNotification(usersIds,
    entityId, field, action) {
    if (Array.isArray(usersIds)) {
        usersIds.forEach((_userId) => {
            Notifications.insert({
                userId: _userId,
                entityId: entityId,
                field: field,
                action: action
            });
        });
    }
}

//ex. V3I15: Subtask V3T15 created by M. Korkosz few seconds ago
function msgNotification(usersIds,
    entityId, field, message, action,
    links) {

    if (Array.isArray(usersIds)) {
        usersIds.forEach((_userId) => {
            Notifications.insert({
                userId: _userId,
                entityId: entityId,
                field: field,
                message: message,
                action: action,
                links: links
            });
        });
    }
}

var linkSchema = new SimpleSchema({
    word: {
        type: 'String'
    },
    url: {
        type: 'String'
    }
});

export {
oldNewNotification as oldNewNotification,
simpleNotification as simpleNotification,
msgNotification as msgNotification
};