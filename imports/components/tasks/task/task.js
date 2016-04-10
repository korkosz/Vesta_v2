import Projects from '/imports/api/project/project';
import Tasks from '/imports/api/task/task';
import Metadata from '/imports/api/metadata/metadata';

import pill from '/imports/components/lib/pill/pill';
import './task.html';

class IdeaCtrl {
    constructor($scope, $routeParams, $sce) {
        $scope.viewModel(this);
        
    
        this.$routeParams = $routeParams;
        this.helpers({
            task() {
                var task = Tasks.findOne({_id: this.$routeParams.id});
                if(task) {
                    let project = Projects.findOne({_id: task.projectId});
                    task.projectName = project && project.name;
                    task.desc = function() {
                        return $sce.trustAsHtml(task.description);    
                    };
                }
                return task;
            },
            taskStatuses() {           
                  console.log(Metadata.findOne({metadataName: 'TaskStatuses'}))
                  return Metadata.findOne({metadataName: 'TaskStatuses'});
            }
        });
    }
};

export default angular.module('task')

    .component('task', {      
        templateUrl: 'imports/components/tasks/task/task.html',
        controller: IdeaCtrl
    });
