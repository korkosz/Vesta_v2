import { Mongo } from 'meteor/mongo';

var ListsSchema = new Mongo.Collection('Metadata.Lists');

const fieldSchema = new SimpleSchema({
    field: {
        type: String
    },
    value: {
        type: Number,
        allowedValues: [-1, 1]
    }        
});

ListsSchema.schema = new SimpleSchema({
    user: {
        type: String
    },
    entities: {
        type: [String]
    },
    columns: {
        type: [String]
    },
    filters: {
        type: Object,
        optional: true,
        blackbox: true
    },
    sort: {
        type: [[String]],
        optional: true
    }
    // sort: {
    //     type: [fieldSchema],
    //     optional: true
    // }
});

ListsSchema.attachSchema(ListsSchema.schema);

export default ListsSchema;