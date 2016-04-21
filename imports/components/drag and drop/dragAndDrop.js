import './dragAndDrop.html';
import ngFileUpload from './ng-file-upload';

export default angular.module("dragAndDrop", ['cloudinary', 'ngFileUpload'])
    .directive("dragAndDrop", function ($q, Upload, cloudinary) {
        return {
            templateUrl: 'imports/components/drag and drop/dragAndDrop.html',
            link,
            controller: DragAndDropCtrl,
            controllerAs: 'vm',
            scope: {
                output: '=',
                confirmText: '@'
            }
        }

        function link($scope, el, attrs, ctrl) {
            var d = new Date();
            var divCounter = 0;
            var huj = [];

            $scope.title = "Image (" + d.getDate() + " - " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ")";
            //$scope.$watch('files', function() {
            $scope.uploadFiles = function (files) {
                if (!$scope.files) return;
                angular.forEach(files, function (file) {
                    huj.push(file);
                });

                let edit = $('#edit');
                for (let i = files.length; i--;) {
                    let file = files[i];
                    let reader = new FileReader();

                    reader.readAsDataURL(file);
                    reader.onload = function (e) {
                        addImageWithNewLine(edit, file, e.target.result)
                        divCounter++;
                    };

                    function addImageWithNewLine(container, file, uploadImgSrc) {
                        var divEdit = createEditDiv();
                        var img = createImgElement(uploadImgSrc, file);
                        $(img).data('file', file);
                        container.append(img, divEdit);

                        function createImgElement(_uploadImgSrc, _file) {
                            var img = document.createElement('img');
                            $(img).attr({
                                'src': _uploadImgSrc,
                                height: '242px',
                                width: '200px',
                                id: 'img' + divCounter
                            });
                            _file.imgId = 'img' + divCounter;
                            $(img).mouseenter(function () {
                                $(img).attr({
                                    height: 'auto',
                                    width: 'auto'
                                });
                            });
                            $(img).mouseleave(function () {
                                $(img).attr({
                                    height: '242px',
                                    width: '200px'
                                });
                            });
                            return img;
                        }

                        function createEditDiv() {
                            var div = document.createElement('div');
                            $(div).attr({
                                name: "edit",
                                contentEditable: "true",
                                counter: divCounter
                            }).css({
                                'margin-bottom': '20px',
                                'min-height': '50px',
                                'border': '1px dashed red'
                            });
                            return div;
                        }
                    }
                }
            };

            /* Modify the look and fill of the dropzone when files are being dragged over it */
            $scope.dragOverClass = function ($event) {
                var items = $event.dataTransfer.items;
                var hasFile = false;
                if (items != null) {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].kind == 'file') {
                            hasFile = true;
                            break;
                        }
                    }
                } else {
                    hasFile = true;
                }
                return hasFile ? "dragover" : "dragover-err";
            }; 
        }
    });

class DragAndDropCtrl {
    constructor() {
        this.sth = "aa";
    }
}
