import { Meteor } from 'meteor/meteor';
import IdeasCollection from '/imports/api/ideas/idea';
import ProjectsCollection from '/imports/api/project/project';

Meteor.startup(() => {
	ProjectsCollection.remove({});
	ProjectsCollection.insert({
		name: 'Vesta',
		modules: [
			'Ideas',
			'Projects',
			'Issues'
		]	
	})	
});
