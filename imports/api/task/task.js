import {Mongo} from 'meteor/mongo';
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
            if(!this.value) return "New";
        }
    },
    assigned: {
        type: String,
        optional: true  
    },
    creationDate: {
        type: Date,
        autoValue: function() {
            if(!this.value) return new Date();
        }
    },
    createdBy: {
        type: String,
        autoValue() {
            if(!this.value) {
                if(this.userId) return this.userId;
                return 'KorkoszDefaultMateusz';     
            }                       
        }
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
    }    
});
TaskCollection.attachSchema(TaskCollection.schema);