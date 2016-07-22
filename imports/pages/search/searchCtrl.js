import Ideas from '/imports/api/ideas/idea';
import Tasks from '/imports/api/task/task';
import Asks from '/imports/api/ask/ask';

angular.module('simple-todos')
    .controller('searchCtrl', searchCtrl);

function searchCtrl($scope) {
    $scope.viewModel(this);

    this.sortArr = [];

    this.selected = {
        entities: [],
        columns: []
    };

    this.model = {
        entities: {},
        columns: {}
    };

    this.searchResult = {
        ideas: [],
        asks: [],
        tasks: []
    };

    //@returns: 1, -1, 0 - asc, desc, no filter   
    this.fieldSorted = function (field) {
        var sort = this.sortArr.find((sortItem) => {
            return sortItem.field === field;
        });
        if (angular.isUndefined(sort)) return 0;
        return sort.value;
    };

    this.sort = function (field) {
        var me = this;
        var sortItem = getSortValue(field);

        //filter was off -> asc
        if (angular.isUndefined(sortItem)) {
            this.sortArr.push({ field: field, value: 'asc' });
            return;
        }
        //filter was asc -> desc
        if (sortItem.value === 'asc') {
            sortItem.value = 'desc';
            return;
        }

        //filter was desc -> off
        if (sortItem.value === 'desc') {
            var idx = me.sortArr.findIndex((_sortItem) => {
                return _sortItem.field === field;
            });
            me.sortArr.splice(idx, 1);
            return;
        }

        function getSortValue(field) {
            return me.sortArr.find((sortItem) => {
                return sortItem.field === field;
            });
        }
    };

    this.getSearchResult = function () {
        this.searchResult = {};

        if (this.selected.entities.indexOf('Ideas') > -1) {
            this.searchResult.ideas = Ideas.find().fetch();
        }
        if (this.selected.entities.indexOf('Tasks') > -1) {
            this.searchResult.tasks = Tasks.find().fetch();
        }
        if (this.selected.entities.indexOf('Asks') > -1) {
            this.searchResult.asks = Asks.find().fetch();
        }
    };

    this.getValue = function (entity, field, value) {

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

        if (!EntityCollection.schemaMetadata) return value;

        var metadata = EntityCollection.schemaMetadata[field];
        if (metadata && metadata.transform) {
            return metadata.transform(value, entity);
        } else {
            return value;
        }
    }

    /*
     * @param {bool} action - true/push, false/pull
     */
    this.entityChanged = function (entity, action) {
        var vm = this;

        if (action) {
            vm.selected.entities.push(entity);
        } else {
            vm.selected.entities.splice(
                vm.selected.entities.indexOf(entity), 1);
        }
        vm.selected.columns.length = 0;

        for (let column in vm.model.columns) {
            if (vm.model.columns.hasOwnProperty(column)) {
                vm.model.columns[column] = false;
            }
        }
        vm.getColumns();
        this.searchResult.ideas && this.searchResult.ideas.splice(
            0, this.searchResult.ideas.length);
        this.searchResult.asks && this.searchResult.asks.splice(
            0, this.searchResult.asks.length);
        this.searchResult.tasks && this.searchResult.tasks.splice(
            0, this.searchResult.tasks.length);
    };

    /*
     * @param {bool} action - true/push, false/pull
     */
    this.columnChanged = function (column, action) {
        if (action) {
            this.selected.columns.push(column);
        } else {
            this.selected.columns.splice(
                this.selected.columns.indexOf(column), 1);
        }
        this.searchResult.ideas && this.searchResult.ideas.splice(
            0, this.searchResult.ideas.length);
        this.searchResult.asks && this.searchResult.asks.splice(
            0, this.searchResult.asks.length);
        this.searchResult.tasks && this.searchResult.tasks.splice(
            0, this.searchResult.tasks.length);
    };

    this.getLabel = function (field) {
        if (this.selected.entities.length === 0) return;

        // If there is more than one entity selected
        // we can choose only columns that are common
        // to all entities 
        const entity = this.selected.entities[0];

        switch (entity) {
            case 'Ideas':
                return Ideas.schema.label(field);
            case 'Tasks':
                return Tasks.schema.label(field);
            case 'Asks':
                return Asks.schema.label(field);
        }
    }

    this.getColumns = function () {
        var columns = [];

        if (this.selected.entities.length === 1) {
            let entity = this.selected.entities[0];
            switch (entity) {
                case 'Ideas':
                    columns = columns.concat(Ideas.searchColumns(Ideas));
                    break;
                case 'Tasks':
                    columns = columns.concat(Tasks.searchColumns(Tasks));
                    break;
                case 'Asks':
                    columns = columns.concat(Asks.searchColumns(Asks));
                    break;
            }
        } else if (this.selected.entities.length > 1) {
            this.selected.entities.forEach((entity) => {
                switch (entity) {
                    case 'Ideas':
                        if (columns.length > 0) {
                            columns = _.intersection(columns,
                                Ideas.searchColumns(Ideas));
                        } else {
                            columns = columns.concat(Ideas.searchColumns(Ideas));
                        }
                        break;
                    case 'Tasks':
                        if (columns.length > 0) {
                            columns = _.intersection(columns,
                                Tasks.searchColumns(Tasks));
                        } else {
                            columns = columns.concat(Tasks.searchColumns(Tasks));
                        }
                        break;
                    case 'Asks':
                        if (columns.length > 0) {
                            columns = _.intersection(columns,
                                Asks.searchColumns(Asks));
                        } else {
                            columns = columns.concat(Asks.searchColumns(Asks));
                        }
                        break;
                }
            });
        }
        return columns;
    }

    var list = {
        //user: 'cGQZ526BT6BTefZ7a',
        entities: ['Task'],
        columns: ['number', 'title',
            'type', 'status', 'priority', 'assigned',
            'createdBy', 'updatedAt', 'creationDate']
        //     ,
        // filters: {
        //     sprint: vesta.currentSprint + 1
        // }
    }
}
searchCtrl.$inject = ['$scope'];