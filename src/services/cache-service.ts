import { cache } from 'react';


interface CacheOptions {
  ttl?: number; 
  tags?: string[];
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>>;
  private tagMap: Map<string, Set<string>>;

  private constructor() {
    this.cache = new Map();
    this.tagMap = new Map();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = 3600, tags = [] } = options;
    const timestamp = Date.now() + (ttl * 1000);

    this.cache.set(key, { data, timestamp });


    tags.forEach(tag => {
      if (!this.tagMap.has(tag)) {
        this.tagMap.set(tag, new Set());
      }
      this.tagMap.get(tag)?.add(key);
    });
  }

  public get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  public invalidateByTag(tag: string): void {
    const keys = this.tagMap.get(tag);
    if (keys) {
      keys.forEach(key => this.cache.delete(key));
      this.tagMap.delete(tag);
    }
  }

  public invalidateByKey(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
    this.tagMap.clear();
  }
}

export const cacheService = CacheService.getInstance();

export const getCachedData = cache(async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> => {
  const cached = cacheService.get<T>(key);
  if (cached) return cached;

  const data = await fetchFn();
  cacheService.set(key, data, options);
  return data;
}); 