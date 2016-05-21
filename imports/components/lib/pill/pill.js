import '../lib.js';
import './pill.html';

//TODO: Zrezygnowac z atrybutu state, lepiej pozwolic na stylizowanie klasa, oraz wsadzanie icon
class PillCtrl {
    constructor() {
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

    removeItem() {
        if (angular.isFunction(this.remove)) this.remove();
    }
}

export default angular.module("lib.pill", [])
    .component("pill",
    {
        templateUrl: 'imports/components/lib/pill/pill.html',
        controller: PillCtrl,
        bindings: {
            state: '@',
            value: '<',
            readOnly: '<',
            remove: '&'
        }
    });
