import axios from "axios";

// Future client for the garden backend (nissim-smart-garden).
// VITE_GARDEN_API_URL may be unset. This module does not send requests.
// Do not attach the household JWT here: the base URL is another host.

export function normalizeGardenApiUrl(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\/+$/, "");
}

export function gardenApiBaseUrl() {
  return normalizeGardenApiUrl(import.meta.env.VITE_GARDEN_API_URL);
}

export function isGardenApiConfigured() {
  return gardenApiBaseUrl() !== "";
}

export function createGardenApi(baseURL = gardenApiBaseUrl()) {
  return axios.create({ baseURL });
}
