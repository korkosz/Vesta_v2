import Ideas from '/imports/api/ideas/idea';
import ListsSchemas from '/imports/api/metadata/listMetadata';

import './list.html';

class VestaListCtrl {
    constructor($scope) {
        $scope.viewModel(this);
        this.sortArr = [];
        this.sortArrChanged = false;

        this.helpers({
            list() {
                return ListsSchemas.findOne();
            },
            ideas() {
                this.getReactively('list');
                this.getReactively('sortArrChanged');

                if (!this.list || this.list.length === 0) return;

                if (this.list.sort && !this.ideas) {
                    let me = this;
                    this.list.sort.forEach((_sort) => {
                        me.sortArr.push(_sort);
                    });
                }
                if (this.list.entities.indexOf('Idea') !== -1) {
                    return Ideas.find({}, { sort: this.sortArr });
                } else {
                    return [];
                }
            }
        });
    }

    getLabel(field) {
        return Ideas.schema.label(field);
    }

    sort(field) {
        var me = this;
        var _sortArray = getSortValue(field);

        //filter was off -> asc
        if (angular.isUndefined(_sortArray)) {
            this.sortArr.push([field, 'asc'])
            this.sortArrChanged = !this.sortArrChanged;
            return;
        }
        //filter was asc -> desc
        if (getSortValue(field) === 'asc') {
            _sortArray[1] = 'desc';
            this.sortArrChanged = !this.sortArrChanged;
            return;
        }

        //filter was desc -> off
        if (getSortValue(field) === 'desc') {
            var idx = me.sortArr.findIndex(() => {
                return _sortArr[0] === field;
            });
            me.sortArr.splice(idx, 1);
            this.sortArrChanged = !this.sortArrChanged;
            return;
        }

        function getSortValue(field) {
            return me.sortArr.find((_sortArr) => {
                return _sortArr[0] === field;
            });
        }
    }

    //@returns: 1, -1, 0 - asc, desc, no filter     
    fieldSorted(field) {
        var sort = this.sortArr.find((_sortArr) => {
            return _sortArr[0] === field;
        });
        if (angular.isUndefined(sort)) return 0;
        return sort[1];
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
