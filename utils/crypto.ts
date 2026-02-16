/**
 * SHA-256 hash utility for recharge code verification.
 * Uses expo-crypto in native apps and Web Crypto in web.
 */

import * as ExpoCrypto from "expo-crypto";

export async function createHash(input: string): Promise<string> {
  if (ExpoCrypto?.digestStringAsync) {
    return ExpoCrypto.digestStringAsync(
      ExpoCrypto.CryptoDigestAlgorithm.SHA256,
      input,
      { encoding: ExpoCrypto.CryptoEncoding.HEX },
    );
  }

  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  throw new Error("SHA-256 hashing is not available on this platform");
}
