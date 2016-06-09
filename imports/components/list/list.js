import Ideas from '/imports/api/ideas/idea';
import Tasks from '/imports/api/task/task';

import ListsSchemas from '/imports/api/metadata/listMetadata';

import './list.html';

class VestaListCtrl {
    constructor($scope, $location) {
        $scope.viewModel(this);
        
        this.sortArr = [];
        this.sortArrChanged = false;
        this.$location = $location;
        
        this.helpers({
            list() {
                this.getReactively('listId');
                if (this.listId) {
                    return ListsSchemas.findOne(this.listId);
                }
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
            },
            tasks() {
                this.getReactively('list');
                this.getReactively('sortArrChanged');

                if (!this.list || this.list.length === 0) return;

                if (this.list.sort && !this.tasks) {
                    let me = this;
                    this.list.sort.forEach((_sort) => {
                        me.sortArr.push(_sort);
                    });
                }
                if (this.list.entities.indexOf('Task') !== -1) {
                    return Tasks.find({}, { sort: this.sortArr });
                } else {
                    return [];
                }
            }
        });
    }

    getCursorStyle() {
        if (!this.list || 
            this.list.entities.length > 1) return 'auto';           
        else return 'pointer';   
    }
    
    details(number) {
        if (!this.list || this.list.entities.length > 1) return;      
       
        this.$location.path('/'+ this.list.entities[0].toLowerCase() + '/' + number);
    }
    
    getValue(field, value) {
        if (!this.list) return;

        const entity = this.list.entities[0];
        var EntityCollection = null;
        switch (entity) {
            case 'Idea':
                EntityCollection = Ideas;
                break;
            case 'Task':
                EntityCollection = Tasks;
                break;
            case 'Ask':
                EntityCollection = Ideas;
                break;
        }
        
        if(!EntityCollection.schemaMetadata) return value;
        
        var metadata = EntityCollection.schemaMetadata[field];
        if (metadata) {
            return metadata.transform(value);
        } else {
            return value;
        }
    }

    getLabel(field) {
        if (!this.list) return;

        const entity = this.list.entities[0];

        switch (entity) {
            case 'Idea':
                return Ideas.schema.label(field);
            case 'Task':
                return Tasks.schema.label(field);
            case 'Ask':
                return Ideas.schema.label(field);
        }
    }

    sort(field) {
        var me = this;
        var _sortArray = getSortValue(field);

        //filter was off -> asc
        if (angular.isUndefined(_sortArray)) {
            this.sortArr.push([field, 'asc']);
            this.sortArrChanged = !this.sortArrChanged;
            return;
        }
        //filter was asc -> desc
        if (_sortArray[1] === 'asc') {
            _sortArray[1] = 'desc';
            this.sortArrChanged = !this.sortArrChanged;
            return;
        }

        //filter was desc -> off
        if (_sortArray[1] === 'desc') {
            var idx = me.sortArr.findIndex((_arr) => {
                return _arr[0] === field;
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

VestaListCtrl.$inject = ['$scope', '$location'];

export default angular.module("idea")
    .directive('vestaList', [function () {
        return {
            templateUrl: "imports/components/list/list.html",
            controller: VestaListCtrl,
            controllerAs: 'vm',
            scope: {
                listId: '@'
            },
            bindToController: true,
            link
        }

        function link(scope, el, attrs, ctrl) {
        }
    }]);
