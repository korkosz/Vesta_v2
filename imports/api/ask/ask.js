import { Mongo } from 'meteor/mongo';

import Modules from '/imports/api/module/module';
import Projects from '/imports/api/project/project';

import {Notify} from '/imports/api/notification/notification';

class AsksClass extends Mongo.Collection {
    insert(doc) {
        while (1) {
            var sort = { number: -1 };
            var fields = {
                number: 1
            };

            var cursor = this.findOne({}, { fields: fields, sort: sort });
            var seq = cursor && cursor.number ? cursor.number + 1 : 1;
            doc.number = seq;

            var project = Projects.findOne(doc.project);
            var projectPrefix = project ? project.prefix : null;
            var sprint = project ? project.currentSprint : null;

            if (projectPrefix && sprint) {
                doc.id = projectPrefix.toUpperCase() + sprint +
                    'A' + seq;
            }

            var results = super.insert(doc);
            break;
        }
    };

    remove(askId) {
        this.update(askId, {
            $set: {
                isDeleted: true
            }
        });
    };
}

export default AsksCollection = new AsksClass('Asks');

AsksCollection.schema = new SimpleSchema({
    id: {
        type: String
    },
    number: {
        type: Number
    },
    title: {
        type: String,
        max: 100
    },
    description: {
        type: String,
        optional: true
    },
    responses: {
        type: [String],
        optional: true
    },
    goodPoints: {
        type: [String],
        optional: true
    },
    module: {
        type: String
    },
    project: {
        type: String
    },
    ideaId: {
        type: String,
        optional: true
    },
    creationAt: {
        type: Date
    },
    createdBy: {
        type: String,
        defaultValue: this.userId
    },
    updatedAt: {
        type: Date,
        autoValue: function () {
            return new Date();
        },
        optional: true
    },
    isDeleted: {
        type: Boolean,
        defaultValue: false
    }
});

AsksCollection.helpers({
    projectName() {
        var project = Projects.findOne(this.project);
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

AsksCollection.attachSchema(AsksCollection.schema);
