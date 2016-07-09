import {Mongo} from 'meteor/mongo';

export default Requests = new Mongo.Collection('Ideas.Requests');

Requests.schema = new SimpleSchema({
    // Requestor
    creator: {
        type: String
    },
    // MongoDb _id field
    idea: {
        type: String
    },
    // Our Entity.Number type (ex. V3I10) 
    ideaId: {
        type: String
    },
    // Indicates action which user is asking for
    requestTypeId: {
        type: Number
    },
    resultId: {
        type: Number,
        autoValue() {
            if (this.isInsert) {
                return 1; // Waiting
            }
        }
    },
    // If decission maker directly rejects Request
    // he can provide explanation of his decission
    rejectReason: {
        type: String,
        optional: true
    },
    // User who makes request can explain why he 
    // is asking for specific action
    explanation: {
        type: String,
        optional: true
    },
    // This field is important if result is 
    // different than Waiting
    seen: {
        type: String,
        optional: true
    }
});

Requests.helpers({
    getRequestDescription() {
        if (this.requestTypeId)
            return Requests.requestTypes[this.requestTypeId];
    },
    getUserName() {
        var user = Meteor.users.findOne(this.creator);
        if (user) return user.profile.fullname;
    }
});

Requests.requestTypes = {
    1: 'Create First Task (Reviews will be off)',
    2: 'Start Discussion (Reviews will be off)',
    3: 'Close Idea',
    4: 'Reject Idea',
    5: 'Defer Idea'
};

Requests.resultTypes = {
    1: 'Waiting',
    2: 'Accepted',
    3: 'Rejected',
    4: 'Not Fulfilled',
    5: 'Canceled'
};

Requests.attachSchema(Requests.schema);