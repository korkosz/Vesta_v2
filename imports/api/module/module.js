import {Mongo} from 'meteor/mongo';

export default ModuleCollection = new Mongo.Collection('modules');

ModuleCollection.schema = new SimpleSchema({
    name: {
        type: String,
        max: 50
    },
    project: {
        type: String
    }   
});

ModuleCollection.attachSchema(ModuleCollection.schema);