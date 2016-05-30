import ModulesCollection from '/imports/api/module/module';
import ProjectsCollection from '/imports/api/project/project';

export default angular.module('global', [])
    .controller('globalCtrl', globalCtrl);

function globalCtrl() {   
    this.currentUser = Meteor.user();
    this.userLogIn = function () {
        return !!Meteor.userId();
    };
    this.assignedToMeFilter = {assigned: Meteor.userId(), status: {$in: ['Open', 'Working']}};
    this.ideasFilter = {status: {$in: ['New', 'Considered', 'Working']}};
    
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
    
    this.addModule = function() {
        var vesta = ProjectsCollection.findOne({});
        ModulesCollection.insert({
            name: this.module.name,
            project: vesta._id  
        });
        this.module.name = '';  
    }
}