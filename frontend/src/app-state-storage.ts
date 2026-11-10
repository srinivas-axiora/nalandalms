export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function readAppState<T>(storage: StorageLike, key: string, initial: T, allowPersistence: boolean): T {
  if (!allowPersistence) {
    storage.removeItem(key);
    return initial;
  }
  const serialized = storage.getItem(key);
  return serialized ? JSON.parse(serialized) as T : initial;
}

export function writeAppState<T>(storage: StorageLike, key: string, value: T, allowPersistence: boolean) {
  if (!allowPersistence) {
    storage.removeItem(key);
    return;
  }
  storage.setItem(key, JSON.stringify(value));
}
