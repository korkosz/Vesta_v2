import Projects from '/imports/api/project/project';
import Posts from '/imports/api/project/posts';
import Tacks from '/imports/api/project/tacks';
import Bookmarks from '/imports/api/metadata/bookmark';

import './bookmarks/bookmark';

export default angular.module('global', [])
    .controller('globalCtrl', ['$scope', globalCtrl]);

function globalCtrl($scope) {
    $scope.viewModel(this);

    this.currentUser = Meteor.user();
    this.userLogIn = function () {
        return !!Meteor.userId();
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
        }
    });


    this.addPost = function (valid) {
        if (!valid) return;

        Posts.insert({
            project: this.post.projectId,
            content: this.post.content
        });
    };

    this.assignedToMeFilter = { assigned: Meteor.userId(), status: { $in: [1, 2] } };
    this.activeTasksFilter = { status: { $in: [1, 2] } };
    this.ideasFilter = { status: { $in: [1, 6, 2, 7, 8] } };
    this.activeAsksFilter = { status: { $in: [1, 2] } };

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