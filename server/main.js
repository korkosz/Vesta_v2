import {Meteor} from 'meteor/meteor';
import IdeasCollection from '/imports/api/ideas/idea';
import ProjectsCollection from '/imports/api/project/project';
import TaskCollection from '/imports/api/task/task';
import ReviewsCollection from '/imports/api/ideas/review';
import Metadata from '/imports/api/metadata/metadata';

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
                    "High"
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