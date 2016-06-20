import Ideas from '/imports/api/ideas/idea';
import Reviews from '/imports/api/ideas/review';

class ReviewCtrl {
    constructor($scope, $routeParams) {
        $scope.viewModel(this);

        this.review = {
            merits: [],
            drawbacks: [],
            comment: ''
        };
        this.$routeParams = $routeParams;
        this.moment = moment;

        this.helpers({
            idea() {
                return Ideas.findOne({
                    number: parseInt(this.$routeParams.number)
                });
            },
            reviews() {
                this.getReactively('idea.reviews.length');
                if (this.idea) return Reviews.find({
                    _id: { $in: this.idea.reviews }
                });
            }
        });
    }

    addMerit(_review) {
        if (angular.isUndefined(_review))
            _review = this.review;

        _review.merits.push(this.merit);
        this.merit = "";
    }

    addDrawback(_review) {
        if (angular.isUndefined(_review))
            _review = this.review;

        _review.drawbacks.push(this.drawback);
        this.drawback = "";
    }

    removeMerit(merit, _review) {
        if (angular.isUndefined(_review))
            _review = this.review;

        var idx = _review.merits.indexOf(merit);
        _review.merits.splice(idx, 1);
    }

    removeDrawback(drawback, _review) {
        if (angular.isUndefined(_review))
            _review = this.review;

        var idx = _review.drawbacks.indexOf(drawback);
        _review.drawbacks.splice(idx, 1);
    }

    removeReview(_revId) {
        Meteor.call('ideas.removeReview', _revId, this.idea._id);
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
                _rev.createdBy === Meteor.userId()) === -1;
        };
    }

    currentUserIsReviewOwner(review) {
        return review.createdBy === Meteor.userId();
    }

    ownerAndEdit(review) {
        return this.currentUserIsReviewOwner(review) &&
            review.edited;
    }

    currentUserName() {
        if (Meteor.user()) return Meteor.user().profile.fullname;
    }

    updateReview(review) {
        review.edited = false;

        var notify = {
            reviewers: this.idea.reviewers,
            provider: Meteor.userId(),
            id: this.idea.id,
            when: new Date(),
            entityCreator: this.idea.createdBy
        };

        Reviews.update(review._id, {
            $set: {
                merits: review.merits,
                drawbacks: review.drawbacks,
                comment: review.comment
            }
        }, null, notify);
    }

    addReview() {

        Meteor.call('ideas.addReview', this.review, this.idea._id);
        this.review = {}

        // clearArray(this.review.merits);
        // clearArray(this.review.drawbacks);
        // this.review.comment = '';

        // ///
        // function clearArray(arr) {
        //     for (var i = 0, len = arr.length; i < len; i++)
        //         arr.pop();
        //     return arr;
        // }
    }
}

ReviewCtrl.$inject = ['$scope', '$routeParams'];

export default angular
    .module('idea')
    .controller('ReviewCtrl', ReviewCtrl);