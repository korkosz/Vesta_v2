import { Mongo } from 'meteor/mongo';

import Modules from '/imports/api/module/module';
import Projects from '/imports/api/project/project';

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

Ideas.helpers({
    project() {
        var project = Projects.findOne(this.projectId);
        if(project) return project.name;
    },
    creator() {
        var user = Meteor.users.findOne(this.createdBy);
        if(user) return user.profile.fullname;        
    },
    moduleName() {
        var module = Modules.findOne(this.module);
        if(module) return module.name;   
    }           
});

Ideas.attachSchema(Ideas.schema);
