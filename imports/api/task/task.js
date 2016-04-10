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
    priority: {
        type: String  
    },
    progress: {
        type: Number,
        autoValue: function() {
            return 0;
        }  
    },
    type: {
        type: String    
    },
    status: {
        type: String,
        autoValue: function() {
            return "New";
        }
    },
    creator: {
        type: String,
        autoValue: function() {
            return 'Korkosz';
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