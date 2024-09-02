function createPushNotificationsJobs(jobs, queue) {
    if (!Array.isArray(jobs)) {
        throw new Error('Jobs is not an array');
    };
    jobs.forEach((jobInfo) => {
        // Create a new job instance
        const job = queue.create('push_notification_code_3', jobInfo);
        
        job.save((err) => {
            if (err) {
                console.error(`Error saving job: ${err}`);
                return;
            }
            console.log(`Notification job created: ${job.id}`);
        });
    
        // Use a closure to capture the correct job instance
        job.on('complete', () => {
            console.log(`Notification job ${job.id} completed`);
        }).on('failed', (err) => {
            console.log(`Notification job ${job.id} failed: ${err}`);
        }).on('progress', (progress) => {
            console.log(`Notification job ${job.id} ${progress}% complete`);
        });
    });    
};

module.exports = createPushNotificationsJobs;