import './dragAndDrop.html';

export default angular.module("dragAndDrop", [])
    .directive("dragAndDrop", function($q) {
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

        function link(scope, el, attrs, ctrl) {
            $('#dropzone').on('dragover', function(event) {
                event.preventDefault();
                event.stopPropagation();
            });

            $('#dropzone').on('dragenter', function(event) {
                event.preventDefault();
                event.stopPropagation();
            });

            $('#dropzone').on('drop', function(e) {
                e.preventDefault();
                e.stopPropagation();

                var dt = e.originalEvent.dataTransfer;
                if (dt) {
                    let files = dt.files;
                    if (files.length > 0) {
                        let edit = $('#edit');
                        for (let i = files.length; i--;) {
                            let file = files[i];
                            let reader = new FileReader();

                            reader.readAsDataURL(file);
                            reader.onload = function(e) {
                                addImageWithNewLine(edit, file, e.target.result)
                            };
                        }
                    }
                }
                return false;

                function addImageWithNewLine(container, file, uploadImgSrc) {
                    var divEdit = createEditDiv();
                    var img = createImgElement(uploadImgSrc);
                    $(img).data('file', file);
                    container.append(img, divEdit);

                    function createImgElement(_uploadImgSrc) {
                        var img = document.createElement('img');
                        $(img).attr('src', _uploadImgSrc);
                        return img;
                    }

                    function createEditDiv() {
                        var div = document.createElement('div');
                        $(div).attr({
                            name: "edit",
                            contentEditable: "true"
                        }).css({
                            'margin-bottom': '20px',
                            'min-height': '50px',
                            'border': '1px dashed red'
                        });
                        return div;
                    }
                }
            });

            ctrl.add = function() {
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
                                    console.log(_imgDb.url());
                                    img.attr('src', _imgDb.url());
                                    scope.$apply(function() {
                                        removeEditableAttr();
                                        scope.output.html = editEl.html();
                                        def.resolve();
                                    });
                                    clearInterval(stop);
                                }
                            }
                        }, 1000);
                    }
                }
                $q.all(promises).then(function() {
                    alert('git');
                });
                
                function removeEditableAttr() {
                    var divs = $("div[name='edit']");
                    var len = divs.length;
                    while (len--) {
                        let div = divs.eq(len);
                        div.removeAttr('contentEditable');
                        div.css('border', 'none');
                    }
                }
            };
        }
    });

class DragAndDropCtrl {
    constructor() {
        this.sth = "aa";
    }
}
