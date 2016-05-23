import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';
import Tasks from '/imports/api/task/task';
import Metadata from '/imports/api/metadata/metadata';
import Modules from '/imports/api/module/module';

import './task_new.html';

class NewTaskCtrl {
    constructor($scope, $q) {
        $scope.viewModel(this);
        var vm = this;

        this.projectsColDef = $q.defer();
        this.modulesColDef = $q.defer();

        this.task = {};
        this.task.description = '';

        this.helpers({
            projects() {
                return Projects.find();
            },
            modules() {
                this.getReactively('task.project');
                if (this.task.project && 
                    typeof this.task.project !== 'string') {
                    this.modulesColDef.resolve();
                    return this.task.project.getModules();
                }
            },
            taskTypes() {
                return Metadata.findOne({ metadataName: 'TaskType' });
            },
            taskPriority() {
                return Metadata.findOne({ metadataName: 'TaskPriority' });
            },
            users() {
                return Meteor.users.find();
            }
        });

        this.initValuesPresent = function () {
            vm.modulesColDef.promise.then(() => {
                if (vm.module !== '') {
                    vm.task.module = vm.modules.find(function (m) {
                        return m._id === vm.module;
                    });
                }
            })
        };
    }

    closeModal() {
        $('#newTaskModal').modal('hide');
    }

    accept() {
        this.compileOutput().then(() => {
            this.task.projectId = this.task.project._id;
            this.task.createdBy = Meteor.userId();
            this.task.creationDate = new Date();
            Tasks.insert(this.task);
            this.cancel();
        });
    }

    cancel() {
        this.task = {};
        this.task.description = '';
        this.closeModal();
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
                project: '@',
                module: '@'
            },
            bindToController: true
        }

        function link(scope, el, attrs, ctrl) {

         ///Init with Project && / || Module present
            var moduleAttrDefer = $q.defer();
            var projectAttrDefer = $q.defer();

            $q.all([projectAttrDefer, moduleAttrDefer,
                ctrl.projectsColDef]).then(ctrl.initValuesPresent);

            attrs.$observe('project', function () {
                if (ctrl.project !== '') {
                    ctrl.task.project = ctrl.projects.find(function (p) {
                        return p._id === ctrl.project;
                    });
                    projectAttrDefer.resolve();
                }
            });

            attrs.$observe('module', function () {
                if (ctrl.module !== '') {
                    moduleAttrDefer.resolve();
                }
            });
            ///




            if (!ctrl.title) ctrl.title = 'Task';

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
                var editEl = $('new-task div[id^="taTextElement"]');
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
                    this.task.description = editEl.html();
                });
            };
        }
    }]);
