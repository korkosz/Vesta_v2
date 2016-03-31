import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngRoute from 'angular-route';

import todosList from '../imports/components/todosList/todosList';
 
angular.module('simple-todos', [
  angularMeteor,
  ngRoute,
  todosList.name
]);