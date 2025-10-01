import { Router } from 'express';
import { healthCheck, readinessCheck, livenessCheck } from '@/controllers/healthController.js';

const router = Router();

/**
 * @route GET /health
 * @desc Comprehensive health check including database status
 * @access Public
 */
router.get('/', healthCheck);

/**
 * @route GET /health/ready
 * @desc Readiness probe - service is ready to accept requests
 * @access Public
 */
router.get('/ready', readinessCheck);

/**
 * @route GET /health/live
 * @desc Liveness probe - service is alive
 * @access Public
 */
router.get('/live', livenessCheck);

export default router;