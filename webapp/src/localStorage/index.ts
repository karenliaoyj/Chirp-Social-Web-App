export interface Persister<T> {
  persist: (data: T) => void;
  revoke: () => void;
  retrieve: () => T | undefined;
}

export function JSONPersister<T>(
  key: PersisterKey,
  storage: Storage
): Persister<T> {
  return {
    persist: (data: T) => {
      storage.setItem(key, JSON.stringify(data));
    },
    revoke: () => {
      storage.removeItem(key);
    },
    retrieve: () => {
      const persistData = storage.getItem(key);
      return persistData && JSON.parse(persistData);
    },
  };
}

export enum PersisterKey {
  User = "user",
}
