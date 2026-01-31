const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store active connections
let activeClient = null;

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
    
    if (!guildID || !url || !port) {
        return res.status(400).json({ error: 'guildID, url, and port are required' });
    }
    
    try {
        const db = activeClient.db();
        const result = await db.collection('dashboards').updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    guildID: guildID,
                    url: url,
                    port: port
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

app.listen(PORT, () => {
    console.log(`Plexdev - Patcher server running on http://localhost:${PORT}`);
});

// Cleanup on shutdown
const shutdown = async (signal) => {
    console.log(`${signal} received. Closing server gracefully...`);
    if (activeClient) {
        await activeClient.close();
    }
    process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
