import kue from 'kue';

const queue = kue.createQueue();

const jobInfo = {
    phoneNumber: '08148921234',
    message: 'This is the code to verify your account',
}

const job = queue.create('push_notification_code', jobInfo)
    .save( (err) => {
        if (!err) {
            console.log(`Notification job created: ${job.id}`);
        } else {
            console.log('Job was not created!');
        }
});


function sendNotification(phoneNumber, message) {
    console.log(`Sending notification to ${phoneNumber}, with message: ${message}`);
}

queue.process('push_notification_code', (job, done) => {
    const { phoneNumber, message } = job.data;
    sendNotification(phoneNumber, message);
    done();
});