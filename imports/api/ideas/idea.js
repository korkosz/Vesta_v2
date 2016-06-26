import { Mongo } from 'meteor/mongo';
import Entity from '../entity';
import './methods';

class IdeasCollection extends Entity { }

export default Ideas = new IdeasCollection('ideas');

var votingsSchema = new SimpleSchema({
    _id: {
        type: String,
        autoValue() {
            //return (new Date()).getTime().toString();
        },
        optional: true
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
    voting: {
        type: votingsSchema,
        optional: true
    },
    votes: {
        type: [votesSchema],
        optional: true
    }
});
Ideas.attachSchema(Ideas.schema);

Ideas.schemaMetadata = Entity.createSchemaMetadata({});
Entity.extendHelpers(Ideas, {
    getVotingDescription() {
        if (this.voting)
            return votingTypes[this.voting.type];
    }
});

const votingTypes = {
    0: 'Create First Task - reviews will be off',
    1: 'Start Discussion - reviews will be off',
    2: 'Reject Idea',
    3: 'Defer Idea',
    4: 'Close Idea'
};