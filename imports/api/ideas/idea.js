import { Mongo } from 'meteor/mongo';
import Entity from '../entity';
import './methods';

class IdeasCollection extends Entity { }

export default Ideas = new IdeasCollection('ideas');

var voteSchema = new SimpleSchema({
    userId: {
        type: String
    },
    userName: {
        type: String
    },
    value: {
        type: Boolean
    }
});

var requestSchema = new SimpleSchema({
    userName: {
        type: String
    },
    requestId: {
        type: Number
    },
    explanation: {
        type: String,
        optional: true
    },
    creationDate: {
        type: Number,
        label: 'Created At',
        autoValue() {
            if (this.isInsert) {
                return (new Date()).getTime();
            }
        },
        optional: true
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
        type: Number,
        optional: true
    },
    votes: {
        type: [voteSchema],
        optional: true
    },
    requests: {
        type: [requestSchema],
        optional: true
    }
});
Ideas.attachSchema(Ideas.schema);

Ideas.schemaMetadata = Entity.createSchemaMetadata({});

Entity.extendHelpers(Ideas, {
    getVotingDescription() {
        if (this.voting)
            return Ideas.votingTypes[this.voting];
    }
});

Ideas.votingTypes = {
    1: 'Create First Task (Reviews will be off)',
    2: 'Start Discussion (Reviews will be off)',
    3: 'Close Idea',
    4: 'Reject Idea',
    5: 'Defer Idea'
};