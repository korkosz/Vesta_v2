import { Mongo } from 'meteor/mongo';

var Notifications = new Mongo.Collection('notifications');

Notifications.schema = new SimpleSchema({
    userId: {
        type: String
    },
    entity: {
        type: String
    },
    action: {
        type: String
    },
    provider: {
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

export default Notifications;

export function Notify(_entity, _id, _action, usersIds, _provider, when) {
    if (Array.isArray(usersIds)) {
        usersIds.forEach((_userId) => {
            Notifications.insert({
                userId: _userId,
                entity: _entity,
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
            action: _action,
            seen: false,
            provider: _provider,
            creationDate: when
        });
    }
}