import {Mongo} from 'meteor/mongo';
import Entity from '../entity';
import Comments from '/imports/api/task/comment'
import Metadata from '/imports/api/metadata/metadata';
import './methods';

class TaskClass extends Entity { }

export default TaskCollection = new TaskClass('Tasks');

TaskCollection.schema = Entity.createSchema({
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

TaskCollection.schemaMetadata = Entity.createSchemaMetadata({
    assigned: {
        type: 'id',
        transform(value) {
            var user = Meteor.users.findOne(value);
            if (user) {
                return user.profile.firstname[0] + '.' + ' ' +
                    user.profile.lastname;
            }
        }
    },
    type: {
        transform(value) {
            const taskTypes = Metadata.findOne('5vdA3vyJ2qCTMabwL').value;
            return taskTypes.find((type) => type.id === value).value;
        }
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
