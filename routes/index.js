const router = require('express').Router();
const apiRoutes = require('./api/routing_app.js');

router.use('/api', apiRoutes);

module.exports = router;