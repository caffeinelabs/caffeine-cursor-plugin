#!/usr/bin/env node

/**
 * Structure check for this marketplace.
 *
 * Verifies the marketplace manifest, each plugin manifest it points at, the
 * frontmatter every component type requires, and any MCP server config.
 * Exits non-zero on the first set of errors found.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const errors = [];
const warnings = [];

const NAME_PATTERN = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const MARKETPLACE_NAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const MARKDOWN_EXTENSIONS = new Set([".md", ".mdc", ".markdown"]);

/** Component directories and the frontmatter keys each one requires. */
const COMPONENTS = [
  { dir: "rules", label: "rule", required: ["description"] },
  { dir: "commands", label: "command", required: ["name", "description"] },
  { dir: "agents", label: "agent", required: ["name", "description"] },
];

const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function isDirectory(target) {
  try {
    return (await fs.stat(target)).isDirectory();
  } catch {
    return false;
  }
}

async function readJson(filePath, label) {
  let raw;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    fail(`${label} is missing: ${path.relative(repoRoot, filePath)}`);
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    fail(`${label} is not valid JSON (${path.relative(repoRoot, filePath)}): ${error.message}`);
    return null;
  }
}

/** Minimal `key: value` frontmatter reader — enough to check required keys exist. */
function parseFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) return null;

  const end = normalized.indexOf("\n---", 4);
  if (end === -1) return null;

  const fields = {};
  for (const line of normalized.slice(4, end).split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    fields[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return fields;
}

async function walk(dir) {
  const found = [];
  const stack = [dir];
  while (stack.length > 0) {
    for (const entry of await fs.readdir(stack.pop(), { withFileTypes: true })) {
      const full = path.join(entry.parentPath ?? entry.path, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) found.push(full);
    }
  }
  return found;
}

function isSafeRelativePath(value) {
  if (typeof value !== "string" || value.length === 0) return false;
  if (value.startsWith("http://") || value.startsWith("https://")) return true;
  if (path.isAbsolute(value)) return false;
  const normalized = path.posix.normalize(value.replace(/\\/g, "/"));
  return normalized !== ".." && !normalized.startsWith("../");
}

async function checkFrontmatter(filePath, label, required, plugin) {
  const relative = path.relative(repoRoot, filePath);
  const parsed = parseFrontmatter(await fs.readFile(filePath, "utf8"));

  if (!parsed) {
    fail(`${plugin}: ${label} is missing YAML frontmatter: ${relative}`);
    return;
  }

  for (const key of required) {
    if (!parsed[key]) {
      fail(`${plugin}: ${label} is missing "${key}" in frontmatter: ${relative}`);
    }
  }
}

async function checkComponents(pluginDir, plugin) {
  for (const { dir, label, required } of COMPONENTS) {
    const componentDir = path.join(pluginDir, dir);
    if (!(await exists(componentDir))) continue;

    for (const file of await walk(componentDir)) {
      if (MARKDOWN_EXTENSIONS.has(path.extname(file).toLowerCase())) {
        await checkFrontmatter(file, label, required, plugin);
      }
    }
  }

  const skillsDir = path.join(pluginDir, "skills");
  if (await exists(skillsDir)) {
    const skillFiles = (await walk(skillsDir)).filter(
      (file) => path.basename(file) === "SKILL.md",
    );

    if (skillFiles.length === 0) {
      fail(`${plugin}: skills/ exists but contains no SKILL.md file.`);
    }

    for (const file of skillFiles) {
      await checkFrontmatter(file, "skill", ["name", "description"], plugin);
    }
  }
}

async function checkMcpConfig(pluginDir, plugin) {
  const mcpPath = path.join(pluginDir, "mcp.json");
  if (!(await exists(mcpPath))) {
    warn(`${plugin}: no mcp.json (only needed when the plugin ships an MCP server).`);
    return;
  }

  const config = await readJson(mcpPath, `${plugin} mcp.json`);
  if (!config) return;

  const servers = config.mcpServers;
  if (!servers || typeof servers !== "object" || Object.keys(servers).length === 0) {
    fail(`${plugin}: mcp.json must define a non-empty "mcpServers" object.`);
    return;
  }

  for (const [name, server] of Object.entries(servers)) {
    if (!server || typeof server !== "object") {
      fail(`${plugin}: mcp.json server "${name}" must be an object.`);
      continue;
    }

    const isRemote = server.type === "http" || server.type === "sse" || server.url;

    if (isRemote) {
      if (typeof server.url !== "string" || !/^https?:\/\//.test(server.url)) {
        fail(`${plugin}: mcp.json server "${name}" needs a "url" starting with http(s)://`);
      }
      if (server.url?.startsWith("http://")) {
        warn(`${plugin}: mcp.json server "${name}" uses plain http; prefer https.`);
      }
    } else if (typeof server.command !== "string" || server.command.length === 0) {
      fail(`${plugin}: mcp.json server "${name}" needs either a "url" or a "command".`);
    }
  }
}

async function checkManifestPaths(pluginDir, manifest, plugin) {
  const fields = ["logo", "rules", "skills", "agents", "commands", "hooks", "mcpServers"];

  for (const field of fields) {
    const value = manifest[field];
    const candidates =
      typeof value === "string"
        ? [value]
        : Array.isArray(value)
          ? value.filter((entry) => typeof entry === "string")
          : [];

    for (const candidate of candidates) {
      if (candidate.startsWith("http://") || candidate.startsWith("https://")) continue;

      if (!isSafeRelativePath(candidate)) {
        fail(`${plugin}: "${field}" path "${candidate}" must be relative and stay inside the plugin.`);
        continue;
      }

      if (!(await exists(path.resolve(pluginDir, candidate)))) {
        fail(`${plugin}: "${field}" references a missing path "${candidate}".`);
      }
    }
  }
}

async function main() {
  const marketplacePath = path.join(repoRoot, ".cursor-plugin", "marketplace.json");
  const marketplace = await readJson(marketplacePath, "Marketplace manifest");
  if (!marketplace) return summarize();

  if (typeof marketplace.name !== "string" || !MARKETPLACE_NAME_PATTERN.test(marketplace.name)) {
    fail('Marketplace "name" must be lowercase kebab-case.');
  }

  if (typeof marketplace.owner?.name !== "string" || !marketplace.owner.name) {
    fail('Marketplace "owner.name" is required.');
  }

  if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) {
    fail('Marketplace "plugins" must be a non-empty array.');
    return summarize();
  }

  const seen = new Set();

  for (const [index, entry] of marketplace.plugins.entries()) {
    const label = `plugins[${index}]`;

    if (!entry || typeof entry !== "object") {
      fail(`${label} must be an object.`);
      continue;
    }

    if (typeof entry.name !== "string" || !NAME_PATTERN.test(entry.name)) {
      fail(`${label}.name must be lowercase alphanumerics, hyphens, or periods.`);
      continue;
    }

    if (seen.has(entry.name)) fail(`Duplicate plugin name: "${entry.name}"`);
    seen.add(entry.name);

    if (!isSafeRelativePath(entry.source)) {
      fail(`${label}.source must be a safe relative path.`);
      continue;
    }

    const pluginDir = path.join(repoRoot, entry.source);
    if (!(await isDirectory(pluginDir))) {
      fail(`${label}.source directory is missing: ${entry.source}`);
      continue;
    }

    const manifest = await readJson(
      path.join(pluginDir, ".cursor-plugin", "plugin.json"),
      `${entry.name} plugin manifest`,
    );
    if (!manifest) continue;

    if (typeof manifest.name !== "string" || !NAME_PATTERN.test(manifest.name)) {
      fail(`${entry.name}: plugin.json "name" must be lowercase alphanumerics, hyphens, or periods.`);
    } else if (manifest.name !== entry.name) {
      fail(`${entry.name}: plugin.json name "${manifest.name}" does not match the marketplace entry.`);
    }

    for (const key of ["displayName", "version", "description"]) {
      if (typeof manifest[key] !== "string" || !manifest[key]) {
        fail(`${entry.name}: plugin.json is missing "${key}".`);
      }
    }

    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      warn(`${entry.name}: plugin.json "version" ("${manifest.version}") is not semver.`);
    }

    await checkManifestPaths(pluginDir, manifest, entry.name);
    await checkComponents(pluginDir, entry.name);
    await checkMcpConfig(pluginDir, entry.name);
  }

  summarize();
}

function summarize() {
  if (warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of warnings) console.log(`- ${warning}`);
    console.log("");
  }

  if (errors.length > 0) {
    console.error("Validation failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log("Validation passed.");
}

await main();
