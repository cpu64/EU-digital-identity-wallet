import datetime
from pathlib import Path
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
from cryptography.x509.oid import NameOID
from cryptography import x509
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend


def generate_root_cert(private_key, public_key):
    subject = issuer = x509.Name(
        [
            x509.NameAttribute(NameOID.COUNTRY_NAME, "LT"),
            x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "Kaunas"),
            x509.NameAttribute(NameOID.LOCALITY_NAME, "Kaunas"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "WalletBy"),
            x509.NameAttribute(NameOID.COMMON_NAME, "WalletBy CA"),
        ]
    )

    root_cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(public_key)
        .serial_number(x509.random_serial_number())
        .not_valid_before(datetime.datetime.now(datetime.timezone.utc))
        .not_valid_after(
            datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=365)
        )
        .add_extension(x509.BasicConstraints(ca=True, path_length=None), critical=True)
        .add_extension(
            x509.KeyUsage(
                digital_signature=True,
                content_commitment=False,
                key_encipherment=False,
                data_encipherment=False,
                key_agreement=False,
                key_cert_sign=True,
                crl_sign=True,
                encipher_only=False,
                decipher_only=False,
            ),
            critical=True,
        )
        .add_extension(
            x509.SubjectKeyIdentifier.from_public_key(public_key),
            critical=False,
        )
        .sign(private_key, hashes.SHA256())
    )

    return root_cert

def load_cert_info():
    if not Path("app/keys/private_key.pem").exists() or not Path("app/keys/public_key.pem").exists():
        raise FileNotFoundError(f"File not found: app/keys/private_key.pem")

    with open("app/keys/private_key.pem", "rb") as f:
        private_key = serialization.load_pem_private_key(f.read(), password=None)

    with open("app/keys/public_key.pem", "rb") as f:
        public_key = serialization.load_pem_public_key(f.read())

    cert = None
    if not Path("app/keys/ca_cert.pem").exists():
        cert = generate_root_cert(private_key, public_key)
        with open("app/keys/ca_cert.pem", "wb") as f:
            f.write(cert.public_bytes(encoding=serialization.Encoding.PEM))
    else:
        with open("app/keys/ca_cert.pem", "rb") as f:
            cert = x509.load_pem_x509_certificate(f.read(), default_backend())

    return (private_key, public_key, cert)


def handle_csr(csr_text, key, cert):
    csr = x509.load_pem_x509_csr(csr_text, default_backend())

    if not csr.is_signature_valid:
        return None

    builder = (
        x509.CertificateBuilder()
        .subject_name(csr.subject)
        .issuer_name(cert.subject)
        .public_key(csr.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(
            datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=1)
        )
        .not_valid_after(
            datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=365)
        )
    )

    for ext in csr.extensions:
        builder = builder.add_extension(ext.value, ext.critical)

    cert = builder.sign(private_key=key, algorithm=hashes.SHA256())
    cert_pem = cert.public_bytes(serialization.Encoding.PEM)

    return cert_pem
