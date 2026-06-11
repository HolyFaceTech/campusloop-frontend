export function resolveFileUrl(path) {
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "");

  if (path.startsWith("/")) {
    return `${base}${path}`;
  }

  return `${base}/storage/${path}`;
}

export function resolveStoragePath(filePath) {
  if (!filePath) {
    return "";
  }

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const base = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "");
  const normalized = filePath.startsWith("/storage/")
    ? filePath
    : `/storage/${filePath.replace(/^\/+/, "")}`;

  return `${base}${normalized}`;
}

/** Open a stored file path or URL in a new tab (local /storage or S3 signed URL). */
export function openFileUrl(path) {
  const url = resolveFileUrl(path);

  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
