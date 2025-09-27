import { SignJWT, importPKCS8 } from "jose";
import { conf } from "@/lib/config";

const KEY_ID = conf().APPLE.KEY_ID;
const TEAM_ID = conf().APPLE.TEAM_ID;
const PRIVATE_KEY_PEM = conf().APPLE.PRIVATE_KEY_PEM;

// simple in-memory cache (per serverless instance/process)
let cachedToken: { value: string; exp: number } | null = null;

export const AppleKit = {
  async createAppleDevToken(): Promise<string> {
    const alg = "ES256";
    const now = Math.floor(Date.now() / 1000);

    // reuse if > 1 hour left
    if (cachedToken && cachedToken.exp - now > 3600) return cachedToken.value;
    const privateKeyPem = AppleKit.formatPrivateKey(PRIVATE_KEY_PEM);
    if (!privateKeyPem) throw new Error("Missing Apple private key");
    const key = await importPKCS8(privateKeyPem, alg);
    // Apple allows up to ~6 months. We'll choose ~30 days.
    const iat = now;
    const exp = iat + 60 * 60 * 24 * 30;

    const token = await new SignJWT({})
      .setProtectedHeader({ alg, kid: KEY_ID })
      .setIssuer(TEAM_ID)
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .sign(key);

    cachedToken = { value: token, exp };
    return token;
  },
  /**
   * Format pem key for Apple Music JWT.
   */
  formatPrivateKey(key: string): string {
    return key.replace(/\\n/g, "\n");
  },
};
