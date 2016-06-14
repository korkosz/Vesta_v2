import {Mongo} from 'meteor/mongo';
//import angular from 'angular';

import Modules from '/imports/api/module/module';
import Projects from '/imports/api/project/project';

import {Notify} from '/imports/api/notification/notification';

export default class Entity extends Mongo.Collection {
    insert(doc) {
        while (1) {
            var me = this;
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
                    'T' + seq;
            }

            super.insert(doc, function (res) {
                if (doc.assigned !== doc.createdBy) {
                    Notify(me._name, doc.id, 'New', doc.assigned,
                        doc.createdBy, doc.creationDate);
                }
            });
            break;
        }
    }

    remove(id) {
        this.update(id, {
            $set: {
                isDeleted: true
            }
        });
    }
}

Entity.createSchema = function (schemaExtension) {
    var base = {
        id: {
            type: String
        },
        number: {
            type: Number
        },
        project: {
            type: String
        },
        module: {
            type: String
        },
        sprint: {
            type: Number
        },
        title: {
            type: String,
            max: 100
        },
        status: {
            type: String,
            defaultValue: "Open"
        },
        description: {
            type: String,
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
    };

    var schema = Object.assign(base, schemaExtension);

    return new SimpleSchema(schema);
};

function extend() {

}