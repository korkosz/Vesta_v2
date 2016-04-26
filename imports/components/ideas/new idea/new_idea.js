import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';

import './new_idea.html';

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
        if (this.selectedReviewersIds.indexOf(
            this.reviewer._id) !== -1) return;
        this.selectedReviewersIds.push(this.reviewer._id);
        this.selectedReviewers.push(this.reviewer.profile.fullname);
        this.reviewer = null;
    }

    closeModal() {
        $('#newIdeaModal').modal('hide');
    }

    accept(valid) {
        if (!valid) return;
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
    .config(['cloudinaryProvider', function (cloudinaryProvider) {
        cloudinaryProvider
            .set("cloud_name", "korkosz")
            .set("upload_preset", "mxobndkm");
    }])
    .directive('newIdea', function ($q, Upload, cloudinary) {
        return {
            templateUrl: "imports/components/ideas/new idea/new_idea.html",
            controller: NewIdeaCtrl,
            controllerAs: 'newIdeaVm',
            link
        }

        function link(scope, el, attrs, ctrl) {
            function uploadToServer(file, def) {
                file.upload = Upload.upload({
                    url: "https://api.cloudinary.com/v1_1/" + cloudinary.config().cloud_name + "/upload",
                    data: {
                        upload_preset: cloudinary.config().upload_preset,
                        tags: 'myphotoalbum',
                        file: file
                    }
                }).success(function (data, status, headers, config) {
                    var img = $('#' + file.imgId).attr('src', data.url);
                    setFullSizeImg(img);
                    def.resolve();
                }).error(function (data, status, headers, config) {
                    console.error('Sth went wrong when uploading image');
                });

                function setFullSizeImg(img) {
                    img.attr({
                        height: 'auto',
                        width: 'auto'
                    });
                }
            };

            ctrl.compileOutput = function () {
                var defer = $q.defer();
                var promises = [];
                var editEl = el.find('#edit');
                var imgs = editEl.find('img');
                var imgsLen = imgs.length;

                while (imgsLen--) {
                    let img = imgs.eq(imgsLen);
                    let file = img.data('file');
                    let defer = $q.defer();
                    let promise = defer.promise;
                    promises.push(promise);
                    if (file) {
                        uploadToServer(file, defer);
                    }
                }
                return $q.all(promises).then(() => {
                    removeEditAttrs();
                    this.idea.description = editEl.html();
                });

                function removeEditAttrs() {
                    var divs = $("div[name='edit']");
                    var len = divs.length;
                    while (len--) {
                        let div = divs.eq(len);
                        removeContentEditable(div);
                        removeBorder(div);
                    }

                    function removeContentEditable(div) {
                        div.removeAttr('contentEditable');
                    }

                    function removeBorder(div) {
                        div.css('border', 'none');
                    }
                }
            };
        }
    });

/*

 */
