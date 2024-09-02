import { expect } from 'chai';
import kue from 'kue';
import sinon from 'sinon';

import createPushNotificationsJobs from './8-job.js';

const logSpy = sinon.spy(console, 'log');

const queue = kue.createQueue();

describe('createPushNotificationsJobs', () => {

    before(() => {
        queue.testMode.enter();
    });

    afterEach(() => {
        queue.testMode.clear();
    });

    after(() => {
        // Restore console.log after all tests
        logSpy.restore();
    });

    it('should throw an error if jobs is not an array', () => {
        expect(() => createPushNotificationsJobs({}, queue)).to.throw('Jobs is not an array');
    });

    it('should add jobs to the queue and handle events correctly', function(done) {
        const jobs = [
            { phoneNumber: '1234567890', message: 'Hello, World!' },
            { phoneNumber: '0987654321', message: 'Hello, Universe!' }
        ];

        // Call the function to create jobs
        createPushNotificationsJobs(jobs, queue);

        // Check that jobs are created in the queue
        kue.Job.rangeByType('push_notification', 0, -1, 'asc', function(err, jobsInQueue) {
            if (err) return done(err);

            expect(jobsInQueue).to.have.lengthOf(2); // Should have 2 jobs

            jobsInQueue.forEach(job => {
                // Check job creation log
                expect(logSpy.calledWith(`Notification job created: ${job.id}`)).to.be.true;

                // Simulate job events
                job.emit('complete');
                job.emit('failed', new Error('Test failure'));
                job.emit('progress', 50);

                // Check event logs
                expect(logSpy.calledWith(`Notification job ${job.id} completed`)).to.be.true;
                expect(logSpy.calledWith(`Notification job ${job.id} failed: Error: Test failure`)).to.be.true;
                expect(logSpy.calledWith(`Notification job ${job.id} 50% complete`)).to.be.true;
            });

            done();
        });
    });
});