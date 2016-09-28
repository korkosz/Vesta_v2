import {Mongo} from 'meteor/mongo';

import Modules from '/imports/api/module/module';
import Projects from '/imports/api/project/project';
import Metadata from '/imports/api/metadata/metadata';
import Sprints from '/imports/api/sprint/sprint';

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
}

Entity.createSchema = function (schemaMeta, schemaExtension) {
    var base = {};

    for (let key in schemaMeta) {
        if (schemaMeta.hasOwnProperty(key)) {
            base[key] = schemaMeta[key]['base'];
        }
    }

    var schema = Object.assign(base, schemaExtension);

    return new SimpleSchema(schema);
};

Entity.createSchemaMetadata = function (meta) {
    var basicSchemaMeta = {
        id: {
            base: {
                type: String
            },
            search: {
                filter: 'equal'
            }
        },
        number: {
            base: {
                type: Number
            },
            search: {
                filter: 'equal'
            }
        },
        project: {
            base: {
                type: String
            },
            transform(value) {
                var project = Projects.findOne(value);
                if (project) return project.name;
            },
            search: {
                filter: 'picklist'
            }
        },
        /**
         * holds ID of a parent of this entity, 
         * but only of the same type. So for Sub-Task 
         * it holds Task ID etc.  
         */
        parent: {
            base: {
                type: String,
                optional: true
            }
        },
        module: {
            base: {
                type: String
            },
            transform(value) {
                var module = Modules.findOne(value);
                if (module) return module.name;
            },
            search: {
                filter: 'picklist'
            }
        },
        title: {
            base: {
                type: String
            }
        },
        creationDate: {
            base: {
                type: Number,
                label: 'Created At',
                autoValue() {
                    if (this.isInsert) {
                        return (new Date()).getTime();
                    }
                }
            },
            transform(value) {
                return moment(value).fromNow();
            },
            search: {
                filter: 'date'
            }
        },
        updatedAt: {
            base: {
                type: Date,
                autoValue: function () {
                    return new Date();
                },
                optional: true,
                label: 'Updated At'
            },
            transform(value) {
                return moment(value).fromNow();
            },
            search: {
                filter: 'date'
            }
        },
        createdBy: {
            base: {
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
        status: {
            base: {
                type: Number,
                defaultValue: 1
            },
            transform(value, additionalValue) {
                switch (additionalValue) {
                    case 'Ask':
                        return Metadata.findOne('orb7v9a457r3T2snk').value[value].value;
                    case 'Idea':
                        return Metadata.findOne('CBJNeBr7WrnA8FmqH').value[value].name;
                    case 'Task':
                        return Metadata.findOne('orb7v9aZq7r3T2snk').value[value].value;
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
            },
            search: {
                filter: 'picklist'
            }
        },
        /**
         * if not provided means object is deferred
         */
        sprint: {
            base: {
                type: String,
                optional: true
            },
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
            },
            search: {
                filter: 'picklist'
            }
        },
        related: {
            base: {
                type: [RelationSchema],
                optional: true
            },
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
            },
            notSearchable: true
        },
        description: {
            base: {
                type: String,
                optional: true
            },
            notify: function (modifier, oldEntity, modifierMethod, userId) {
                const usersToNotify = oldEntity.watchers.filter(
                    (user) => user !== userId);

                simpleNotification(usersToNotify,
                    oldEntity.id, 'Description', 'updated')
            },
            notSearchable: true
        },
        watchers: {
            base: {
                type: [String],
                optional: true
            },
            notSearchable: true
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
        projectColor() {
            var project = Projects.findOne(this.project);
            if (project) return project.color;
        },
        moduleName() {
            var module = Modules.findOne(this.module);
            if (module) return module.name;
        },
        sprintNumber() {
            var sprint = Sprints.findOne(this.sprint);
            return sprint && sprint.number;
        },
        getStatusName() {
            var id = this.id;
            //reverse to search from the end
            id = id.split("").reverse().join("");
            var idx = id.search(/[AIT]/);
            var letter = id[idx];

            switch (letter) {
                case 'A':
                    return Metadata.findOne('orb7v9a457r3T2snk')
                        .value[this.status].value;
                case 'I':
                    return Metadata.findOne('CBJNeBr7WrnA8FmqH')
                        .value[this.status].name;
                case 'T':
                    return Metadata.findOne('orb7v9aZq7r3T2snk')
                        .value[this.status].value;
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

Entity.setupStaticMethods = function (collection) {
    collection.searchColumns = searchColumns;
    collection.getFieldType = getFieldType;
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
    var entityLetter = this._name[0].toUpperCase();

    if (projectPrefix) {
        doc.id = projectPrefix.toUpperCase() +
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
    // var updateModifiers = Object.getOwnPropertyNames(modifier);
    // for (property of updateModifiers) { //$set, $pull etc
    //     let fields = Object.getOwnPropertyNames(modifier[property]);
    //     for (field of fields) {//status, description etc
    //         let meta = this.schemaMetadata[field];
    //         if (meta && typeof meta.notify === 'function') {
    //             meta.notify(modifier, oldObject, property, userId, additionalParams);
    //         }
    //     }
    // }
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

function searchColumns(collection) {
    //1) get schema keys (without nested '$')
    var schemaKeys = collection.schema._firstLevelSchemaKeys;

    //2) Filter out keys explicitly hidden from search 
    //   indicated by notSearchable attribute on schema metadata
    schemaKeys = schemaKeys.filter((key) => {
        var meta = this.schemaMetadata[key];
        if (meta) return !meta.notSearchable;
        else return true;
    });

    return schemaKeys;
}

function getFieldType(collection, field) {
    return collection.schemaMetadata[field]['base']['type'];
}