import { Mongo } from 'meteor/mongo';

export default Bookmarks = new Mongo.Collection('Bookmarks');

Bookmarks.schema = new SimpleSchema({
    user: {
        type: String
    },
    title: {
        type: String
    },
    lists: {
        type: [String]
    }
});

Bookmarks.attachSchema(Bookmarks.schema);