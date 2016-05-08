import {Mongo} from 'meteor/mongo';

import Modules from '/imports/api/module/module';
import Projects from '/imports/api/project/project';

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
        defaultValue: 0
    },
    type: {
        type: String    
    },
    status: {
        type: String,
        defaultValue: "Open"       
    },
    assigned: {
        type: String,
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
TaskCollection.helpers({
    creator() {
        var user = Meteor.users.findOne(this.createdBy);
        if(user) return user.profile.fullname;        
    },
    assignedUser() {
        var user = Meteor.users.findOne(this.assigned);
        if(user) return user.profile.fullname;      
    },
    project() {
        var project = Projects.findOne(this.projectId);  
        if(project) return project.name;
    },
    moduleName() {
        var module = Modules.findOne(this.module);
        if(module) return module.name;   
    }    
});
TaskCollection.attachSchema(TaskCollection.schema);