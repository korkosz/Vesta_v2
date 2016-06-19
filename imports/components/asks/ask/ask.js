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

        this.helpers({
            ask() {
                return Asks.findOne({ number: parseInt(this.$routeParams.number) });
            },
            responses() {
                this.getReactively('ask');
                if (this.ask) {
                    return Responses.find({ ask: this.ask._id }, {
                        sort: {
                            creationDate: 1
                        }
                    });
                }
            },
            mainResponses() {
                this.getReactively('responses.length');
                if (this.responses && this.responses.length > 0) {
                    return this.responses.filter((resp) => !resp.parentResponse)
                }
            },
            relatedIdeas() {
                this.getReactively('ask');
                var me = this;

                if (me.ask &&
                    me.ask.related &&
                    me.ask.related.length > 0) {

                    var ideasIds = me.ask.related.filter((rel) => {
                        return rel.entity === 'Idea';
                    }).map((relObj) => {
                        return relObj.id;
                    });

                    return Ideas.find({ _id: { $in: ideasIds } }).map((idea) => {
                        idea.relation = me.ask.related.find((rel) => {
                            return rel.id === idea._id;
                        }).relation;

                        return idea;
                    });
                }
            },
            setDiscussed() {
                this.getReactively('responses.length');

                if (!this.responses ||
                    this.responses.length < 1) return;

                if (this.ask.status === 1) {
                    Asks.update(this.ask._id, {
                        $set: {
                            status: 2
                        }
                    });
                }
            },
        });
    }

    closeAsk() {
        Asks.update(this.ask._id, {
            $set: { status: 3 }
        });
    }

    removeAsk() {
        $('#deleteAskModal').modal('hide');
        Asks.remove(this.ask._id, true);
        this.$timeout(() => {
            this.$location.url('/');
        }, 500);
    }

    saveDescription() {
        Asks.update(this.ask._id, {
            $set: {
                description: this.ask.description
            }
        });
        this.stopEditDescription();
    }

    addGoodPoint() {
        Asks.update(this.ask._id, {
            $push: { goodPoints: this.goodPoint }
        });
        this.goodPoint = '';
    }

    removeGoodPoint(_goodPoint) {
        Asks.update(this.ask._id, {
            $pull: { goodPoints: _goodPoint }
        });
    }

    alreadyLiked(resp) {
        if (!resp.likes) {
            return false;
        }
        return resp.likes.indexOf(Meteor.userId()) !== -1;
    }

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
    }

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
    }

    canDislike(resp) {
        if (!resp.likes) {
            return true;
        }

        if (resp.likes.indexOf(Meteor.userId()) !== -1) {
            return false;
        } else {
            return true;
        }
    }

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
    }

    addResponse() {
        var vm = this;
        this.response.createdBy = Meteor.userId();
        this.response.creationDate = new Date();
        this.response.ask = this.ask._id;
        Responses.insert(this.response);

        this.response.title = '';
        this.response.description = '';
    }

    addSubResponse(resp, valid) {
        if (!valid) return;

        var response = {};

        response.createdBy = Meteor.userId();
        response.creationDate = new Date();
        response.ask = this.ask._id;
        response.parentResponse = resp._id;

        response.title = resp.sub.title;
        response.description = resp.sub.description;
        Responses.insert(response);

        resp.sub = {};
        resp.replyVisible = false;
    }

    getSubResponses(respId) {
        if (this.responses && this.responses.length > 0) {
            return this.responses.filter((res) => res.parentResponse === respId);
        }
    }

    cancelSubResponse(resp) {
        resp.sub = {};
        resp.replyVisible = false;
    }

    replingToResponse(resp) {
        resp.replyVisible = true;
    }

    removeResponse(resp) {
        Responses.remove(resp._id);
    }

    saveResponse(resp) {
        Responses.update(resp._id, {
            $set: {
                title: resp.title,
                description: resp.description
            }
        });
        resp.edited = false;
    }

    currentUserIsPostOwner(post) {
        return post.createdBy === Meteor.userId();
    }

    ownerAndEdit(post) {
        return this.currentUserIsPostOwner(post) &&
            post.edited;
    }

    ownerAndNotEdit(post) {
        return this.currentUserIsPostOwner(post) &&
            !post.edited;
    }
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