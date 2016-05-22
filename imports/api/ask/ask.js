import { Mongo } from 'meteor/mongo';

export default AsksCollection = new Mongo.Collection('Asks');

AsksCollection.schema = new SimpleSchema({
    title: {
        type: String,
        max: 100
    },
    description: {
        type: String
    },
    statements: {
        type: [String]
    },
    module: {
        type: String
    },
    project: {
        type: String
    },
    creationDate: {
        type: Date
    },
    createdBy: {
        type: String,
        defaultValue: this.userId
    }
});