export default angular.module('global', [])
    .controller('globalCtrl', globalCtrl);
                
function globalCtrl() {
    this.currentUser = Meteor.user(); 
    
    this.userLogIn = function() {
        return !!Meteor.userId(); 
    };
    
    this.createAccount = function() {
        Accounts.createUser({
            email: this.email,
            password: this.password,
            profile: {
                firstname: this.firstname,
                lastname: this.lastname,
                fullname: `${this.firstname} ${this.lastname}` //to jest niebiezpieczne bo 
                //z user wpisujac last i first name ma dostep do zmiennych
            }
        }, ()=> {
            alert('account created')
        })    
    };
}