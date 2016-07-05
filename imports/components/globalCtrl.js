import ModulesCollection from '/imports/api/module/module';
import ProjectsCollection from '/imports/api/project/project';
import Bookmarks from '/imports/api/metadata/bookmark';

import './bookmarks/bookmark'; 

export default angular.module('global', [])
    .controller('globalCtrl', globalCtrl);

function globalCtrl() {   
    this.currentUser = Meteor.user();
    this.userLogIn = function () {
        return !!Meteor.userId();
    };
    this.assignedToMeFilter = {assigned: Meteor.userId(), status: {$in: [1, 2]}};
    this.activeTasksFilter = {status: {$in: [1, 2]}};
    this.ideasFilter = {status: {$in: [1, 6, 2, 7, 8]}};
    this.activeAsksFilter = {status: {$in: [1, 2]}};
     
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