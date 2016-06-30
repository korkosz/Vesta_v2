import './_statusModal.html';

angular.module('idea').component('reasonModal', {
    templateUrl: 'imports/components/ideas/idea/_statusModal.html',
    bindings: {
        icon: '@',
        hideReason: '<',
        action: '&',
        ideaVoting: '@',
        voteId: '@',
        title: '@'
    }
});

