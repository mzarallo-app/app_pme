// Almacenamiento local (localStorage) usado como backend de la app en modo MVP,
// sin requerir un proyecto Firebase configurado. Cada función expone la misma
// forma que tendría un repositorio respaldado por Firestore, para poder
// reemplazar la implementación más adelante sin tocar la UI.

const PREFIX = 'app_pme_';

function readCollection<T>(name: string): T[] {
  try {
    const raw = localStorage.getItem(PREFIX + name);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeCollection<T>(name: string, items: T[]): void {
  localStorage.setItem(PREFIX + name, JSON.stringify(items));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function getAll<T>(collection: string): T[] {
  return readCollection<T>(collection);
}

export function getById<T extends { id: string }>(collection: string, id: string): T | undefined {
  return readCollection<T>(collection).find((item) => item.id === id);
}

export function upsert<T extends { id: string }>(collection: string, item: T): T {
  const items = readCollection<T>(collection);
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx >= 0) items[idx] = item;
  else items.push(item);
  writeCollection(collection, items);
  return item;
}

export function remove(collection: string, id: string): void {
  const items = readCollection<{ id: string }>(collection).filter((i) => i.id !== id);
  writeCollection(collection, items);
}

export function isSeeded(): boolean {
  return localStorage.getItem(PREFIX + 'seeded') === 'true';
}

export function markSeeded(): void {
  localStorage.setItem(PREFIX + 'seeded', 'true');
}

export function resetAll(): void {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}
