import {Mongo} from 'meteor/mongo';

import Projects from '/imports/api/project/project';

export default Tacks = new Mongo.Collection('Projects.Tacks');

Tacks.schema = new SimpleSchema({
    project: {
        type: String
    },
    projectPrefix: {
        type: String
    },
    content: {
        type: String
    },
    important: {
        type: Boolean,
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
});

Tacks.attachSchema(Tacks.schema);

Tacks.helpers({
    projectColor() {
        var project = Projects.findOne(this.project);
        if (project) return project.color;
    }
})