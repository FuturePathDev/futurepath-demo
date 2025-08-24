// src/api/Resources.js
import { apiFetch } from "./base.js";

// Search/list resources (no freeOnly)
export async function searchResources(params = {}) {
  const qs = new URLSearchParams();

  if (params.query) qs.set("query", params.query);
  if (params.audience) qs.set("audience", String(params.audience));
  if (params.grades) qs.set("grades", String(params.grades));
  if (params.clusters) qs.set("clusters", String(params.clusters));
  if (params.riaSec) qs.set("riaSec", String(params.riaSec));
  if (params.formats) qs.set("formats", String(params.formats));
  if (params.nextToken) qs.set("nextToken", params.nextToken);
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));

  const url = `/resources${qs.toString() ? `?${qs.toString()}` : ""}`;
  return apiFetch(url); // { items, nextToken }
}

export async function getResource(id) {
  return apiFetch(`/resources/${encodeURIComponent(id)}`);
}

// Bookmarks
export async function listBookmarks() {
  return apiFetch(`/bookmarks`);
}

export async function addBookmark(resourceId) {
  return apiFetch(`/bookmarks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resourceId }),
  });
}

export async function removeBookmark(resourceId) {
  return apiFetch(`/bookmarks/${encodeURIComponent(resourceId)}`, {
    method: "DELETE",
  });
}
