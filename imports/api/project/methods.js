import Projects from '/imports/api/project/project';

Meteor.methods({
    'project.newProject': newProject
});

function newProject(project, selectedUsers) {
    return Projects.insert(project, (err, res) => {

        Meteor.users.update({
            _id: {
                $in: selectedUsers
            }
        }, {
                $push: {
                    'profile.projects': res
                }
            }, { multi: true }, (err, res) => {
                if (err) throw new Meteor.Error('makeRequest', err.message);
            });
    });
}