import Bookmarks from '/imports/api/metadata/bookmark';

import './bookmark.html';

class BookmarksCtrl {
    constructor($scope) {
        $scope.viewModel(this);

        this.helpers({
            bookmarks() {
                return Bookmarks.find();
            }
        });
    }
}
BookmarksCtrl.$inject = ['$scope'];

export default angular.module("idea")
    .component('bookmarks', {
        templateUrl: "imports/components/bookmarks/bookmark.html",
        controller: BookmarksCtrl
    });