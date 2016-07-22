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
    }
});
Ideas.attachSchema(Ideas.schema);

Ideas.schemaMetadata = Entity.createSchemaMetadata({
    reason: {
        notSearchable: true
    },
    reviewers: {
        notSearchable: true
    },
    reviews: {
        notSearchable: true
    },
    voting: {
        notSearchable: true
    },
    votes: {
        notSearchable: true
    }
});

Entity.extendHelpers(Ideas, {
    getVotingDescription() {
        if (this.voting)
            return Ideas.votingTypes[this.voting];
    }
});

Entity.setupStaticMethods(Ideas);

Ideas.votingTypes = {
    1: 'Create First Task (Reviews will be off)',
    2: 'Start Discussion (Reviews will be off)',
    3: 'Close Idea',
    4: 'Reject Idea',
    5: 'Defer Idea'
};