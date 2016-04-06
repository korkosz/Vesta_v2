//import '../app';
import template from './idea.html';
import IdeaCtrl from './controller';

export default angular.module('idea')
    .directive('idea', function() {
        return {
            templateUrl: 'imports/components/ideas/idea/idea.html'
        }
    });