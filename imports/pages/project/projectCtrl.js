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

    this.projectName = $routeParams.name;

    this.helpers({
        project() {
            return Projects.findOne({ name: this.projectName });
        },
        currentSprint() {
            this.getReactively('project');
            if (this.project) {
                return Sprints.findOne({ project: this.project._id });
            }

        },
        modules() {
            this.getReactively('project');
            if (this.project) {
                return Modules.find({
                    project: this.project._id
                });
            }
        },
        sprints() {
            this.getReactively('project');
            if (this.project) {
                return Sprints.find({
                    project: this.project._id
                });
            }
        },
        tacks() {
            this.getReactively('project');
            if (this.project) {
                return Tacks.find({
                    project: this.project._id
                });
            }
        }
    });

    this.nextSprintIsAlreadyPlan = function () {
        var nextSprint = this.getNextSprint();
        return angular.isDefined(nextSprint);
    };

    this.getNextSprint = function () {
        if (!this.sprints) return;

        var currentSprint = this.sprints.find((sprint) => {
            return sprint.current;
        });
        var currentSprintNumber = currentSprint.number;
        var nextSprintNumber = currentSprint.number + 1;
        var nextSprint = this.sprints.find((sprint) => {
            return sprint.number === nextSprintNumber;
        });

        return nextSprint;
    };

    this.startPlanning = function (valid) {
        if (!valid) return;

        Sprints.insert({
            startDate: this.sprint.start.getTime(),
            endDate: this.sprint.end.getTime(),
            project: this.project._id,
            current: false
        }, (err, res) => {
            if (err) window.alert(err);
            $timeout(() => {
                $location.path('/sprint/' + res)
            }, 1000);
        });
    };

    this.getSprintStartMaxDate = function () {
        if (this.sprint && this.sprint.end) {
            return $filter('date')(this.sprint.end, 'yyyy-MM-dd');
        } else {
            return $filter('date')(moment().add(1, 'y').toDate(), 'yyyy-MM-dd');
        }
    };

    this.getSprintEndMaxDate = function () {
        return $filter('date')(moment().add(1, 'y').toDate(), 'yyyy-MM-dd');
    };

    this.getSprintStartMinDate = function () {
        if (this.currentSprint) {
            return $filter('date')(this.currentSprint.endDate, 'yyyy-MM-dd');
        }
    };

    this.getSprintEndMinDate = function () {
        if (this.currentSprint) {
            if (this.sprint && this.sprint.start) {
                return $filter('date')(this.sprint.start, 'yyyy-MM-dd');
            } else {
                return $filter('date')(this.currentSprint.endDate, 'yyyy-MM-dd');
            }
        }
    };

    /**
     * Past, Current, Next
     */
    this.sprintStatus = function () {

    };

    this.addModule = function () {
        Modules.insert({
            name: this.moduleName,
            project: this.project._id
        });
        this.moduleName = '';
    };

    this.addTackToProject = function () {
        Tacks.insert({
            project: this.project._id,
            projectPrefix: this.project.prefix,
            content: this.newTack.content,
            important: this.newTack.important
        });
        this.newTack = null;
    };

    this.removeTack = function (tackId) {
        Tacks.remove(tackId);
    };

    this.userNotYetInProject = function () {
        if (this.project && Meteor.user()) {
            if (!Meteor.user().profile.projects) return true;

            return !Meteor.user().profile
                .projects.some(
                (p) => p === this.project._id);
        }
    };

    this.assignUserToProject = function () {
        Meteor.users.update(Meteor.userId(), {
            $push: {
                'profile.projects': this.project._id
            }
        });
    }
}
projectCtrl.$inject = ['$scope', '$routeParams', '$filter',
    '$location', '$timeout'];