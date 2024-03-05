const db = require('../models');
const Project = db.project;
const User = db.user;
const StripeController = require('./stripe.controller')

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).send({ data: projects })
  } catch (error) {
    res.status(500).send({ message: 'Unexpected Error' + error.toString() })
  }
};

exports.addNewProject = async (req, res) => {
  try {
    const data = req.body;
    const creator_id = req.userId;

    const project = await Project({
      name: data.name,
      amount: data.amount,
      number: data.number,
      start: data.start,
      duration: data.duration,
      members: [{ '_id': creator_id, status: 'active' }],
      status: 'preparing',
      creator: creator_id
    });

    const plan = await StripeController.createProductAndPlanOnStripe(project.name, parseFloat(project.amount), data.duration)
    if (plan) {
      project.stripe_plan_token = plan.id;
      await project.save()
    }
    res.status(200).send({ data: project });
  } catch (error) {
    res.status(500).send({ message: 'Unexpected Error' + error.toString() })
  }
}

exports.addNewProjectMember = async (req, res) => {
  try {
    const member_id = req.body.member_id
    const project_id = req.body.project_id
    const status = req.body.status
    const project = await Project.findById(project_id);

    if (!project) return res.status(404).send({ message: 'Project not found!' });

    if (project.status == 'prepared')
      return res.status(420).send({ message: 'The project is full of members.' })

    if (member_id && !project.members.map((member) => member['_id']).includes(member_id))
      project.members = [...(project.members), { '_id': member_id, status: status }]

    const activeMembers = project.members.filter(member => member['status'] === 'active');
    if (activeMembers.length >= parseInt(project.number))
      project.status = 'prepared'

    await project.save()
    res.status(200).send({ data: project });
  } catch (error) {
    res.status(500).send({ message: 'Unexpected Error' + error.toString() })
  }
}

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)

    if (!project) {
      return res.status(404).send({ message: 'Project not found' });
    }

    res.status(200).send({ message: 'Project deleted successfully', data: project });
  } catch (error) {
    res.status(500).send({ message: 'Unexpected Error' + error.toString() })
  }
}

exports.getAllUnmembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    const unmembers = await User.find({ '_id': { $nin: project.members.map((member) => member['_id']) } })
    res.status(200).send({ data: unmembers })
  } catch (error) {
    res.status(500).send({ message: 'Unexpected Error' + error.toString() })
  }
}

exports.getAllMembers = async (req, res) => {
  try {
    const projects = await Project.findById(req.params.projectId);
    const members = await User.find({ '_id': { $in: projects.members.map((member) => member['_id']) } })
    members.map((member) => {
      const status = projects.members.find(item => item['_id'] == member['_id']);
      member['_doc']['status'] = status['status']
    })
    res.status(200).send({ data: members })
  } catch (error) {
    res.status(500).send({ message: 'Unexpected Error' + error.toString() })
  }
}


exports.updateProjectMember = async (req, res) => {
  const projectId = req.body.projectId;
  const memberId = req.body.memberId;
  const status = req.body.status;
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).send({ message: 'Project not found!' });
    if (project.status === 'prepared')
      return res.status(420).send({ message: 'The project is full of members.' });
    const memberIndex = project.members.findIndex(member => member['_id'] == memberId);
    if (memberIndex !== -1) {
      project.members[memberIndex]['status'] = status;
      const activeMembers = project.members.filter(member => member['status'] === 'active');
      if (activeMembers.length >= parseInt(project.number))
        project.status = 'prepared'
      project.markModified('members');
      await project.save();
      return res.status(200).send({ message: 'Update Project successfully!' });
    } else {
      return res.status(404).send({ message: 'Member not found in the project!' });
    }
  } catch (error) {
    return res.status(500).send({ message: 'Unexpected Error' + error.toString() });
  }
}

exports.cronAllProjects = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const projects = await Project.find();

    await Promise.all(projects.map(async (project) => {
      if (project.status === 'prepared') {
        let startDate = new Date(project.start);
        let endDate = new Date(startDate.getTime());
        const number = parseInt(project.number);

        if (startDate.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)) {
          const activeMembers = project.members.filter(member => member['status'] === 'active');

          switch (project.duration) {
            case 'Weekly':
              endDate.setDate(startDate.getDate() + number * 7);
              break;
            case 'Monthly':
              endDate.setMonth(startDate.getMonth() + number);
              break;
            case 'Yearly':
              endDate.setFullYear(startDate.getFullYear() + number);
              break;
            default:
              endDate.setDate(startDate.getDate() + number);
              break;
          }

          const product = await StripeController.createSubscriptions(project.stripe_plan_token, endDate, activeMembers);

          if (product) {
            project.stripe_product_token = product.id;
            project.status = 'running';
          }
        }
        if (endDate.getTime() < yesterday.getTime()) {
          project.status = 'finished';
        }

        await project.save();
      } else if (project.status === 'running') {
        // const awarded_customers = Object.keys(project.paid_members).filter(key => project.paid_members[key] == 'awarded');
        // Promise.all(awarded_customers.map(async (customerId) => {
        //   const user = await User.findOne({ stripe_customer_token: customerId });
        //   if (user) {
        //     let awarded_projects = (user.awarded_projects || [])
        //     if (!awarded_projects.includes(project['_id'])){
        //       awarded_projects.push(project['_id']);
        //     }
        //     user.awarded_projects = awarded_projects;
        //     await user.save();
        //   }
        // }))
      }
    }));
  } catch (error) {
    console.log('Unexpected Error: ', error.toString())
  }
}

exports.cronAwardPardna = async () => {
  try {
    const runningProjects = await Project.find({ status: 'running' });
    runningProjects.map((project) => {
      activeMembers = project.members.filter((member) => member['status'] == 'active')
    })
  } catch (error) {
    console.log('Unexpected Error: ', error.toString())
  }
}