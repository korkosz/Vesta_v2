import Asks from '/imports/api/ask/ask';
import Projects from '/imports/api/project/project';
import Modules from '/imports/api/module/module';
import Responses from '/imports/api/ask/response';

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
            },
            responses() {
                this.getReactively('ask.responses.length');
                if (this.ask) {
                    return Responses.find({
                        _id: {
                            $in: this.ask.responses
                        }
                    }, {
                            sort: {
                                creationDate: 1
                            }
                        });
                }
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

    alreadyLiked(resp) {
        if (!resp.likes) {
            return false;
        }
        return resp.likes.indexOf(Meteor.userId()) !== -1;
    };

    stopLiking(resp) {
        Responses.update(resp._id, {
            $pull: {
                likes: Meteor.userId()
            }
        })
    }

    alreadyDisliked(resp) {
        if (!resp.dislikes) {
            return false;
        }
        return resp.dislikes.indexOf(Meteor.userId()) !== -1;
    };

    stopDisliking(resp) {
        Responses.update(resp._id, {
            $pull: {
                dislikes: Meteor.userId()
            }
        })
    }

    //jesli juz dislajkowal
    //to nie moze, albo jesli to jego to tez nie !
    canLike(resp) {
        if (!resp.dislikes) {
            return true;
        }

        if (resp.dislikes.indexOf(Meteor.userId()) !== -1) {
            return false;
        } else {
            return true;
        }
    };

    canDislike(resp) {
        if (!resp.likes) {
            return true;
        }

        if (resp.likes.indexOf(Meteor.userId()) !== -1) {
            return false;
        } else {
            return true;
        }
    };

    likeDislikeResponse(resp, like) {
        if (like) {
            Responses.update(resp._id, {
                $push: { likes: Meteor.userId() }
            });
        } else {
            Responses.update(resp._id, {
                $push: { dislikes: Meteor.userId() }
            });
        }
    };

    addResponse() {
        var vm = this;
        this.reponse.createdBy = Meteor.userId();
        this.reponse.creationDate = new Date();
        this.reponse.askId = this.ask._id;

        Responses.insert(this.reponse, function (id) {
            debugger;
            Asks.update(vm.ask._id, {
                $push: { responses: id }
            });
        });

        this.reponse.title = '';
        this.reponse.reponse = '';

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