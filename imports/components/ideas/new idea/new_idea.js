import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';
import Modules from '/imports/api/module/module';

import './new_idea.html';
import './custom.js';

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
            this.idea.creationDate = new Date();
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
NewIdeaCtrl.$inject = ['$scope'];
export default angular.module("idea")
    .config(['cloudinaryProvider', function (cloudinaryProvider) {
        cloudinaryProvider
            .set("cloud_name", "korkosz")
            .set("upload_preset", "mxobndkm");
    }])
    .directive('newIdea', ['$q', 'Upload', 'cloudinary', function ($q, Upload, cloudinary) {
        return {
            templateUrl: "imports/components/ideas/new idea/new_idea.html",
            controller: NewIdeaCtrl,
            controllerAs: 'newIdeaVm',
            link
        }

        function link(scope, el, attrs, ctrl) {
            function dataURItoBlob(dataURI) {
                var binary = atob(dataURI.split(',')[1]);
                var array = [];
                for (var i = 0; i < binary.length; i++) {
                    array.push(binary.charCodeAt(i));
                }
                return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
            }

            function uploadToServer(file, def) {
                file.upload = Upload.upload({
                    url: "https://api.cloudinary.com/v1_1/" + cloudinary.config().cloud_name + "/upload",
                    data: {
                        upload_preset: cloudinary.config().upload_preset,
                        tags: 'myphotoalbum',
                        file: file
                    }
                }).success(function (data, status, headers, config) {
                    var img = $('#' + file.name).attr('src', data.url);
                    def.resolve();
                }).error(function (data, status, headers, config) {
                    console.error('Sth went wrong when uploading image');
                });
            };

            ctrl.compileOutput = function () {
                var defer = $q.defer();
                var promises = [];
                var counter = 0;
                var editEl = $('*[id^="taTextElement"]');
                var imgs = editEl.find('img');
                var imgsLen = imgs.length;

                while (imgsLen--) {
                    let img = imgs.eq(imgsLen);
                    let src = img.attr('src');
                    let blob = dataURItoBlob(src);
                    //name is UTC timestamp in miliseconds
                    let name = Date.now() + '';
                    let file = new File([blob], name);
                    img.attr('id', name);
                    let defer = $q.defer();
                    let promise = defer.promise;
                    promises.push(promise);
                    if (file) {
                        uploadToServer(file, defer);
                    }
                }
                return $q.all(promises).then(() => {
                    this.idea.description = editEl.html();
                });
            };
        }
    }]);
