import {Meteor} from 'meteor/meteor';
import IdeasCollection from '/imports/api/ideas/idea';
import ProjectsCollection from '/imports/api/project/project';
import TaskCollection from '/imports/api/task/task';
import TaskCommentsCollection from '/imports/api/task/comment';
import ReviewsCollection from '/imports/api/ideas/review';
import AsksCollection from '/imports/api/ask/ask';
import Metadata from '/imports/api/metadata/metadata';
import ModulesCollection from '/imports/api/module/module';

Images.allow({
    'insert': function () {
        // add custom authentication code here
        return true;
    }
});

Meteor.publish(null, function () {
    return Meteor.users.find();
});

Meteor.startup(() => {
    //	ProjectsCollection.remove({});
    var vesta = ProjectsCollection.findOne();
    const modulesLen = ModulesCollection.find().count();
    if (modulesLen === 0) {
        ModulesCollection.insert({
            name: 'Ideas',
            project: vesta._id
        });

        ModulesCollection.insert({
            name: 'Projects',
            project: vesta._id
        });

        ModulesCollection.insert({
            name: 'Tasks',
            project: vesta._id
        });

        ModulesCollection.insert({
            name: 'Global',
            project: vesta._id
        });
    }

    const length = ProjectsCollection.find().count();
    if (length === 0) {
        ProjectsCollection.insert({
            name: 'Vesta',
            modules: [
                'Ideas',
                'Projects',
                'Issues'
            ]
        });
    }
    Metadata.remove({});
    const lenghtMetadata = Metadata.find().count();
    if (lenghtMetadata === 0) {
        Metadata.insert(
            {
                "_id": "CBJNeBr7WrnA8FmqH",
                "metadataName": "IdeaStatuses",
                "value": [
                    "New",
                    "Considered",
                    "Resolved",
                    "Rejected"
                ]
            }
        );

        Metadata.insert(
            {
                "_id": "bnEAGD2Rdu8wnRDTN",
                "metadataName": "TaskPriority",
                "value": [
                    "Low",
                    "Normal",
                    "High",
                    'Critical'
                ]
            }
        );

        Metadata.insert(
            {
                "_id": "5vdA3vyJ2qCTMabwL",
                "metadataName": "TaskType",
                "value": [
                    "Bug",
                    "Feature"
                ]
            }
        );

        Metadata.insert(
            {
                "_id": "orb7v9aZq7r3T2snk",
                "metadataName": "TaskStatuses",
                "value": [
                    "Open",
                    "Closed",
                    "Working",
                    "Rejected",
                    "Ready for testing"
                ]
            }
        );
    }
});