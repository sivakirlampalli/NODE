// routes/schoolRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /addSchool
router.post('/addSchool', (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  const sql = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, address, latitude, longitude], (err, result) => {
    if (err) return res.status(500).json({ error: 'DB insert failed' });
    res.json({ message: 'School added successfully', id: result.insertId });
  });
});

// GET /listSchools
router.get('/listSchools', (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  const sql = 'SELECT * FROM schools';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'DB fetch failed' });

    const withDistance = results.map((school) => {
      const distance = getDistance(userLat, userLon, school.latitude, school.longitude);
      return { ...school, distance };
    });

    withDistance.sort((a, b) => a.distance - b.distance);
    res.json(withDistance);
  });
});

// Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = router;
