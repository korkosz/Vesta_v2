import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';
import Metadata from '/imports/api/metadata/metadata';
import Modules from '/imports/api/module/module';

import './idea_list.html';

class IdeaListCtrl {
    constructor($scope, $location) {
        $scope.viewModel(this);

        this.moment = moment;
        this.$location = $location;
        var imagesDiv = $('#images');
        console.log(Metadata.find({}).fetch());
        this.helpers({
            ideas() {
                return Ideas.find();
            }
        });
    }

    details(number) {
        this.$location.path('/idea/' + number);
    }
}
IdeaListCtrl.$inject = ['$scope', '$location'];
export default angular.module("idea")
    .component('ideaList', {
        templateUrl: "imports/components/ideas/idea list/idea_list.html",
        controller: IdeaListCtrl
    });