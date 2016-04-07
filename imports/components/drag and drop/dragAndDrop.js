import './dragAndDrop.html';

export default angular.module("dragAndDrop", [])
    .directive("dragAndDrop", function() {
        return {
            templateUrl: 'imports/components/drag and drop/dragAndDrop.html',
            link,
            controller: DragAndDropCtrl,
            scope: {
                output: '=',
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
                let thumbnails = $('#thumbnails');
                let imgsColection = new Map();
                for (let i = files.length; i--;) {
                    let file = files[i];
                    let reader = new FileReader();

                    reader.readAsDataURL(file);
                    reader.onload = function(e) {
                        addImageWithNewLine(thumbnails, e.target.result)
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
            var img = createImgElement(uploadImgSrc);
            var divEdit = createContainingDiv(img);            
            container.append(divEdit);
            
            function createImgElement(_uploadImgSrc) {
                var img = document.createElement('img');                
                $(img).attr('src', _uploadImgSrc);
                /*$(img).attr('name', '00' + Math.floor((Math.random() * 10) + 1));
                $(img).addClass('img-thumbnail');
                $(img).attr('width', '242');
                $(img).attr('height', '200');
                $(img).mouseenter(e => { 
                    e.target.style.width = '100%';
                    e.target.style.height = '100%';
                });
                $(img).mouseleave(e => {
                    e.target.style.width = '304px';
                    e.target.style.height = '236px';
                });*/
                return img;
            }

            function createContainingDiv(img) {
                var div = $(document.createElement('div'));
                div.addClass('thumbnail col-sm-6 col-md-4');
                div.append(img);
                return div;
            }
        }
    });
}
