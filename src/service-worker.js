import { reconcileWindowGroups } from "./group-tabs.js";

let operationInProgress = false;

async function showResult(result) {
  await chrome.action.setBadgeBackgroundColor({ color: "#2e7d32" });
  await chrome.action.setBadgeText({ text: "✓" });
  await chrome.action.setTitle({
    title: `Grouped ${result.groupedTabs} tabs into ${result.groups} domain group${result.groups === 1 ? "" : "s"}`
  });

  setTimeout(async () => {
    await chrome.action.setBadgeText({ text: "" });
    await chrome.action.setTitle({ title: "Group tabs by domain" });
  }, 1800);
}

async function showError(error) {
  console.error("Could not group tabs by domain:", error);
  await chrome.action.setBadgeBackgroundColor({ color: "#b3261e" });
  await chrome.action.setBadgeText({ text: "!" });
  await chrome.action.setTitle({ title: "Could not group tabs by domain" });
}

async function groupCurrentWindow(tab) {
  if (operationInProgress) return;
  operationInProgress = true;

  try {
    const windowId = tab?.windowId ?? (await chrome.windows.getCurrent()).id;
    const result = await reconcileWindowGroups(chrome, windowId);
    await showResult(result);
  } catch (error) {
    await showError(error);
  } finally {
    operationInProgress = false;
  }
}

chrome.action.onClicked.addListener(groupCurrentWindow);

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "group-tabs-by-domain") {
    await groupCurrentWindow();
  }
});
