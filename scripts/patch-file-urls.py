import re
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "src"


def import_line_for(path: Path) -> str:
    rel = path.parent.relative_to(root)
    depth = len(rel.parts)
    prefix = "../" * depth
    return f"import {{ resolveFileUrl, resolveStoragePath }} from '{prefix}utils/fileUrl';"


replacements = [
    (
        r"`\$\{import\.meta\.env\.VITE_API_BASE_URL\.replace\(\"/api\", \"\"\)\}\$\{file\.path\}`",
        "`${resolveFileUrl(file.path)}`",
    ),
    (
        r"`\$\{baseUrl\}/storage/\$\{filePath\}`",
        "`${resolveStoragePath(filePath)}`",
    ),
    (
        r": `/storage/\$\{filePath\}`",
        ": resolveStoragePath(filePath)",
    ),
]

for path in root.rglob("*.jsx"):
    text = path.read_text(encoding="utf-8")
    original = text

    for pattern, repl in replacements:
        text = re.sub(pattern, repl, text)

    if ("resolveFileUrl" in text or "resolveStoragePath" in text) and "utils/fileUrl" not in original:
        imp = import_line_for(path)
        if imp not in text:
            matches = list(re.finditer(r"^import .+$", text, re.M))
            if matches:
                idx = matches[-1].end()
                text = text[:idx] + "\n" + imp + text[idx:]

    if text != original:
        path.write_text(text, encoding="utf-8")
        print(f"updated {path.relative_to(root)}")
