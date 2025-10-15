const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dataController = require('./controllers/dataController');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Basic HTML interface
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
            <head><title>Cargo Hub Management</title></head>
            <body>
                <h1>Cargo Hub Management System</h1>
                <h2>API Endpoints:</h2>
                <ul>
                    <li>POST /api/fleet - Add new fleet</li>
                    <li>POST /api/driver - Add new driver</li>
                </ul>
            </body>
        </html>
    `);
});

// API Routes
app.post('/api/fleet', dataController.addFleet);
app.post('/api/driver', dataController.addDriver);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 3000;

// Start server with error handling
app.listen(PORT, '0.0.0.0', (error) => {
    if (error) {
        console.error('Error starting server:', error);
        return;
    }
    console.log(`Server running at http://localhost:${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});
