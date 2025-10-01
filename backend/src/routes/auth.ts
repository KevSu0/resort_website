import { Router } from 'express';
import { z } from 'zod';
import { login, refreshToken, logout, getCurrentUser } from '../controllers/authController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  siteId: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

// Validation middleware
const validateLogin = (req: any, res: any, next: any) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid request data',
      });
    }
  }
};

const validateRefreshToken = (req: any, res: any, next: any) => {
  try {
    refreshTokenSchema.parse(req.body);
    next();
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid request data',
      });
    }
  }
};

const validateLogout = (req: any, res: any, next: any) => {
  try {
    logoutSchema.parse(req.body);
    next();
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid request data',
      });
    }
  }
};

// Rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const tokenRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 token refresh requests per windowMs
  message: {
    success: false,
    message: 'Too many token refresh attempts, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes

/**
 * @route POST /auth/login
 * @desc User login
 * @access Public
 */
router.post('/login', authRateLimit, validateLogin, login);

/**
 * @route POST /auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', tokenRateLimit, validateRefreshToken, refreshToken);

/**
 * @route POST /auth/logout
 * @desc User logout
 * @access Private
 */
router.post('/logout', authenticate, validateLogout, logout);

/**
 * @route GET /auth/me
 * @desc Get current user info
 * @access Private
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @route GET /auth/check
 * @desc Check if token is valid
 * @access Private
 */
router.get('/check', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: {
      userId: req.user?.userId,
      email: req.user?.email,
      role: req.user?.role,
      siteId: req.user?.siteId,
      brandId: req.user?.brandId,
    },
    session: {
      id: req.session?.id,
      expiresAt: req.session?.expiresAt,
    },
  });
});

/**
 * @route POST /auth/verify-email
 * @desc Verify email address (placeholder)
 * @access Public
 */
router.post('/verify-email', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Email verification not implemented yet',
    code: 'NOT_IMPLEMENTED',
  });
});

/**
 * @route POST /auth/forgot-password
 * @desc Request password reset (placeholder)
 * @access Public
 */
router.post('/forgot-password', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Password reset not implemented yet',
    code: 'NOT_IMPLEMENTED',
  });
});

/**
 * @route POST /auth/reset-password
 * @desc Reset password (placeholder)
 * @access Public
 */
router.post('/reset-password', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Password reset not implemented yet',
    code: 'NOT_IMPLEMENTED',
  });
});

/**
 * @route POST /auth/change-password
 * @desc Change password (placeholder)
 * @access Private
 */
router.post('/change-password', authenticate, (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Password change not implemented yet',
    code: 'NOT_IMPLEMENTED',
  });
});

export default router;