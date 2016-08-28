import Projects from '/imports/api/project/project';

Meteor.methods({
    'project.newProject': newProject
});

function newProject(project, selectedUsers) {
    Projects.insert(project, (err, res) => {
        Meteor.users.update({
            _id: {
                $in: selectedUsers
            }
        }, {
                $push: {
                    'profile.projects': res
                }
            }, { multi: true })
    });
}