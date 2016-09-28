import Projects from '/imports/api/project/project';
import Requests from '/imports/api/ideas/requests';
import Tacks from '/imports/api/project/tacks';
import Bookmarks from '/imports/api/metadata/bookmark';
import Tasks from '/imports/api/task/task';
import Ideas from '/imports/api/ideas/idea';
import Asks from '/imports/api/ask/ask';

import './bookmarks/bookmark';

export default angular.module('global', [])
    .controller('globalCtrl', ['$scope', globalCtrl]);

function globalCtrl($scope) {
    $scope.viewModel(this);

    this.moment = moment;

    this.currentUser = Meteor.user();
    this.userLogIn = function () {
        return !!Meteor.userId();
    };

    //TEMP
    this.assignedToMeFilter = {
        assigned: Meteor.userId(), status: { $in: [1, 2] }
    };

    this.helpers({
        projects() { //projects to which user is assigned
            var user = Meteor.user();
            if (user && user.profile.projects) {
                return Projects.find({
                    _id: { $in: user.profile.projects }
                }).map((p) => {
                    p.nearestSprint = p.getNearestSprint();
                    return p;
                });
            }
        },
        tacks() {
            this.getReactively('projects');
            var user = Meteor.user();
            if (this.projects && this.projects.length
                && user && user.profile.projects) {
                return Tacks.find({
                    project: {
                        $in: user.profile.projects
                    }
                });
            }
        },
        requests() {
            return Requests.find({
                creator: {
                    $ne: Meteor.userId()
                },
                resultId: 1
            })
        },
        myRequests() {
            return Requests.find({
                creator: Meteor.userId()
            });
        },
        tasks() {
            var user = Meteor.user();
            if (user && user.profile.projects) {
                return Tasks.find({
                    assigned: Meteor.userId(),
                    status: { $in: [1, 2] },
                    project: {
                        $in: user.profile.projects
                    }
                }).map((task) => {
                    task.isNew = moment.utc().diff(
                        task.creationDate, 'days') === 0;
                    return task;
                });
            }
        },
        ideas() {
            var user = Meteor.user();
            if (user && user.profile.projects) {
                var filter = {
                    reviewers: Meteor.userId(), //nice trick !!!!
                    /**
                     * New, Working, Consider, Implemented, Discussed
                     * This way we make sure to filter only active Ideas
                     * from Next Sprint Planning (current sprint's should 
                     * have Closed or Rejected status')
                     */
                    status: { $in: [1, 2, 6, 7, 8] },
                    sprint: {
                        $exists: true //not deferred
                    },
                    project: {
                        $in: user.profile.projects
                    }
                };
                return Ideas.find(filter).map((idea) => {
                    idea.isNew = moment.utc().diff(
                        idea.creationDate, 'days') === 0;
                    return idea;
                });
            }
        },
        deferredIdeas() {
            var user = Meteor.user();
            if (user && user.profile.projects) {
                var filter = {
                    reviewers: Meteor.userId(),
                    status: { $in: [1, 2, 5, 6, 7, 8] },
                    sprint: {
                        $exists: false //not deferred
                    },
                    project: {
                        $in: user.profile.projects
                    }
                };
                return Ideas.find(filter).map((idea) => {
                    idea.isNew = moment.utc().diff(
                        idea.creationDate, 'days') === 0;
                    return idea;
                });
            }
        },
        asks() {
            var user = Meteor.user();
            if (!user || !user.profile.projects) return;

            var filter = {
                status: { $in: [1, 2] },
                /**
                 * docelowo ask bedzie mial jakas grupe zainetersowanych
                 * jak reviewers w Idea
                 */
                project: { $in: user.profile.projects }
            };

            return Asks.find(filter).map((ask) => {
                ask.isNew = moment.utc().diff(
                    ask.creationDate, 'days') === 0;
                return ask;
            });
        }
    });

    this.removeRequest = function (reqId) {
        Meteor.call('ideas.removeRequest',
            reqId, (err, res) => {
                if (err) window.alert(err);
            });
    };

    this.requestDesc = function (requestTypeId) {
        return Requests.requestTypes[requestTypeId];
    };

    this.sprintStarted = function (sprintStartDate) {
        return sprintStartDate < (new Date()).getTime();
    };

    this.createAccount = function () {
        Accounts.createUser({
            email: this.email,
            password: this.password,
            profile: {
                firstname: this.firstname,
                lastname: this.lastname,
                fullname: `${this.firstname} ${this.lastname}` //to jest niebiezpieczne bo 
                //z user wpisujac last i first name ma dostep do zmiennych
            }
        }, () => {
            alert('account created')
        })
    };


}