import Sprints from '/imports/api/sprint/sprint';
import Ideas from '/imports/api/ideas/idea';
import Asks from '/imports/api/ask/ask';
import Tasks from '/imports/api/task/task';

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

    /**
     * String[] - holds ids of all child Ideas  
     */
    //vm.ideasChildrensIds = [];

    vm.activeIdea = null;

    vm.helpers({
        sprint() {
            return Sprints.findOne(sprintId);
        },
        /**
         * Ideas from this Sprint
         */
        ideas() {
            vm.getReactively('sprint');
            if (vm.sprint)
                return Ideas.find({ sprint: vm.sprint._id })
        },
        /**
         * Asks from this Sprint
         */
        asks() {
            vm.getReactively('sprint');
            if (vm.sprint)
                return Asks.find({ sprint: vm.sprint._id }).map((ask) => {
                    if (ask &&
                        ask.related) {
                        let parentIdea = ask.related.find((rel) => {
                            return rel.relation === 'Based On' &&
                                rel.entity === 'Idea';
                        });

                        if (parentIdea)
                            ask.parentIdea = parentIdea.id;
                    }
                    return ask;
                });
        },
        tasks() {
            vm.getReactively('sprint');
            if (vm.sprint)
                return Tasks.find({ sprint: vm.sprint._id }).map((task) => {
                    if (task &&
                        task.related) {
                        let parentIdea = task.related.find((rel) => {
                            return rel.relation === 'Based On' &&
                                rel.entity === 'Idea';
                        });

                        if (parentIdea)
                            task.parentIdea = parentIdea.id;
                    }
                    return task;
                });
        },
        /**
         * 1) Find not closed, not working, deferred Ideas
         * 2) Check each one if it has related sub-ideas
         * 3) If so, collect sub-idea's ID
         */
        deferredIdeas() {
            vm.getReactively('sprint');
            if (vm.sprint) {
                var filter = {
                    status: {
                        $in: [
                            1,/*new*/
                            6,/*consider*/
                            8 /*discussed*/
                        ]
                    },
                    sprint: {
                        $exists: false
                    },
                    project: vm.sprint.project
                };
                return Ideas.find(filter);
            }
        }
    });

    // vm.filterIsParent = function(value, idx, arr) {
    //     return !value.parent;
    // };
    vm.goToDetails = function (id) {
        window.location.href = '#/' + id;
    };

    vm.notRelatedAsk = function (ask) {
        return ask && !ask.parentIdea;
    };

    vm.activateIdea = function (idea) {
        vm.activeIdea = idea;
    };

    vm.removeFromThisSprint = function (ideaId) {
        Ideas.update(ideaId, {
            $unset: { sprint: '' }
        });
    };

    vm.addToThisSprint = function (ideaId) {
        Meteor.call('ideas.setSprint', ideaId,
            vm.sprint._id, (err, res) => {
                if (err) window.alert(err)
                else {
                    vm.closeModal();
                }
            });
    };

    vm.addGoal = function () {
        if (!vm.newGoal) return;

        Sprints.update(vm.sprint._id, {
            $push: {
                goals: vm.newGoal
            }
        }, (err, res) => {
            if (err) window.alert(err);
        });
        vm.newGoal = null;
    };

    vm.removeGoal = function (goal) {
        Sprints.update(vm.sprint._id, {
            $pull: {
                goals: goal
            }
        }, (err, res) => {
            if (err) window.alert(err);
        });
    };

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