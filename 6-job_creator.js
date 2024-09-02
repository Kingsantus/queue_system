import kue from 'kue';

const queue = kue.createQueue();

const jobInfo = {
    phoneNumber: '08148921234',
    message: 'This is a notice of a job',
}

const job = queue.create('push_notification_code', jobInfo)
    .save( (err) => {
        if (!err) {
            console.log(`Notification job created: ${job.id}`);
        } else {
            console.log('Job was not created!');
        }
});

job.on('complete', () => {
    console.log('Notification job completed');
});

job.on('failed', () => {
    console.log('Notification job failed');
});