import Ideas from '/imports/api/ideas/idea';
import Tasks from '/imports/api/task/task';
import Asks from '/imports/api/ask/ask';

angular.module('simple-todos')
    .controller('searchCtrl', searchCtrl);

function searchCtrl($scope) {
    $scope.viewModel(this);

    this.selected = {
        entities: [],
        columns: []
    };

    this.model = {
        entities: {},
        columns: {}
    };


    /*
     * @param {bool} action - true/push, false/pull
     */
    this.entityChanged = function (entity, action) {
        if (action) {
            this.selected.entities.push(entity);
        } else {
            this.selected.entities.splice(
                this.selected.entities.indexOf(entity), 1);
        }
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

        this.selected.entities.forEach((entity) => {
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
        });
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