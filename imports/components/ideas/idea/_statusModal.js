import './_statusModal.html';
import Metadata from '/imports/api/metadata/metadata';

angular.module('idea').component('reasonModal', {
    templateUrl: 'imports/components/ideas/idea/_statusModal.html',
    bindings: {
        icon: '@',
        hideReason: '<',
        action: '&',
        ideaVoting: '<',
        status: '@'
    },
    controller($scope) {
        $scope.viewModel(this);
        var vm = this;

        $scope.$watch(() => this.ideaVoting, (newVal) => {
            if(newVal && this.status == newVal) {
                vm.votingCb = newVal;
            }
        })
        this.helpers({
            statuses() {
                var meta = Metadata.findOne('CBJNeBr7WrnA8FmqH');
                if (meta) return meta.value;
            }
        });

        this.statusVerb = function () {
            if (this.statuses && this.status)
                return this.statuses[this.status].verb;
        }
    }
});

