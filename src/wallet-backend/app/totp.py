import base64
import hmac
import struct
import time
import hashlib

issuer = "walletby"
algorithm = hashlib.sha1
chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
period = 30
digits = 6


def get_totp(secret):
    timestamp = int(time.time()) // period
    secret_bytes = base64.b32decode(secret.upper())
    hmac_input = struct.pack(">Q", timestamp)
    sha_hash = hmac.new(secret_bytes, hmac_input, algorithm).digest()
    offset = sha_hash[-1] & 0x0F
    code_bytes = sha_hash[offset : offset + 4]
    code = struct.unpack(">I", code_bytes)[0] & 0x7FFFFFFF
    otp = code % (10**digits)
    return str(otp).zfill(digits)


def verify_totp(totp, secret):
    if totp and not totp.isdigit():
        raise ValueError("Invalid OTP: Only digits are allowed")
    if any(char not in chars for char in secret.upper()):
        raise ValueError("Secret contains invalid characters.")
    totp = str(totp).zfill(digits)[:digits].encode("utf-8")
    generated = get_totp(secret).zfill(digits)[:digits].encode("utf-8")
    return hmac.compare_digest(totp, generated)
