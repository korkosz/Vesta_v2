import { Mongo } from 'meteor/mongo';

export default Ideas = new Mongo.Collection('ideas');

Ideas.schema = new SimpleSchema({
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
        defaultValue: "New"       
    },
    reviewers: {
        type: [String],
        optional: true
    },
    reviews: {
        type: [String],
        optional: true
    },
    creationDate: {
        type: Date,
        defaultValue: new Date()        
    },
    createdBy: {
        type: String,
        defaultValue: this.userId
    }
});

Ideas.attachSchema(Ideas.schema);
