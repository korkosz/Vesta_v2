import {Meteor} from 'meteor/meteor';
import IdeasCollection from '/imports/api/ideas/idea';
import ProjectsCollection from '/imports/api/project/project';
import TaskCollection from '/imports/api/task/task';
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
    if (length < 0) {
        ProjectsCollection.insert({
            name: 'Vesta'
            , modules: [
			'Ideas'
			, 'Projects'
			, 'Issues'
		]
        });

        var id1 = ProjectsCollection.insert({
            name: 'ProjectTest1'
            , modules: [
			'ProjectTest1_module1'
			, 'ProjectTest1_module2'
			, 'ProjectTest1_module3'
		]
        });

        var id2 = ProjectsCollection.insert({
            name: 'ProjectTest2'
            , modules: [
			'ProjectTest2_module1'
			, 'ProjectTest2_module2'
			, 'ProjectTest2_module3'
		]
        });

        var id3 = ProjectsCollection.insert({
            name: 'ProjectTest3'
            , modules: [
			'ProjectTest3_module1'
			, 'ProjectTest3_module2'
			, 'ProjectTest3_module3'
		]
        });
    }

});