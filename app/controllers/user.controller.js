const User = require("../models/user.model");

exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.status(200).send({data: users});
};

exports.getAllUnmembers = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const unmembers = await User.find({ '_id': { $nin: [...(user.members), user._id] } })
    res.status(200).send({ data: unmembers })
  } catch (error) {
    res.status(500).send({ message: 'Unexpected Error' + error.toString() })
  }
}

exports.addTeamMember = async (req, res) => {
  try {
    const member_id = req.body.member_id
    const user = await User.findById(req.userId);
    if (member_id && !user.members.includes(member_id))
      user.members = [...(user.members), member_id]

    await user.save()
    res.status(200).send({ data: user })
  } catch (error) {
    res.status(500).send({ message: 'Unexpected Error' + error.toString() })
  }
}


exports.getAllTeamMembers = async (req, res) => {
  try {
    const members = await User.find({ '_id': { $in: req.body.members } })
    res.status(200).send({ data: members })
  } catch (error) {
    res.status(500).send({ message: 'Unexpected Error' + error.toString() })
  }
}

exports.getAllAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
    const adminUsers = users.filter(user => user.roles.includes('admin'))
    res.status(200).send({ data: adminUsers })
  } catch (error) {
    res.status(500).send({ message: 'Unexpected Error' + error.toString() })
  }
}

exports.getAllTier2Users = async (req, res) => {
  try {
    const users = await User.find()
    const tier2Users = users.filter(user => user.roles.includes('tier2') && !user.roles.includes('admin'))
    res.status(200).send({ data: tier2Users })
  } catch (error) {
    res.status(500).send({ message: 'Unexpected Error' + error.toString() })
  }
}

exports.getAllTier1Users = async (req, res) => {
  try {
    const users = await User.find()
    const tier1Users = users.filter(user => user.roles.includes('tier1') && !user.roles.includes('tier2'))
    res.status(200).send({ data: tier1Users })
  } catch (error) {
    res.status(500).send({ message: 'Unexpected Error' + error.toString() })
  }
}

exports.setUserRoles = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    user.roles = req.body.roles;

    await user.save()
    res.status(200).send({ data: user })
  } catch (error) {
    res.status(500).send({ message: 'Unexpected Error' + error.toString() })
  }
}