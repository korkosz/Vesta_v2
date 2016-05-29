import { Mongo } from 'meteor/mongo';

import Modules from '/imports/api/module/module';
import Projects from '/imports/api/project/project';


class IdeasCollection extends Mongo.Collection {
    insert(doc) {
        while (1) {

            var sort = { number: -1 };
            var fields = {
                number: 1
            };

            var cursor = this.findOne({}, { fields: fields, sort: sort });
            var seq = cursor && cursor.number ? cursor.number + 1 : 1;
            doc.number = seq;

            var results = super.insert(doc);

            // if (results.hasWriteError()) {
            //     if (results.writeError.code == 11000 /* dup key */)
            //         continue;
            //     else
            //         console.log("unexpected error inserting data: " + JSON.stringify(results));
            // }
            break;
        }
    }

    remove(ideaId) {
        this.update(ideaId, {
            $set: {
                isDeleted: true
            }
        });
    }
}

export default Ideas = new IdeasCollection('ideas');

Ideas.schema = new SimpleSchema({
    title: {
        type: String,
        max: 100
    },
    number: {
        type: Number,
        optional: true
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
    },
    updatedAt: {
        type: Date,
        autoValue: function () {
            if (this.isUpdate) {
                return new Date();
            }
        },
        denyInsert: true,
        optional: true
    },
    isDeleted: {
        type: Boolean,
        defaultValue: false
    }
});

Ideas.helpers({
    project() {
        var project = Projects.findOne(this.projectId);
        if (project) return project.name;
    },
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
    moduleName() {
        var module = Modules.findOne(this.module);
        if (module) return module.name;
    }
});

Ideas.attachSchema(Ideas.schema);
