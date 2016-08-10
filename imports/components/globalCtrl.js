import Projects from '/imports/api/project/project';
import Requests from '/imports/api/ideas/requests';
import Posts from '/imports/api/project/posts';
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
                });
            }
        },
        project() {
            return Projects.findOne({ name: 'Vesta' });
        },
        tacks() {
            this.getReactively('projects');
            if (this.projects && this.projects.length) {
                return Tacks.find({
                    project: {
                        $in: this.projects.map((p) => p._id)
                    }
                });
            }
        },
        posts() {
            this.getReactively('projects');
            if (this.projects && this.projects.length) {
                return Posts.find({
                    project: {
                        $in: this.projects.map((p) => p._id)
                    }
                });
            }
        },
        mainPosts() {
            this.getReactively('posts');
            if (this.posts && this.posts.length > 0) {
                return this.posts.filter(
                    (post) => !post.parentId)
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
            return Tasks.find({
                assigned: Meteor.userId(),
                status: { $in: [1, 2] }
            }).map((task) => {
                task.isNew = moment.utc().diff(
                    task.creationDate, 'days') === 0;
                return task;
            });
        },
        ideas() {
            var filter = { status: { $in: [1, 6, 2, 7, 8] } };
            return Ideas.find(filter).map((idea) => {
                idea.isNew = moment().diff(idea.creationDate, 'days') === 0;
                return idea;
            });
        },
        asks() {
            var filter = { status: { $in: [1, 2] } };

            return Asks.find(filter).map((ask) => {
                ask.isNew = moment().diff(ask.creationAt, 'days') === 0;
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
    }

    this.addPost = function (valid) {
        if (!valid) return;

        Posts.insert({
            project: this.post.projectId,
            content: this.post.content
        });
        this.post = null;
    };

    this.addSubPost = function (post, valid) {
        if (!valid) return;

        Posts.insert({
            project: post.project,
            parentId: post._id,
            content: post.subPost
        });
        post.reply = false;
        post.subPost = null;
    };

    this.getSubPosts = function (postId) {
        if (this.posts && this.posts.length > 0) {
            return this.posts.filter(
                (post) => post.parentId === postId);
        }
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