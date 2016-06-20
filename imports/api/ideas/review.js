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
                'Review', 'created');

            Ideas.update(relatedIdea._id, {
                $push: { reviews: res }
            });
            return res;
        });
    }

    //TODO: ZMIENIC REVID NA SELECTOR
    remove(revId, ideaId, notify) {
        if (typeof ideaId === 'undefined') throw new Error('ideaId is undefined !!!');
        if (typeof revId === 'undefined') throw new Error('revId is undefined !!!');

        super.remove(revId, function (err, res) {
            Ideas.update({ _id: ideaId }, {
                $pull: { reviews: revId }
            }, null, notify);
        });
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
                Notify('Idea', notifyObject.id, 'Update', notifyObject.reviewers,
                    notifyObject.provider, notifyObject.when);
            }

            if (typeof callback === 'function') callback();
        }
        super.update(selector, updateDoc, innerCallback);
    }
}

export default Reviews = new ReviewsCollection('Reviews')

Reviews.helpers({
    creator() {
        var user = Meteor.users.findOne(this._createdBy);
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