import './comment.html';
import Comments from '/imports/api/task/comment';
import Tasks from '/imports/api/task/task';

class controller {
    constructor($routeParams, $scope) {
        $scope.viewModel(this);
        
        this.moment = moment;
        this.edited = false;
        this.taskNumber = $routeParams.id;
        this.$routeParams = $routeParams;
        
        this.helpers({
            task() {
                return Tasks.findOne({ number: parseInt(this.$routeParams.number) });
            }
        });
    }

    edit() {
        this.edited = true;
    }

    save() {
        var notify = {
            assignedUser: this.task.assigned,
            provider: Meteor.userId(),
            id: this.task.id,
            when: new Date(),
            entityCreator: this.task.createdBy
        };

        Comments.update(this.comment._id, {
            $set: {
                content: this.comment.content
            }
        }, null, notify);
        this.edited = false;
    }

    remove() {
        Comments.remove(this.comment._id, 1);
    }
}
controller.$inject = ['$routeParams', '$scope'];

export default angular.module('task')
    .component('comment', {
        templateUrl: 'imports/components/tasks/comment/comment.html',
        bindings: {
            comment: '<'
        },
        controller
    });

