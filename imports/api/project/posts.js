import {Mongo} from 'meteor/mongo';

export default Posts = new Mongo.Collection('Projects.Posts');

Posts.schema = new SimpleSchema({
    project: {
        type: String
    },
    content: {
        type: String
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
            return new Date();
        },
        optional: true,
        label: 'Updated At'
    }
});