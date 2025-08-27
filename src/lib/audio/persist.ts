import { createStore, get, set, del } from "idb-keyval";

const DB_NAME = "gaku-audio";
const STORE_NAME = "engine";
const store = createStore(DB_NAME, STORE_NAME);

export interface PersistedState<T> {
  version: number;
  savedAt: number; // epoch ms
  data: T;
}

export async function saveState<T>(key: string, data: T, version = 1) {
  const payload: PersistedState<T> = {
    version,
    savedAt: Date.now(),
    data,
  };
  await set(key, payload, store);
}

export async function loadState<T>(
  key: string,
  maxAgeMs: number,
  currentVersion = 1
): Promise<T | null> {
  try {
    const payload = (await get(key, store)) as PersistedState<T> | undefined;
    if (!payload) return null;
    if (payload.version !== currentVersion) return null;
    if (Date.now() - payload.savedAt > maxAgeMs) return null;
    return payload.data;
  } catch (_) {
    return null;
  }
}

export async function clearState(key: string) {
  await del(key, store);
}
