import { Mongo } from 'meteor/mongo';
import Tasks from '/imports/api/task/task';

class CommentsCollection extends Mongo.Collection {
    insert(comment, callback) {
        comment.number = performance.now()
            .toString().slice(0,4).replace('.', 1);
        super.insert(comment, function (err, res) {            
            Tasks.update(comment.taskId, {
                $push: {
                    comments: res
                }
            });
        });
    }
}

export default Comments = new CommentsCollection('Tasks.Comments');

CommentsCollection.schema = new SimpleSchema({
    content: {
        type: String
    },
    taskId: {
        type: String
    },
    number: {
        type: String  
    },
    createdBy: {
        type: String,
        defaultValue: this.userId,
        optional: true
    },
    createdAt: {
        type: Date,
        optional: true
    }
});

Comments.helpers({
    creator() {
        var user = Meteor.users.findOne(this.createdBy);
        if (user) return user.profile.fullname;
    }
});

Comments.attachSchema(CommentsCollection.schema);