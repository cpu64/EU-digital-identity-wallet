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

export const mockCredentials: Credential[] = [
  {
    id: "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    type: "EuropeanDigitalIdentity",
    title: "EU Digital Identity",
    issuer: {
      name: "Republic of Lithuania",
      did: "did:web:issuer.gov.lt",
    },
    issuanceDate: "2025-09-15T10:30:00Z",
    expirationDate: "2035-09-15T10:30:00Z",
    format: "vc+sd-jwt",
    status: "valid",
    subject: {
      "Given Name": "Jonas",
      "Family Name": "Jonaitis",
      "Date of Birth": "1995-03-22",
      "Personal Code": "39503220001",
      Nationality: "Lithuanian",
      "Document Number": "ID-LT-2025-001",
      "Place of Birth": "Vilnius, Lithuania",
      Gender: "Male",
    },
    raw: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://europa.eu/digital-identity/v1",
      ],
      type: ["VerifiableCredential", "EuropeanDigitalIdentity"],
      credentialSubject: {
        id: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        givenName: "Jonas",
        familyName: "Jonaitis",
        dateOfBirth: "1995-03-22",
        personalCode: "39503220001",
        nationality: "Lithuanian",
        documentNumber: "ID-LT-2025-001",
        placeOfBirth: "Vilnius, Lithuania",
        gender: "Male",
      },
      issuer: {
        id: "did:web:issuer.gov.lt",
        name: "Republic of Lithuania",
      },
      issuanceDate: "2025-09-15T10:30:00Z",
      expirationDate: "2035-09-15T10:30:00Z",
    },
  },
  {
    id: "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567891",
    type: "EuropeanDigitalIdentity",
    title: "EU Digital Identity",
    issuer: {
      name: "Republic of Lithuania",
      did: "did:web:issuer.gov.lt",
    },
    issuanceDate: "2025-09-15T10:30:00Z",
    expirationDate: "2035-09-15T10:30:00Z",
    format: "vc+sd-jwt",
    status: "valid",
    subject: {
      "Given Name": "Jonas",
      "Family Name": "Jonaitis",
      "Date of Birth": "1995-03-22",
      "Personal Code": "39503220001",
      Nationality: "Lithuanian",
      "Document Number": "ID-LT-2025-001",
      "Place of Birth": "Vilnius, Lithuania",
      Gender: "Male",
    },
    raw: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://europa.eu/digital-identity/v1",
      ],
      type: ["VerifiableCredential", "EuropeanDigitalIdentity"],
      credentialSubject: {
        id: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        givenName: "Jonas",
        familyName: "Jonaitis",
        dateOfBirth: "1995-03-22",
        personalCode: "39503220001",
        nationality: "Lithuanian",
        documentNumber: "ID-LT-2025-001",
        placeOfBirth: "Vilnius, Lithuania",
        gender: "Male",
      },
      issuer: {
        id: "did:web:issuer.gov.lt",
        name: "Republic of Lithuania",
      },
      issuanceDate: "2025-09-15T10:30:00Z",
      expirationDate: "2035-09-15T10:30:00Z",
    },
  },
  {
    id: "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567891",
    type: "EuropeanDigitalIdentity",
    title: "EU Digital Identity",
    issuer: {
      name: "Republic of Lithuania",
      did: "did:web:issuer.gov.lt",
    },
    issuanceDate: "2025-09-15T10:30:00Z",
    expirationDate: "2035-09-15T10:30:00Z",
    format: "vc+sd-jwt",
    status: "valid",
    subject: {
      "Given Name": "Jonas",
      "Family Name": "Jonaitis",
      "Date of Birth": "1995-03-22",
      "Personal Code": "39503220001",
      Nationality: "Lithuanian",
      "Document Number": "ID-LT-2025-001",
      "Place of Birth": "Vilnius, Lithuania",
      Gender: "Male",
    },
    raw: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://europa.eu/digital-identity/v1",
      ],
      type: ["VerifiableCredential", "EuropeanDigitalIdentity"],
      credentialSubject: {
        id: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        givenName: "Jonas",
        familyName: "Jonaitis",
        dateOfBirth: "1995-03-22",
        personalCode: "39503220001",
        nationality: "Lithuanian",
        documentNumber: "ID-LT-2025-001",
        placeOfBirth: "Vilnius, Lithuania",
        gender: "Male",
      },
      issuer: {
        id: "did:web:issuer.gov.lt",
        name: "Republic of Lithuania",
      },
      issuanceDate: "2025-09-15T10:30:00Z",
      expirationDate: "2035-09-15T10:30:00Z",
    },
  },
  {
    id: "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567891",
    type: "EuropeanDigitalIdentity",
    title: "EU Digital Identity",
    issuer: {
      name: "Republic of Lithuania",
      did: "did:web:issuer.gov.lt",
    },
    issuanceDate: "2025-09-15T10:30:00Z",
    expirationDate: "2035-09-15T10:30:00Z",
    format: "vc+sd-jwt",
    status: "valid",
    subject: {
      "Given Name": "Jonas",
      "Family Name": "Jonaitis",
      "Date of Birth": "1995-03-22",
      "Personal Code": "39503220001",
      Nationality: "Lithuanian",
      "Document Number": "ID-LT-2025-001",
      "Place of Birth": "Vilnius, Lithuania",
      Gender: "Male",
    },
    raw: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://europa.eu/digital-identity/v1",
      ],
      type: ["VerifiableCredential", "EuropeanDigitalIdentity"],
      credentialSubject: {
        id: "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        givenName: "Jonas",
        familyName: "Jonaitis",
        dateOfBirth: "1995-03-22",
        personalCode: "39503220001",
        nationality: "Lithuanian",
        documentNumber: "ID-LT-2025-001",
        placeOfBirth: "Vilnius, Lithuania",
        gender: "Male",
      },
      issuer: {
        id: "did:web:issuer.gov.lt",
        name: "Republic of Lithuania",
      },
      issuanceDate: "2025-09-15T10:30:00Z",
      expirationDate: "2035-09-15T10:30:00Z",
    },
  },
];

export function getCredentialById(id: string): Credential | undefined {
  return mockCredentials.find((c) => c.id === id);
}
