const PASSKEY_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export type MinimalEcPublicJwk = {
  crv?: string;
  kty?: string;
  x?: string;
  y?: string;
};

export type PidIssuanceMaterial = {
  passkey: string;
  privateJwk: JsonWebKey;
  publicJwk: JsonWebKey;
  minimalPubKey: MinimalEcPublicJwk;
};

export function generatePasskey(length = 64): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => PASSKEY_CHARS[b % PASSKEY_CHARS.length]).join(
    "",
  );
}

export async function generateHolderKeyPair(): Promise<{
  publicJwk: JsonWebKey;
  privateJwk: JsonWebKey;
}> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  );
  const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  return { publicJwk, privateJwk };
}

export function toMinimalEcPublicJwk(jwk: JsonWebKey): MinimalEcPublicJwk {
  return { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y };
}

export async function createPidIssuanceMaterial(): Promise<PidIssuanceMaterial> {
  const passkey = generatePasskey(64);
  const { publicJwk, privateJwk } = await generateHolderKeyPair();
  return {
    passkey,
    privateJwk,
    publicJwk,
    minimalPubKey: toMinimalEcPublicJwk(publicJwk),
  };
}

export function storePidIssuanceContext(args: {
  passkey: string;
  privateJwk: JsonWebKey;
  providerDomain: string;
  receiveEndpoint: string;
}): void {
  sessionStorage.setItem("pid_passkey", args.passkey);
  sessionStorage.setItem("pid_private_key", JSON.stringify(args.privateJwk));
  sessionStorage.setItem("pid_provider_domain", args.providerDomain);
  sessionStorage.setItem("pid_receive_endpoint", args.receiveEndpoint);
}
