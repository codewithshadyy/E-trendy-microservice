

const express = require('express');
const { checkConnection } = require('../config/db');
const env = require('../config/env');

const router = express.Router();


router.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'ok', service: env.serviceName });
});


router.get('/health/ready', async (req, res) => {
  try {
    await checkConnection();
    res.status(200).json({ status: 'ready', service: env.serviceName });
  } catch (err) {
    res.status(503).json({ status: 'not_ready', service: env.serviceName, error: err.message });
  }
});


router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: env.serviceName });
});

module.exports = router;