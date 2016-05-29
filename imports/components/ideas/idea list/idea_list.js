import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';
import Metadata from '/imports/api/metadata/metadata';
import Modules from '/imports/api/module/module';

import './idea_list.html';

class IdeaListCtrl {
    constructor($scope, $location) {
        $scope.viewModel(this);
        
        var oldDate = new Date('2000');
        this.moment = moment;
        this.$location = $location;
        this.helpers({
            ideas() {
                ///Musi byc tutaj bo helper refreshuje sie
                ///po zmianie kolekcji
                if (angular.isUndefined(this.filter)) {
                    this.filter = { isDeleted: false };
                }
                else {
                    angular.extend(this.filter,
                        { isDeleted: false });
                }
                return Ideas.find(this.filter).map((idea)=> {
                    idea.isNew = moment().diff(idea.creationDate, 'days') === 0;
                    if(!moment.isDate(idea.updatedAt)) idea.updatedAt = oldDate;
                    return idea;   
                });
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