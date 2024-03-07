const User = require("../models/user.model");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.getAllUnmembers = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const unmembers = await User.find({ '_id': { $nin: [...(user.members), user._id] }, status: 'pass' })
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
