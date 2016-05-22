import { Mongo } from 'meteor/mongo';

class AsksClass extends Mongo.Collection {
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

export default AsksCollection = new AsksClass('Asks');

AsksCollection.schema = new SimpleSchema({
    number: {
        type: String
    },
    title: {
        type: String,
        max: 100
    },
    description: {
        type: String
    },
    statements: {
        type: [String]
    },
    module: {
        type: String
    },
    project: {
        type: String
    },
    creationDate: {
        type: Date
    },
    createdBy: {
        type: String,
        defaultValue: this.userId
    }
});