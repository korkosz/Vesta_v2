import Projects from '/imports/api/project/project';
import Tacks from '/imports/api/project/tacks';
import Modules from '/imports/api/module/module';

import './project.html';

export default angular.module('project', [])
    .controller('projectCtrl', projectCtrl);

function projectCtrl($scope, $routeParams) {
    $scope.viewModel(this);

    this.projectName = $routeParams.name;

    this.helpers({
        project() {
            return Projects.findOne({ name: this.projectName });
        },
        modules() {
            this.getReactively('project');
            if (this.project) {
                return Modules.find({
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
projectCtrl.$inject = ['$scope', '$routeParams'];