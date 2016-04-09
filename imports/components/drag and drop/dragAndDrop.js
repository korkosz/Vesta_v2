import './dragAndDrop.html';

export default angular.module("dragAndDrop", [])
    .directive("dragAndDrop", function () {
        return {
            templateUrl: 'imports/components/drag and drop/dragAndDrop.html'
            , link
            , controller: DragAndDropCtrl
            , controllerAs: 'vm'
            , scope: {
                output: '='
                , confirmText: '@'
            }
        }
    });

class DragAndDropCtrl {
    constructor() {
        this.sth = "aa";
    }
}

function link(scope, el, attrs, ctrl) {
    $('#dropzone').on('dragover', function (event) {
        event.preventDefault();
        event.stopPropagation();
    });

    $('#dropzone').on('dragenter', function (event) {
        event.preventDefault();
        event.stopPropagation();
    });

    $('#dropzone').on('drop', function (e) {
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
                    reader.onload = function (e) {
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
                    name: "edit"
                    , contentEditable: "true"
                }).css({
                    'margin-bottom': '20px'
                    , 'min-height': '50px'
                    , 'border': '1px dashed red'
                });
                return div;
            }
        }
    });

    ctrl.add = function() {
        var x = el.find("#edit");
        var imgs = x.find("img");
        var imgsLen = imgs.length;
        
        while(imgsLen--) {
            let img = imgs.eq(imgsLen);
            let file = img.data('file');
            if (file) {
                Images.insert(file, function (err, fileObj) {
                    console.log(err);
                    console.log(fileObj.hasStored());
                    
                    let stop = setInterval(()=> {
                        if(fileObj.hasStored()) {
                            img.attr('src', fileObj.url());
                            clearInterval(stop);
                        }    
                    }, 2000)
                });
                
            }
        }
    };
}