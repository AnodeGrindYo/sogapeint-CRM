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
const chatRoutes = require('./chatRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/contracts', contractRoutes);
router.use('/files', fileRoutes);
router.use('/benefits', benefitRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/scrape', scraperRoutes);
router.use('/kpi', kpiRoutes);
// router.use('/chat', chatRoutes);

// affiche la liste des routes en console
// router.stack.forEach(function(r){
//     console.log(r)
//     if (r.route && r.route.path){
//       console.log(r.route.path)
//     }
//   })


module.exports = router;
