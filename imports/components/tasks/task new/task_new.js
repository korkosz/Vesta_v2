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

        this.task = {};
        this.task.description = '';

        this.init = () => {
            this.task = {};
            this.task.description = '';
            this.output = "";
            
            if(this.ideaTitle) 
                this.task.title = this.ideaTitle;
            
            if(this.project) 
                this.task.project = Projects.findOne(this.project);              
            
            if(this.module) 
                this.task.module = Modules.findOne(this.module);
                
            if(this.ideaTitle && this.project && this.module)    
                this.task.type = 'Feature';
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
                this.getReactively('task.project');
                if (this.task.project) {
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
    }

    closeModal() {
        $('#' + this.altId + 'newTaskModal').modal('hide');
    }

    accept(valid) {
        if (!valid) return;
        var vm = this;
        
        this.compileOutput().then(() => {
            vm.task.projectId = vm.task.project._id;
            vm.task.createdBy = Meteor.userId();
            vm.task.creationDate = new Date();
            vm.task.ideaId = vm.ideaId;

            //this is the case when attributes have been used
            if (vm.task.module && typeof vm.task.module !== 'string') {
                vm.task.module = vm.task.module._id;
            };

            Tasks.insert(vm.task);
            vm.closeModal();
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
                module: '@',
                ideaId: '@',
                ideaTitle: '@',
                altId: '@'
            },
            bindToController: true
        }

        function link(scope, el, attrs, ctrl) {
            if (!ctrl.altId) {
                ctrl.altId = '';
            }

            attrs.$observe('project', function () {
                if (ctrl.project) {
                    ctrl.task.project = Projects.findOne(ctrl.project);
                    if (ctrl.task.project && ctrl.module) {
                        ctrl.task.module = Modules.findOne(ctrl.module);
                        ctrl.task.type = 'Feature';
                    }
                }
            });
            attrs.$observe('ideaTitle', function () {
                if (ctrl.ideaTitle)
                    ctrl.task.title = ctrl.ideaTitle;
            });

            //Set default Title
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
