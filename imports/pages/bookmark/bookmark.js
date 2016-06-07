import Bookmarks from '/imports/api/metadata/bookmark';
import '/imports/components/list/list';

export default angular.module('global')
    .controller('BookmarkCtrl', BookmarkCtrl);

function BookmarkCtrl() {   
   
}

BookmarkCtrl.$inject = [];