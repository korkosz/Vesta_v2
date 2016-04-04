 export default angular.module('idea')
     .controller('modalCtrl', function($scope) {
         $scope.closeModal = function() {
             $('#newIdeaModal').modal('hide');
         };
     });
