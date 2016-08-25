
import Notifications from '/imports/api/notification/notification';
import Sprints from '/imports/api/sprint/sprint';
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

    this.ideasListVisible = false;
    this.tasksListVisible = false;
    this.asksListVisible = false;

    this.ideasUnseenCounter = 0;
    this.tasksUnseenCounter = 0;
    this.asksUnseenCounter = 0;

    this.helpers({
        sprints() {
            return Sprints.find();
        },
        notsIdeas() {
            var me = this;
            var options = {
                limit: 10,
                sort: {
                    creationDate: -1
                }
            };
            this.ideasUnseenCounter = 0;
            return Notifications.find({ userId: Meteor.userId(), entityLetter: 'I' }, options).map((not) => {
                if (!not.seen) {
                    me.ideasUnseenCounter++;
                }
                return not;
            });
        },
        notsTasks() {
            var me = this;
            var options = {
                limit: 10,
                sort: {
                    creationDate: -1
                }
            };
            this.tasksUnseenCounter = 0;
            return Notifications.find({ userId: Meteor.userId(), entityLetter: 'T' }, options).map((not) => {
                if (!not.seen) {
                    me.tasksUnseenCounter++;
                }
                return not;
            });
        },
        notsAsks() {
            var me = this;
            var options = {
                limit: 10,
                sort: {
                    creationDate: -1
                }
            };
            this.asksUnseenCounter = 0;
            return Notifications.find({ userId: Meteor.userId(), entityLetter: 'A' }, options).map((not) => {
                if (!not.seen) {
                    me.asksUnseenCounter++;
                }
                return not;
            });
        },
    });

    this.seeMore = function () {
        this.limit = null;
    };

    this.getMessage = function (notification) {
        //ex. V3I15: Status 3 -> 4 updated by M. Korkosz few seconds ago
        if (typeof notification.oldValue !== 'undefined') {
            var msg = ': ' + notification.field + ' ';
            msg += notification.oldValue + ' > ';
            msg += notification.newValue + ' ';
            msg += notification.action;
            return msg;

            //ex. V3I15: Subtask V3T15 created by M. Korkosz few seconds ago
        } else if (typeof notification.message !== 'undefined') {
            var msg = ': ' + notification.field + ' ';
            msg += notification.message + ' ';
            msg += notification.action;
            return msg;

            //ex. V3I15: Description updated by M. Korkosz few seconds ago
        } else {
            var msg = '';
            if (notification.field) {
                msg += ': ' + notification.field + ' ';
            } else {
                msg += ' ';
            }
            msg += notification.action;
            return msg;
        }
    };

    this.toggleList = function (entityLetter) {
        switch (entityLetter) {
            case 'I':
                this.ideasListVisible = !this.ideasListVisible;
                if (!this.ideasListVisible) {
                    this.limit = 5;
                    this.notsIdeas.forEach((notf) => {
                        if (!notf.seen) {
                            Notifications.update(notf._id, { $set: { seen: true } });
                        }
                    });
                }
                break;
            case 'T':
                this.tasksListVisible = !this.tasksListVisible;
                if (!this.tasksListVisible) {
                    this.limit = 5;
                    this.notsTasks.forEach((notf) => {
                        if (!notf.seen) {
                            Notifications.update(notf._id, { $set: { seen: true } });
                        }
                    });
                }
                break;
            case 'A':
                this.asksListVisible = !this.asksListVisible;
                if (!this.asksListVisible) {
                    this.limit = 5;
                    this.notsAsks.forEach((notf) => {
                        if (!notf.seen) {
                            Notifications.update(notf._id, { $set: { seen: true } });
                        }
                    });
                }
                break;
        }
    };

    this.seenColor = function (seen) {
        if (!seen) return '#E8F7FF';
        return '#fff';
    };

    this.updateCurrentSprint = function () {
        var currentSprint = this.sprints.find((sprint) => {
            return sprint.current;
        });
        var currentSprintNumber = currentSprint.number;
        var nextSprintNumber = currentSprint.number + 1;
        var nextSprint = this.sprints.find((sprint) => {
            return sprint.number === nextSprintNumber;
        });
        var currentSprintOutdated =
            currentSprint.endDate < (new Date()).getTime();
        if (currentSprintOutdated && nextSprint) alert('outdated !!!')
    };
}

controller.$inject = ['$scope'];