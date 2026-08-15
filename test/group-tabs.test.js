import assert from "node:assert/strict";
import test from "node:test";

import { reconcileWindowGroups } from "../src/group-tabs.js";

test("removes mixed groups and rebuilds pure domain groups", async () => {
  const calls = [];
  let nextGroupId = 100;
  const tabs = [
    { id: 1, index: 0, windowId: 7, groupId: 10, pinned: false, url: "https://mail.google.com" },
    { id: 2, index: 1, windowId: 7, groupId: 10, pinned: false, url: "https://github.com/openai" },
    { id: 3, index: 2, windowId: 7, groupId: -1, pinned: false, url: "https://docs.google.com" },
    { id: 4, index: 3, windowId: 7, groupId: 20, pinned: false, url: "https://github.com/example" },
    { id: 5, index: 4, windowId: 7, groupId: 20, pinned: false, url: "https://example.com" },
    { id: 6, index: 5, windowId: 7, groupId: -1, pinned: false, url: "chrome://newtab" }
  ];

  const chromeApi = {
    tabs: {
      async query(query) {
        calls.push(["query", query]);
        return tabs;
      },
      async ungroup(tabIds) {
        calls.push(["ungroup", tabIds]);
      },
      async group(options) {
        calls.push(["group", options]);
        return nextGroupId++;
      }
    },
    tabGroups: {
      async update(groupId, options) {
        calls.push(["update", groupId, options]);
      }
    }
  };

  const result = await reconcileWindowGroups(chromeApi, 7);

  assert.deepEqual(calls[0], ["query", { windowId: 7 }]);
  assert.deepEqual(calls[1], ["ungroup", [1, 2, 4, 5]]);
  assert.deepEqual(calls[2], ["group", { tabIds: [1, 3] }]);
  assert.equal(calls[3][2].title, "GOOGLE");
  assert.deepEqual(calls[4], ["group", { tabIds: [2, 4] }]);
  assert.equal(calls[5][2].title, "GITHUB");
  assert.deepEqual(result, { groups: 2, groupedTabs: 4, ungroupedTabs: 2 });
});

test("leaves singleton domains ungrouped", async () => {
  let groupCalled = false;
  const chromeApi = {
    tabs: {
      async query() {
        return [{ id: 1, index: 0, groupId: 12, pinned: false, url: "https://example.com" }];
      },
      async ungroup(tabIds) {
        assert.deepEqual(tabIds, [1]);
      },
      async group() {
        groupCalled = true;
      }
    },
    tabGroups: { async update() {} }
  };

  const result = await reconcileWindowGroups(chromeApi, 1);
  assert.equal(groupCalled, false);
  assert.deepEqual(result, { groups: 0, groupedTabs: 0, ungroupedTabs: 1 });
});
