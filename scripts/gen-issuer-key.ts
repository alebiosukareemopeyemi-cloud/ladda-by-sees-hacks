/**
 * One-off ed25519 keypair generator for the credential issuer (§3, §8).
 *
 *   npm run gen:key
 *
 * Paste the printed values into `.env.local` (and `.env` for Prisma CLI):
 *   LADDA_ISSUER_PRIVATE_KEY=<private hex>            # secret — never commit
 *   NEXT_PUBLIC_LADDA_ISSUER_PUBLIC_KEY=<public hex>  # safe to expose
 *
 * Run once per environment. Rotating the key invalidates every credential
 * signed with the old one.
 */
import * as ed from "@noble/ed25519";
import { webcrypto } from "node:crypto";

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function main() {
  const priv = new Uint8Array(32);
  webcrypto.getRandomValues(priv);
  const pub = await ed.getPublicKeyAsync(priv);

  process.stdout.write(
    [
      "# ed25519 issuer keypair — generated " + new Date().toISOString(),
      "LADDA_ISSUER_PRIVATE_KEY=" + toHex(priv),
      "NEXT_PUBLIC_LADDA_ISSUER_PUBLIC_KEY=" + toHex(pub),
      "",
    ].join("\n"),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
