const db = require("../models");
const Notification = db.notification;

exports.addNewNotification = async (userId, title, content) => {
    try {
        const notification = await Notification({
            userId: userId,
            title: title,
            content: content,
            status: 'unchecked'
        })

        if (notification) await notification.save()
    } catch (error) {
        console.log('Unexpected Error: ', error);
    }
}


exports.getNotificationsByUserId = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.userId, status: 'unchecked' })
        res.status(200).send({ data: notifications })
    } catch (error) {
        res.status(500).send({ message: 'Unexpected Error: ' + error.toString() })
    }
}

exports.checkNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id)
        if (notification) {
            notification.status = 'checked'
            await notification.save()
        }        
    } catch (error) {
        res.status(500).send({ message: 'Unexpected Error: ' + error.toString() })
    }
}