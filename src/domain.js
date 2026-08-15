import { getDomain, getDomainWithoutSuffix } from "tldts";

const GROUPABLE_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Return the registrable domain used to group a tab.
 *
 * Private suffixes are enabled so independently owned sites such as
 * project.github.io do not get combined into one giant github.io group.
 */
export function domainForUrl(rawUrl) {
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    if (!GROUPABLE_PROTOCOLS.has(url.protocol)) return null;

    const hostname = url.hostname.toLocaleLowerCase();
    return getDomain(hostname, { allowPrivateDomains: true }) ?? hostname;
  } catch {
    return null;
  }
}

/** Match the inspiration extension's short, uppercase group labels. */
export function groupTitleForDomain(domain) {
  const name = getDomainWithoutSuffix(domain, { allowPrivateDomains: true });
  return (name ?? domain.split(".")[0]).toLocaleUpperCase();
}

export function tabsByDomain(tabs) {
  const domains = new Map();

  for (const tab of tabs) {
    if (tab.pinned || typeof tab.id !== "number") continue;

    const domain = domainForUrl(tab.url);
    if (!domain) continue;

    const domainTabs = domains.get(domain) ?? [];
    domainTabs.push(tab);
    domains.set(domain, domainTabs);
  }

  return domains;
}
