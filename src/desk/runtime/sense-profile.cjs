var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/sense/profile.ts
var profile_exports = {};
__export(profile_exports, {
  PROFILE_SCHEMA_VERSION: () => PROFILE_SCHEMA_VERSION,
  assertProfileShape: () => assertProfileShape,
  emptyProfile: () => emptyProfile
});
module.exports = __toCommonJS(profile_exports);
var PROFILE_SCHEMA_VERSION = 1;
function emptyProfile(date, seedKey = "local") {
  return {
    date,
    seedKey,
    keystrokes: 0,
    clicks: 0,
    mouseTravel: 0,
    idleSec: 0,
    activeSec: 0,
    focusSessions: [],
    windowSwitches: 0,
    activeHours: Array.from({ length: 24 }, () => 0)
  };
}
function assertProfileShape(p) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date)) {
    throw new Error(`Invalid date: ${p.date}`);
  }
  if (!Array.isArray(p.activeHours) || p.activeHours.length !== 24) {
    throw new Error("activeHours must be length 24");
  }
  for (const key of [
    "keystrokes",
    "clicks",
    "mouseTravel",
    "idleSec",
    "activeSec",
    "windowSwitches"
  ]) {
    if (typeof p[key] !== "number" || p[key] < 0 || Number.isNaN(p[key])) {
      throw new Error(`Invalid ${key}`);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PROFILE_SCHEMA_VERSION,
  assertProfileShape,
  emptyProfile
});
