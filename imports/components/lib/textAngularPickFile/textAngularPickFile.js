import '../lib.js';

angular.module('lib.textAngularPickFile', [])
    .directive('pickFile', function () {
        return {
            restrict: 'A',
            link(scope, el) {
                var btnGrps = el.find('.btn-group');
                var btnGrp = btnGrps.eq(btnGrps.length - 1);
                var inputFile = angular.element('<input>');
                var button = angular.element('<button>');

                inputFile.attr('type', 'file');
                inputFile.css('display', 'none');

                button.addClass('btn', 'btn-default');
                button.attr('type', 'button');
                button.text('F');
                button.on('click', function () {
                    inputFile.click();
                });
                btnGrp.append(button);
                btnGrp.append(inputFile);
            }
        }
    })