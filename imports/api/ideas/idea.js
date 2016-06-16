import { Mongo } from 'meteor/mongo';
import Entity from '../entity';
import { Notify } from '/imports/api/notification/notification';

import './methods';
class IdeasCollection extends Entity {
    update(selector, updateDoc, callback, notifyObject) {
        function innerCallback() {
            if(!notifyObject) return;
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
}

export default Ideas = new IdeasCollection('ideas');

Ideas.schema = Entity.createSchema({
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
    }
});
Ideas.attachSchema(Ideas.schema);

Ideas.schemaMetadata = Entity.createSchemaMetadata({});
Entity.extendHelpers(Ideas, {});
