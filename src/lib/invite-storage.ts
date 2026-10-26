import { INVITE_DISMISSED_STORAGE_KEY } from "./constants";

let cachedKey: string | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function getDismissedInviteKey(): string | null {
  if (typeof window === "undefined") return null;

  if (!initialized) {
    try {
      cachedKey = window.localStorage.getItem(INVITE_DISMISSED_STORAGE_KEY);
    } catch {
      cachedKey = null;
    }

    initialized = true;
  }

  return cachedKey;
}

export function setDismissedInviteKey(key: string): void {
  cachedKey = key;
  initialized = true;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(INVITE_DISMISSED_STORAGE_KEY, key);
    } catch {
      // Sem localStorage (modo privado/bloqueado): a dispensa vale só nesta aba.
    }
  }

  emit();
}

export function subscribeDismissedInvite(listener: () => void): () => void {
  listeners.add(listener);

  function handleStorage(event: StorageEvent) {
    if (event.key !== INVITE_DISMISSED_STORAGE_KEY) return;

    cachedKey = event.newValue;
    initialized = true;
    emit();
  }

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    listeners.delete(listener);

    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}
