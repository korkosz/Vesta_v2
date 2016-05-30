var Notifications = new MongoCollection('ideas');

Notifications.schema = new SimpleSchema({
    userId: {
        type: String
    },
    entity: {
        type: String
    },
    message: {
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

class NotifyFactory {
    Notify(_entity, _id, _action, _message, usersIds, _provider, when) {
        if (Array.isArray(usersIds)) {
            usersIds.forEach((_userId) => {
                Notifications.insert({
                    userId: _userId,
                    entity: _entity,
                    message: _message,
                    action: _action,
                    seen: false,
                    provider: _provider,
                    creationDate: when
                });
            });
        }

        if (typeof usersIds === 'String') {
            Notifications.insert({
                userId: usersIds,
                entity: _entity,
                message: _message,
                action: _action,
                seen: false,
                provider: _provider,
                creationDate: when
            });
        }
    }
}

export default Notify = new NotifyFactory();