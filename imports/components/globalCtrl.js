export default angular.module('global', [])
    .controller('globalCtrl', globalCtrl);
                
function globalCtrl() {
    this.currentUser = Meteor.user(); 
    
    this.userLogIn = function() {
        return !!Meteor.userId(); 
    }
}