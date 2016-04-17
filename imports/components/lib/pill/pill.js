import '../lib.js';
import './pill.html';

//TODO: Zrezygnowac z atrybutu state, lepiej pozwolic na stylizowanie klasa, oraz wsadzanie icon

/**
 * {<Direction} may be: 
 * a) read-only - input and remove button are hidden
 * b) one-way - input is hidden, remove button not
 * c) two-way - both input and remove button are visible
 */
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
                direction: '@?',
                ctPlaceholder: '@'
            },
            bindToController: true,
            link
        }
    });

class PillCtrl {
    constructor() {
        this.pills = [];
        this.pill = '';

        if (this.ngModel) {
            this.pills = this.ngModel;
        }

        switch (this.state) {
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
        if (this.pill === '') return;
        this.pills.push(this.pill);
        this.pill = '';
    }

    removePill(pill) {
        this.pills.splice(this.pills.indexOf(pill), 1);
    }
}

function link(scope, el, attrs, ctrl) {
    el.find('input').attr('placeholder',
        ctrl.ctPlaceholder);

    switch (ctrl.direction) {
        case 'read-only':
            el.find('#pilltxt').hide();
            break;
        case 'one-way':
            el.find('#pilltxt').hide();
            break;
        default:
            break;
    }

}