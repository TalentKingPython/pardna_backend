const CronJob = require("node-cron");
const ProjectController = require("../controllers/project.controller")
const StripeController = require("../controllers/stripe.controller")

const initCronJobFunction = CronJob.schedule("0 */1 * * * *", async () => {
    console.log("I'm executed on a schedule!", new Date().toLocaleString());
    // Add your custom logic here
    try {
        await StripeController.handlePaidInvoice()
        await ProjectController.cronAllProjects()
    } catch (err) { console.error(err) }
}, {
    scheduled: false,
});

exports.cronJobsInit = () => {
    initCronJobFunction.start();
}