const pool = require('../db');

// Add Fleet
exports.addFleet = async (req, res) => {
    const { vehicle_id, vehicle_type, model, capacity } = req.body;
    try {
        const check = await pool.query('SELECT 1 FROM vehicle_fleet WHERE vehicle_id = $1', [vehicle_id]);
        if (check.rowCount > 0) {
            return res.status(400).json({ error: 'Vehicle ID already exists in fleet' });
        }
        // Insert fleet data
        await pool.query(
            'INSERT INTO vehicle_fleet (vehicle_id, vehicle_type, model, capacity) VALUES ($1, $2, $3, $4)', 
            [vehicle_id, vehicle_type, model, capacity]
        );
        return res.status(201).json({ message: 'Fleet added successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error', details: err.message });
    }
};

// Add Driver
exports.addDriver = async (req, res) => {
    const { driver_id, name, license_number, contact } = req.body;
    try {
        const check = await pool.query('SELECT 1 FROM drivers WHERE driver_id = $1', [driver_id]);
        if (check.rowCount > 0) {
            return res.status(400).json({ error: 'Driver ID already exists' });
        }
        // Insert driver data
        await pool.query(
            'INSERT INTO drivers (driver_id, name, license_number, contact) VALUES ($1, $2, $3, $4)', 
            [driver_id, name, license_number, contact]
        );
        return res.status(201).json({ message: 'Driver added successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error', details: err.message });
    }
};