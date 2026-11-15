/*
 * Two Weeks Out | browser-local worksheet autosave (v1)
 * Applies only to worksheets without their own persistence implementation.
 * Data stays in localStorage in this browser/origin.
 */
(function () {
  "use strict";
  var KEY = "two_autosave_v1:" + location.pathname.replace(/\/+$/, "").toLowerCase();
  var actions = [];
  var restoring = false;
  var saveTimer = null;
  var MAX_ACTIONS = 300;
  var controlSelector = 'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="hidden"]):not([type="password"]):not([type="file"]),textarea,select,[contenteditable="true"]';

  function controls() {
    return Array.prototype.filter.call(document.querySelectorAll(controlSelector), function (el) {
      return !el.closest("template");
    });
  }
  function signature(el, all) {
    if (el.id && document.querySelectorAll('[id="' + CSS.escape(el.id) + '"]').length === 1) return "id:" + el.id;
    if (el.name) {
      var matches = all.filter(function (x) { return x.name === el.name && x.tagName === el.tagName; });
      return "name:" + el.tagName + ":" + el.name + ":" + matches.indexOf(el);
    }
    return "index:" + all.indexOf(el);
  }
  function readFields() {
    var all = controls();
    return all.map(function (el) {
      return {
        key: signature(el, all),
        index: all.indexOf(el),
        tag: el.tagName,
        type: el.type || "",
        value: el.isContentEditable ? el.innerHTML : el.value,
        checked: !!el.checked
      };
    });
  }
  function persist() {
    if (restoring) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: 1, actions: actions, fields: readFields(), at: Date.now() }));
    } catch (err) {
      console.warn("Two Weeks Out: worksheet autosave unavailable", err);
    }
  }
  function scheduleSave() {
    if (restoring) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persist, 80);
  }
  function findField(record) {
    var all = controls();
    var found = all.find(function (el) { return signature(el, all) === record.key; });
    if (!found && all[record.index] && all[record.index].tagName === record.tag) found = all[record.index];
    return found || null;
  }
  function setFields(fields) {
    // First assign every value, then emit events so worksheet calculations update.
    fields.forEach(function (record) {
      var el = findField(record);
      if (!el) return;
      if (el.isContentEditable) el.innerHTML = record.value || "";
      else if (el.type === "checkbox" || el.type === "radio") el.checked = !!record.checked;
      else el.value = record.value == null ? "" : record.value;
    });
    fields.forEach(function (record) {
      var el = findField(record);
      if (!el) return;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
  function buttonRecord(button) {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));
    var inline = button.getAttribute("onclick") || "";
    var same = buttons.filter(function (b) { return (b.getAttribute("onclick") || "") === inline; });
    return {
      onclick: inline,
      ordinal: same.indexOf(button),
      index: buttons.indexOf(button),
      id: button.id || ""
    };
  }
  function findButton(record) {
    if (record.id) {
      var byId = document.getElementById(record.id);
      if (byId && byId.tagName === "BUTTON") return byId;
    }
    var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));
    if (record.onclick) {
      var matches = buttons.filter(function (b) { return (b.getAttribute("onclick") || "") === record.onclick; });
      if (matches[record.ordinal]) return matches[record.ordinal];
    }
    return buttons[record.index] || null;
  }
  function isStructureAction(button) {
    var inline = button.getAttribute("onclick") || "";
    var caption = (button.textContent || "").trim();
    return /\b(add|remove|delete)(?:[A-Z_]|\w*)\s*\(/i.test(inline) ||
      /^\s*(add|remove|delete)\b/i.test(caption);
  }
  function isResetAction(button) {
    var inline = button.getAttribute("onclick") || "";
    var caption = (button.textContent || "").trim();
    return /\b(clearAll|resetAll|clearAmounts|resetAllFields)\s*\(/i.test(inline) ||
      /^\s*(clear all|reset all|start over)\b/i.test(caption);
  }
  function restore() {
    var saved;
    try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); }
    catch (err) { console.warn("Two Weeks Out: invalid autosave", err); return; }
    if (!saved || saved.v !== 1 || !Array.isArray(saved.fields)) return;

    restoring = true;
    try {
      actions = Array.isArray(saved.actions) ? saved.actions.slice(0, MAX_ACTIONS) : [];
      actions.forEach(function (record) {
        var button = findButton(record);
        if (button) button.click();
      });
      setFields(saved.fields);
      // Rerendering a dynamic worksheet may replace elements during input events.
      // A second pass restores controls recreated during that process.
      setFields(saved.fields);
    } catch (err) {
      console.warn("Two Weeks Out: could not fully restore worksheet", err);
    } finally {
      restoring = false;
    }
  }
  document.addEventListener("input", scheduleSave);
  document.addEventListener("change", scheduleSave);
  document.addEventListener("click", function (e) {
    if (restoring) return;
    var button = e.target.closest && e.target.closest("button");
    if (button && (isResetAction(button) || isStructureAction(button))) {
      var wasReset = isResetAction(button);
      var before = JSON.stringify(readFields());
      var record = buttonRecord(button);
      // Capture after the worksheet handler. A canceled confirmation should
      // not erase saved history or replay an operation that never happened.
      setTimeout(function () {
        var changed = JSON.stringify(readFields()) !== before;
        if (changed && wasReset) actions = [];
        else if (changed && !wasReset && actions.length < MAX_ACTIONS) actions.push(record);
        scheduleSave();
      }, 0);
    } else {
      scheduleSave();
    }
  }, true);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", restore);
  else setTimeout(restore, 0);
})();
