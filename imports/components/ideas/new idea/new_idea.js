import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';
import Modules from '/imports/api/module/module';
import Sprints from '/imports/api/sprint/sprint';

import './new_idea.html';

class NewIdeaCtrl {
    constructor($scope) {
        $scope.viewModel(this);

        this.init = (initial) => {
            this.idea = {};
            this.idea.description = '';
            this.output = "";

            this.selectedReviewers = [];

            if (!initial) this.selectedReviewers.push(Meteor.user());

            if (this.ideaTitle)
                this.idea.title = this.ideaTitle;

            if (this.project) {
                this.idea._project = Projects.findOne(this.project);
                this.projectSelected();
            }

            if (this.module)
                this.idea.module = Modules.findOne(this.module);

            if (this.sprint) {
                if (this.sprint === -1) {
                    this.idea.sprint = 'Defer';
                } else {
                    this.idea.sprint = this.sprint;
                }
            }

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
            sprints() {
                this.getReactively('idea._project');
                if (this.idea._project) {
                    let select = {
                        number: {
                            $gte: this.idea._project.currentSprintNb()
                        }
                    };
                    let sprints = Sprints.find(select).fetch();

                    /**
                     * Set current sprint as default sprint
                     */                  
                    if (sprints && sprints.length > 0)
                        //sprints should be sorted by a number index
                        this.idea.sprint = sprints[0];

                    return sprints;
                }
            },
            modules() {
                this.getReactively('idea._project');
                if (this.idea._project) {
                    return this.idea._project.getModules();
                }
            },
            users() {
                this.getReactively('this.selectedReviewers.length');
                return Meteor.users.find({
                    _id: {
                        $nin: this.selectedReviewers.map((rev) => rev._id)
                    }
                });
            }
        });
    }

    removeReviewer(reviewer) {
        var revIdx = this.selectedReviewers.findIndex((rev) =>
            rev._id === reviewer._id);
        this.selectedReviewers.splice(revIdx, 1);
    }

    reviewerSelected() {
        this.selectedReviewers.push(this.reviewer);
        this.reviewer = null;
    }

    closeModal() {
        $('#' + this.altId + 'newIdeaModal').modal('hide');
    }

    accept(valid) {
        if (!valid) return;

        var vm = this;

        vm.compileOutput().then(() => {
            vm.idea.project = vm.idea._project._id;
            vm.idea.reviewers = vm.selectedReviewers.map(
                (rev) => rev._id);
            vm.idea.ideaId = vm.ideaId;
            vm.idea.askId = vm.askId;

            if (vm.idea.sprint === 'Defer') {
                vm.idea.sprint = -1;
            }

            /**
             * case when sprint is left as default (current)
             */
            if(typeof vm.idea.sprint === 'object' && 
               typeof vm.idea.sprint._id !== 'undefined') {
                   vm.idea.sprint = vm.idea.sprint._id;
            }
            
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
                askId: '@',
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
                if (ctrl.sprint) {
                    if (ctrl.idea.sprint === -1) {
                        delete ctrl.idea.sprint;
                    } else {
                        ctrl.idea.sprint = ctrl.sprint;
                    }
                }
            });

            //Set default Title
            if (!ctrl.title) ctrl.title = 'create new idea';

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

                if (ctrl.altId && ctrl.altId.length > 0) {
                    var editEl = $('div[id="' + ctrl.altId + 'newIdeaModal"]' +
                        ' div[id^="taTextElement"]');
                } else {
                    var editEl = $('new-idea div[id^="taTextElement"]');
                }

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
