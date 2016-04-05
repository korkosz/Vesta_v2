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

        $('#dropzone').on('dragover', function (event) {
			event.preventDefault();
			event.stopPropagation();
		});

		$('#dropzone').on('dragenter', function (event) {
			event.preventDefault();
			event.stopPropagation();
		});

		$('#dropzone').on('drop', function (e) {
			e.preventDefault();
			e.stopPropagation();

			var opis = document.getElementById('opis');
			var opisText = opis.textContent;		
			var ranges = [];

			sel = window.getSelection();

			let preview = $('#preview');
		    if (e.originalEvent.dataTransfer) {
		        if (e.originalEvent.dataTransfer.files.length > 0) {
		        	let files = e.originalEvent.dataTransfer.files;

		        	for (var i = files.length - 1; i >= 0; i--) {
		        		let file = files[i];		        		            		            
					    
					    var reader = new FileReader();
					    reader.onload = function(e) {
					    	var image = '<img src=' + e.target.result + '/>';
						    for(var i = 0; i < sel.rangeCount; i++) {
								var indexWhereToPutImage = sel.getRangeAt(i).startOffset;								
							 	opis.innerHTML = 
							 		opisText.slice(0, indexWhereToPutImage) + 
							 			image + opisText.slice(indexWhereToPutImage);	
							}
					    }; 
					    				    
					    reader.readAsDataURL(file);
				    }
		        }
		    }
		    return false;
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