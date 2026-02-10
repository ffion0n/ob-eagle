const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "svg",
  "avif",
  "heic",
  "heif"
]);

function getServerPort() {
  const raw = localStorage.getItem("eagleBridgePort") || "6060";
  const port = parseInt(raw, 10);
  if (!Number.isFinite(port) || port < 1 || port > 65535) return 6060;
  return port;
}

function normalizeExt(ext) {
  return String(ext || "").replace(/^\./, "").toLowerCase();
}

function buildDisplayName(item) {
  const name = String(item && item.name ? item.name : "").trim();
  const ext = normalizeExt(item && item.ext ? item.ext : "");
  if (!name) return item && item.id ? `${item.id}.info` : "eagle-item.info";
  if (ext && !name.toLowerCase().endsWith(`.${ext}`)) return `${name}.${ext}`;
  return name;
}

function buildMarkdown(item, port) {
  const id = String(item && item.id ? item.id : "").trim();
  if (!id) return "";
  const link = `http://localhost:${port}/images/${id}.info`;
  const text = buildDisplayName(item);
  const ext = normalizeExt(item && item.ext ? item.ext : "");
  if (IMAGE_EXTENSIONS.has(ext)) return `![${text}|500](${link})`;
  return `[${text}](${link})`;
}

async function writeToClipboard(text) {
  if (eagle.clipboard && typeof eagle.clipboard.writeText === "function") {
    await eagle.clipboard.writeText(text);
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  throw new Error("Clipboard API unavailable");
}

async function copyForSelection() {
  let selectedItems = [];
  try {
    selectedItems = await eagle.item.getSelected();
  } catch (error) {
    console.error("[copy-to-obsidian] getSelected failed", error);
    eagle.showNotification("Failed to get selected items", "error");
    return false;
  }

  if (!selectedItems || selectedItems.length === 0) {
    eagle.showNotification("Please select at least one item in Eagle", "warning");
    return false;
  }

  const port = getServerPort();
  const lines = selectedItems.map((item) => buildMarkdown(item, port)).filter(Boolean);
  if (lines.length === 0) {
    eagle.showNotification("No valid items to copy", "warning");
    return false;
  }

  try {
    await writeToClipboard(lines.join("\n"));
    eagle.showNotification(`Copied ${lines.length} Obsidian link(s)`, "success");
    return true;
  } catch (error) {
    console.error("[copy-to-obsidian] clipboard failed", error);
    eagle.showNotification("Copy failed. Check clipboard permission", "error");
    return false;
  }
}

async function hidePluginWindow() {
  try {
    if (eagle.window && typeof eagle.window.hide === "function") {
      await eagle.window.hide();
      return;
    }
  } catch (error) {
    console.warn("[copy-to-obsidian] eagle.window.hide failed", error);
  }

  try {
    if (typeof window.close === "function") {
      window.close();
    }
  } catch (error) {
    console.warn("[copy-to-obsidian] window.close failed", error);
  }
}

function hideWindowSoon() {
  void hidePluginWindow();
  setTimeout(() => {
    void hidePluginWindow();
  }, 30);
  setTimeout(() => {
    void hidePluginWindow();
  }, 120);
}

eagle.onPluginCreate(() => {
  console.log("[copy-to-obsidian] plugin created");
  hideWindowSoon();
});

eagle.onPluginShow(() => {
  hideWindowSoon();
});

eagle.onPluginRun(async () => {
  hideWindowSoon();
  await copyForSelection();
  hideWindowSoon();
});
