import express from 'express';
import redis from 'redis';



const listProducts = [
    {
        id: 1,
        name: 'Suitcase 250',
        price: 50,
        stock: 4
    },
    {
        id: 2,
        name: 'Suitcase 450',
        price: 100,
        stock: 10
    },
    {
        id: 3,
        name: 'Suitcase 650',
        price: 350,
        stock: 2
    },
    {
        id: 4,
        name: 'Suitcase 1050',
        price: 550,
        stock: 5
    }
];

function getItemById(id) {
    return listProducts.find(product => product.id === id) || null;
};

const app = express();

const PORT = 1245;

const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379
});

client.on('connect', () => {
    console.log('Redis client connected to the server');
});

client.on('error', (error) => {
    console.error('Redis client not connected to the server:', error);
});

function reserveStockById(itemId, stock) {
    const key = `item.${itemId}`;

    client.set(key, stock, redis.print);
};

async function getCurrentReservedStockById(itemId) {

    return new Promise((resolve, reject) => {
        client.get(`item.${itemId}`, (err, stock) => {
          if (err) {
            return reject(err);
          }
          resolve(stock ? parseInt(stock, 10) : 0);
        });
    });
};

app.get('/list_products', (req, res) => {
    res.json(listProducts);
});

app.get('/reserve_product/:itemId', (req, res) => {
    const itemId = parseInt(req.params.itemId, 10);

    if (isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid itemId' });
    }

    // Fetch the item
    const product = getItemById(itemId);

    if (!product) {
        return res.json({ status: 'Product not found' });
    }

    try {
        // Get the current reserved stock
        const reservedStock = getCurrentReservedStockById(itemId);

        // Check if there is enough stock
        const availableStock = product.stock - reservedStock;
        if (availableStock <= 0) {
            return res.json({
                status: 'Not enough stock available',
                itemId: itemId
            });
        }

        // Reserve one item
        reserveStockById(itemId, reservedStock + 1);

        // Confirm reservation
        return res.json({
            status: 'Reservation confirmed',
            itemId: itemId
        });

    } catch (error) {
        console.error('Error reserving product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.get('/list_products/:itemId', async (req, res) => {
    const itemId = parseInt(req.params.itemId, 10);

    if (isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid itemId' });
    }

    try {
        // Fetch product details
        const product = getItemById(itemId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Fetch reserved stock
        const reservedStock = await getCurrentReservedStockById(itemId);

        // Respond with product details and reserved stock
        res.json({
            itemId: product.id,
            itemName: product.name,
            price: product.price,
            initialAvailableQuantity: product.stock,
            currentQuantity: product.stock - reservedStock
        });
    } catch (error) {
        console.error('Error fetching product or stock:', error);
        res.status(500).json({ status: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log('Connected!');
});