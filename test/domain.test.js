import assert from "node:assert/strict";
import test from "node:test";

import { domainForUrl, groupTitleForDomain, tabsByDomain } from "../src/domain.js";

test("groups subdomains by their registrable domain", () => {
  assert.equal(domainForUrl("https://docs.google.com/document/1"), "google.com");
  assert.equal(domainForUrl("https://mail.google.com/"), "google.com");
  assert.equal(domainForUrl("https://news.bbc.co.uk/story"), "bbc.co.uk");
});

test("respects private suffixes", () => {
  assert.equal(domainForUrl("https://alice.github.io/a"), "alice.github.io");
  assert.equal(domainForUrl("https://bob.github.io/b"), "bob.github.io");
});

test("uses the inspiration extension's short uppercase group titles", () => {
  assert.equal(groupTitleForDomain("google.com"), "GOOGLE");
  assert.equal(groupTitleForDomain("bbc.co.uk"), "BBC");
  assert.equal(groupTitleForDomain("alice.github.io"), "ALICE");
});

test("ignores browser pages, invalid URLs, and pinned tabs", () => {
  assert.equal(domainForUrl("chrome://settings"), null);
  assert.equal(domainForUrl("not a URL"), null);

  const grouped = tabsByDomain([
    { id: 1, url: "https://example.com", pinned: true },
    { id: 2, url: "https://example.com", pinned: false },
    { id: 3, url: "chrome://newtab", pinned: false }
  ]);

  assert.deepEqual([...grouped.keys()], ["example.com"]);
  assert.deepEqual(grouped.get("example.com").map((tab) => tab.id), [2]);
});
