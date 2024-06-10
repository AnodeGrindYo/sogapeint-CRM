const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const companyRoutes = require('./companyRoutes');
const contractRoutes = require('./contractRoutes');
const fileRoutes = require('./fileRoutes');
const benefitRoutes = require('./benefitRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const scraperRoutes = require('./scraperRoutes');
const kpiRoutes = require('./kpiRoutes');


router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/contracts', contractRoutes);
router.use('/files', fileRoutes);
router.use('/benefits', benefitRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/scrape', scraperRoutes);
router.use('/kpi', kpiRoutes);



module.exports = router;
