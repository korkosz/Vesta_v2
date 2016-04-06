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
	}

	closeModal() {
		$('#newIdeaModal').modal('hide');
	}

	accept() {
		this.idea.projectId = this.idea.project._id;
	    Ideas.insert(this.idea);
	    this.closeModal();
	}

	cancel() {
	    this.closeModal();
	}

	openModal() {
		this.idea = null;
	}	

	getSelection() {
		var opis = document.getElementById('opis').textContent;
		var ranges = [];

		sel = window.getSelection();

		for(var i = 0; i < sel.rangeCount; i++) {
			var indexWhereToPutImage = sel.getRangeAt(i).startOffset;
		 	document.getElementById('opis').textContent = 
		 		opis.slice(0, indexWhereToPutImage) + " HUJ HUJ HUJ " + opis.slice(indexWhereToPutImage);	
		}
	}
}

export default angular.module("idea")
    .component('newIdea', {
        templateUrl: "imports/components/ideas/new idea/new_idea.html",
        controller: NewIdeaCtrl
    });


/*

 */