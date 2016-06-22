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
        Meteor.call('tasks.updateComment',
            this.task._id, this.comment._id,
            this.comment.content, (err, res) => {
                if (err) window.alert(err);
            });
        this.edited = false;
    }

    remove() {
        Meteor.call('tasks.removeComment',
            this.task._id, this.comment._id, (err, res) => {
                if (err) window.alert(err);
            });
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

