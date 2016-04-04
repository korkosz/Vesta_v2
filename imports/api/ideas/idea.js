import { Mongo } from 'meteor/mongo';

export default Ideas = new Mongo.Collection('ideas');
//
Ideas.schema = new SimpleSchema({
    title: {
        type: String,
        max: 100
    },
    description: {
        type: String
    },
    projectId: {
        type: String
    },
    creationDate: {
        type: Date,
        autoValue: function() {
            return new Date();
        }
    }
});

export const ideaSchema = Ideas.schema;

Ideas.attachSchema(Ideas.schema);

//Ideas.insert({title: "test2", description: "test2"});
