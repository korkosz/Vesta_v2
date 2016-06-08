import { Mongo } from 'meteor/mongo';

import Modules from '/imports/api/module/module';
import Projects from '/imports/api/project/project';

import {Notify} from '/imports/api/notification/notification';

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

            var project = Projects.findOne(doc.projectId);
            var projectPrefix = project ? project.prefix : null;
            var sprint = project ? project.sprint : null;

            if (projectPrefix && sprint) {
                doc.id = projectPrefix.toUpperCase() + sprint +
                    'I' + seq;
            }

            super.insert(doc, function (res) {
                var usersToNotify = doc.reviewers.map((rev) => {
                    if (rev !== doc.createdBy) return rev;
                });

                if (usersToNotify.length > 0) {
                    Notify('Idea', doc.id, 'New', usersToNotify,
                        doc.createdBy, doc.creationDate);
                }
            });

            break;
        }
    }

    update(selector, updateDoc, callback, notifyObject) {
        function innerCallback() {
            //reviewers have to be notified
            var usersToNotify = notifyObject.reviewers.map((rev) => {
                if (rev !== notifyObject.provider) return rev;
            });

            //if creator not already in reviewers and
            //he is not the one who updated entity 
            //- notify him
            if (usersToNotify.indexOf(notifyObject
                .entityCreator) === -1 && notifyObject
                .entityCreator !== notifyObject.provider) {
                usersToNotify.push(notifyObject.entityCreator);
            }

            if (usersToNotify.length > 0) {
                Notify('Idea', notifyObject.id, 'Update', usersToNotify,
                    notifyObject.provider, notifyObject.when);
            }

            if (typeof callback === 'function') callback();
        }
        super.update(selector, updateDoc, innerCallback);
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
    id: {
        type: String
    },
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
        type: String,
        label: 'Project'
    },
    status: {
        type: String,
        defaultValue: "New"
    },
    reason: {
        type: String,
        optional: true
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
        defaultValue: new Date(),
        label: 'Created At'
    },
    createdBy: {
        type: String,
        defaultValue: this.userId,
        label: 'Created By'
    },
    updatedAt: {
        type: Date,
        autoValue: function () {
            return new Date();
        },
        optional: true,
        label: 'Updated At'
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
