import {Router} from 'meteor/iron:router';

import '/imports/ui/layouts/ApplicationLayout.html';
import '/imports/ui/pages/home.html';

Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
  this.render('Home');
});

export var list = [1,2,3,4];