"use strict";

function asPlainText(value, maxLength) {
  if (value == null) return "";
  const limit = maxLength || 500;
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, limit);
}

function asCount(value) {
  const n = typeof value === "number" ? value : Number(String(value == null ? "" : value).trim());
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > 10000) return 0;
  return n;
}

function safeImagePath(path) {
  if (typeof path !== "string") return "";
  const value = path.trim();
  if (!value || value.length > 240 || value.includes("..") || value.includes("\\")) return "";
  if (!/^assets\/(?:[A-Za-z0-9._-]+\/)+[A-Za-z0-9._ -]+\.(?:jpe?g|png|webp|gif)$/.test(value)) {
    return "";
  }
  return value;
}

function safeLink(url) {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 500 || /[\u0000-\u001F\u007F\\]/.test(trimmed)) return "";

  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    if (trimmed.startsWith("//") || trimmed.includes("..")) return "";
    if (!/^[A-Za-z0-9._~/-]+(?:#[A-Za-z][\w-]*)?$/.test(trimmed)) return "";
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return "";
    if (parsed.username || parsed.password) return "";
    return parsed.href;
  } catch (_) {
    return "";
  }
}

function elementByPageHash(hash) {
  if (typeof hash !== "string" || !/^#[A-Za-z][\w:-]*$/.test(hash)) return null;
  return document.getElementById(hash.slice(1));
}
