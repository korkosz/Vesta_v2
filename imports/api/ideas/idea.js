import { Mongo } from 'meteor/mongo';
import Entity from '../entity';
import './methods';

class IdeasCollection extends Entity { }

export default Ideas = new IdeasCollection('ideas');

var votesSchema = new SimpleSchema({
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
        type: [votesSchema],
        optional: true
    }
});
Ideas.attachSchema(Ideas.schema);

Ideas.schemaMetadata = Entity.createSchemaMetadata({});
Entity.extendHelpers(Ideas, {
    getVotingDescription() {
        if (this.voting)
            return votingTypes[this.voting];
    }
});

const votingTypes = {
    0: 'Create First Task - reviews will be off',
    1: 'Start Discussion - reviews will be off',
    3: 'Close Idea',
    4: 'Reject Idea',
    5: 'Defer Idea'    
};