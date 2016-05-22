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
        this.helpers({
            ideas() {
                ///Musi byc tutaj bo helper refreshuje sie
                ///po zmianie kolekcji
                this.filter = !!this.filter ? this.filter : {};
                return Ideas.find(this.filter);
            }
        });
    }

    details(number) {
        this.$location.path('/idea/' + number);
    }

    hasFilter() {
        return !$.isEmptyObject(this.filter);
    }

}
IdeaListCtrl.$inject = ['$scope', '$location'];

export default angular.module("idea")
    .component('ideaList', {
        templateUrl: "imports/components/ideas/idea list/idea_list.html",
        controller: IdeaListCtrl,
        bindings: {
            filter: '<',
            title: '@'
        }
    });