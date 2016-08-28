import Projects from '/imports/api/project/project';

import './project_new.html';

export default angular.module('project')
    .controller('ProjectNewCtrl', ProjectNewCtrl);

function ProjectNewCtrl($scope) {
    $scope.viewModel(this);

    var vm = this;

    vm.helpers({
        users() {
            return Meteor.users.find();
        }
    });

    var selectedUsers = [];

    vm.selectUser = function (_userId) {
        var idx = selectedUsers.indexOf(_userId);

        if (idx === -1)
            selectedUsers.push(_userId);
        else
            selectedUsers.splice(idx, 1);
    };

    vm.addNewProject = function () {
        Meteor.call('project.newProject', vm.project, selectedUsers,
            (err, res) => {
                if (err) {
                    alert(err);
                    return;
                }
                window.location.href = '#/project/' + vm.project.name;
            });
    }
}
ProjectNewCtrl.$inject = ['$scope'];