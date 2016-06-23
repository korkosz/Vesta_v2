import { Mongo } from 'meteor/mongo';

import Asks from '/imports/api/ask/ask';

import {simpleNotification} from '/imports/api/notification/notification';

class ResponsesClass extends Mongo.Collection {
    insert(doc, callback, relatedAsk, userId) {

        var sort = { number: -1 };
        var fields = {
            number: 1
        };

        var cursor = this.findOne({}, { fields: fields, sort: sort });
        var seq = cursor && cursor.number ? cursor.number + 1 : 1;
        doc.number = seq;

        super.insert(doc, function (err, res) {
            if (err) {
                if (typeof callback === 'function') {
                    callback(err);
                }
                return;
            }
            const usersToNotify = relatedAsk.watchers.filter(
                (user) => user !== userId);

            simpleNotification(usersToNotify, relatedAsk.id,
                'Post \"' + doc.number + '\"', 'added');

            if (typeof callback === 'function') callback(null, res);

            return res;
        });
    }

    remove(selector, callback, relatedAsk, userId, postNb) {
        super.remove(selector, function (err, res) {
            if (err) {
                if (typeof callback === 'function') {
                    callback(err);
                }
                return;
            }
            const usersToNotify = relatedAsk.watchers.filter(
                (user) => user !== userId);

            simpleNotification(usersToNotify, relatedAsk.id,
                'Post \"' + postNb + '\"', 'removed');

            if (typeof callback === 'function') callback(null, res);
        });
    }

    update(selector, updateDoc, callback, relatedAsk, userId, postNb) {
        super.update(selector, updateDoc, function (err, res) {
            if (err) {
                if (typeof callback === 'function') {
                    callback(err);
                }
                return;
            }
            const usersToNotify = relatedAsk.watchers.filter(
                (user) => user !== userId);

            simpleNotification(usersToNotify, relatedAsk.id,
                'Post \"' + postNb + '\"', 'updated');

            if (typeof callback === 'function') callback(null, res);

            return res;
        });
    }
}

export default ReponsesCollection = new ResponsesClass('Asks.Responses');

ReponsesCollection.schema = new SimpleSchema({
    ask: {
        type: String
    },
    parentResponse: {
        type: String,
        optional: true
    },
    number: {
        type: Number
    },
    title: {
        type: String,
        max: 100,
        optional: true
    },
    description: {
        type: String,
        optional: true
    },
    likes: {
        type: [String],
        optional: true
    },
    dislikes: {
        type: [String],
        optional: true
    },
    creationDate: {
        type: Number,
        autoValue() {
            if (this.isInsert) {
                return (new Date()).getTime();
            }
        },
        optional: true
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
    createdBy: {
        type: String,
        autoValue() {
            if (this.isInsert) {
                return this.userId;
            }
        }
    }
});


ReponsesCollection.helpers({
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
    }
});

ReponsesCollection.attachSchema(ReponsesCollection.schema);