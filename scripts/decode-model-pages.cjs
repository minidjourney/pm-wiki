const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

function decode(relB64, relOut) {
  const root = path.join(__dirname, "..");
  const b64 = fs.readFileSync(path.join(root, relB64), "utf8").trim();
  const out = path.join(root, relOut);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, zlib.gunzipSync(Buffer.from(b64, "base64")));
  console.log("decoded", relOut, fs.statSync(out).size);
}

decode("app/en/models/[slug]/page.tsx.b64", "app/en/models/[slug]/page.generated.tsx");
decode("app/models/[slug]/page.tsx.b64", "app/models/[slug]/page.generated.tsx");
