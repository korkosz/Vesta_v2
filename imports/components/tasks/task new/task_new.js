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
                let idx = newTaskVm.task.project.modules.indexOf(vm.module);
                vm.task.module = newTaskVm.task.project.modules[idx];
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
    .directive('newTask', ['$q', function ($q) {
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

            ctrl.compileOutput = function () {
                var editEl = el.find('#edit');
                var imgs = editEl.find('img');
                var imgsLen = imgs.length;
                var promises = [];

                while (imgsLen--) {
                    let img = imgs.eq(imgsLen);
                    let file = img.data('file');
                    let def = $q.defer();
                    let promise = def.promise;
                    promises.push(promise);
                    if (file) {
                        Images.insert(file, function (err, fileObj) {
                            file.id = fileObj._id;
                        });

                        let stop = setInterval(() => {
                            var _imgDb = Images.findOne({
                                _id: file.id
                            });
                            if (_imgDb) {
                                if (_imgDb.url()) {
                                    img.attr('src', _imgDb.url());
                                    scope.$apply(function () {
                                        removeEditableAttr();
                                        def.resolve();
                                    });
                                    clearInterval(stop);
                                }
                            }
                        }, 1000);
                    }
                }

                function removeEditableAttr() {
                    var divs = $("div[name='edit']");
                    var len = divs.length;
                    while (len--) {
                        let div = divs.eq(len);
                        div.removeAttr('contentEditable');
                        div.css('border', 'none');
                    }
                }

                return $q.all(promises).then(function () {
                    ctrl.task.description = editEl.html();
                });
            };
        }
    }]);