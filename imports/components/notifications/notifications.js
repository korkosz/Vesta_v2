
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
    this.limit = 5;
    this.listVisible = false;

    this.seeMore = function () {
        this.limit = null;
    };

    this.calculateTop = function (index) {
        return index * 5 + 5;
    };

    this.getColor = function (notification) {
        switch (notification.entity) {
            case 'Idea':
                return '#FFAA16';
            case 'Task':
                return '#3AC53A';
        }
    };

    this.getMessage = function (notification) {
        switch (notification.action) {
            case 'New':
                return ' has been created';
            case 'Update':
                return ' has been updated';
        }
    };

    this.toggleList = function () {
        this.listVisible = !this.listVisible;
        if (!this.listVisible) {
            this.limit = 5;
            this.notifications.forEach((notf)=> {
                if(!notf.seen) {
                    Notifications.update(notf._id, {$set: {seen: true}});   
                }             
            });
        }
    };
    
    this.seenColor = function(seen) {
        if(!seen) return '#E8F7FF';  
        return '#fff';  
    };
    
    this.helpers({
        notifications() {
            var options = {
                limit: 10,
                sort: {
                    creationDate: -1
                }
            };

            return Notifications.find({ userId: Meteor.userId() }, options);
        }
    });
}

controller.$inject = ['$scope'];