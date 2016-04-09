import '../lib.js';
import './pill.html';

export default angular.module("lib.pill", [])
    .directive("pill", function () {
        return {
            restrict: 'E',
            templateUrl: 'imports/components/lib/pill/pill.html', 
            controller: function() {
            },
            controllerAs: 'vm', 
            scope: {}
        }
    });