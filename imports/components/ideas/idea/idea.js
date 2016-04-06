import Projects from '/imports/api/project/project';
import Ideas from '/imports/api/ideas/idea';
import Metadata from '/imports/api/metadata/metadata';

import template from './idea.html';

class IdeaCtrl {
    constructor($scope) {
        $scope.viewModel(this);

        this.helpers({
            idea() {
                var idea = Ideas.findOne();
                if(idea) {
                    let project = Projects.findOne({_id: idea.projectId});
                    idea.projectName = project && project.name;
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
