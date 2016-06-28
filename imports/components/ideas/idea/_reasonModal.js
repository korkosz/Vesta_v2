import './_reasonModal.html';
import Metadata from '/imports/api/metadata/metadata';

//idea-status przesylaj ale juz setStatus to kombinuj z &
class statusModalCtrl {
    constructor($scope) {
        $scope.viewModel(this);

        this.helpers({
            statuses() {
                var meta = Metadata.findOne('CBJNeBr7WrnA8FmqH');
                if (meta) return meta.value;
            }
        });
    }

    statusName(sId) {
        if (this.statuses) return this.statuses[sId];
    }

    setStatus(_status, msg, votingType) {
        if (votingType && !this.ideaVoting) {
            Meteor.call('ideas.startVoting',
                this.ideaId, votingType, (err, res) => {
                    if (err) window.alert(err);
                });
        } else {
            Meteor.call('ideas.setStatus', _status,
                this.ideaId, msg, (err, res) => {
                    if (err) window.alert(err);
                });
        }
        this.reason = '';
    }
}
statusModalCtrl.$inject = ['$scope'];

angular.module('idea').component('reasonModal', {
    templateUrl: 'imports/components/ideas/idea/_reasonModal.html',
    bindings: {
        status: '@',
        icon: '@',
        hideReason: '<',
        ideaId: '@',
        ideaVoting: '@'
    },
    controller: statusModalCtrl
});

