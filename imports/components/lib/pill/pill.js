import '../lib.js';
import './pill.html';

export default angular.module("lib.pill", [])
    .directive("pill", function () {
        return {
            restrict: 'E',
            templateUrl: 'imports/components/lib/pill/pill.html', 
            controller: PillCtrl,
            controllerAs: 'vm', 
            scope: {}
        }
    });

class PillCtrl {
    constructor() {
        this.pills = [];
        this.pill = '';
    }
    
    addPill() {
        this.pills.push(this.pill); 
        this.pill = ''; 
    }
    
    removePill(pill) {
        this.pills.splice(this.pills.indexOf(pill), 1);    
    }
}