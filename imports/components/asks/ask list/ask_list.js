import Asks from '/imports/api/ask/ask';
import Projects from '/imports/api/project/project';
import Modules from '/imports/api/module/module';

import './ask_list.html';

class AskListCtrl {
    constructor($scope, $location) {
        $scope.viewModel(this);

        this.moment = moment;
        this.$location = $location;
        this.helpers({
            asks() {
                ///Musi byc tutaj bo helper refreshuje sie
                ///po zmianie kolekcji
                if (angular.isUndefined(this.filter)) {
                    this.filter = { isDeleted: false };
                }
                else {
                    angular.extend(this.filter,
                        { isDeleted: false });
                }
                return Asks.find(this.filter);
            }
        });
    }

    details(number) {
        this.$location.path('/ask/' + number);
    }

    hasFilter() {
        return !$.isEmptyObject(this.filter);
    }

}
AskListCtrl.$inject = ['$scope', '$location'];

export default angular.module("ask")
    .component('askList', {
        templateUrl: "imports/components/asks/ask list/ask_list.html",
        controller: AskListCtrl,
        bindings: {
            filter: '<',
            title: '@'
        }
    });