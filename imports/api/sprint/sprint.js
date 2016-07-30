import {Mongo} from 'meteor/mongo';

export default Sprints = new Mongo.Collection('Sprints');

Sprints.schema = new SimpleSchema({ 
    number: {
        type: Number,
        autoValue() {
            return 88;
        }
    },
    startDate: {
        type: Number,
        autoValue() {
            return 1469870465749;
        }
    },
    endDate: {
        type: Number,
        autoValue() {
            return 1469870465935;
        }
    },
    goals: {
        type: [String],
        optional: true
    }
});

Sprints.attachSchema(Sprints.schema);