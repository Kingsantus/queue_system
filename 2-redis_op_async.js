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
function setNewSchool(schoolName, value) {
    client.set(schoolName, value, redis.print);
}

// importing promisify to convert a function to async/await
const displayAsync = promisify(client.get).bind(client);

async function displaySchoolValue(schoolName) {
    try {
        const value = await displayAsync(schoolName);
        console.log(value);
    } catch (err) {
        console.error("Error from get:", err);
    }
}


displaySchoolValue('Holberton');
setNewSchool('HolbertonSanFrancisco', '100');
displaySchoolValue('HolbertonSanFrancisco');