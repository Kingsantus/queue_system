import { createClient } from 'redis';
import express from 'express';
import { promisify } from 'util';
import kue from 'kue';

const app = express();

const PORT = 1245;

const client = createClient({
    host: '127.0.0.1',
    port: 6379
});

const queue = kue.createQueue();

// Handle connection events
client.on('connect', () => {
    console.log('Redis client connected to the server');
});

client.on('error', (error) => {
    console.error('Redis client not connected to the server:', error);
});

function reserveSeat(number) {
    client.set('available_seats', number, (err, value) => {
        if (!err) {
            console.log(`Seat ${number} has been reserved`);
        }
    })
}

const displayAsync = promisify(client.get).bind(client);

async function getCurrentAvailableSeats() {
    try {
        const value = await displayAsync('available_seats');
        return parseInt(value, 10) || 0;
    } catch (err) {
        console.error("Error fetching availavle seats:", err);
    }
}

// Initialize available seats and reservationEnabled
let reservationEnabled = true;

async function initializeSeats() {
    reserveSeat(50);  // Set the number of available seats to 50

    const availableSeats = await getCurrentAvailableSeats();

    if (availableSeats <= 0) {
        reservationEnabled = false;
    }

    console.log(`Reservation enabled: ${reservationEnabled}`);
}

// Launch the application and initialize seats
initializeSeats();

app.get('/available_seats', async (req, res) => {
    let availableSeats = await getCurrentAvailableSeats();
    res.json({
        'numberOfAvailableSeat': availableSeats,
    });
});

app.get('/reserve_seat', async (req, res) => {
    if (!reservationEnabled) {
        return res.json({ "status": "Reservation are blocked" });
    }

    const job = queue.create('reserve_seat');
    job.on('completed', () => {
        console.log(`Seat reservation job ${job.id} completed`);
    }).on('failed', (err) => {
        console.log(`Seat reservation job ${job.id} failed: ${err.message}`);
    })
    job.save((err) => {
        if (err) {
            return res.json({ "status": "Reservation failed" });
        } else {
            return res.json({ "status": "Reservation in process" });
        }
    });
});

app.get('/process', async (req, res) => {
    queue.process('reserve_seat', async (job, done) => {
        let availableSeats = await getCurrentAvailableSeats();

        if (availableSeats <= 0) {
            reservationEnabled = false;
            return done(new Error('Not enough seats available'));
        }

        const newSeat = availableSeats - 1;

        await reserveSeat(newSeat);

        availableSeats = newSeat;

        if (newSeat === 0) {
            reservationEnabled = false;
        }

        done()
    });

    res.json({ "status": "Queue processing" })
})


app.listen(PORT, () => {
    console.log('Connected!');
});