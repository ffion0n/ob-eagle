function getServerPort() {
  const raw = localStorage.getItem("eagleBridgePort") || "6060";
  const port = parseInt(raw, 10);
  if (!Number.isFinite(port) || port < 1 || port > 65535) return 6060;
  return port;
}

function normalizeHost(host) {
  const raw = String(host || "").trim();
  if (!raw) return "localhost";
  return raw.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

function getServerHost() {
  return normalizeHost(localStorage.getItem("eagleBridgeHost") || "localhost");
}

function buildImagebedUrl(item, host, port) {
  const id = String(item && item.id ? item.id : "").trim();
  if (!id) return "";
  return `http://${host}:${port}/images/${id}.info`;
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
    console.error("[copy-imagebed-link] getSelected failed", error);
    eagle.showNotification("获取选中项失败", "error");
    return false;
  }

  if (!selectedItems || selectedItems.length === 0) {
    eagle.showNotification("请先在 Eagle 里选中至少 1 个项目", "warning");
    return false;
  }

  const host = getServerHost();
  const port = getServerPort();
  const lines = selectedItems.map((item) => buildImagebedUrl(item, host, port)).filter(Boolean);
  if (lines.length === 0) {
    eagle.showNotification("没有可复制的有效项目", "warning");
    return false;
  }

  try {
    await writeToClipboard(lines.join("\n"));
    eagle.showNotification(`已复制 ${lines.length} 条图床链接`, "success");
    return true;
  } catch (error) {
    console.error("[copy-imagebed-link] clipboard failed", error);
    eagle.showNotification("复制失败：请检查剪贴板权限", "error");
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
    console.warn("[copy-imagebed-link] eagle.window.hide failed", error);
  }

  try {
    if (typeof window.close === "function") {
      window.close();
    }
  } catch (error) {
    console.warn("[copy-imagebed-link] window.close failed", error);
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
  console.log("[copy-imagebed-link] plugin created");
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

