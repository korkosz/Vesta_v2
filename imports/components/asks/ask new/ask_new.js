import Projects from '/imports/api/project/project';
import Modules from '/imports/api/module/module';
import Asks from '/imports/api/ask/ask';

import './ask_new.html';

class NewAskCtrl {
    constructor($scope) {
        $scope.viewModel(this);

        this.init = () => {
            this.ask = {};
            this.ask.description = '';
            this.output = "";

            if (this.ideaTitle)
                this.ask.title = this.ideaTitle;

            if (this.project)
                this.ask.project = Projects.findOne(this.project);

            if (this.module)
                this.ask.module = Modules.findOne(this.module);

            if (this.sprint)
                this.ask.sprint = this.sprint;
        }
        /// init
        this.init();

        this.setPristine = () => {
            $scope.newAskForm.$setPristine();
            $scope.newAskForm.ask_project.$setPristine();
            $scope.newAskForm.ask_module.$setPristine();
            $scope.newAskForm.ask_title.$setPristine();
        }

        this.helpers({
            projects() {
                return Projects.find();
            },
            modules() {
                this.getReactively('ask.project');
                if (this.ask.project &&
                    typeof this.ask.project !== 'string') {
                    return this.ask.project.getModules();
                }
            },
        });
    }

    projectSelected() {
        this.ask.sprint = this.ask.project.currentSprint;

        this.ask.project.sprints = this.ask.project.sprints.filter((sprint) => {
            return sprint >= this.ask.project.currentSprint;
        });
    }

    closeModal() {
        $('#' + this.altId + 'newAskModal').modal('hide');
    }

    accept(valid) {
        if (!valid) return;
        var vm = this;
        this.compileOutput().then(() => {
            vm.ask.project = vm.ask.project._id;
            vm.ask.ideaId = vm.ideaId;
            
            //this is the case when attributes have been used
            if (this.ask.module && typeof this.ask.module !== 'string') {
                this.ask.module = this.ask.module._id;
            };

            Meteor.call('asks.createAsk', vm.ask, (err, res) => {
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
        $('#' + this.altId + 'newAskModal').modal('show');
    }
}

NewAskCtrl.$inject = ['$scope'];

export default angular.module("ask")
    .config(['cloudinaryProvider', function (cloudinaryProvider) {
        cloudinaryProvider
            .set("cloud_name", "korkosz")
            .set("upload_preset", "mxobndkm");
    }])
    .directive('newAsk', ['$q', 'Upload', 'cloudinary', function ($q, Upload, cloudinary) {
        return {
            templateUrl: "imports/components/asks/ask new/ask_new.html",
            controller: NewAskCtrl,
            controllerAs: 'newAskVm',
            link,
            scope: {
                project: '@',
                module: '@',
                ideaId: '@',
                ideaTitle: '@',
                altId: '@',
                sprint: '=',
                hide: '='
            },
            bindToController: true
        }

        function link(scope, el, attrs, ctrl) {
            if (!ctrl.altId) {
                ctrl.altId = '';
            }

            attrs.$observe('project', function () {
                if (ctrl.project) {
                    ctrl.ask.project = Projects.findOne(ctrl.project);
                    if (ctrl.ask.project && ctrl.module) {
                        ctrl.ask.module = Modules.findOne(ctrl.module);
                    }
                }
            });

            attrs.$observe('ideaTitle', function () {
                if (ctrl.ideaTitle)
                    ctrl.ask.title = ctrl.ideaTitle;
            });

            attrs.$observe('sprint', function () {
                if (ctrl.sprint)
                    ctrl.ask.sprint = ctrl.sprint;
            });

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
                    var editEl = $('div[id="' + ctrl.altId + 'newAskModal"]' +
                        ' div[id^="taTextElement"]');
                } else {
                    var editEl = $('new-ask div[id^="taTextElement"]');
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
                    vm.ask.description = editEl.html();
                });
            };
        }
    }]);
