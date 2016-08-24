import {Mongo} from 'meteor/mongo';

class Sprints extends Mongo.Collection {
    insert(doc, callback) {
        var sort = { number: -1 };
        var fields = { number: 1 };

        var cursor = this.findOne({}, { fields: fields, sort: sort });
        var seq = cursor && cursor.number ? cursor.number + 1 : 1;
        doc.number = seq;

        return super.insert(doc, function (err, res) {
            if (err) {
                if (typeof callback === 'function') {
                    callback(err);
                }
                return;
            }
            //2) callback
            if (typeof callback === 'function') callback(null, res);
        });
    }
}

export default SprintsCollection = new Sprints('Sprints');

SprintsCollection.schema = new SimpleSchema({
    number: {
        type: Number
    },
    startDate: {
        type: Number
    },
    endDate: {
        type: Number
    },
    project: {
        type: String
    },
    current: {
        type: Boolean
    },
    closed: {
        type: Boolean
    },
    goals: {
        type: [String],
        optional: true
    }
});

SprintsCollection.attachSchema(SprintsCollection.schema);
