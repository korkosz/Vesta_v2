import Projects from '/imports/api/project/project';

import './projectList.html';

export default angular.module('project')
    .controller('ProjectListCtrl', ProjectListCtrl);

function ProjectListCtrl($scope) {
    $scope.viewModel(this);

    var vm = this;

    vm.helpers({
        projects() {
            return Projects.find({});
        }
    });
}
ProjectListCtrl.$inject = ['$scope'];