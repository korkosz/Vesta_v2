import { Meteor } from 'meteor/meteor';
import IdeasCollection from '/imports/api/ideas/idea';
import ProjectsCollection from '/imports/api/project/project';

Meteor.startup(() => {
	ProjectsCollection.remove({});
	IdeasCollection.remove({});

	ProjectsCollection.insert({
		name: 'Vesta',
		modules: [
			'Ideas',
			'Projects',
			'Issues'
		]	
	});

	var id1 = ProjectsCollection.insert({
		name: 'ProjectTest1',
		modules: [
			'ProjectTest1_module1',
			'ProjectTest1_module2',
			'ProjectTest1_module3'
		]	
	});

	var id2 = ProjectsCollection.insert({
		name: 'ProjectTest2',
		modules: [
			'ProjectTest2_module1',
			'ProjectTest2_module2',
			'ProjectTest2_module3'
		]	
	});

	var id3 = ProjectsCollection.insert({
		name: 'ProjectTest3',
		modules: [
			'ProjectTest3_module1',
			'ProjectTest3_module2',
			'ProjectTest3_module3'
		]	
	});	

	IdeasCollection.insert({
		title: 'idea1_Title',
		description: 'idea1_Description',
		projectId: id1
	});

	IdeasCollection.insert({
		title: 'idea2_Title',
		description: 'idea2_Description',
		projectId: id1
	});

	IdeasCollection.insert({
		title: 'idea3_Title',
		description: 'idea3_Description',
		projectId: id1
	});

	IdeasCollection.insert({
		title: 'idea4_Title',
		description: 'idea4_Description',
		projectId: id1
	});

	IdeasCollection.insert({
		title: 'idea5_Title',
		description: 'idea5_Description',
		projectId: id2
	});

	IdeasCollection.insert({
		title: 'idea6_Title',
		description: 'idea6_Description',
		projectId: id2
	});

	IdeasCollection.insert({
		title: 'idea7_Title',
		description: 'idea7_Description',
		projectId: id3
	});
});
