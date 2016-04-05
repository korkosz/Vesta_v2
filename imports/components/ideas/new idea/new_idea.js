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
}

export default angular.module("idea")
    .component('newIdea', {
        templateUrl: "imports/components/ideas/new idea/new_idea.html",
        controller: NewIdeaCtrl
    });


/*
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

			let preview = $('#preview');
		    if (e.originalEvent.dataTransfer) {
		        if (e.originalEvent.dataTransfer.files.length > 0) {
		        	let files = e.originalEvent.dataTransfer.files;

		        	for (var i = files.length - 1; i >= 0; i--) {
		        		let file = files[i]
		        	
			            let canvas = document.createElement("canvas");
			            canvas.width = 200;
			            canvas.height = 200;			            		            

					    preview.append(canvas); // Assuming that "preview" is the div output where the content will be displayed.
					    
					    var reader = new FileReader();
					    reader.onload = function(e) {
				    		let img = new Image();
				     		img.src = e.target.result;
				     		canvas.getContext("2d").drawImage(img, 50, 50);
					    }; 
					    				    
					    reader.readAsDataURL(file);
				    }
		        }
		    }
		    return false;
		});
 */