import axios from "axios";

const OFFICE_EXTENSIONS = new Set([
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
]);

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

function openUrl(url) {
  if (!url) {
    return false;
  }

  window.open(url, "_blank", "noopener,noreferrer");

  return true;
}

/** Open a stored file path or URL in a new tab (local /storage or S3 signed URL). */
export function openFileUrl(path) {
  const url = resolveFileUrl(path);

  return openUrl(url);
}

/**
 * Fetch a fresh signed view/download URL then open it.
 * Office files use attachment disposition so desktop browsers download instead of Office Online 404.
 */
export async function openStoredFile(file) {
  if (!file) {
    return false;
  }

  const ext = (file.file_extension || "").toLowerCase();
  const disposition = OFFICE_EXTENSIONS.has(ext) ? "attachment" : "inline";

  if (file.id) {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/files/${file.id}/view-url`,
        { params: { disposition } },
      );

      if (openUrl(res.data?.url)) {
        return true;
      }
    } catch (error) {
      console.error("Failed to fetch file view URL.", error);
    }
  }

  return openFileUrl(file.path);
}
