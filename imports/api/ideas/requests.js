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
    }
});

Requests.helpers({
    getRequestDescription() {
        if (this.requestTypeId)
            return Requests.requestTypes[this.requestTypeId];
    },
     getResultDescription() {
        if (this.resultId)
            return Requests.resultTypes[this.resultId];
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

/* 1) Check if all pending requests still make sense.
 * 2) Set "Accepted" for fulfilled requests 
 * 
 * Use after status of an Idea changed 
 * 
 * @example 
 *  If status changed to Working requests to 
 *  start discussion are now obsolete 
 */
export function handlePendingRequests(ideaId, currentStatus) {

    ///1) Check if all pending requests still make sense.
    var notFullfiled = {
        idea: ideaId,
        resultId: 1
    };

    switch (currentStatus) {
        case 1: //New
            notFullfiled.requestTypeId = {
                $nin: [4, 5] //can request to Defer or Reject
            };
            break;
        case 2: //Working
            notFullfiled.requestTypeId = {
                $nin: [1, 4, 5] //can request to Defer or Reject
            };
            break;
        case 3: //Closed
            notFullfiled.requestTypeId = 3;
            break;
        case 4: //Rejected 
            notFullfiled.requestTypeId = 4;
            break;
        case 5: //Defer - deferred Idea can be reject
            notFullfiled.requestTypeId = {
                $nin: [4, 5]
            };
            break;
        case 6: //Consider
            notFullfiled.requestTypeId = 3; // can't request to close
            break;
        case 7: //Implemented
            notFullfiled.requestTypeId = {
                $ne: 3 // can only request to close
            };
            break;
        case 8: //Discussed
            notFullfiled.requestTypeId = {
                $nin: [1, 2, 4, 5] //Can Reject, Defer i create First Task
            };
            break;
    }

    Requests.update(notFullfiled, {
        $set: {
            resultId: 4 //Not Fulfilled
        }
    }, { multi: true });

    ///2) Set "Accepted" for fulfilled requests
    var accepted = {
        idea: ideaId,
        resultId: 1
    };
    switch (currentStatus) {
        case 2: //Working
            accepted.requestTypeId = 1;
            break;
        case 3: //Closed
            accepted.requestTypeId = 3;
            break;
        case 4: //Rejected 
            accepted.requestTypeId = 4;
            break;
        case 5: //Defer
            accepted.requestTypeId = 5;
            break;
        case 8: //Discussed
            accepted.requestTypeId = 2;
            break;
    }
    if (accepted.requestTypeId) {
        Requests.update(accepted, {
            $set: {
                resultId: 2 //Accepted
            }
        }, { multi: true });
    }

}