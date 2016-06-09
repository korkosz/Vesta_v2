import Bookmarks from '/imports/api/metadata/bookmark';
import ListsSchemas from '/imports/api/metadata/listMetadata';

import '/imports/components/list/list';

export default angular.module('global')
    .controller('BookmarkCtrl', BookmarkCtrl);

function BookmarkCtrl($scope, $routeParams) {   
    $scope.viewModel(this);
    
    this.bookmarkName = $routeParams.name;
    this.helpers({
        bookmark() {
            return Bookmarks.findOne({title: this.bookmarkName});   
        }    
    });  
}

BookmarkCtrl.$inject = ['$scope', '$routeParams'];