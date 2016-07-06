import {Mongo} from 'meteor/mongo';

import Projects from '/imports/api/project/project';

export default Posts = new Mongo.Collection('Projects.Posts');

Posts.schema = new SimpleSchema({
    project: {
        type: String
    },
    content: {
        type: String
    },
    parentId: {
        type: String,
        optional: true
    },
    creationDate: {
        type: Number,
        label: 'Created At',
        autoValue() {
            if (this.isInsert) {
                return (new Date()).getTime();
            }
        }
    },
    createdBy: {
        type: String,
        label: 'Created By',
        autoValue() {
            if (this.isInsert) {
                return this.userId;
            } else {
                this.unset();
            }
        }
    },
    updatedAt: {
        type: Date,
        autoValue: function () {
            if (this.isUpdate) {
                return (new Date()).getTime();
            } else {
                this.unset();
            }
        },
        optional: true,
        label: 'Updated At'
    }
});

Posts.helpers({
    creator() {
        var user = Meteor.users.findOne(this.createdBy);
        if (user) return user.profile.fullname;
    },
    creatorShort() {
        var user = Meteor.users.findOne(this.createdBy);
        if (user) {
            return user.profile.firstname[0] + '.' + ' ' +
                user.profile.lastname;
        }
    },
    projectPrefix() {
        var project = Projects.findOne(this.project);
        if (project) return project.prefix;
    }
});

Posts.attachSchema(Posts.schema);