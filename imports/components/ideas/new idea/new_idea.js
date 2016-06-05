import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';
import Modules from '/imports/api/module/module';

import './new_idea.html';

class NewIdeaCtrl {
    constructor($scope) {
        $scope.viewModel(this);

        this.init = () => {
            this.idea = {};
            this.idea.description = '';
            this.selectedReviewers = [];
            this.reviewersChanged = false;
            this.output = "";
        }

        /// init
        this.init();

        this.setPristine = () => {
            $scope.newIdeaForm.$setPristine();
            $scope.newIdeaForm.project.$setUntouched();
            $scope.newIdeaForm.module.$setUntouched();
            $scope.newIdeaForm.reviewer.$setUntouched();
            $scope.newIdeaForm.title.$setUntouched();
            $scope.newIdeaForm.description.$setUntouched();
        }

        this.helpers({
            projects() {
                return Projects.find();
            },
            users() {
                this.getReactively('reviewersChanged');
                return Meteor.users.find({
                    _id: {
                        $nin: this.selectedReviewers.map((rev) => rev._id)
                    }
                });
            },
            modules() {
                this.getReactively('idea.project');
                if (this.idea.project &&
                    typeof this.idea.project !== 'string') {
                    return this.idea.project.getModules();
                }
            },
        });
    }

    removeReviewer(reviewer) {
        this.reviewersChanged = !this.reviewersChanged;
        var revIdx = this.selectedReviewers.findIndex((rev) =>
            rev._id === reviewer._id);
        this.selectedReviewers.splice(revIdx, 1);
    }

    reviewerSelected() {
        this.reviewersChanged = !this.reviewersChanged;
        this.selectedReviewers.push(this.reviewer);
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
            this.idea.reviewers = this.selectedReviewers.map(
                (rev) => rev._id);
            this.idea.reviews = [];

            Ideas.insert(this.idea);
            this.closeModal();
        });
    }

    cancel() {
        this.closeModal();
    }

    openModal() {
        this.init();
        this.setPristine();
    }
}
NewIdeaCtrl.$inject = ['$scope'];
export default angular.module("idea")
    .config(['cloudinaryProvider', function (cloudinaryProvider) {
        cloudinaryProvider
            .set("cloud_name", "korkosz")
            .set("upload_preset", "mxobndkm");
    }])
    .directive('inputFile', function() {
        return {
            restrict: 'A',
            link(scope, el) {
                //debugger;   
                var btnGrps = el.find('.btn-group');
                var btnGrp = btnGrps.eq(btnGrps.length - 1);
                var inputFile = angular.element('<input>');
                var button = angular.element('<button>');

                inputFile.attr('type', 'file');
                inputFile.css('display', 'none');

                button.addClass('btn', 'btn-default');
                button.attr('type', 'button');
                button.text('F');
                button.on('click', function() {
                    inputFile.click();
                });
                btnGrp.append(button);
                btnGrp.append(inputFile);


                //dodaj input type file i go ukryj
                //dodaj tez buttona i klikniecie na niego bedzie
                //odpalalo klikniecie inputa type file
            }
        }
    })
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
                var vm = this;

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
                    vm.idea.description = editEl.html();
                });
            };
        }
    }]);
