const {
  createHash,
  createPrivateKey,
  sign
} = require("node:crypto");

function normalizeDeviceId(value) {
  return String(value || "").replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 12);
}

function formatDeviceId(value) {
  const s = normalizeDeviceId(value);
  return [s.slice(0, 4), s.slice(4, 8), s.slice(8, 12)].join("-");
}

function parseLegacyKey(raw) {
  const key = String(raw || "").trim().toUpperCase().replace(/\s+/g, "");
  let m = key.match(/^SP-([A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4})-(\d{8})-([A-Z0-9]{10})$/);
  if (m) return { key, product: "PRO", device: m[1], expiry: m[2], sig: m[3], legacy: true };

  m = key.match(/^SF-(PRO|ACT|REG|OSV|NDS|ACQ)-([A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4})-(\d{8})-([A-Z0-9]{10})$/);
  if (m) return { key, product: m[1], device: m[2], expiry: m[3], sig: m[4], legacy: false };
  return null;
}

function ymdTodayUtc() {
  const d = new Date();
  return d.getUTCFullYear() + String(d.getUTCMonth() + 1).padStart(2, "0") + String(d.getUTCDate()).padStart(2, "0");
}

function legacyHash(key) {
  return createHash("sha256").update(key, "utf8").digest("hex");
}

function parseAllowlist(value) {
  return new Set(
    String(value || "")
      .split(/[\s,;]+/)
      .map(x => x.trim().toLowerCase())
      .filter(x => /^[a-f0-9]{64}$/.test(x))
  );
}

function expectedLegacySig(parsed, secret) {
  const dev = normalizeDeviceId(parsed.device);
  const payload = parsed.legacy
    ? dev + "|" + parsed.expiry + "|" + secret
    : dev + "|" + parsed.expiry + "|" + parsed.product + "|" + secret;
  return createHash("sha256").update(payload, "utf8").digest("hex").slice(0, 10).toUpperCase();
}

function b64url(buf) {
  return Buffer.from(buf).toString("base64url");
}

function signSf2(product, device, expiry, privateKeyPemB64) {
  const payload = JSON.stringify({
    v: 2,
    p: product,
    d: formatDeviceId(device),
    e: expiry
  });
  const payloadBytes = Buffer.from(payload, "utf8");
  const pem = Buffer.from(privateKeyPemB64, "base64").toString("utf8");
  const key = createPrivateKey(pem);
  const signature = sign(null, payloadBytes, key);
  return "SF2." + b64url(payloadBytes) + "." + b64url(signature);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const legacySecret = process.env.LEGACY_LICENSE_SECRET || "";
  const privateKeyPemB64 = process.env.LICENSE_PRIVATE_KEY_PEM_B64 || "";
  const allowlist = parseAllowlist(process.env.LEGACY_LICENSE_HASHES);

  if (!legacySecret || !privateKeyPemB64 || allowlist.size === 0) {
    return res.status(503).json({ error: "legacy_migration_not_configured" });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const parsed = parseLegacyKey(body.key);
  if (!parsed) return res.status(400).json({ error: "invalid_legacy_key" });

  const requestDevice = normalizeDeviceId(body.deviceId);
  const keyDevice = normalizeDeviceId(parsed.device);
  if (!requestDevice || requestDevice !== keyDevice) {
    return res.status(400).json({ error: "device_mismatch" });
  }

  if (parsed.expiry < ymdTodayUtc()) {
    return res.status(400).json({ error: "expired_legacy_key" });
  }

  const hash = legacyHash(parsed.key);
  if (!allowlist.has(hash)) {
    return res.status(403).json({ error: "legacy_key_not_allowlisted" });
  }

  if (parsed.sig !== expectedLegacySig(parsed, legacySecret)) {
    return res.status(403).json({ error: "invalid_legacy_signature" });
  }

  let license;
  try {
    license = signSf2(parsed.product, keyDevice, parsed.expiry, privateKeyPemB64);
  } catch {
    return res.status(503).json({ error: "license_signing_not_configured" });
  }

  return res.status(200).json({
    license,
    product: parsed.product,
    expiryYmd: parsed.expiry,
    migrated: true
  });
};
