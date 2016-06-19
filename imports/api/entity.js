import {Mongo} from 'meteor/mongo';

import Modules from '/imports/api/module/module';
import Projects from '/imports/api/project/project';
import Metadata from '/imports/api/metadata/metadata';

import {Notify} from '/imports/api/notification/notification';

export default class Entity extends Mongo.Collection {
    insert(doc, callback) {
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
            var entityLetter = this._name[0].toUpperCase();

            if (projectPrefix && sprint) {
                doc.id = projectPrefix.toUpperCase() + sprint +
                    entityLetter + seq;
            }

            return super.insert(doc, function (err, res) {
                if (doc.assigned !== doc.createdBy) {
                    Notify(me._name, doc.id, 'New', doc.assigned,
                        doc.createdBy, doc.creationDate);
                }

                callback(err, res);
            });
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
            type: Number,
            defaultValue: 1
        },
        description: {
            type: String,
            optional: true
        },
        related: {
            type: [RelationSchema],
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

Entity.createSchemaMetadata = function (meta) {
    var basicSchemaMeta = {
        creationDate: {
            type: Date,
            transform(value) {
                return moment(value).fromNow();
            }
        },
        updatedAt: {
            type: Date,
            transform(value) {
                return moment(value).fromNow();
            }
        },
        createdBy: {
            type: 'id',
            transform(value) {
                var user = Meteor.users.findOne(value);
                if (user) {
                    return user.profile.firstname[0] + '.' + ' ' +
                        user.profile.lastname;
                }
            }
        },
        status: {
            transform(value, additionalValue) {
                switch (additionalValue) {
                    case 'Ask':
                        const askStatuses = Metadata.findOne('orb7v9a457r3T2snk').value;
                        return askStatuses.find((stat) => stat.id === value).value;
                    case 'Idea':
                        const ideaStatuses = Metadata.findOne('CBJNeBr7WrnA8FmqH').value;
                        return ideaStatuses.find((stat) => stat.id === value).value;
                    case 'Task':
                        const taskStatuses = Metadata.findOne('orb7v9aZq7r3T2snk').value;
                        return taskStatuses.find((stat) => stat.id === value).value;
                    default:
                        return 'ERROR2';
                }
            }
        }
    }

    return Object.assign(basicSchemaMeta, meta);
};

Entity.extendHelpers = function (collection, helpers) {
    var basicHelpers = {
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
        projectName() {
            var project = Projects.findOne(this.project);
            if (project) return project.name;
        },
        moduleName() {
            var module = Modules.findOne(this.module);
            if (module) return module.name;
        },
        getStatusName() {
            var id = this.id;
            //reverse to search from the end
            id = id.split("").reverse().join("");
            var idx = id.search(/[AIT]/);
            var letter = id[idx];
            var _id = id.substring(0, idx);
            _id = _id.split("").reverse().join("");

            if (!Number.isSafeInteger(Number.parseInt(_id)))
                return 'ERROR';

            switch (letter) {
                case 'A':
                    const askStatuses = Metadata.findOne('orb7v9a457r3T2snk').value;
                    return askStatuses.find((stat) => stat.id === this.status).value;
                case 'I':
                    const ideaStatuses = Metadata.findOne('CBJNeBr7WrnA8FmqH').value;
                    return ideaStatuses.find((stat) => stat.id === this.status).value;
                case 'T':
                    const taskStatuses = Metadata.findOne('orb7v9aZq7r3T2snk').value;
                    return taskStatuses.find((stat) => stat.id === this.status).value;
                default:
                    return 'ERROR2';
            }
        }
    };

    var helpers = Object.assign(basicHelpers, helpers);
    collection.helpers(helpers);
};

var RelationSchema = new SimpleSchema({
    entity: {
        type: 'String'
    },
    id: {
        type: 'String'
    },
    relation: {
        type: 'String'
    }
});