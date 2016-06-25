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
    },
    votings: {
        type: [votingsSchema],
        optional: true
    },
    votes: {
        type: [votesSchema],
        optional: true
    }
});
Ideas.attachSchema(Ideas.schema);

var votingsSchema = new SimpleSchema({
    _id: {
        type: String,
        autoValue() {
            if (this.isInsert) {
                return (new Date()).getTime().toString();
            } else {
                this.unset();
            }
        }
    },
    type: {
        type: Number
    }
});

var votesSchema = new SimpleSchema({
    voting: {
        type: String
    },
    user: {
        type: Number
    },
    value: {
        type: Boolean
    }
});

Ideas.schemaMetadata = Entity.createSchemaMetadata({});
Entity.extendHelpers(Ideas, {});

const votingTypes = {
    0: 'First Task',
    1: 'Start Discussion',
    2: 'Reject Idea',
    3: 'Defer Idea',
    4: 'Close Idea'
}