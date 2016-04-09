import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';

import './new_idea.html';

class NewIdeaCtrl {
	constructor($scope) {
		$scope.viewModel(this);

        this.helpers({
            projects() {
                return Projects.find();
            }      
        });
        
        this.output = {};
        this.output.html = 'as';
        
       /*$scope.$watch(() => {
            return this.output.html;
        }, function(newVal) {
              alert(newVal);        
        });*/
        
	}

	closeModal() {
		$('#newIdeaModal').modal('hide');
	}

	accept() {
		this.idea.projectId = this.idea.project._id;
        this.idea.description = this.output.html;
	    Ideas.insert(this.idea);
	    this.closeModal();
	}

	cancel() {
	    this.closeModal();
	}

	openModal() {
		this.idea = null;
	}	
}

export default angular.module("idea")
    .component('newIdea', {
        templateUrl: "imports/components/ideas/new idea/new_idea.html",
        controller: NewIdeaCtrl
    });


/*

 */