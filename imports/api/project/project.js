import { Mongo } from 'meteor/mongo';
import Ideas from '/imports/api/ideas/idea';
import Modules from '/imports/api/module/module';
import Sprints from '/imports/api/sprint/sprint';

import './methods.js';

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
    prefix: {
        type: String
    },
    color: {
        type: String
    },
    currentSprint: {
        type: String,
        optional: true
    }
});

Projects.helpers({
    getModules() {
        return Modules.find({ project: this._id });
    },
    currentSprintNb() {
        var sprint = Sprints.findOne({ project: this._id });
        return sprint && sprint.number;
    },
    getCurrentSprint() {
        return Sprints.findOne(this.currentSprint);
    },
    getNearestSprint() {
        return Sprints.findOne({
            project: this._id,
            endDate: {
                $gt: (new Date()).getTime()
            }
        }, {
                sort: {
                    endDate: 1
                }
            });
    }
});

Projects.attachSchema(Projects.schema);
