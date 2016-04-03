import '../app';
import template from './idea.html';
import IdeaCtrl from './controller';

const elementsToHide = {
    new: ['status'],
    edit: [],
    view: ['acceptBtn', 'cancelBtn']
};

const buttonsText = {
    new: ['Add', 'Cancel'],
    edit: ['Save', 'Cancel'],
    view: []
};

function compile(tElement, tAttrs) {
    const mode = tAttrs.mode || 'view';

    setVisibility(mode);
    setButtonsText(mode);

    function setVisibility(_mode) {
        for (let elementName of elementsToHide[mode]) {
            tElement.find('#' + elementName).css('display', 'none');
        }
    }

    function setButtonsText(_mode) {
        let buttons = tElement.find('button');

        for (let i = 0, len = buttons.length; i < len; i++) {
            let btn = buttons.eq(i);
            btn.text(buttonsText[mode][i]);
        }
    }
}

export default angular.module('idea')
    .directive('idea', function() {
        return {
            scope: { accept: '&', cancel: '&' },
            templateUrl: 'imports/components/ideas/idea/idea.html',
            controller: IdeaCtrl,
            controllerAs: 'vm',
            compile: compile
        }
    });
