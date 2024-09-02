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

const channel = 'holberton school channel';

client.subscribe(channel);

client.on('message', (channel, message) => {
    console.log(`${message}`);

    if (message === 'KILL_SERVER') {
        client.unsubscribe(channel, () => {
            client.quit();
        });
    }
});