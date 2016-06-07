import './reasonModal.html';

angular.module('idea').component('reasonModal', {
    templateUrl: 'imports/components/ideas/idea/reasonModal.html',
    bindings: {
        status: '@',
        verb: '@'        
    }        
});