import Projects from '/imports/api/project/project';
import Tacks from '/imports/api/project/tacks';
import Modules from '/imports/api/module/module';
import Sprints from '/imports/api/sprint/sprint';

import './project.html';

export default angular.module('project', [])
    .controller('projectCtrl', projectCtrl);

function projectCtrl($scope, $routeParams, $filter, $location,
    $timeout) {
    $scope.viewModel(this);

    var vm = this;

    vm.projectName = $routeParams.name;

    vm.helpers({
        project() {
            return Projects.findOne({ name: vm.projectName });
        },
        currentSprint() {
            vm.getReactively('project');
            if (vm.project) {
                return Sprints.findOne({ project: vm.project._id });
            }

        },
        modules() {
            vm.getReactively('project');
            if (vm.project) {
                return Modules.find({
                    project: vm.project._id
                });
            }
        },
        sprints() {
            vm.getReactively('project');
            if (vm.project) {
                return Sprints.find({
                    project: vm.project._id
                });
            }
        },
        tacks() {
            vm.getReactively('project');
            if (vm.project) {
                return Tacks.find({
                    project: vm.project._id
                });
            }
        }
    });
    vm.saveColor = function() {
        Projects.update(vm.project._id, {
            $set: {
                color: vm.project.color
            }
        });
    };

    vm.nextSprintIsAlreadyPlan = function () {
        var nextSprint = vm.getNextSprint();
        return angular.isDefined(nextSprint);
    };

    vm.getNextSprint = function () {
        if (!vm.sprints || vm.sprints.length === 0) return;

        var currentSprint = vm.sprints.find((sprint) => {
            return sprint.current;
        });
        var currentSprintNumber = currentSprint.number;
        var nextSprintNumber = currentSprint.number + 1;
        var nextSprint = vm.sprints.find((sprint) => {
            return sprint.number === nextSprintNumber;
        });

        return nextSprint;
    };

    vm.startPlanning = function (valid) {
        if (!valid) return;

        Sprints.insert({
            startDate: vm.sprint.start.getTime(),
            endDate: vm.sprint.end.getTime(),
            project: vm.project._id,
            current: false,
            closed: false
        }, (err, res) => {
            if (err) window.alert(err);
            $timeout(() => {
                $location.path('/sprint/' + res)
            }, 1000);
        });
    };

    vm.getSprintStartMaxDate = function () {
        if (vm.sprint && vm.sprint.end) {
            return $filter('date')(vm.sprint.end, 'yyyy-MM-dd');
        } else {
            return $filter('date')(moment().add(1, 'y').toDate(), 'yyyy-MM-dd');
        }
    };

    vm.getSprintEndMaxDate = function () {
        return $filter('date')(moment().add(1, 'y').toDate(), 'yyyy-MM-dd');
    };

    vm.getSprintStartMinDate = function () {
        if (vm.currentSprint) {
            return $filter('date')(vm.currentSprint.endDate, 'yyyy-MM-dd');
        } else {
            return $filter('date')(new Date(), 'yyyy-MM-dd');
        }
    };

    vm.getSprintEndMinDate = function () {
        if (vm.currentSprint) {
            if (vm.sprint && vm.sprint.start) {
                return $filter('date')(vm.sprint.start, 'yyyy-MM-dd');
            } else {
                return $filter('date')(vm.currentSprint.endDate, 'yyyy-MM-dd');
            }
        } else {
            if (vm.sprint && vm.sprint.start) {
                return $filter('date')(vm.sprint.start, 'yyyy-MM-dd');
            } else {
                return $filter('date')(new Date(), 'yyyy-MM-dd');
            }
        }
    };

    /**
     * Past, Current, Next
     */
    vm.sprintStatus = function () {

    };

    vm.addModule = function () {
        Modules.insert({
            name: vm.moduleName,
            project: vm.project._id
        });
        vm.moduleName = '';
    };

    vm.addTackToProject = function () {
        Tacks.insert({
            project: vm.project._id,
            projectPrefix: vm.project.prefix,
            content: vm.newTack.content,
            important: vm.newTack.important
        });
        vm.newTack = null;
    };

    vm.removeTack = function (tackId) {
        Tacks.remove(tackId);
    };

    vm.userNotYetInProject = function () {
        if (vm.project && Meteor.user()) {
            if (!Meteor.user().profile.projects) return true;

            return !Meteor.user().profile
                .projects.some(
                (p) => p === vm.project._id);
        }
    };

    vm.assignUserToProject = function () {
        Meteor.users.update(Meteor.userId(), {
            $push: {
                'profile.projects': vm.project._id
            }
        });
    }
}
projectCtrl.$inject = ['$scope', '$routeParams', '$filter',
    '$location', '$timeout'];