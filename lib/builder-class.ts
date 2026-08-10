const CLASS_SETS = {
  ai: ["Agent Architect", "Model Mystic", "Prompt Pirate", "Neural Navigator", "AI Alchemist"],
  web3: ["Protocol Pirate", "Onchain Explorer", "Contract Craftsman", "Blockspace Bandit", "DeFi Diver"],
  aiWeb3: ["Onchain Intelligence", "Agent Architect", "Protocol Alchemist", "Autonomous Miner", "Model Maximalist"],
  design: ["Pixel Hacker", "Interface Fakir", "Design Systems Druid", "Visual Voyager", "Prototype Pirate"],
  frontend: ["Frontend Fakir", "Pixel Hacker", "Browser Bandit", "Component Captain", "CSS Cartographer"],
  backend: ["Backend Bandit", "API Alchemist", "Database Diver", "Server Shaman", "Queue Keeper"],
  security: ["Zero Knowledge Yapper", "Proof Pirate", "Security Surfer", "Cipher Craftsman", "Audit Alchemist"],
  mobile: ["Pocket Protocolist", "Native Nomad", "Touchscreen Tinkerer", "App Alchemist", "Mobile Maverick"],
  hardware: ["Circuit Surfer", "Hardware Hacker", "Sensor Shaman", "Firmware Fakir", "Silicon Shipwright"],
  data: ["Data Diver", "Vector Voyager", "Query Craftsman", "Pipeline Pirate", "Signal Scientist"],
  default: ["Ship Machine", "Full-Stack Nomad", "Terminal Dweller", "Builder Bandit", "Stack Surfer"],
} as const;

function hasAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

export function classCandidates(stack: string): readonly string[] {
  const value = stack.toLowerCase();
  const ai = hasAny(value, ["ai", "agent", "llm", "ml", "model", "prompt", "rag", "vision"]);
  const web3 = hasAny(value, ["web3", "solidity", "onchain", "crypto", "defi", "protocol", "blockchain", "zk"]);

  if (ai && web3) return CLASS_SETS.aiWeb3;
  if (hasAny(value, ["design", "figma", "ux", "ui", "visual", "brand"])) return CLASS_SETS.design;
  if (hasAny(value, ["security", "audit", "zero knowledge", "zk", "cryptography"])) return CLASS_SETS.security;
  if (ai) return CLASS_SETS.ai;
  if (web3) return CLASS_SETS.web3;
  if (hasAny(value, ["frontend", "react", "next", "vue", "svelte", "css"])) return CLASS_SETS.frontend;
  if (hasAny(value, ["backend", "api", "node", "go", "rust", "java", "server", "database"])) return CLASS_SETS.backend;
  if (hasAny(value, ["ios", "android", "mobile", "flutter", "react native"])) return CLASS_SETS.mobile;
  if (hasAny(value, ["hardware", "iot", "arduino", "robot", "firmware", "embedded"])) return CLASS_SETS.hardware;
  if (hasAny(value, ["data", "analytics", "postgres", "sql", "vector", "pipeline"])) return CLASS_SETS.data;
  return CLASS_SETS.default;
}

export function pickBuilderClass(stack: string, index = 0) {
  const candidates = classCandidates(stack);
  return candidates[index % candidates.length];
}

export function deterministicBuilderId(name: string) {
  const normalized = name.trim().toLowerCase() || "goa-builder";
  let hash = 2166136261;
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const number = 100 + ((hash >>> 0) % 900);
  return `HHG-26-${number}`;
}

export function safeFileSlug(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
  return slug || "builder-id";
}
