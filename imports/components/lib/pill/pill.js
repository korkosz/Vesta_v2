import '../lib.js';
import './pill.html';

export default angular.module("lib.pill", [])
    .directive("pill", function () {
        return {
            restrict: 'E',
            templateUrl: 'imports/components/lib/pill/pill.html', 
            controller: PillCtrl,
            controllerAs: 'vm', 
            scope: {
                state: '@',
                ngModel: '=',
                readOnly: '<?',
                placeholder: '@'
            },
            bindToController: true,
            link
        }
    });

class PillCtrl {
    constructor() {
        this.pills = [];
        this.pill = '';         
        
        if(this.ngModel) {
            this.pills = this.ngModel;       
        }
        
        switch(this.state) {
            case 'plus':
                this.sign = '+';
                this.signClass = this.state;
                this.stateClass = 'pill-advantage';
                break;
            case 'minus':
                this.sign = '-';
                this.signClass = this.state;
                this.stateClass = 'pill-disadvantage';
                break;
            default:
                this.sign = '';
                this.signClass = '';
                this.stateClass = '';
                break;
        }           
    }
    
    addPill() {
        if(this.pill === '') return;
        this.pills.push(this.pill); 
        this.pill = ''; 
    }
    
    removePill(pill) {
        this.pills.splice(this.pills.indexOf(pill), 1);    
    }
}

function link(scope, el, attrs, ctrl) {
    el.find('input').attr('placeholder', ctrl.placeholder);    
}