import { useEffect, useMemo } from 'react';

const randomId = () =>
  Array.from({ length: 5 })
    .map(() => Math.floor(Math.random() * 255).toString(16))
    .join('');

interface CacheEntry {
  state: 'loaded' | 'inflight' | 'errored';
  value: unknown;
  error: unknown;
  consumers: Set<string>;
  resolvers: Set<() => void>;
  rejectors: Set<(error: unknown) => void>;
}

interface CreateSuspenderOptions {
  loader: () => Promise<unknown>;
  consumerKey: string;
  loaderKey: string;
}

export function createPromiseSuspender() {
  const cache = new Map<string, CacheEntry>();

  function createSuspender({
    loader,
    consumerKey,
    loaderKey,
  }: CreateSuspenderOptions) {
    const existingEntry = cache.get(loaderKey);
    if (existingEntry?.state === 'loaded') return existingEntry.value;

    // make suspender
    if (existingEntry) {
      if (existingEntry.state === 'errored') throw existingEntry.error;

      throw new Promise<void>((resolve, reject) => {
        existingEntry.resolvers.add(resolve);
        existingEntry.rejectors.add(reject);
      });
    }

    throw new Promise<void>((resolve, reject) => {
      const newEntry: CacheEntry = {
        consumers: new Set(),
        rejectors: new Set(),
        resolvers: new Set(),
        state: 'inflight',
        value: null,
        error: null,
      };

      newEntry.resolvers.add(resolve);
      newEntry.rejectors.add(reject);
      newEntry.consumers.add(consumerKey);

      cache.set(loaderKey, newEntry);

      loader()
        .then((result) => {
          newEntry.state = 'loaded';
          newEntry.value = result;

          for (const resolver of newEntry.resolvers) {
            resolver();
          }
          for (const resolver of newEntry.resolvers) {
            newEntry.resolvers.delete(resolver);
          }
        })
        .catch((error) => {
          newEntry.state = 'errored';
          newEntry.error = error;

          for (const rejector of newEntry.rejectors) {
            rejector(error);
          }
          for (const rejector of newEntry.rejectors) {
            newEntry.rejectors.delete(rejector);
          }
        });
    });
  }

  function usePromise<T>(loader: () => Promise<T>, keys: string[]) {
    const loaderKey = keys.join('|');
    const consumerKey = useMemo(randomId, []);

    useEffect(() => {
      // report key is unused on clean up
      return () => {
        const entry = cache.get(loaderKey);
        if (!entry) return;

        entry.consumers.delete(consumerKey);
        if (entry.consumers.size) return;

        cache.delete(loaderKey);
      };
    }, [loaderKey, consumerKey]);

    return createSuspender({ consumerKey, loaderKey, loader });
  }

  return usePromise;
}
