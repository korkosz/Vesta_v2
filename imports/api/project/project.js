import { Mongo } from 'meteor/mongo';
import Ideas from '/imports/api/ideas/idea';

class Projects extends Mongo.Collection {
    getAllIdeas() {
    	return Ideas.find();
    }
}

export default Projects = new Mongo.Collection('Projects');

Projects.schema = new SimpleSchema({
    name: {
        type: String
    },
    modules: {
        type: [String]
    }
});

Projects.attachSchema(Projects.schema);
