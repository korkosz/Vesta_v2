import './_firstRelatedModal.html';
import Metadata from '/imports/api/metadata/metadata';

angular.module('idea').component('firstRelatedModal', {
    templateUrl: 'imports/components/ideas/idea/_firstRelatedModal.html',
    bindings: {
        entity: '@',
        vote: '&',
        hide: '<'
    },
    controller
});

function controller($scope, $timeout) {
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

    this.action = function () {
        var me = this;

        $('#' + me.entity + '-reasonModal').modal('hide');
        if (me.votingCb === me.entityVoteId()) {
            me.vote({ votingType: me.votingCb });
        } else {
            $timeout(() => {
                var btn = $('#0' + me.entity + 'Btn');
                angular.element(btn).triggerHandler('click');
            }, 1000);
        }
    }
}
controller.$inject = ['$scope', '$timeout'];