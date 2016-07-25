import {Mongo} from 'meteor/mongo';
import Entity from '../entity';
import Comments from '/imports/api/task/comment'
import Metadata from '/imports/api/metadata/metadata';
import './methods';

class TaskClass extends Entity { }

export default TaskCollection = new TaskClass('Tasks');

TaskCollection.schemaMetadata = Entity.createSchemaMetadata({
    assigned: {
        base: {
            type: String,
            optional: true
        },
        type: 'id',
        transform(value) {
            var user = Meteor.users.findOne(value);
            if (user) {
                return user.profile.firstname[0] + '.' + ' ' +
                    user.profile.lastname;
            }
        },
        search: {
            filter: 'picklist'
        }
    },
    type: {
        base: {
            type: Number
        },
        transform(value) {
            const taskTypes = Metadata.findOne('5vdA3vyJ2qCTMabwL').value;
            return taskTypes.find((type) => type.id === value).value;
        },
        search: {
            filter: 'picklist'
        }
    },
    priority: {
        base: {
            type: String
        },
        //notify: oldNewNotifyHelper('priority'),
        search: {
            filter: 'picklist'
        }
    }
});

TaskCollection.schema = Entity.createSchema(TaskCollection.schemaMetadata, {
    priority: {
        type: String
    },
    // progress: {
    //     type: Number,
    //     defaultValue: 0
    // },
    type: {
        type: Number
    },
    assigned: {
        type: String,
        optional: true
    }
});

Entity.extendHelpers(TaskCollection, {
    assignedUser() {
        var user = Meteor.users.findOne(this.assigned);
        if (user) return user.profile.fullname;
    },
    assignedUserShort() {
        var user = Meteor.users.findOne(this.assigned);
        if (user) {
            return user.profile.firstname[0] + '.' + ' ' +
                user.profile.lastname;
        }
    },
    getComments() {
        var _commentsIds = this.comments;
        if (!Array.isArray(_commentsIds)) return [];
        return Comments.find({
            _id: {
                $in: _commentsIds
            }
        });
    },
    getTypeName() {
        const taskTypes = Metadata.findOne('5vdA3vyJ2qCTMabwL').value;
        return taskTypes.find((type) => type.id === this.type).value;
    }
});

Entity.setupStaticMethods(TaskCollection);

TaskCollection.attachSchema(TaskCollection.schema);
