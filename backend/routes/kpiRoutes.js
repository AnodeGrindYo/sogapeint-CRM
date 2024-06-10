const express = require('express');
const router = express.Router();
const kpiController = require('../controllers/kpiController');

/**
 * @swagger
 * /totalOrders:
 *   get:
 *     summary: Retourne le nombre total de commandes
 *     description: Retourne le nombre total de commandes.
 *     tags: [KPI]
 *     responses:
 *       200:
 *         description: Nombre total de commandes
 *       500:
 *         description: Erreur serveur
 */
router.get('/totalOrders', kpiController.getTotalOrders);

/**
 * @swagger
 * /ordersByDate:
 *   get:
 *     summary: Retourne le nombre de commandes sur une période spécifique
 *     description: Calcule le nombre de commandes sur une période spécifique.
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début de la période
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Nombre de commandes sur la période donnée
 *       500:
 *         description: Erreur serveur
 */
router.get('/ordersByDate', kpiController.getOrdersByDate);

/**
 * @swagger
 * /activeOrders:
 *   get:
 *     summary: Retourne le nombre de commandes actives
 *     description: Calcule le nombre de commandes actives.
 *     tags: [KPI]
 *     responses:
 *       200:
 *         description: Nombre de commandes actives
 *       500:
 *         description: Erreur serveur
 */
router.get('/activeOrders', kpiController.getActiveOrders);

/**
 * @swagger
 * /activeOrdersByDate:
 *   get:
 *     summary: Retourne le nombre de commandes actives sur une période donnée
 *     description: Nombre de commandes actives sur une période donnée.
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début de la période
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Nombre de commandes actives sur la période donnée
 *       500:
 *         description: Erreur serveur
 */
router.get('/activeOrdersByDate', kpiController.getActiveOrdersByDate);

/**
 * @swagger
 * /inactiveOrders:
 *   get:
 *     summary: Retourne le nombre de commandes inactives
 *     description: Détermine le nombre de commandes inactives.
 *     tags: [KPI]
 *     responses:
 *       200:
 *         description: Nombre de commandes inactives
 *       500:
 *         description: Erreur serveur
 */
router.get('/inactiveOrders', kpiController.getInactiveOrders);

/**
 * @swagger
 * /inactiveOrdersByDate:
 *   get:
 *     summary: Retourne le nombre de commandes inactives sur une période spécifique
 *     description: Nombre de commandes inactives sur une période spécifique.
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début de la période
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Nombre de commandes inactives sur la période donnée
 *       500:
 *         description: Erreur serveur
 */
router.get('/inactiveOrdersByDate', kpiController.getInactiveOrdersByDate);

/**
 * @swagger
 * /completedOrders:
 *   get:
 *     summary: Retourne le nombre de commandes complétées
 *     description: Calcule le nombre de commandes complétées.
 *     tags: [KPI]
 *     responses:
 *       200:
 *         description: Nombre de commandes complétées
 *       500:
 *         description: Erreur serveur
 */
router.get('/completedOrders', kpiController.getCompletedOrders);

/**
 * @swagger
 * /completedOrdersByDate:
 *   get:
 *     summary: Retourne le nombre de commandes complétées sur une période donnée
 *     description: Nombre de commandes complétées sur une période donnée.
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début de la période
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Nombre de commandes complétées sur la période donnée
 *       500:
 *         description: Erreur serveur
 */
router.get('/completedOrdersByDate', kpiController.getCompletedOrdersByDate);

/**
 * @swagger
 * /averageExecutionTime:
 *   get:
 *     summary: Retourne la durée moyenne d'exécution des commandes sur une période donnée
 *     description: Moyenne du temps d'exécution des commandes sur une période spécifique.
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début de la période
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Durée moyenne d'exécution des commandes
 *       500:
 *         description: Erreur serveur
 */
router.get('/averageExecutionTime', kpiController.getAverageExecutionTime);

/**
 * @swagger
 * /totalRevenue:
 *   get:
 *     summary: Retourne le revenu total généré par les commandes dans une période donnée
 *     description: Revenu total généré par les commandes dans une période donnée.
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début de la période
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Revenu total généré par les commandes
 *       500:
 *         description: Erreur serveur
 */
router.get('/totalRevenue', kpiController.getTotalRevenue);

/**
 * @swagger
 * /averageRevenue:
 *   get:
 *     summary: Retourne le revenu moyen par commande sur une période spécifique
 *     description: Revenu moyen par commande sur une période spécifique.
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début de la période
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Revenu moyen par commande
 *       500:
 *         description: Erreur serveur
 */
router.get('/averageRevenue', kpiController.getAverageRevenue);

/**
 * @swagger
 * /ordersByService:
 *   get:
 *     summary: Retourne le nombre de commandes par service
 *     description: Nombre de commandes par service.
 *     tags: [KPI]
 *     responses:
 *       200:
 *         description: Nombre de commandes par service
 *       500:
 *         description: Erreur serveur
 */
router.get('/ordersByService', kpiController.getOrdersByService);

/**
 * @swagger
 * /ordersByServiceByDate:
 *   get:
 *     summary: Retourne le nombre de commandes par service sur une période donnée
 *     description: Commandes par service sur une période donnée.
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début de la période
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Nombre de commandes par service sur la période donnée
 *       500:
 *         description: Erreur serveur
 */
router.get('/ordersByServiceByDate', kpiController.getOrdersByServiceByDate);

/**
 * @swagger
 * /ordersWithIncidents:
 *   get:
 *     summary: Retourne le nombre de commandes avec incidents sur une période donnée
 *     description: Nombre de commandes avec incidents dans une période donnée.
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début de la période
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Nombre de commandes avec incidents
 *       500:
 *         description: Erreur serveur
 */
router.get('/ordersWithIncidents', kpiController.getOrdersWithIncidents);

/**
 * @swagger
 * /mailResponseRate:
 *   get:
 *     summary: Retourne le taux de réponse aux mails pour les commandes sur une période spécifique
 *     description: Taux de réponse aux mails pour les commandes sur une période spécifique.
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début de la période
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Taux de réponse aux mails
 *       500:
 *         description: Erreur serveur
 */
router.get('/mailResponseRate', kpiController.getMailResponseRate);

/**
 * @swagger
 * /contributorsEfficiency:
 *   get:
 *     summary: Évalue l'efficacité des contributeurs externes vs internes
 *     description: Évalue l'efficacité des contributeurs externes vs internes.
 *     tags: [KPI]
 *     responses:
 *       200:
 *         description: Efficacité des contributeurs
 *       500:
 *         description: Erreur serveur
 */
router.get('/contributorsEfficiency', kpiController.getContributorsEfficiency);

/**
 * @swagger
 * /occupationRate:
 *   get:
 *     summary: Calcule le pourcentage de commandes marquées comme occupées
 *     description: Calcule le pourcentage de commandes marquées comme occupées.
 *     tags: [KPI]
 *     responses:
 *       200:
 *         description: Taux d'occupation
 *       500:
 *         description: Erreur serveur
 */
router.get('/occupationRate', kpiController.getOccupationRate);

/**
 * @swagger
 * /averageBillingAmount:
 *   get:
 *     summary: Retourne le montant moyen des factures sur une période donnée
 *     description: Montant moyen des factures sur une période donnée.
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début de la période
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Montant moyen des factures
 *       500:
 *         description: Erreur serveur
 */
router.get('/averageBillingAmount', kpiController.getAverageBillingAmount);

/**
 * @swagger
 * /averageExternalContributorPaymentDelay:
 *   get:
 *     summary: Retourne le délai moyen de paiement pour les contributeurs externes
 *     description: Délai moyen de paiement pour les contributeurs externes.
 *     tags: [KPI]
 *     responses:
 *       200:
 *         description: Délai moyen de paiement
 *       500:
 *         description: Erreur serveur
 */
router.get('/averageExternalContributorPaymentDelay', kpiController.getAverageExternalContributorPaymentDelay);

/**
 * @swagger
 * /ordersStatusDistribution:
 *   get:
 *     summary: Retourne la distribution des statuts des commandes
 *     description: Distribution des statuts des commandes pour identifier les goulots d'étranglement.
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début de la période
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Distribution des statuts des commandes
 *       500:
 *         description: Erreur serveur
 */
router.get('/ordersStatusDistribution', kpiController.getOrdersStatusDistribution);

/**
 * @swagger
 * /customerRenewalRate:
 *   get:
 *     summary: Retourne le taux de renouvellement des clients
 *     description: Taux de renouvellement des clients, indiquant la fidélité clientèle.
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début de la période
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Taux de renouvellement des clients
 *       500:
 *         description: Erreur serveur
 */
router.get('/customerRenewalRate', kpiController.getCustomerRenewalRate);

/**
 * @swagger
 * /order-amount:
 *   get:
 *     summary: Retourne le nombre de commandes créées par un utilisateur entre deux dates
 *     description: Nombre de commandes créées par un utilisateur entre deux dates.
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début de la période
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Nombre de commandes créées par l'utilisateur
 *       500:
 *         description: Erreur serveur
 */
router.get('/order-amount', kpiController.getOrderAmount);

/**
 * @swagger
 * /order-amount-this-month:
 *   get:
 *     summary: Retourne le nombre de commandes pour le mois courant et le mois précédent
 *     description: Nombre de commandes pour le mois courant et le mois précédent.
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Nombre de commandes pour le mois courant et le mois précédent
 *       500:
 *         description: Erreur serveur
 */
router.get('/order-amount-this-month', kpiController.getOrderAmountThisMonth);

/**
 * @swagger
 * /average-order-amount:
 *   get:
 *     summary: Retourne le montant moyen des commandes sur la période donnée
 *     description: Montant moyen des commandes sur la période donnée.
 *     tags: [KPI]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *       - in: query
 *         name: dateStart
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début de la période
 *       - in: query
 *         name: dateEnd
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin de la période
 *     responses:
 *       200:
 *         description: Montant moyen des commandes sur la période donnée
 *       500:
 *         description: Erreur serveur
 */
router.get('/average-order-amount', kpiController.getAverageOrderAmount);

module.exports = router;
