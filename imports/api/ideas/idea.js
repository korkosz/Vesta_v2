import { Mongo } from 'meteor/mongo';
import Entity from '../entity';
import './methods';

class IdeasCollection extends Entity { }

export default Ideas = new IdeasCollection('ideas');

Ideas.schema = Entity.createSchema({
    reason: {
        type: String,
        optional: true
    },
    reviewers: {
        type: [String],
        optional: true
    },
    reviews: {
        type: [String],
        optional: true
    }
});
Ideas.attachSchema(Ideas.schema);

Ideas.schemaMetadata = Entity.createSchemaMetadata({});
Entity.extendHelpers(Ideas, {});
