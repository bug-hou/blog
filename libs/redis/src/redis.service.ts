import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject("REDIS_CLIENT")
  private readonly redisClient: RedisClientType;

  async sGet<T extends any>(key: string): Promise<T> {
    // this.redisClient.setEx(key, 60, "1")
    return await this.redisClient.get(key) as T;
  }

  async sSet(key: string, value: string, ttl?: number) {
    await this.redisClient.set(key, value);
    console.log(ttl);
    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
    return true;
  }

  async sDel(key: string) {
    return await this.redisClient.del(key);
  }

  async sKeys(pattern: string) {
    return await this.redisClient.keys(pattern);
  }

  async jsonGet(key: string) {
    const value = await this.sGet(key);
    let res = value;
    if (typeof value === "string") {
      try {
        res = JSON.parse(value);
      } catch (error) {
        res = value;
      }
    }
    return res;
  }

  async jsonSet(key: string, value: any = [], ttl?: number) {
    await this.sSet(key, JSON.stringify(value), ttl);
    return true;
  }

  async setSet(key: string, value: string) {
    return await this.redisClient.sAdd(key, value)
  }
}
