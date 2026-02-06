const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store active connections
let activeClient = null;
let server = null;

// Validate MongoDB URI format
function isValidMongoUri(uri) {
    return typeof uri === 'string' &&
        uri.length <= 2048 &&
        /^mongodb(\+srv)?:\/\/.+/.test(uri);
}

// Validate ObjectId format
function isValidObjectId(id) {
    return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test MongoDB connection
app.post('/api/connect', async (req, res) => {
    const { uri } = req.body;

    if (!uri) {
        return res.status(400).json({ error: 'MongoDB URI is required' });
    }

    if (!isValidMongoUri(uri)) {
        return res.status(400).json({ error: 'Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://' });
    }

    try {
        // Close existing connection if any
        if (activeClient) {
            await activeClient.close();
        }

        // Create new connection
        const client = new MongoClient(uri);
        await client.connect();

        // Test the connection
        await client.db().admin().ping();

        activeClient = client;

        res.json({ success: true, message: 'Connected to MongoDB successfully' });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({
            error: 'Failed to connect to MongoDB',
            details: error.message
        });
    }
});

// Get dashboards data
app.get('/api/dashboards', async (req, res) => {
    if (!activeClient) {
        return res.status(400).json({ error: 'Not connected to database. Please connect first.' });
    }

    try {
        const db = activeClient.db();
        const dashboards = await db.collection('dashboards').find({}).toArray();

        res.json({
            success: true,
            count: dashboards.length,
            dashboards: dashboards
        });
    } catch (error) {
        console.error('Error fetching dashboards:', error);
        res.status(500).json({
            error: 'Failed to fetch dashboards',
            details: error.message
        });
    }
});

// Update dashboard
app.put('/api/dashboards/:id', async (req, res) => {
    if (!activeClient) {
        return res.status(400).json({ error: 'Not connected to database. Please connect first.' });
    }

    const { id } = req.params;
    const { guildID, url, port } = req.body;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid dashboard ID format' });
    }

    if (!guildID || !url || !port) {
        return res.status(400).json({ error: 'guildID, url, and port are required' });
    }

    // Validate field types
    if (typeof guildID !== 'string' || typeof url !== 'string') {
        return res.status(400).json({ error: 'guildID and url must be strings' });
    }

    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        return res.status(400).json({ error: 'port must be a valid port number (1-65535)' });
    }

    try {
        const db = activeClient.db();
        const result = await db.collection('dashboards').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    guildID: guildID,
                    url: url,
                    port: portNum
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Dashboard not found' });
        }

        res.json({
            success: true,
            message: 'Dashboard updated successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error updating dashboard:', error);
        res.status(500).json({
            error: 'Failed to update dashboard',
            details: error.message
        });
    }
});

// Disconnect
app.post('/api/disconnect', async (req, res) => {
    if (activeClient) {
        await activeClient.close();
        activeClient = null;
    }
    res.json({ success: true, message: 'Disconnected from MongoDB' });
});

server = app.listen(PORT, () => {
    console.log(`Plexdev - Patcher server running on http://localhost:${PORT}`);
});

// Graceful shutdown: close both HTTP server and DB client
const shutdown = async (signal) => {
    console.log(`${signal} received. Closing server gracefully...`);
    if (server) {
        server.close(() => {
            console.log('HTTP server closed.');
        });
    }
    if (activeClient) {
        await activeClient.close();
    }
    process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
