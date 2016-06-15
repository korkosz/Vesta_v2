import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';
import Modules from '/imports/api/module/module';

import './new_idea.html';

class NewIdeaCtrl {
    constructor($scope) {
        $scope.viewModel(this);

        this.init = (initial) => {
            this.idea = {};
            this.idea.description = '';
            this.output = "";

            this.selectedReviewers = [];
            this.reviewersChanged = !this.reviewersChanged;

            if (!initial) this.selectedReviewers.push(Meteor.user());

            if (this.ideaTitle)
                this.idea.title = this.ideaTitle;

            if (this.project)
                this.idea._project = Projects.findOne(this.project);

            if (this.module)
                this.idea.module = Modules.findOne(this.module);

            if (this.sprint)
                this.idea.sprint = this.sprint;

            if (this.reviewers && this.reviewers.length > 0) {
                var _reviewers = Meteor.users.find({
                    _id: {
                        $in: this.reviewers
                    }
                });
                _reviewers.forEach((rev) => {
                    if (rev._id !== Meteor.userId())
                        this.selectedReviewers.push(rev);
                });
                this.reviewersChanged = !this.reviewersChanged;
            }
        }

        /// init
        this.init(true);

        this.setPristine = () => {
            $scope.newIdeaForm.$setPristine();
            $scope.newIdeaForm.project.$setUntouched();
            $scope.newIdeaForm.module.$setUntouched();
            $scope.newIdeaForm.reviewer.$setUntouched();
            $scope.newIdeaForm.title.$setUntouched();
        }

        this.helpers({
            projects() {
                return Projects.find();
            },
            modules() {
                this.getReactively('idea._project');
                if (this.idea._project) { //&&typeof this.idea._project !== 'string'
                    return this.idea._project.getModules();
                }
            },
            users() {
                this.getReactively('reviewersChanged');
                return Meteor.users.find({
                    _id: {
                        $nin: this.selectedReviewers.map((rev) => rev._id)
                    }
                });
            }
        });
    }

    projectSelected() {
        this.idea.sprint = this.idea._project.currentSprint;

        this.idea._project.sprints = this.idea._project.sprints.filter((sprint) => {
            return sprint >= this.idea._project.currentSprint;
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
        $('#' + this.altId + 'newIdeaModal').modal('hide');
    }

    accept(valid) {
        if (!valid) return;

        var vm = this;

        this.compileOutput().then(() => {
            vm.idea.project = vm.idea._project._id;
            vm.idea.reviewers = vm.selectedReviewers.map(
                (rev) => rev._id);
            vm.idea.ideaId = vm.ideaId;
            
            //this is the case when attributes have been used
            if (vm.idea.module && typeof vm.idea.module !== 'string') {
                vm.idea.module = vm.idea.module._id;
            };

            Meteor.call('ideas.createIdea', vm.idea, (err, res) => {
                if (err) window.alert(err)
                else {
                    vm.closeModal();
                }
            });

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
    }]).directive('newIdea', ['$q', 'Upload', 'cloudinary', function ($q, Upload, cloudinary) {
        return {
            templateUrl: "imports/components/ideas/new idea/new_idea.html",
            controller: NewIdeaCtrl,
            controllerAs: 'newIdeaVm',
            link,
            scope: {
                title: '@',
                project: '@',
                module: '@',
                ideaId: '@',
                ideaTitle: '@',
                altId: '@',
                sprint: '=',
                reviewers: '='
            },
            bindToController: true
        }

        function link(scope, el, attrs, ctrl) {
            if (!ctrl.altId) {
                ctrl.altId = '';
            }

            attrs.$observe('project', function () {
                if (ctrl.project) {
                    ctrl.idea._project = Projects.findOne(ctrl.project);
                    if (ctrl.idea._project && ctrl.module) {
                        ctrl.idea.module = Modules.findOne(ctrl.module);
                    }
                }
            });

            attrs.$observe('ideaTitle', function () {
                if (ctrl.ideaTitle)
                    ctrl.idea.title = ctrl.ideaTitle;
            });

            attrs.$observe('sprint', function () {
                if (ctrl.sprint)
                    ctrl.idea.sprint = ctrl.sprint;
            });
            // scope.$watch(function () {
            //     return ctrl.reviewers && ctrl.reviewers.length;
            // }, function () {
            //     if (ctrl.reviewers && ctrl.reviewers.length > 0) {
            //         var _reviewers = Meteor.users.find({
            //             _id: {
            //                 $in: ctrl.reviewers
            //             }
            //         });
            //         _reviewers.forEach((rev) => {
            //             ctrl.selectedReviewers.push(rev);
            //         });
            //         ctrl.reviewersChanged = !ctrl.reviewersChanged;
            //     }
            // });

            //Set default Title
            if (!ctrl.title) ctrl.title = 'Idea';

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
