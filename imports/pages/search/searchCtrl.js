import Ideas from '/imports/api/ideas/idea';
import Tasks from '/imports/api/task/task';
import Asks from '/imports/api/ask/ask';

angular.module('simple-todos')
    .controller('searchCtrl', searchCtrl);

function searchCtrl($scope) {
    $scope.viewModel(this);
    var vm = this;

    this.sortArr = [];
    /*
     *[{
         field: sprint,
         filters: [
             {
                 type: equals,
                 value: 12
             }
         ]
     }]
     * 
     */
    this.filterArr = [];

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

    // *** FILTERS ***
    this.filterEqual = function (field, value) {
        const type = 'equal';

        var fieldFilters = this.filterArr.find(
            (filter) => filter.field === field);

        // 1) this is the first filter for this field
        if (angular.isUndefined(fieldFilters) && value) {
            this.filterArr.push({
                field: field,
                filters: [{
                    type: type,
                    value: value,
                    active: true
                }]
            });
            return;
        }

        // 2) There was already filter of this type
        // if so delete it 
        var typeFilterIdx = fieldFilters.filters.findIndex(
            (filter) => filter.type === type);

        if (typeFilterIdx > -1) {
            fieldFilters.filters.splice(typeFilterIdx, 1);
        }

        if (value) {
            fieldFilters.filters.push({
                type: type,
                value: value,
                active: true
            });
        }
    };

    this.activeFilters = function (field) {
        var fieldFilter = this.filterArr.find(
            (filter) => filter.field === field);

        return angular.isDefined(fieldFilter) &&
            fieldFilter.filters.length > 0 &&
            fieldFilter.filters.findIndex(
                (f) => f.active === true) > -1;
    };

    this.getUniqueValues = function (field) {
        if (this.selected.entities.indexOf('Idea') > -1) {
            return _.uniq(this.searchResult.ideas.map(
                (entity) => entity[field]));
        }
        if (this.selected.entities.indexOf('Task') > -1) {
            return _.uniq(this.searchResult.tasks.map(
                (entity) => entity[field]));
        }
        if (this.selected.entities.indexOf('Ask') > -1) {
            return_.uniq(this.searchResult.asks.map(
                (entity) => entity[field]));
        }
    };

    this.getFilterType = function (field) {
        if (this.selected.entities.length === 0) return;

        // If there is more than one entity selected
        // we can choose only columns that are common
        // to all entities 
        const entity = this.selected.entities[0];

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

        if (!EntityCollection.schemaMetadata) return;

        var metadata = EntityCollection.schemaMetadata[field];
        if (metadata && metadata.search) {
            return metadata.search.filter;
        }
    };

    function setupFilters() {
        var filterObj = {};
        vm.filterArr.forEach((filterField) => {
            filterField.filters.forEach((filter) => {
                if (filter.active) {
                    if (filter.type === 'equal') {
                        filterObj[filterField.field] = filter.value;
                    }
                }
            });
        });
        return filterObj;
    }
    // FILTERS *END*


    // *** SORT *** 
    this.sort = function (field) {
        var me = this;
        var sortItem = getSortValue(field);

        //filter was off -> asc
        if (angular.isUndefined(sortItem)) {
            this.sortArr.push({ field: field, value: 'asc', active: true });
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
    //@returns: 1, -1, 0 - asc, desc, no filter   
    this.fieldSorted = function (field) {
        var sort = this.sortArr.find((sortItem) => {
            return sortItem.field === field && sortItem.active;
        });
        if (angular.isUndefined(sort)) return 0;
        return sort.value;
    };
    // SORT *END*


    this.getSearchResult = function () {
        this.searchResult = {};

        var sort = this.sortArr.map((sortItem) => {
            if (sortItem.active)
                return [sortItem.field, sortItem.value];
        });

        var filter = setupFilters();

        if (this.selected.entities.indexOf('Idea') > -1) {
            this.searchResult.ideas = Ideas.find(filter, { sort: sort }).fetch();
        }
        if (this.selected.entities.indexOf('Task') > -1) {
            this.searchResult.tasks = Tasks.find(filter, { sort: sort }).fetch();
        }
        if (this.selected.entities.indexOf('Ask') > -1) {
            this.searchResult.asks = Asks.find(filter, { sort: sort }).fetch();
        }
    };

    this.getValue = function (field, value) {

        if (this.selected.entities.length === 0) return;

        // If there is more than one entity selected
        // we can choose only columns that are common
        // to all entities 
        const entity = this.selected.entities[0];

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

        this.sortArr.length = 0;
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

            var idx = this.sortArr.findIndex((sortItem) => {
                return sortItem.field.toLowerCase() === column.toLowerCase();
            });

            if (idx > -1) {
                this.sortArr.splice(idx, 1);
            }
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
            case 'Idea':
                return Ideas.schema.label(field);
            case 'Task':
                return Tasks.schema.label(field);
            case 'Ask':
                return Asks.schema.label(field);
        }
    };

    this.getColumns = function () {
        var columns = [];

        if (this.selected.entities.length === 1) {
            let entity = this.selected.entities[0];
            switch (entity) {
                case 'Idea':
                    columns = columns.concat(Ideas.searchColumns(Ideas));
                    break;
                case 'Task':
                    columns = columns.concat(Tasks.searchColumns(Tasks));
                    break;
                case 'Ask':
                    columns = columns.concat(Asks.searchColumns(Asks));
                    break;
            }
        } else if (this.selected.entities.length > 1) {
            this.selected.entities.forEach((entity) => {
                switch (entity) {
                    case 'Idea':
                        if (columns.length > 0) {
                            columns = _.intersection(columns,
                                Ideas.searchColumns(Ideas));
                        } else {
                            columns = columns.concat(Ideas.searchColumns(Ideas));
                        }
                        break;
                    case 'Task':
                        if (columns.length > 0) {
                            columns = _.intersection(columns,
                                Tasks.searchColumns(Tasks));
                        } else {
                            columns = columns.concat(Tasks.searchColumns(Tasks));
                        }
                        break;
                    case 'Ask':
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
    };

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