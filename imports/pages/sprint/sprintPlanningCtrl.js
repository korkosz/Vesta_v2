import Sprints from '/imports/api/sprint/sprint';

angular.module('simple-todos')
    .controller('SprintPlanningCtrl', SprintPlanningCtrl);

function SprintPlanningCtrl($scope, $routeParams) {
    $scope.viewModel(this);

    var vm = this;
    var sprintId = $routeParams.id;
    var activeStageIndex = 0;

    const stages = {
        GOALS: 0,
        IDEAS_ASKS: 1,
        TASKS: 2,
        ASSIGNMENT: 3
    };

    vm.stageSectionsVisibility = {
        GOALS: true,
        IDEAS_ASKS: true,
        TASKS: true,
        ASSIGNMENT: true
    };

    vm.helpers({
        sprint() {
            return Sprints.findOne(sprintId);
        }
    });

    vm.isStageActive = function (stage) {
        return stages[stage] <= activeStageIndex;
    };

    vm.activateNextStage = function () {
        activeStageIndex += 1;
    }

    vm.getStageDesc = function (stage) {
        switch (stage) {
            case 'GOALS':
                return 'Establish general goals';
            case 'IDEAS_ASKS':
                return `Create Ideas and Sub-Ideas if there is not
                        100% agreeement - discuss it !`;
            case 'TASKS':
                return `Create Tasks - don't assign 
                        them immediatetly. It's better to have whole view !`;
            case 'ASSIGNMENT':
                return `Assign Tasks and ask people to estimate 
                        theirs work`;
        }
    }
}
SprintPlanningCtrl.$inject = ['$scope', '$routeParams'];