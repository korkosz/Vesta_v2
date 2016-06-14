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
            currentSprint: 4,
            sprints: [1, 2, 3, 4, 5, 6]
        });
    }
    ProjectsCollection.update({ "name": "Vesta" }, {
        $set: {
            currentSprint: 4,
            sprints: [1, 2, 3, 4, 5, 6]
        }
    })
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

        var arr = [ideaId, Projects, Tasks, Global];
        ProjectsCollection.update(vesta._id, { $set: { modules: arr } })
    }

    Metadata.remove({});
    const lenghtMetadata = Metadata.find().count();
    if (lenghtMetadata === 0) {
        Metadata.insert(
            {
                "_id": "CBJNeBr7WrnA8FmqH",
                "metadataName": "IdeaStatuses",
                "value": [
                    "Open",
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

        Metadata.insert(
            {
                "_id": "TEZLTpEeKwqydXnFW",
                "metadataName": "EntitiesRelations",
                "value": {
                    task_task: [
                        'Relative To',
                        'Clone Of',
                        'Solution In'
                    ]
                }
            }
        );
    }

    ListsSchemas.remove({});
    ListsSchemas.insert({
        _id: 'Ju5XP4domR7ueqJep',
        user: 'cGQZ526BT6BTefZ7a',
        entities: ['Idea'],
        columns: ['title', 'number',
            'status', 'creationDate',
            'createdBy', 'updatedAt', 'sprint'],
        filters: {
            isDeleted: false
        }
    });

    Bookmarks.remove({});
    Bookmarks.insert({
        user: 'cGQZ526BT6BTefZ7a',
        title: 'Ideas',
        lists: ['Ju5XP4domR7ueqJep']
    });

    var listttIds = ListsSchemas.insert({
        user: 'cGQZ526BT6BTefZ7a',
        entities: ['Task'],
        columns: ['number', 'title',
            'type', 'status', 'priority', 'assigned',
            'createdBy', 'updatedAt', 'creationDate', 'sprint'],
        filters: {
            isDeleted: false
        }
    });

    Bookmarks.insert({
        user: 'cGQZ526BT6BTefZ7a',
        title: 'Tasks',
        lists: [listttIds]
    });

    var list1 = ListsSchemas.insert({
        user: 'cGQZ526BT6BTefZ7a',
        entities: ['Idea'],
        columns: ['title', 'number',
            'status', 'creationDate',
            'createdBy', 'updatedAt',],
        filters: {
            sprint: vesta.currentSprint + 1,
            isDeleted: false
        }
    });

    var list2 = ListsSchemas.insert({
        user: 'cGQZ526BT6BTefZ7a',
        entities: ['Task'],
        columns: ['number', 'title',
            'type', 'status', 'priority', 'assigned',
            'createdBy', 'updatedAt', 'creationDate'],
        filters: {
            sprint: vesta.currentSprint + 1,
            isDeleted: false
        }
    });

    Bookmarks.insert({
        user: 'cGQZ526BT6BTefZ7a',
        title: 'Next Sprint',
        lists: [list1, list2]
    });
});