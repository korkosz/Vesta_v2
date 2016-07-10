import Projects from '/imports/api/project/project';
import Requests from '/imports/api/ideas/requests';
import Posts from '/imports/api/project/posts';
import Tacks from '/imports/api/project/tacks';
import Bookmarks from '/imports/api/metadata/bookmark';

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
        }
    });

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