 export default angular.module('idea')
     .controller('modalCtrl', function($scope) {
         $scope.closeModal = function() {
             $('#myModal2').modal('hide');
         };
     });
