export default class IdeaCtrl {
    constructor($scope) {
        this.acceptAdditionalAction = $scope.accept;
        this.cancelAdditionalAction = $scope.cancel;
    }

    accept() {
        console.log('accept');
        this.acceptAdditionalAction ?
            this.acceptAdditionalAction() :
            angular.noop();
    }

    cancel() {
        console.log('cancel');
        this.cancelAdditionalAction ?
            this.cancelAdditionalAction() :
            angular.noop();
    }

};
