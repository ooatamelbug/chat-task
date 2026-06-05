import { Injectable } from '@nestjs/common';

@Injectable()
export class RateLimitService {
  private map = new Map<string, number[]>();

  isAllowed(key: string) {
    const now = Date.now();
    const window = 10000; // 10 sec

    const timestamps = this.map.get(key) || [];

    const filtered = timestamps.filter((t) => now - t < window);

    if (filtered.length >= 5) return false;

    filtered.push(now);
    this.map.set(key, filtered);

    return true;
  }
}
