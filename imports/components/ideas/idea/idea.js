import Projects from '/imports/api/project/project';
import Ideas from '/imports/api/ideas/idea';
import Metadata from '/imports/api/metadata/metadata';
import Reviews from '/imports/api/ideas/review';
import pill from '/imports/components/lib/pill/pill';

import './review.html';
import './idea.html';

class IdeaCtrl {
    constructor($scope, $routeParams, $location, $timeout) {
        $scope.viewModel(this);

        this.review = {
            merits: [],
            drawbacks: [],
            comment: ''
        };
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
            reviews() {
                var idea = Ideas.findOne({ number: parseInt(this.$routeParams.number) });
                if (idea) return Reviews.find({ _id: { $in: idea.reviews } });
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

    addMerit(_review) {
        if(angular.isUndefined(_review))
            _review = this.review;

        _review.merits.push(this.merit);
        this.merit = "";
    }

    addDrawback(_review) {
        if(angular.isUndefined(_review))
            _review = this.review;

        _review.drawbacks.push(this.drawback);
        this.drawback = "";
    }

    removeMerit(merit, _review) {
        if(angular.isUndefined(_review))
            _review = this.review;

        var idx = _review.merits.indexOf(merit);
        _review.merits.splice(idx, 1);
    }

    removeDrawback(drawback, _review) {
        if(angular.isUndefined(_review))
            _review = this.review;

        var idx = _review.drawbacks.indexOf(drawback);
        _review.drawbacks.splice(idx, 1);
    }

    removeReview(_revId) {
        Reviews.remove(_revId, this.idea._id);
    }

    removeReviewVisible(_createdBy) {
        return Meteor.userId() === _createdBy;
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

    newReviewVisible() {
        if (!this.idea ||
            !Meteor.user()) return false;

        const vm = this;

        return userInReviewers() && userDidntReviewedYet();

        ///
        function userInReviewers() {
            return vm.idea.reviewers.findIndex((_rev) =>
                _rev === Meteor.userId()) > -1;
        };

        function userDidntReviewedYet() {
            if (!vm.reviews) return true;
            return vm.reviews.findIndex((_rev) =>
                _rev._createdBy === Meteor.userId()) === -1;
        };
    }

    currentUserIsReviewOwner(review) {
        return review._createdBy === Meteor.userId();
    }

    ownerAndEdit(review) {
        return this.currentUserIsReviewOwner(review) &&
            review.edited;
    }

    currentUserName() {
        if (Meteor.user()) return Meteor.user().profile.fullname;
    }

    saveDescription() {
        Ideas.update(this.idea._id, {
            $set: {
                description: this.idea.description
            }
        });
        this.stopEditDescription();
    };
    
    updateReview(review) {
        review.edited = false;
        Reviews.update(review._id, {
            $set: {
                merits: review.merits,
                drawbacks: review.drawbacks,
                comment: review.comment
            }
        });  
    }
    
    addReview() {
        this.review._createdBy = Meteor.userId();
        this.review._ideaId = this.idea._id;
        Reviews.insert(this.review);

        clearArray(this.review.merits);
        clearArray(this.review.drawbacks);
        this.review.comment = '';

        ///
        function clearArray(arr) {
            for (var i = 0, len = arr.length; i < len; i++)
                arr.pop();
            return arr;
        }
    }

    setStatus() {
        Ideas.update(this.idea._id, {
            $set: {
                status: this.idea.status
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