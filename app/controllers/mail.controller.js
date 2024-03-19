const axios = require('axios');
const db = require('../models')
const User = db.user;
const Project = db.project;

const NotificationController = require('./notification.controller')

// Config object containing request headers
const config = {
    headers: {
        Authorization: 'AccessKey cZnStoETUPs2tv60qzPUrknXgF8zVJ07ylFH',
        'Content-Type': 'application/json'
    }
};

exports.projectCreationEmail = async (creator_id, member_id, duration, startDate) => {
    const creator = await User.findById(creator_id)
    const member = await User.findById(member_id)
    const title = 'Hello! Join to New iPardna'
    const content = `${creator.name} has created a pool ${duration} event starting ${startDate.toLocaleString()}. Please login to app to confirm joining event.`

    // Data object representing the request body
    const requestData = {
        receiver: {
            contacts: [{ identifierValue: member.email }]
        },
        body: {
            type: 'html',
            html: {
                metadata: { subject: title },
                html: `<p>${content}</p>`,
                text: content
            }
        }
    };

    axios.post('https://nest.messagebird.com/workspaces/1aebeb4b-df40-4e9d-af55-158c8c5537f1/channels/b3a06357-30af-431a-b54e-74e094ebc7b9/messages', requestData, config)
        .then(response => {
            console.log('Message sent successfully:', response.data);
        })
        .catch(error => {
            console.error('Error sending message:', error.response.data);
        });

    await NotificationController.addNewNotification(member._id, title, content)
}

exports.projectJoiningEmail = async (member_id, startDate, amount) => {
    const user = await User.findById(member_id)
    const title = 'Thank your for joining new iPardna'
    const content = `Thank you for joining. iPardna draw will begin ${startDate.toLocaleString()}. ${parseFloat(amount)} will be debited from your account.`

    const requestData = {
        receiver: {
            contacts: [{ identifierValue: user.email }]
        },
        body: {
            type: 'html',
            html: {
                metadata: { subject: title },
                html: `<p>${content}</p>`,
                text: content
            }
        }
    };

    axios.post('https://nest.messagebird.com/workspaces/1aebeb4b-df40-4e9d-af55-158c8c5537f1/channels/b3a06357-30af-431a-b54e-74e094ebc7b9/messages', requestData, config)
        .then(response => {
            console.log('Message sent successfully:', response.data);
        })
        .catch(error => {
            console.error('Error sending message:', error.response.data);
        });

    await NotificationController.addNewNotification(user._id, title, content)
}

exports.projectAwardedEmail = async (stripe_customer_token, projectId) => {
    const user = await User.find({ stripe_customer_token: stripe_customer_token })
    const project = await Project.findById(projectId)
    const title = 'Congratulations!'
    const content = `Congratulations ${user.name} you have been randomly selected for this ${project.duration} draw and payment will be automatically process to the card on file. First time users is subjected to Stripes restriction of a 1 week hold. Following events will be released the following day. Thank you for participating. If you know anyone that would be interested in participating in future draws, please direct them to download the app.`

    const requestData = {
        receiver: {
            contacts: [{ identifierValue: user.email }]
        },
        body: {
            type: 'html',
            html: {
                metadata: { subject: title },
                html: `<p>${content}</p>`,
                text: content
            }
        }
    };

    await axios.post('https://nest.messagebird.com/workspaces/1aebeb4b-df40-4e9d-af55-158c8c5537f1/channels/b3a06357-30af-431a-b54e-74e094ebc7b9/messages', requestData, config)
        .then(response => {
            console.log('Message sent successfully:', response.data);
        })
        .catch(error => {
            console.error('Error sending message:', error.response.data);
        });
        
    await NotificationController.addNewNotification(user._id, title, content)
}