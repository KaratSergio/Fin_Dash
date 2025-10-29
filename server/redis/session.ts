import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import type { Express } from 'express';

export async function setupSession(app: Express) {
  // ---------------------------
  // Create Redis client
  // ---------------------------
  const redisClient = createClient({
    socket: {
      host: process.env['REDIS_HOST'] || 'localhost',
      port: Number(process.env['REDIS_PORT'] || 6379),
    },
  });

  // ---------------------------
  // Redis event logs
  // ---------------------------
  redisClient.on('connect', () => console.log('✅ Redis connected'));
  redisClient.on('ready', () => console.log('🔹 Redis ready'));
  redisClient.on('error', (err) => console.error('❌ Redis error:', err));
  redisClient.on('close', () => console.log('🔹 Redis connection closed'));
  redisClient.on('reconnecting', () => console.log('🔹 Redis reconnecting'));
  redisClient.on('end', () => console.log('🔹 Redis connection ended'));

  // ---------------------------
  // Connect to Redis
  // ---------------------------
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
    throw err;
  }

  // ---------------------------
  // Configure Express session
  // ---------------------------
  app.use(
    session({
      name: 'connect.sid',
      store: new RedisStore({ client: redisClient }),
      secret: process.env['SESSION_SECRET'] || 'supersecret',
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60, // 1 hour
      },
    }),
  );
}
