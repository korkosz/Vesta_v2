import './comment.html';
import Comments from '/imports/api/task/comment';

class controller {
    constructor() {
        this.moment = moment;
        this.edited = false;
    }

    edit() {
        this.edited = true;
    }

    save() {        
        Comments.update(this.comment._id, {
            $set: {
                content: this.comment.content
            }
        });
        this.edited = false;
    }
    
    remove() {
        Comments.remove(this.comment._id, 1);        
    }
}

export default angular.module('task')
    .component('comment', {
        templateUrl: 'imports/components/tasks/comment/comment.html',
        bindings: {
            comment: '<'
        },
        controller
    });

