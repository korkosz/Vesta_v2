import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';

import './idea_list.html';

class IdeaListCtrl {
	constructor($scope) {
		$scope.viewModel(this);
        var imagesDiv = $('#images');

        this.helpers({
            ideas() {         	
                return Ideas.find().map(function (idea) {
                	var project = Projects.findOne({_id: idea.projectId});
                	idea.projectName = project.name;
                	return idea;
                });
            },
            imgs() {                
                return Images.find().fetch();
                

                // for (let i = imgs.length; i--;) {
                //     let file = imgs[i];
                //     let reader = new FileReader();
                //     let img = document.createElement('img');

                //     reader.readAsDataURL(file);
                //     reader.onload = function(e) {
                //         img.src = e.target.result;
        
                //     };
                // }
            }      
        });  
	}	
}

export default angular.module("idea")
    .component('ideaList', {
        templateUrl: "imports/components/ideas/idea list/idea_list.html",
        controller: IdeaListCtrl
    });