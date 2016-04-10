import Projects from '/imports/api/project/project';
import Ideas from '/imports/api/ideas/idea';
import Metadata from '/imports/api/metadata/metadata';

import pill from '/imports/components/lib/pill/pill';
import './idea.html';
import './idea.scss';

class IdeaCtrl {
    constructor($scope, $routeParams, $sce) {
        $scope.viewModel(this);
        
    
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
                }
                return idea;
            },
            ideaStatuses() {           
                  console.log(Metadata.findOne({metadataName: 'IdeaStatuses'}))
                  return Metadata.findOne({metadataName: 'IdeaStatuses'});
            }
        });
    }
};

export default angular.module('idea')

    .component('idea', {      
        templateUrl: 'imports/components/ideas/idea/idea.html',
        controller: IdeaCtrl
    });
