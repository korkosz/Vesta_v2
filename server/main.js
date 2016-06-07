import {Meteor} from 'meteor/meteor';
import IdeasCollection from '/imports/api/ideas/idea';
import ProjectsCollection from '/imports/api/project/project';
import TaskCollection from '/imports/api/task/task';
import TaskCommentsCollection from '/imports/api/task/comment';
import ReviewsCollection from '/imports/api/ideas/review';
import AsksCollection from '/imports/api/ask/ask';
import ResponsesCollection from '/imports/api/ask/response';
import Metadata from '/imports/api/metadata/metadata';
import ModulesCollection from '/imports/api/module/module';
import Notify from '/imports/api/notification/notification';
import ListsSchemas from '/imports/api/metadata/listMetadata';
import Bookmarks from '/imports/api/metadata/bookmark';

Meteor.publish(null, function () {
    return Meteor.users.find();
});

Meteor.startup(() => {
    //	ProjectsCollection.remove({});
    var vesta = ProjectsCollection.findOne();
    if (typeof vesta === 'undefined') {
        ProjectsCollection.insert({
            name: 'Vesta',
            prefix: 'V',
            sprint: 3
        });
    }
    const modulesLen = ModulesCollection.find().count();

    if (modulesLen === 0) {
        var ideaId = ModulesCollection.insert({
            name: 'Ideas',
            project: vesta._id
        });

        var Projects = ModulesCollection.insert({
            name: 'Projects',
            project: vesta._id
        });

       var Tasks = ModulesCollection.insert({
            name: 'Tasks',
            project: vesta._id
        });

        var Global = ModulesCollection.insert({
            name: 'Global',
            project: vesta._id
        });
        
        var arr = [ideaId,Projects,Tasks,Global];
        ProjectsCollection.update(vesta._id, {$set:{modules: arr}})
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
                    "Consider",
                    "Working",
                    "Deferred",
                    "Rejected",
                    "Closed",
                    "Implemented",
                    "Discussed"
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
    
    ListsSchemas.remove({});
    ListsSchemas.insert({
       user: 'cGQZ526BT6BTefZ7a',
       entities: ['Idea'],
       columns: ['title']
    });
});