import Asks from '/imports/api/ask/ask';
import Projects from '/imports/api/project/project';
import Modules from '/imports/api/module/module';

import './ask.html';

class AskCtrl {
    constructor($scope, $routeParams, $location, $timeout) {
        $scope.viewModel(this);
       
        this.descriptionEdited = false;
        this.$routeParams = $routeParams;
        this.$location = $location;
        this.$timeout = $timeout;
        this.moment = moment;
        this.reviewers = []; 

        this.helpers({
            ask() {
                return Asks.findOne({ number: parseInt(this.$routeParams.number) });               
            }
        });
    };

    removeAsk() {
        $('#deleteAskModal').modal('hide');
        Asks.remove(this.ask._id, true);
        this.$timeout(() => {
            this.$location.url('/');
        }, 500);
    };
    
    saveDescription() {
        Asks.update(this.ask._id, {
            $set: {
                description: this.ask.description
            }
        });
        this.stopEditDescription();
    }; 
};
AskCtrl.$inject = ['$scope', '$routeParams', '$location', '$timeout'];
export default angular.module('ask')
    .directive('ask', function () {
        return {
            templateUrl: 'imports/components/asks/ask/ask.html',
            controller: AskCtrl,
            controllerAs: '$ctrl',
            link
        }
    });

function link(scope, el, attr, ctrl) {
    // hide toolbar
    el.find('[text-angular-toolbar]').css('display', 'none');

    ctrl.editDescription = function () {
        el.find('[text-angular-toolbar]').css('display', 'block');
        ctrl.descriptionEdited = true;
    };

    ctrl.stopEditDescription = function () {
        el.find('[text-angular-toolbar]').css('display', 'none');
        ctrl.descriptionEdited = false;
    };
}