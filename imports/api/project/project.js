import { Mongo } from 'meteor/mongo';
import Ideas from '/imports/api/ideas/idea';
import Modules from '/imports/api/module/module';

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
    },
    sprint: {
        type: Number
    }
});

Projects.helpers({
    getModules() {
        return Modules.find({ project: this._id });
    }
});

Projects.attachSchema(Projects.schema);
