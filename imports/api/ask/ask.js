import { Mongo } from 'meteor/mongo';
import Entity from '../entity';
import './methods';
import {Notify} from '/imports/api/notification/notification';

class AsksClass extends Entity { }

export default AsksCollection = new AsksClass('Asks');

AsksCollection.schema = Entity.createSchema({
    responses: {
        type: [String],
        optional: true
    },
    goodPoints: {
        type: [String],
        optional: true
    },
    ideaId: {
        type: String,
        optional: true
    }
});
AsksCollection.attachSchema(AsksCollection.schema);

AsksCollection.schemaMetadata = Entity.createSchemaMetadata({});
Entity.extendHelpers(AsksCollection, {});