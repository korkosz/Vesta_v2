import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';
import Metadata from '/imports/api/metadata/metadata';

import './idea_list.html';

class IdeaListCtrl {
	constructor($scope) {
		$scope.viewModel(this);
        var imagesDiv = $('#images');
        console.log(Metadata.find({}).fetch());
        this.helpers({
            ideas() {         	
                return Ideas.find().map(function (idea) {
                	var project = Projects.findOne({_id: idea.projectId});
                	idea.projectName = project.name;
                	return idea;
                });
            },
            imgs() { 
                return Images.find();   
            }      
        });  
	}	
}

export default angular.module("idea")
    .component('ideaList', {
        templateUrl: "imports/components/ideas/idea list/idea_list.html",
        controller: IdeaListCtrl
    });