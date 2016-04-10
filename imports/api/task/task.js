import {Mongo} from 'meteor/mongo';

export default TaskCollection = new Mongo.Collection('Tasks');

TaskCollection.schema = new SimpleSchema({
    title: {
        type: String,
        max: 100
    },
    description: {
        type: String
    },
    module: {
        type: String,
        optional: true
    },
    projectId: {
        type: String
    },
    status: {
        type: String,
        autoValue: function() {
            return "New";
        }
    },
    creationDate: {
        type: Date,
        autoValue: function() {
            return new Date();
        }
    }
});

TaskCollection.attachSchema(TaskCollection.schema);