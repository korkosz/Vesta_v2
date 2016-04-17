import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';

import './new_idea.html';

/*
    TODO: 
        1. Zmienic hosting na Cloudinary       
*/

class NewIdeaCtrl {
    constructor($scope) {
        $scope.viewModel(this);
        
        this.idea = {};
        this.selectedReviewers = [];
        this.selectedReviewersIds = [];
        this.idea.description = '';
        
        this.helpers({
            projects() {
                return Projects.find();
            },
            users() {
                return Meteor.users.find();
            }
        });
    }
    
    reviewerSelected() {
        if(this.selectedReviewersIds.indexOf(
            this.reviewer._id) !== -1) return;
        this.selectedReviewersIds.push(this.reviewer._id);
        this.selectedReviewers.push(this.reviewer.profile.fullname);
        this.reviewer = null;
    }
    
    closeModal() {
        $('#newIdeaModal').modal('hide');
    }

    accept(valid) {
        if(!valid) return;
        this.compileOutput().then(() => {
            this.idea.projectId = this.idea.project._id;
            this.idea.createdBy = Meteor.userId();
            this.idea.reviewers = this.selectedReviewersIds;
            this.idea.reviews = [];
            Ideas.insert(this.idea);
            this.closeModal();  
        });        
    }

    cancel() {        
        this.closeModal();
    }

    openModal() {
        this.idea = null;
    }
}

export default angular.module("idea")
    .directive('newIdea', function($q) {
        return {
            templateUrl: "imports/components/ideas/new idea/new_idea.html",
            controller: NewIdeaCtrl,
            controllerAs: 'newIdeaVm',
            link
        }

        function link(scope, el, attrs, ctrl) {
            ctrl.compileOutput = function() {
                var editEl = el.find('#edit');
                var imgs = editEl.find('img');
                var imgsLen = imgs.length;
                var promises = [];

                while (imgsLen--) {
                    let img = imgs.eq(imgsLen);
                    let file = img.data('file');
                    let def = $q.defer();
                    let promise = def.promise;
                    promises.push(promise);
                    if (file) {
                        Images.insert(file, function(err, fileObj) {
                            file.id = fileObj._id;
                        });

                        let stop = setInterval(() => {
                            var _imgDb = Images.findOne({
                                _id: file.id
                            });
                            if (_imgDb) {
                                if (_imgDb.url()) {
                                    img.attr('src', _imgDb.url());
                                    scope.$apply(function() {
                                        removeEditableAttr();
                                        def.resolve();
                                    });
                                    clearInterval(stop);
                                }
                            }
                        }, 1000);
                    }
                }               
                
                function removeEditableAttr() {
                    var divs = $("div[name='edit']");
                    var len = divs.length;
                    while (len--) {
                        let div = divs.eq(len);
                        div.removeAttr('contentEditable');
                        div.css('border', 'none');
                    }
                }
                
                return $q.all(promises).then(function() {                              
                    ctrl.idea.description = editEl.html();    
                });
            };
        }
    });

/*

 */
