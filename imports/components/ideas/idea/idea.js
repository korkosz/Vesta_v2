import Projects from '/imports/api/project/project';
import Ideas from '/imports/api/ideas/idea';
import Metadata from '/imports/api/metadata/metadata';
import Reviews from '/imports/api/ideas/review';
import pill from '/imports/components/lib/pill/pill';
import './idea.html';

class IdeaCtrl {
    constructor($scope, $routeParams) {
        $scope.viewModel(this);

        this.review = {
            merits: [],
            drawbacks: [],
            comment: ''
        };
        this.descriptionEdited = false;
        this.$routeParams = $routeParams;

        this.helpers({
            idea() {
                var idea = Ideas.findOne({ _id: this.$routeParams.id });
                if (idea) {
                    let project = Projects.findOne({ _id: idea.projectId });
                    let user = Meteor.users.findOne({ _id: idea.createdBy });
                    let reviewers = Meteor.users.find({
                        _id: {
                            $in: idea.reviewers
                        }
                    }).fetch();
                    idea.projectName = project && project.name;
                    idea.createdBy = user.profile.fullname;
                    idea.reviewers = reviewers;
                    if (!idea.reviews) idea.reviews = [];
                }
                return idea;
            },
            ideaStatuses() {
                return Metadata.findOne({ metadataName: 'IdeaStatuses' });
            },
            reviews() {
                var idea = Ideas.findOne({ _id: this.$routeParams.id });
                if (idea) return Reviews.find({ _id: { $in: idea.reviews } });
            }
        });
    }

    removeReview(_revId) {
        Reviews.remove(_revId, this.idea._id);
    }

    removeReviewVisible(_createdBy) {
        return Meteor.userId() === _createdBy;
    }

    newReviewVisible() {
        if (!this.idea || !this.reviews ||
            this.reviews.length === 0 || !Meteor.user()) return false;

        const vm = this;

        return userInReviewers() && userDidntReviewedYet();

        ///
        function userInReviewers() {
            return vm.idea.reviewers.findIndex((_rev) =>
                _rev._id === Meteor.userId()) > -1;
        };

        function userDidntReviewedYet() {
            return vm.reviews.findIndex((_rev) =>
                _rev._createdBy === Meteor.userId()) === -1;
        };
    }

    currentUserName() {
        if (Meteor.user()) return Meteor.user().profile.fullname;
    }

    addReview() {
        this.review._createdBy = Meteor.userId();
        this.review._ideaId = this.idea._id;
        Reviews.insert(this.review, () => alert());

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
IdeaCtrl.$inject = ['$scope', '$routeParams'];
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
    var imgModal = $('#imgModal');
    var imgModalBody = $('#imgModalBody');
    // hide toolbar
    el.find('[text-angular-toolbar]').css('display', 'none');
    var editor = el.find('.ta-editor');

    // activate and diactivate edition
    editor.dblclick(function () {
        el.find('[text-angular-toolbar]').css('display', 'block');
        ctrl.descriptionEdited = true;
    });
    editor.focusout(function () {
        el.find('[text-angular-toolbar]').css('display', 'none');
        ctrl.descriptionEdited = false;
    });

    // setTimeout(function () {
    //     // if you click 2x on img modal will apear 
    //     var imgs = editor.find('img');
    //     imgsLen = imgs.length;

    //     while (imgsLen--) {
    //         let img = imgs.eq(imgsLen);
    //         img.click(function (event) {
    //             // if description is not in edit mode right now
    //             if (!ctrl.descriptionEdited) {
    //                 event.preventDefault();
    //                 event.stopPropagation();
    //                 imgModalBody.append(img);
    //                 imgModal.modal();
    //             }
    //         });
    //     }
    // }, 1000);
}