import { Mongo } from 'meteor/mongo';
import Entity from '../entity';
import './methods';
import {simpleNotification} from '/imports/api/notification/notification';

class AsksClass extends Entity { }

export default AsksCollection = new AsksClass('Asks');

AsksCollection.schema = Entity.createSchema({
    goodPoints: {
        type: [String],
        optional: true
    }
});
AsksCollection.attachSchema(AsksCollection.schema);

AsksCollection.schemaMetadata = Entity.createSchemaMetadata({
    goodPoints: {
        notify: function (modifier, oldEntity, modifierMethod, userId) {
            const usersToNotify = oldEntity.watchers.filter(
                (user) => user !== userId);

            switch (modifierMethod) {
                case '$push':
                    simpleNotification(usersToNotify, oldEntity.id,
                        'Good Point', 'added');
                    break;
                case '$pull':
                    simpleNotification(usersToNotify, oldEntity.id,
                        'Good Point', 'removed');
                    break;
            }
        },
        notSearchable: true
    }
});

Entity.setupStaticMethods(AsksCollection);

Entity.extendHelpers(AsksCollection, {});