
import Notifications from '/imports/api/notification/notification';
import './notifications.html';

export default angular.module('global')
    .component('notifications', {
        templateUrl: "imports/components/notifications/notifications.html",
        controller
    });

function controller($scope) {
    $scope.viewModel(this);
    
    this.moment = moment;
    
    this.listVisible = false;
    this.calculateTop = function (index) {
        return index * 5 + 5;
    };
    this.getColor = function (notification) {
        switch (notification.entity) {
            case 'Idea':
                return '#FFEFD3';
            case 'Task':
                return '#EDFFED';
        }
    }
    this.getMessage = function (notification) {
        switch (notification.action) {
            case 'New':
                return ' has been created.';
            case 'Update':
                return ' has been updated.';
        }
    };

    this.helpers({
        notifications() {
            return Notifications.find({ userId: Meteor.userId() });
        }
    });
}

controller.$inject = ['$scope'];