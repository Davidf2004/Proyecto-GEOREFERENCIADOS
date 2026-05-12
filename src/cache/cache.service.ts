import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';
import { envs } from 'src/config/envs';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private client?: ReturnType<typeof createClient>;

  async onModuleInit(): Promise<void> {
    if (!envs.REDIS_ENABLED) {
      this.logger.log('Redis cache disabled; using direct database reads.');
      return;
    }

    const client = createClient({
      socket: {
        host: envs.REDIS_HOST,
        port: envs.REDIS_PORT,
        connectTimeout: 3000,
        reconnectStrategy: false,
      },
    });

    client.on('error', (error) => {
      this.logger.warn(`Redis cache error: ${error.message}`);
    });

    try {
      await client.connect();
      this.client = client;
      this.logger.log(`Redis cache connected at ${envs.REDIS_HOST}:${envs.REDIS_PORT}`);
    } catch (error) {
      this.logger.warn(
        `Redis cache unavailable at startup; continuing without cache. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      await client.disconnect().catch(() => undefined);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.client?.isOpen) {
      return;
    }

    await this.client.quit().catch(() => undefined);
  }

  async getOrSet<T>(key: string, loader: () => Promise<T>, ttlSeconds = envs.REDIS_TTL_SECONDS): Promise<T> {
    const cachedValue = await this.get<T>(key);
    if (cachedValue !== null) {
      return cachedValue;
    }

    const freshValue = await loader();
    await this.set(key, freshValue, ttlSeconds);
    return freshValue;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client?.isOpen) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      this.logger.warn(`Redis get failed for key "${key}": ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = envs.REDIS_TTL_SECONDS): Promise<void> {
    if (!this.client?.isOpen) {
      return;
    }

    try {
      await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (error) {
      this.logger.warn(`Redis set failed for key "${key}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client?.isOpen) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.warn(
        `Redis delete failed for key "${key}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
