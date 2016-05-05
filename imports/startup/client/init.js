import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngRoute from 'angular-route';

angular.module('simple-todos', [
    angularMeteor,
    ngRoute,
    'accounts.ui',
    'ngMessages',
    'idea',
    'lib',
    'lib.pill',
    'task',
    'global',
    'textAngular'
]);

Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_EMAIL'
});


