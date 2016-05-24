import { Mongo } from 'meteor/mongo';

import Modules from '/imports/api/module/module';
import Projects from '/imports/api/project/project';

class ResponsesClass extends Mongo.Collection {
    insert(doc) {
        while (1) {
            var sort = { number: -1 };
            var fields = {
                number: 1
            };

            var cursor = this.findOne({}, { fields: fields, sort: sort });
            var seq = cursor && cursor.number ? cursor.number + 1 : 1;
            doc.number = seq;

            var results = super.insert(doc);
            break;
        }
    }
}

export default ReponsesCollection = new ResponsesClass('Asks.Reponses');

ReponsesCollection.schema = new SimpleSchema({
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
    creationAt: {
        type: Date
    },
    createdBy: {
        type: String,
        defaultValue: this.userId
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