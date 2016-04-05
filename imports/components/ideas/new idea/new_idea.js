import './new_idea.html';

class NewIdeaCtrl {

}

export default angular.module("idea")
    .component('newIdea', {
        templateUrl: "imports/components/ideas/new idea/new_idea.html",
        controller: NewIdeaCtrl
    });
