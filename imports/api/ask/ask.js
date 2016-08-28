import { Mongo } from 'meteor/mongo';

import Entity from '../entity';
import Responses from '/imports/api/ask/response';

import './methods';
import {simpleNotification} from '/imports/api/notification/notification';

class AsksClass extends Entity { }

export default AsksCollection = new AsksClass('Asks');

AsksCollection.schemaMetadata = Entity.createSchemaMetadata({
    goodPoints: {
        base: {
            type: [String],
            optional: true
        },
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

AsksCollection.schema = Entity.createSchema(AsksCollection.schemaMetadata, {
    goodPoints: {
        type: [String],
        optional: true
    }
});
AsksCollection.attachSchema(AsksCollection.schema);

Entity.setupStaticMethods(AsksCollection);

Entity.extendHelpers(AsksCollection, {
    //zamienic to na wartosc trzymana w Asku bo tak to jest 
    //kosmicznie niewydajne
    getLatestPost() {
        return Responses.findOne({
            ask: this._id
        }, {
            sort: {
                creationDate: -1
            }
        });
    }
});