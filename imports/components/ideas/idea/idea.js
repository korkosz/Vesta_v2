import Projects from '/imports/api/project/project';
import Ideas from '/imports/api/ideas/idea';
import Metadata from '/imports/api/metadata/metadata';
import Reviews from '/imports/api/ideas/review';
import pill from '/imports/components/lib/pill/pill';
import './review';
import './review.html';
import './idea.html';

class IdeaCtrl {
    constructor($scope, $routeParams, $location, $timeout) {
        $scope.viewModel(this);
       
        this.descriptionEdited = false;
        this.$routeParams = $routeParams;
        this.$location = $location;
        this.$timeout = $timeout;
        this.moment = moment;
        this.reviewers = [];

        function clearArray(arr) {
            for (var i = 0, len = arr.length; i < len; i++)
                arr.pop();
            return arr;
        }

        this.helpers({
            idea() {
                var idea = Ideas.findOne({ number: parseInt(this.$routeParams.number) });
                if (idea) {
                    var vm = this;
                    let reviewers = Meteor.users.find({
                        _id: {
                            $in: idea.reviewers
                        }
                    }).map(function (rev) {
                        return rev.profile.fullname;
                    });

                    clearArray(vm.reviewers);

                    reviewers.forEach((rev) => {
                        vm.reviewers.push(rev);
                    });
                }
                return idea;
            },
            ideaStatuses() {
                return Metadata.findOne({ metadataName: 'IdeaStatuses' });
            },            
            users() {
                this.getReactively('reviewers.length');
                if (this.idea) {
                    return Meteor.users.find({
                        _id: {
                            $nin: this.idea.reviewers
                        }
                    });
                }
            }
        });
    }

    removeIdea() {
        $('#deleteIdeaModal').modal('hide');
        Ideas.remove(this.idea._id, true);
        this.$timeout(() => {
            this.$location.url('/');
        }, 500);
    }

    reviewerSelected() {
        Ideas.update(this.idea._id, {
            $push: {
                reviewers: this.reviewer._id
            }
        });
    }  
    
    saveDescription() {
        Ideas.update(this.idea._id, {
            $set: {
                description: this.idea.description
            }
        });
        this.stopEditDescription();
    };
    
    setStatus(_status) {
        Ideas.update(this.idea._id, {
            $set: {
                status: _status
            }
        });
    }
};
IdeaCtrl.$inject = ['$scope', '$routeParams', '$location', '$timeout'];
export default angular.module('idea')
    .directive('idea', function () {
        return {
            templateUrl: 'imports/components/ideas/idea/idea.html',
            controller: IdeaCtrl,
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