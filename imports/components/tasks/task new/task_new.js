import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';
import Tasks from '/imports/api/task/task';
import Metadata from '/imports/api/metadata/metadata';
import Modules from '/imports/api/module/module';

import './task_new.html';

class NewTaskCtrl {
    constructor($scope, $q) {
        $scope.viewModel(this);

        this.init = () => {
            this.task = {};
            this.task.description = '';
            this.output = "";

            if (this.parentTitle)
                this.task.title = this.parentTitle;

            if (this.parentProject)
                this.task._project = Projects.findOne(this.parentProject);

            if (this.parentModule)
                this.task.module = Modules.findOne(this.parentModule);

            if (this.ideaId)
                this.task.type = 2;
            else if (this.taskId)
                this.task.type = 3;

            if (this.parentSprint)
                this.task.sprint = this.parentSprint;
        }

        /// init
        this.init();

        this.setPristine = () => {
            $scope.newTaskForm.$setPristine();
            $scope.newTaskForm.project.$setUntouched();
            $scope.newTaskForm.module.$setUntouched();
            $scope.newTaskForm.type.$setUntouched();
            $scope.newTaskForm.priority.$setUntouched();
            $scope.newTaskForm.assign.$setUntouched();
            $scope.newTaskForm.title.$setUntouched();
        }

        this.helpers({
            projects() {
                return Projects.find();
            },
            modules() {
                this.getReactively('task._project');
                if (this.task._project) {
                    return this.task._project.getModules();
                }
            },
            taskTypes() {
                var taskTypes = Metadata.findOne({ metadataName: 'TaskType' });
                if (taskTypes) {
                    if (!this.taskId) {
                        return taskTypes.value.filter((type) => type.id !== 3);
                    } else {
                        return taskTypes.value.filter((type) => type.id === 3);
                    }
                }
            },
            taskPriority() {
                return Metadata.findOne({ metadataName: 'TaskPriority' });
            },
            users() {
                return Meteor.users.find();
            }
        });
    }

    projectSelected() {
        if (!this.task.priority) {
            this.task.priority = 'Normal';
        }

        this.task.sprint = this.task._project.currentSprint;
        this.task._project.sprints = this.task._project.sprints.filter((sprint) => {
            return sprint >= this.task._project.currentSprint;
        });
    }

    closeModal() {
        $('#' + this.altId + 'newTaskModal').modal('hide');
    }

    accept(valid) {
        if (!valid) return;
        var vm = this;

        this.compileOutput().then(() => {
            vm.task.project = vm.task._project._id;
            vm.task.ideaId = vm.ideaId;
            vm.task.taskId = vm.taskId;

            //this is the case when attributes have been used
            if (vm.task.module && typeof vm.task.module !== 'string') {
                vm.task.module = vm.task.module._id;
            };

            Meteor.call('tasks.createTask', vm.task, (err, res) => {
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
        $('#' + this.altId + 'newTaskModal').modal('show');
    }
}
NewTaskCtrl.$inject = ['$scope', '$q'];

export default angular.module("task")
    .directive('newTask', ['$q', 'Upload', 'cloudinary', function (
        $q, Upload, cloudinary) {
        return {
            templateUrl: "imports/components/tasks/task new/task_new.html",
            controller: NewTaskCtrl,
            controllerAs: 'newTaskVm',
            link,
            scope: {
                title: '@',
                parentProject: '@',
                parentModule: '@',
                parentTitle: '@',
                parentSprint: '=',
                ideaId: '@',
                taskId: '@',
                altId: '@',
                hide: '='
            },
            bindToController: true
        }

        function link(scope, el, attrs, ctrl) {
            if (!ctrl.altId) {
                ctrl.altId = '';
            }

            attrs.$observe('parentProject', function () {
                if (ctrl.parentProject) {
                    ctrl.task._project = Projects.findOne(ctrl.parentProject);
                    if (ctrl.task._project && ctrl.parentModule) {
                        ctrl.task.module = Modules.findOne(ctrl.parentModule);
                    }
                }
            });

            attrs.$observe('parentTitle', function () {
                if (ctrl.parentTitle)
                    ctrl.task.title = ctrl.parentTitle;
            });

            attrs.$observe('parentSprint', function () {
                if (ctrl.parentSprint)
                    ctrl.task.sprint = ctrl.parentSprint;
            });

            //Set default Title
            if (!ctrl.title) ctrl.title = 'create new task';

            function uploadToServer(file, def) {
                file.upload = Upload.upload({
                    url: "https://api.cloudinary.com/v1_1/" +
                    cloudinary.config().cloud_name + "/upload",
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

            function dataURItoBlob(dataURI) {
                var binary = atob(dataURI.split(',')[1]);
                var array = [];
                for (var i = 0; i < binary.length; i++) {
                    array.push(binary.charCodeAt(i));
                }
                return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
            }

            ctrl.compileOutput = function () {
                var defer = $q.defer();
                var promises = [];
                var counter = 0;
                var vm = this;

                if (ctrl.altId && ctrl.altId.length > 0) {
                    var editEl = $('div[id="' + ctrl.altId + 'newTaskModal"]' +
                        ' div[id^="taTextElement"]');
                } else {
                    var editEl = $('new-task div[id^="taTextElement"]');
                }

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
                    vm.task.description = editEl.html();
                });
            };
        }
    }]);
