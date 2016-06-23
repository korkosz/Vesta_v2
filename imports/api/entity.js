import {Mongo} from 'meteor/mongo';

import Modules from '/imports/api/module/module';
import Projects from '/imports/api/project/project';
import Metadata from '/imports/api/metadata/metadata';

import {oldNewNotification, simpleNotification,
    msgNotification} from '/imports/api/notification/notification';

export default class Entity extends Mongo.Collection {
    insert(doc, callback) {
        var me = this;

        //1) Generate Id and Number for new document
        setNumberAndId.call(me, doc);

        //2) Set default watchers
        setDefaultWatchers(me._name, doc);

        return super.insert(doc, function (err, res) {
            if (err) {
                if (typeof callback === 'function') {
                    callback(err);
                }
                return;
            }
            //1) notifications
            handleCreateNotification(me._name, doc);
            //2) callback
            if (typeof callback === 'function') callback(null, res);
        });
    }

    update(selector, modifier, callback, updatedObject, userId,
        additionalParams) {
        var me = this;

        //0) here to save old value before update
        if (!updatedObject) updatedObject =
            me.findOne(selector);

        super.update(selector, modifier, (err, res) => {
            if (err) {
                if (typeof callback === 'function') {
                    callback(err);
                }
                return;
            }
            //1) notifications
            handleUpdateNotification.call(me,
                modifier, updatedObject, userId, additionalParams);
            //2) callback
            if (typeof callback === 'function')
                callback(null, res);
        });
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
            label: 'Created At',
            autoValue() {
                if (this.isInsert) {
                    return new Date();
                } else {
                    this.unset();
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
        watchers: {
            type: [String],
            optional: true
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
            },
            notify: function (modifier, oldEntity, modifierMethod, userId) {
                const usersToNotify = oldEntity.watchers.filter(
                    (user) => user !== userId);
                const entityName = oldEntity.getEntityName();
                //map 'Defer' sprint
                var oldVal = this.transform(oldEntity['status'], entityName);
                var newVal = this.transform(modifier[modifierMethod]['status'], entityName);

                oldNewNotification(usersToNotify, oldEntity.id, 'Status',
                    oldVal, newVal, 'changed');
            }
        },
        priority: {
            notify: oldNewNotifyHelper('priority')
        },
        sprint: {
            notify: function (modifier, oldEntity, modifierMethod, userId) {
                const usersToNotify = oldEntity.watchers.filter(
                    (user) => user !== userId);

                //map 'Defer' sprint
                var oldVal = oldEntity['sprint'];
                var newVal = modifier[modifierMethod]['sprint'];
                if (oldVal === -1) oldVal = 'Defer';
                if (newVal === -1) newVal = 'Defer';

                oldNewNotification(usersToNotify, oldEntity.id, 'Sprint',
                    oldVal, newVal, 'updated');
            }
        },
        related: {
            notify: function (modifier, oldEntity, modifierMethod, userId, additionalParams) {
                const usersToNotify = oldEntity.watchers.filter(
                    (user) => user !== userId);
                const related = modifier[modifierMethod].related;
                const msg = '"' + related.relation + ' ' + additionalParams.relatedId + '"';

                switch (modifierMethod) {
                    case '$push':
                        msgNotification(usersToNotify,
                            oldEntity.id, 'Relation', msg, 'created',
                            [{
                                word: additionalParams.relatedId,
                                url: additionalParams.relatedId
                            }]);
                        break;
                    case '$pull':
                        msgNotification(usersToNotify,
                            oldEntity.id, 'Relation', msg, 'removed',
                            [{
                                word: additionalParams.relatedId,
                                url: additionalParams.relatedId
                            }]);
                        break;
                    default:
                        break;
                }
            }
        },
        description: {
            notify: function (modifier, oldEntity, modifierMethod, userId) {
                const usersToNotify = oldEntity.watchers.filter(
                    (user) => user !== userId);

                simpleNotification(usersToNotify,
                    oldEntity.id, 'Description', 'updated')
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
        },
        getEntityName() {
            var id = this.id;
            //reverse to search from the end
            id = id.split("").reverse().join("");
            var idx = id.search(/[AIT]/);
            var letter = id[idx];
            var _id = id.substring(0, idx);
            _id = _id.split("").reverse().join("");

            switch (letter) {
                case 'A':
                    return 'Ask'
                case 'I':
                    return 'Idea'
                case 'T':
                    return 'Task'
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

//inners 
function setNumberAndId(doc) {
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
}

function setDefaultWatchers(entityName, doc) {
    var entityName = entityName.toUpperCase();
    doc.watchers = [];
    switch (entityName) {
        case 'TASKS':
            doc.watchers.push(doc.createdBy);
            if (doc.createdBy !== doc.assigned) {
                doc.watchers.push(doc.assigned);
            }
            break;
        case 'IDEAS':
            doc.watchers = doc.watchers.concat(doc.reviewers);
            if (doc.watchers.indexOf(doc.createdBy) === -1)
                doc.watchers.push(doc.createdBy);
            break;
        case 'ASKS':
            doc.watchers = Meteor.users.find().map((user) => user._id);
            if (doc.watchers.indexOf(doc.createdBy) === -1)
                doc.watchers.push(doc.createdBy);
            break;
        default:
            break;
    }
}

function handleCreateNotification(entityName, doc) {
    var entityName = entityName.toUpperCase();

    switch (entityName) {
        case 'TASKS':
            if (doc.createdBy !== doc.assigned) {
                simpleNotification([doc.assigned], doc.id, null, 'created by',
                    doc.createdBy);
            }
            break;
        case 'IDEAS':
            let usersToNotify = doc.watchers;
            usersToNotify.splice(
                usersToNotify.indexOf(doc.createdBy), 1);

            simpleNotification(usersToNotify, doc.id, null, 'created by',
                doc.createdBy);
            break;
        case 'ASKS':
            let users = doc.watchers;
            users.splice(
                users.indexOf(doc.createdBy), 1);
            simpleNotification(users, doc.id, null, 'created by',
                doc.createdBy);
            break;
        default:
            break;
    }

}

function handleUpdateNotification(modifier, oldObject, userId, additionalParams) {
    var updateModifiers = Object.getOwnPropertyNames(modifier);
    for (property of updateModifiers) { //$set, $pull etc
        let fields = Object.getOwnPropertyNames(modifier[property]);
        for (field of fields) {//status, description etc
            let meta = this.schemaMetadata[field];
            if (meta && typeof meta.notify === 'function') {
                meta.notify(modifier, oldObject, property, userId, additionalParams);
            }
        }
    }

}

function oldNewNotifyHelper(fieldName) {
    return function (modifier, oldEntity, modifierMethod, userId) {
        const upperedLabel = fieldName[0].toUpperCase() +
            fieldName.substr(1, fieldName.length - 1);
        const usersToNotify = oldEntity.watchers.filter(
            (user) => user !== userId);
        oldNewNotification(usersToNotify, oldEntity.id, upperedLabel,
            oldEntity[fieldName], modifier[modifierMethod][fieldName],
            'updated');
    }
}