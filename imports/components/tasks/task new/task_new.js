import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';
import Tasks from '/imports/api/task/task';
import Metadata from '/imports/api/metadata/metadata';
import './task_new.html';

/*
    TODO: 
        1. Zmienic hosting na Cloudinary       
*/
function NewTaskCtrl($scope) {
    var vm = this;
    $scope.viewModel(vm);

    vm.task = {};
    vm.task.description = '';

    // KURWA DODAJ JEBANY ID DO JEBANEGO KURWA MODULU
    $scope.$watch('vm.project', function () {
        if (vm.project) {
            vm.task.project = vm.projects.find(function (p) {
                return p._id === vm.project;
            });
            if (vm.module) {
                let idx = vm.task.project.modules.indexOf(vm.module);
                vm.task.module = vm.task.project.modules[idx];
            }
        }
    });

    vm.helpers({
        projects() {
            return Projects.find();
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

    vm.closeModal = function () {
        $('#newTaskModal').modal('hide');
        vm.task = null;
    }

    vm.accept = function () {
        vm.compileOutput().then(() => {
            vm.task.projectId = vm.task.project._id;
            vm.task.createdBy = Meteor.userId();
            vm.task.creationDate = new Date();
            Tasks.insert(vm.task);
            vm.closeModal();
        });
    }

    vm.cancel = function () {
        vm.closeModal();
    }
}
NewTaskCtrl.$inject = ['$scope'];

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
            if (!ctrl.title) ctrl.title = 'New Task';

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