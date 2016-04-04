import Projects from '/imports/api/project/project';
import Ideas from '/imports/api/ideas/idea';

export default class IdeaCtrl {
    constructor($scope) {
        $scope.viewModel(this);

        this.helpers({
            project() {
                return Projects.findOne({_id: "CNYY3zCw4MT7e9ReZ"});
            }      
        });

        this.acceptAdditionalAction = $scope.accept;
        this.cancelAdditionalAction = $scope.cancel;
    }

    accept() {
        Ideas.insert(this.idea);
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
