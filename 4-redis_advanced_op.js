import redis from 'redis';
import { promisify } from 'util';

// defining the connection, port and host
const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379
});

// Handle connection events
client.on('connect', () => {
    console.log('Redis client connected to the server');
});

// error message if not logged
client.on('error', (error) => {
    console.error('Redis client not connected to the server:', error);
});

// setNewSchool set a value to a key
function hashNewSchool(schoolName, value) {
    const hashKey = 'HolbertonSchools';
    const fields = {
        'Portland': 50,
        'Seattle': 80,
        'New York': 20,
        'Bogota': 20,
        'Cali':40,
        'Paris': 2,
    }
    for (const [field, value] of Object.entries(fields)) {
        client.hset(hashKey, field, value, redis.print);
    }
}

function displaySchoolValue() {
    const hashKey = "HolbertonSchools";

    client.hgetall(hashKey, (err,reply) => {
        console.log(reply);
    })
}

hashNewSchool();
displaySchoolValue();