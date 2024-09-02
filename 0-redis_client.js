import { createClient } from 'redis';

const client = createClient({
    host: '127.0.0.1',
    port: 6379
});

// Handle connection events
client.on('connect', () => {
    console.log('Redis client connected to the server');
});

client.on('error', (error) => {
    console.error('Redis client not connected to the server:', error);
});