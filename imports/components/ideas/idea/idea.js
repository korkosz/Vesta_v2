import Projects from '/imports/api/project/project';
import Ideas from '/imports/api/ideas/idea';
import Metadata from '/imports/api/metadata/metadata';

import pill from '/imports/components/lib/pill/pill';
import './idea.html';

class IdeaCtrl {
    constructor($scope, $routeParams, $sce) {
        $scope.viewModel(this);
        
        this.review = {
            merits: [],
            drawbacks: [],
            comment: ''
        };
        
        this.pile = ["1", "2", "3", "1"];
        this.$routeParams = $routeParams;
        
        this.helpers({
            idea() {
                var idea = Ideas.findOne({_id: this.$routeParams.id});
                if(idea) {
                    let project = Projects.findOne({_id: idea.projectId});
                    idea.projectName = project && project.name;
                    idea.desc = function() {
                        return $sce.trustAsHtml(idea.description);    
                    };
                    idea.reviews = [];
                }
                return idea;
            },
            ideaStatuses() {           
                  console.log(Metadata.findOne({metadataName: 'IdeaStatuses'}))
                  return Metadata.findOne({metadataName: 'IdeaStatuses'});
            }
        });
    }   
    
    addReview() {        
        var reviewTemp = {
            merits: this.review.merits.slice(),
            drawbacks: this.review.drawbacks.slice(),
            comment: this.review.comment    
        }
        this.idea.reviews.push(reviewTemp);
        
        clearArray(this.review.merits);
        clearArray(this.review.drawbacks);
        this.review.comment = '';
        
        function clearArray(arr) {
            for(var i=0, len=arr.length; i<len;i++)
                arr.pop();
            return arr;
        }
    }       
};

export default angular.module('idea')

    .component('idea', {      
        templateUrl: 'imports/components/ideas/idea/idea.html',
        controller: IdeaCtrl
    });
