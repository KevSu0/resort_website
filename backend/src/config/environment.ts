import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config({ path: '../.env' });

// Environment schema validation
const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3001),
  HOST: z.string().default('localhost'),

  // Database
  DATABASE_URL: z.string().min(1),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  CORS_CREDENTIALS: z.string().transform(val => val === 'true').default(true),

  // Security
  JWT_SECRET: z.string().min(32).default('default-jwt-secret-change-in-production'),
  JWT_REFRESH_SECRET: z.string().min(32).default('default-jwt-refresh-secret-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().transform(Number).default(12),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'simple']).default('json'),
});

// Validate and export environment variables
export const env = environmentSchema.parse(process.env);

// Export database URL for Prisma
export const databaseUrl = env.DATABASE_URL;

// Export server configuration
export const serverConfig = {
  port: env.PORT,
  host: env.HOST,
  nodeEnv: env.NODE_ENV,
};

// Export CORS configuration
export const corsConfig = {
  origin: env.CORS_ORIGIN,
  credentials: env.CORS_CREDENTIALS,
};

// Export security configuration
export const securityConfig = {
  jwtSecret: env.JWT_SECRET,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  bcryptRounds: env.BCRYPT_ROUNDS,
};

// Export rate limiting configuration
export const rateLimitConfig = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
};

// Export logging configuration
export const loggingConfig = {
  level: env.LOG_LEVEL,
  format: env.LOG_FORMAT,
};