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
        }
        /// init
        this.init();
        
        this.setPristine = ()=> {
            $scope.newAskForm.$setPristine();
            $scope.newAskForm.ask_project.$setPristine();
            $scope.newAskForm.ask_module.$setPristine();
            $scope.newAskForm.ask_title.$setPristine();  
            $scope.newAskForm.ask_description.$setPristine();  
        }
        
        this.helpers({
            projects() {
                return Projects.find();
            },
            modules() {
                this.getReactively('ask.project');
                if (this.ask.project) {
                    return this.ask.project.getModules();
                }
            },
        });
    }

    closeModal() {
        $('#newAskModal').modal('hide');
    }

    accept(valid) {
        if (!valid) return;
        var vm = this;
        this.compileOutput().then(() => {
            vm.ask.project = vm.ask.project._id;
            vm.ask.createdBy = Meteor.userId();
            vm.ask.creationAt = new Date();
            Asks.insert(vm.ask);
            vm.closeModal();
        });
    }

    cancel() {
        this.setPristine();
        this.closeModal();
    }

    openModal() {
        this.init();
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
                var editEl = $('div[name="ask_description"] *[id^="taTextElement"]');
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
