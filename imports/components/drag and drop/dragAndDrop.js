import './dragAndDrop.html';

export default angular.module("dragAndDrop", [])
    .directive("dragAndDrop", function() {
        return {
            templateUrl: 'imports/components/drag and drop/dragAndDrop.html',
            link,
            controller: DragAndDropCtrl,
            scope: {
                output: '=',
                confirmText: '@'
            }
        }
    });

class DragAndDropCtrl {
    constructor() {
        
    }
}

function link(scope, el, attrs, ctrls) {
    console.log(scope.confirmText);
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
                        addImageWithNewLine(edit, e.target.result)
                    };

                    Images.insert(file, function (err, fileObj) {
                        console.log(err);
                        console.log(fileObj);
                    });
                }
            }
        }
        return false;

        function addImageWithNewLine(container, uploadImgSrc) {
            var divEdit = createEditDiv();
            var img = createImgElement(uploadImgSrc);
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
}
