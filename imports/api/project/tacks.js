import {Mongo} from 'meteor/mongo';

export default Tacks = new Mongo.Collection('Projects.Tacks');

Tacks.schema = new SimpleSchema({
    project: {
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