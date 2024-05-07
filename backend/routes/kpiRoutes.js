/**
 * Routes pour les fonctions suivantes:
 * 1. getTotalOrders - Retourne le nombre total de commandes.
 * 2. getOrdersByDate - Calcule le nombre de commandes sur une période spécifique.
 * 3. getActiveOrders - Compte le nombre de commandes actives.
 * 4. getActiveOrdersByDate - Nombre de commandes actives sur une période donnée.
 * 5. getInactiveOrders - Détermine le nombre de commandes inactives.
 * 6. getInactiveOrdersByDate - Nombre de commandes inactives sur une période spécifique.
 * 7. getCompletedOrders - Calcule le nombre de commandes complétées.
 * 8. getCompletedOrdersByDate - Nombre de commandes complétées sur une période donnée.
 * 9. getAverageExecutionTime - Moyenne du temps d'exécution des commandes sur une période spécifique.
 * 10. getTotalRevenue - Revenu total généré par les commandes dans une période donnée.
 * 11. getAverageRevenue - Revenu moyen par commande sur une période spécifique.
 * 12. getOrdersByService - Nombre de commandes par service.
 * 13. getOrdersByServiceByDate - Commandes par service sur une période donnée.
 * 14. getOrdersWithIncidents - Compte le nombre de commandes avec incidents dans une période donnée.
 * 15. getMailResponseRate - Taux de réponse aux mails pour les commandes sur une période spécifique.
 * 16. getContributorsEfficiency - Évalue l'efficacité des contributeurs externes vs internes.
 * 17. getOccupationRate - Calcule le pourcentage de commandes marquées comme occupées.
 * 18. getAverageBillingAmount - Montant moyen des factures sur une période donnée.
 * 19. getAverageExternalContributorPaymentDelay - Délai moyen de paiement pour les contributeurs externes.
 * 20. getOrdersStatusDistribution - Distribution des statuts des commandes pour identifier les goulots d'étranglement.
 * 21. getCustomerRenewalRate - Taux de renouvellement des clients, indiquant la fidélité clientèle.
 */
const express = require('express');
const router = express.Router();
const kpiController = require('../controllers/kpiController');

router.get('/totalOrders', kpiController.getTotalOrders);
router.get('/ordersByDate', kpiController.getOrdersByDate);
router.get('/activeOrders', kpiController.getActiveOrders);
router.get('/activeOrdersByDate', kpiController.getActiveOrdersByDate);
router.get('/inactiveOrders', kpiController.getInactiveOrders);
router.get('/inactiveOrdersByDate', kpiController.getInactiveOrdersByDate);
router.get('/completedOrders', kpiController.getCompletedOrders);
router.get('/completedOrdersByDate', kpiController.getCompletedOrdersByDate);
router.get('/averageExecutionTime', kpiController.getAverageExecutionTime);
router.get('/totalRevenue', kpiController.getTotalRevenue);
router.get('/averageRevenue', kpiController.getAverageRevenue);
router.get('/ordersByService', kpiController.getOrdersByService);
router.get('/ordersByServiceByDate', kpiController.getOrdersByServiceByDate);
router.get('/ordersWithIncidents', kpiController.getOrdersWithIncidents);
router.get('/mailResponseRate', kpiController.getMailResponseRate);
router.get('/contributorsEfficiency', kpiController.getContributorsEfficiency);
router.get('/occupationRate', kpiController.getOccupationRate);
router.get('/averageBillingAmount', kpiController.getAverageBillingAmount);
router.get('/averageExternalContributorPaymentDelay', kpiController.getAverageExternalContributorPaymentDelay);
router.get('/ordersStatusDistribution', kpiController.getOrdersStatusDistribution);
router.get('/customerRenewalRate', kpiController.getCustomerRenewalRate);
router.get('/order-amount', kpiController.getOrderAmount);
router.get('/order-amount-this-month', kpiController.getOrderAmountThisMonth);
router.get('/average-order-amount', kpiController.getAverageOrderAmount);
module.exports = router;