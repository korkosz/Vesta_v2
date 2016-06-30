import './_firstRelatedModal.html';
import Metadata from '/imports/api/metadata/metadata';

angular.module('idea').component('firstRelatedModal', {
    templateUrl: 'imports/components/ideas/idea/_firstRelatedModal.html',
    bindings: {
        ideaVoting: '@',
        entity: '@'
    },
    controller($scope) {
        $scope.viewModel(this);

        this.helpers({
            statuses() {
                var meta = Metadata.findOne('CBJNeBr7WrnA8FmqH');
                if (meta) return meta.value;
            }
        });

        this.getStatusName = function () {
            if (!this.statuses) return;
            switch (this.entity) {
                case 'Task':
                    return this.statuses[2].name; //Working
                case 'Ask':
                    return this.statuses[8].name; //Discussed
            }
        }

        this.entityVoteId = function () {
            switch (this.entity) {
                case 'Task':
                    return 1;
                case 'Ask':
                    return 2;
            }
        }
    }
});

