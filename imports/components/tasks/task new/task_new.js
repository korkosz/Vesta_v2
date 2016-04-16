import Ideas from '/imports/api/ideas/idea';
import Projects from '/imports/api/project/project';
import Tasks from '/imports/api/task/task';
import Metadata from '/imports/api/metadata/metadata';
import './task_new.html';

/*
    TODO: 
        1. Zmienic hosting na Cloudinary       
*/

class NewTaskCtrl {
    constructor($scope) {
        $scope.viewModel(this);
        
        this.task = {};
        this.task.description = '';
        
        this.helpers({
            projects() {
                return Projects.find();
            },
            taskTypes() {
                return Metadata.findOne({metadataName: 'TaskType'});
            },
            taskPriority() {
                return Metadata.findOne({metadataName: 'TaskPriority'});
            },
            users() {
                return Meteor.users.find();    
            }
        });
    }

    closeModal() {
        $('#newTaskModal').modal('hide');
    }

    accept() {
        this.compileOutput().then(() => {
            this.task.projectId = this.task.project._id;
            Tasks.insert(this.task);
            this.closeModal();  
        });        
    }

    cancel() {
        this.closeModal();
    }

    openModal() {
        this.task = null;
    }
}

export default angular.module("task")
    .directive('newTask', function($q) {
        return {
            templateUrl: "imports/components/tasks/task new/task_new.html",
            controller: NewTaskCtrl,
            controllerAs: '$ctrl',
            link
        }

        function link(scope, el, attrs, ctrl) {
            ctrl.compileOutput = function() {
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
                        Images.insert(file, function(err, fileObj) {
                            file.id = fileObj._id;
                        });

                        let stop = setInterval(() => {
                            var _imgDb = Images.findOne({
                                _id: file.id
                            });
                            if (_imgDb) {
                                if (_imgDb.url()) {
                                    img.attr('src', _imgDb.url());
                                    scope.$apply(function() {
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
                
                return $q.all(promises).then(function() {
                    ctrl.task.description = editEl.html();    
                });
            };
        }
    });