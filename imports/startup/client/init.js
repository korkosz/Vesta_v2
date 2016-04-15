import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngRoute from 'angular-route';

angular.module('simple-todos', [
    angularMeteor,
    ngRoute,
    'accounts.ui',
    'idea',
    'lib',
    'lib.pill',
    'task'
]);
