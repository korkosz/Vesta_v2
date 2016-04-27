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
            if(!this.value) return "New";
        }
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
        autoValue: function() {
            return new Date();
        }
    },
    createdBy: {
        type: String,
        autoValue() {
            if(this.userId) return this.userId;
            return 'KorkoszDefaultMateusz';
            
        }
    }
});

Ideas.attachSchema(Ideas.schema);

//Ideas.insert({title: "test2", description: "test2"});
