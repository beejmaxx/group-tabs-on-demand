import { groupTitleForDomain, tabsByDomain } from "./domain.js";

const NO_GROUP = -1;
const GROUP_COLORS = [
  "blue",
  "red",
  "yellow",
  "green",
  "pink",
  "purple",
  "cyan",
  "orange"
];

function colorForDomain(domain) {
  let hash = 0;
  for (const character of domain) {
    hash = (hash * 31 + character.codePointAt(0)) >>> 0;
  }
  return GROUP_COLORS[hash % GROUP_COLORS.length];
}

/**
 * Reconcile one window so every resulting group contains exactly one domain.
 * Existing groups are deliberately removed first: the extension treats
 * domain grouping as the source of truth and therefore repairs mixed or stale
 * groups rather than trying to guess their intent.
 */
export async function reconcileWindowGroups(chromeApi, windowId) {
  const tabs = await chromeApi.tabs.query({ windowId });
  const groupedTabIds = tabs
    .filter((tab) => !tab.pinned && tab.groupId !== NO_GROUP)
    .map((tab) => tab.id)
    .filter((id) => typeof id === "number");

  if (groupedTabIds.length > 0) {
    await chromeApi.tabs.ungroup(groupedTabIds);
  }

  const domains = tabsByDomain(tabs);
  const groupableDomains = [...domains.entries()]
    .filter(([, domainTabs]) => domainTabs.length >= 2)
    .sort(([, leftTabs], [, rightTabs]) => leftTabs[0].index - rightTabs[0].index);

  let groupedTabs = 0;
  for (const [domain, domainTabs] of groupableDomains) {
    const tabIds = domainTabs.map((tab) => tab.id);
    const groupId = await chromeApi.tabs.group({ tabIds });

    await chromeApi.tabGroups.update(groupId, {
      title: groupTitleForDomain(domain),
      color: colorForDomain(domain),
      collapsed: false
    });
    groupedTabs += tabIds.length;
  }

  return {
    groups: groupableDomains.length,
    groupedTabs,
    ungroupedTabs: tabs.length - groupedTabs
  };
}
