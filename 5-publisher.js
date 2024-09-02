import redis from 'redis';

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



function publishMessage(message, time) {
    setTimeout(() => {
        console.log(`About to send ${message}`);
        client.publish('holberton school channel', message);
    }, time);

}

publishMessage("Holberton Student #1 starts course", 100);
publishMessage("Holberton Student #2 starts course", 200);
publishMessage("KILL_SERVER", 300);
publishMessage("Holberton Student #3 starts course", 400);