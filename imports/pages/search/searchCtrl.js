import Ideas from '/imports/api/ideas/idea';
import Tasks from '/imports/api/task/task';
import Asks from '/imports/api/ask/ask';
import ListsSchemas from '/imports/api/metadata/listMetadata';
//TODO: 
// filtr equals - dajesz enter i mozesz kolejna warosc

angular.module('simple-todos')
    .controller('searchCtrl', searchCtrl);

function searchCtrl($scope) {
    $scope.viewModel(this);
    var vm = this;

    this.helpers({
        usersLists() {
            return ListsSchemas.find({ user: Meteor.userId() });
        }
    });

    this.sortArr = [];
    /*
      [{
         field: sprint,
         filters: [
             {
                 type: equals,
                 value: 12
             }
         ]
     }]      
     */
    this.filterArr = [];

    this.selected = {
        entities: [],
        columns: []
    };

    this.model = {
        entities: {},
        columns: {},
        /*
        {
            field1: {
                value1: true,
                value2: false 
            }        
        }
        */
        uniqFilters: {},
        equalFilters: {}
    };

    this.searchResult = {
        ideas: [],
        asks: [],
        tasks: []
    };

    this.getUniquesFromDb = function() {
        if(vm.getUniqueValues(field).length < 1) {

        }
    }

    this.loadView = function (view) {
        //entities
        vm.selected.entities.length = 0;

        for (let entity in vm.model.entities) {
            if (vm.model.entities.hasOwnProperty(entity)) {
                vm.model.entities[entity] = false;
            }
        }

        view.entities.forEach((ent) => {
            vm.selected.entities.push(ent)
            vm.model.entities[ent] = true;
        });

        //columns
        vm.selected.columns.length = 0;

        for (let column in vm.model.columns) {
            if (vm.model.columns.hasOwnProperty(column)) {
                vm.model.columns[column] = false;
            }
        }
        view.columns.forEach((col) => {
            vm.selected.columns.push(col)
            vm.model.columns[col] = true;
        });

        //sort
        vm.sortArr.length = 0;

        view.sort.forEach((sort) => {
            vm.sortArr.push({
                field: sort[0],
                value: sort[1],
                active: true
            });
        });

        //filters
        vm.clearFilters();

        view.filters.forEach((filterField) => {
            filterField.filters.forEach((filter) => {
                filter.active = true;

                if (filter.type === 'uniq') {
                    vm.model.uniqFilters[filterField.field] = {};
                    filter.value.forEach((filt)=> {
                        vm.model.uniqFilters[filterField.field]                        
                            [filt] = true;    
                    });
                } else if (filter.type === 'equal') {
                    vm.model.equalFilters[filterField.field] =
                        filter.value;
                }
            });
            vm.filterArr.push(filterField);
        });

        vm.getSearchResult();
    };

    this.saveList = function (name) {
        // nie moze byc w field name $ trzeba 
        // tu to jakos wypierdalac
        var listObj = {
            user: Meteor.userId(),
            name: name,
            entities: vm.selected.entities,
            columns: vm.selected.columns,
            filters: vm.filterArr.map((obj) => {
                var field = obj.field;
                var filters = obj.filters.map((fil) => {
                    var type = fil.type;
                    var value = fil.value;
                    return { type: type, value: value }
                });

                return {
                    field: field,
                    filters: filters
                }
            }),
            sort: vm.sortArr.map((sortItem) => {
                if (sortItem.active)
                    return [sortItem.field, sortItem.value];
            })
        }

        ListsSchemas.insert(listObj);
    }

    // *** FILTERS ***
    this.clearFilters = function () {
        this.filterArr.length = 0;
        for (let key in vm.model.uniqFilters) {
            if (vm.model.uniqFilters.hasOwnProperty(key)) {
                delete vm.model.uniqFilters[key];
            }
        }
        for (let key in vm.model.equalFilters) {
            if (vm.model.equalFilters.hasOwnProperty(key)) {
                delete vm.model.equalFilters[key];
            }
        }
    };

    this.filterDate = function (field, gt, lt) {
        const type = 'date';

        if (gt && gt.getTime) gt = gt.getTime();
        if (lt && lt.getTime)
            lt = moment(lt).hour(23).minute(59).second(59).valueOf();

        var fieldFilters = this.filterArr.find(
            (filter) => filter.field === field);

        // 1) this is the first filter for this field
        if (angular.isUndefined(fieldFilters) && (gt || lt)) {
            this.filterArr.push({
                field: field,
                filters: [{
                    type: type,
                    value: {
                        gt: gt,
                        lt: lt
                    },
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

        if (gt || lt) {
            fieldFilters.filters.push({
                type: type,
                value: {
                    gt: gt,
                    lt: lt
                },
                active: true
            });
        }
    }

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

    this.filterUniq = function (field) {
        const type = 'uniq';

        var uniqFiltersObj = vm.model.uniqFilters[field];
        var uniqFilters = [];

        for (let key in uniqFiltersObj) {
            if (uniqFiltersObj.hasOwnProperty(key)) {
                if (uniqFiltersObj[key]) {
                    uniqFilters.push(parseFilterValue(field, key));
                }
            }
        }

        var fieldFilters = this.filterArr.find(
            (filter) => filter.field === field);

        // 1) this is the first filter for this field
        if (angular.isUndefined(fieldFilters) &&
            uniqFilters.length > 0) {
            this.filterArr.push({
                field: field,
                filters: [{
                    type: type,
                    value: uniqFilters,
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

        if (uniqFilters.length > 0) {
            fieldFilters.filters.push({
                type: type,
                value: uniqFilters,
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
                        filterObj[filterField.field] =
                            parseFilterValue(filterField.field, filter.value);
                    } else if (filter.type === 'uniq') {
                        filterObj[filterField.field] = {
                            $in: filter.value
                        }
                    } else if (filter.type === 'date') {
                        var gtLt = {};
                        if (filter.value.gt)
                            gtLt.$gt = filter.value.gt;
                        if (filter.value.lt)
                            gtLt.$lt = filter.value.lt;

                        filterObj[filterField.field] = gtLt;
                    }
                }
            });
        });
        return filterObj;
    }

    function parseFilterValue(field, value) {
        if (vm.selected.entities.length === 0) return;

        var EntityCollection;
        // If there is more than one entity selected
        // we can choose only columns that are common
        // to all entities 
        const entity = vm.selected.entities[0];

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
        const type = EntityCollection.schemaMetadata[field]['base'].type;

        if (type === Number) {
            return Number.parseInt(value)
        } else {
            return value;
        }
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