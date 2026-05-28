// storage.js
// Helpers simples para persistencia local. Usar la misma API cuando se reemplace por adaptador API.

export function loadFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error("loadFromStorage error", key, e);
    return fallback;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("saveToStorage error", key, e);
  }
}

export function clearStorage() {
  const keys = ["ingresos", "compromisos", "ordenesPago", "pucReferencias", "permisosAdministrativo", "auditLogs", "role", "darkMode", "coordinadorPassword"];
  keys.forEach(k => localStorage.removeItem(k));
}
