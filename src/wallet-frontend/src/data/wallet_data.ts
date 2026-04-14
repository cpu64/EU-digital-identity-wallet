import { AES, enc } from "crypto-js";

export type Credential = {
  id: string;
  type: string;
  title: string;
  issuer: {
    name: string;
    did: string;
    logo?: string;
  };
  issuanceDate: string;
  expirationDate: string;
  format: string;
  status: "valid" | "expired" | "revoked";
  subject: Record<string, string>;
  raw: Record<string, unknown>;
};

export type Transaction = {
  id: number;
  credentialType: string;
  credentialTitle: string;
  requester: string;
  sharedAttributes: string[];
  timestamp: string;
  status: "shared" | "declined";
};

export type WalletData = {
  credentials: Credential[];
  transactions: Transaction[];
};

const defaultWalletData: WalletData = {
  credentials: [],
  transactions: [],
};

export const initData = async () => {
  try {
    await getData();
  } catch {
    await updateData(defaultWalletData);
  }
};

export const updateData = async (newData: WalletData) => {
  const key = sessionStorage.getItem("blob_key");
  if (key == null) {
    throw new Error("Blob key was not found");
  }

  const blob = AES.encrypt(JSON.stringify(newData), key).toString();

  const response = await fetch(
    "https://wallet-backend.wallet.test/api/store_blob",
    {
      method: "POST",
      body: JSON.stringify({ blob: blob }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(await response.json());
  }
};

export const getData = async (): Promise<WalletData> => {
  const response = await fetch(
    "https://wallet-backend.wallet.test/api/get_blob",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `/api/get_blob got an error status code: ${response.status}`,
    );
  }

  const contents = await response.json();
  if (!("blob" in contents) || contents.blob == null) {
    throw new Error("Blob not found");
  }

  const key = sessionStorage.getItem("blob_key");
  if (key == null) {
    throw new Error("Key not found");
  }

  const decrypted = AES.decrypt(contents.blob, key).toString(enc.Utf8);

  return JSON.parse(decrypted);
};

export async function getCredentialById(
  id: string,
): Promise<Credential | undefined> {
  return (await getData()).credentials.find((c) => c.id === id);
}

export async function addCredential(credential: Credential): Promise<void> {
  const data = await getData();
  data.credentials.push(credential);
  await updateData(data);
}

export async function deleteCredential(id: string): Promise<void> {
  const data = await getData();
  data.credentials = data.credentials.filter((c) => c.id !== id);
  await updateData(data);
}

export async function addTransaction(transaction: Transaction): Promise<void> {
  const data = await getData();
  data.transactions.push(transaction);
  await updateData(data);
}
