import Ideas from '/imports/api/ideas/idea';

import {oldNewNotification, simpleNotification,
    msgNotification} from '/imports/api/notification/notification';

class ReviewsCollection extends Mongo.Collection {
    insert(review, callback, relatedIdea, userId) {
        super.insert(review, function (err, res) {
            if (err) {
                if (typeof callback === 'function') {
                    callback(err);
                }
                return;
            }
            const usersToNotify = relatedIdea.watchers.filter(
                (user) => user !== userId);

            simpleNotification(usersToNotify, relatedIdea.id,
                'Review', 'added');

            if (typeof callback === 'function') callback(null, res);

            return res;
        });
    }

    //TODO: ZMIENIC REVID NA SELECTOR
    remove(revId, callback, relatedIdea, userId) {
        super.remove(revId, function (err, res) {
            if (err) {
                if (typeof callback === 'function') {
                    callback(err);
                }
                return;
            }
            const usersToNotify = relatedIdea.watchers.filter(
                (user) => user !== userId);

            simpleNotification(usersToNotify, relatedIdea.id,
                'Review', 'removed');

            if (typeof callback === 'function') callback(null, res);
        });
    }

    update(selector, updateDoc, callback, relatedIdea, userId) {
        super.update(selector, updateDoc, function (err, res) {
            if (err) {
                if (typeof callback === 'function') {
                    callback(err);
                }
                return;
            }
            const usersToNotify = relatedIdea.watchers.filter(
                (user) => user !== userId);

            simpleNotification(usersToNotify, relatedIdea.id,
                'Review', 'updated');

            if (typeof callback === 'function') callback(null, res);

            return res;
        });
    }
}

export default Reviews = new ReviewsCollection('Reviews')

Reviews.helpers({
    creator() {
        var user = Meteor.users.findOne(this.createdBy);
        if (user) return user.profile.fullname;
    }
});

ReviewSchema = new SimpleSchema({
    comment: {
        type: String,
        optional: true
    },
    merits: {
        type: [String],
        optional: true
    },
    drawbacks: {
        type: [String],
        optional: true
    },
    createdAt: {
        type: Date,
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
        autoValue() {
            if (this.isInsert) {
                return this.userId;
            }
        }
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
});

Reviews.attachSchema(ReviewSchema);