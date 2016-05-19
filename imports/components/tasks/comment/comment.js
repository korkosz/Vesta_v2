import './comment.html';

class controller {
    constructor() {
        this.moment = moment;
    }
}

export default angular.module('task')
    .component('comment', {
        templateUrl: 'imports/components/tasks/comment/comment.html',
        bindings: {
            comment: '='
        },
        controller
    });

