import Ideas from '/imports/api/ideas/idea';
import ListsSchemas from '/imports/api/metadata/listMetadata';

import './list.html';

class VestaListCtrl {
    constructor($scope) {
        $scope.viewModel(this);

        this.helpers({
            list() {
                return ListsSchemas.findOne();
            },
            ideas() {
                this.getReactively('list');
                if (!this.list || this.list.length === 0) return;

                if (this.list.entities.indexOf('Idea') !== -1) {
                    return Ideas.find()
                } else {
                    return [];
                }
            }
        });
    }

    getLabel(field) {
        console.log(Ideas.schema.label(field));
        return Ideas.schema.label(field);
    }
}

VestaListCtrl.$inject = ['$scope'];

export default angular.module("idea")
    .directive('vestaList', [function () {
        return {
            templateUrl: "imports/components/list/list.html",
            controller: VestaListCtrl,
            controllerAs: 'vm',
            link
        }

        function link(scope, el, attrs, ctrl) {
        }
    }]);
