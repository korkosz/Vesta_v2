import { Mongo } from 'meteor/mongo';

var Notifications = new Mongo.Collection('notifications');

Notifications.schema = new SimpleSchema({
    userId: { //because one notification per user
        type: String
    },
    entityId: {
        type: String
    },
    action: {
        type: String
    },
    actionProvider: {
        type: String
    },
    creationDate: {
        type: Date
    },
    seen: {
        type: Boolean
    }
});

Notifications.attachSchema(Notifications.schema);

Notifications.helpers({
    creator() {
        var user = Meteor.users.findOne(this.provider);
        if (user) return user.profile.fullname;
    },
    creatorShort() {
        var user = Meteor.users.findOne(this.provider);
        if (user) {
            return user.profile.firstname[0] + '.' + ' ' +
                user.profile.lastname;
        }
    }
});

export default Notifications;

export function Notify(_entity, _id, _action, usersIds, _provider, when) {
    if (Array.isArray(usersIds)) {
        usersIds.forEach((_userId) => {
            Notifications.insert({
                userId: _userId,
                entity: _entity,
                entityId: _id,
                action: _action,
                seen: false,
                provider: _provider,
                creationDate: when
            });
        });
    }

    if (typeof usersIds === 'string') {
        Notifications.insert({
            userId: usersIds,
            entity: _entity,
            entityId: _id,
            action: _action,
            seen: false,
            provider: _provider,
            creationDate: when
        });
    }
}

export function getNotificationMsg(notificationObj) {
    //create
        
}