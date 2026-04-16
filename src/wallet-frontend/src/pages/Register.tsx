import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import QRCode from "react-qr-code";
import { v4 as uuidv4 } from "uuid";

type RegistrationResponse = { success: boolean; status: string };

function RegisterUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [errorStatus, setErrorStatus] = useState("");
  const navigate = useNavigate();
  const [totp, setTotp] = useState<string>("");
  const [usesTotp, setUsesTotp] = useState(false);
  const [qrCodeLink, setQrCodeLink] = useState<string | undefined>(undefined);

  function generateTotpQrCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const secret_length = 32;

    const bytes = new Uint32Array(secret_length);
    crypto.getRandomValues(bytes);
    const secret = Array.from(bytes, (b) => chars[b % chars.length]).join("");
    setTotp(secret);

    const otpLink = `otpauth://totp/walletby:${uuidv4()}?secret=${secret}&issuer=walletby&algorithm=SHA1&digits=6&period=30`;
    setQrCodeLink(otpLink);
  }

  async function handleRegister(e: React.SyntheticEvent<HTMLFormElement>) {
    try {
      e.preventDefault();

      const request = {
        username: username,
        password: password,
        totp: totp,
      };

      const response = await fetch(
        "https://wallet-backend.wallet.test/api/register",
        {
          method: "POST",
          body: JSON.stringify(request),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const contents: RegistrationResponse = await response.json();
      if (response.ok) {
        navigate("/");
      } else {
        setErrorStatus(contents.status);
        throw new Error(contents.status);
      }
    } catch {
      setOpen(true);
    }
  }

  return (
    <div className={styles.login_box}>
      <Card className="w-full sm:max-w-md">
        <div className={styles.title}>
          <img
            src="/images/wallet-logo.png"
            alt="Wallet Logo"
            className={styles.logo}
          />
        </div>
        <div className={styles.title}>
          <CardTitle>Register to Walletby</CardTitle>
        </div>
        <CardContent>
          <form onSubmit={handleRegister}>
            <Field>
              <FieldLabel htmlFor="text" className="form-label">
                Username:
              </FieldLabel>
              <Input
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                type="text"
                className="form-control"
                id="username"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password" className="form-label">
                Password:
              </FieldLabel>
              <Input
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                type="password"
                className="form-control"
                id="password"
                required
              />
            </Field>
            <br />
            <Field orientation="horizontal">
              <Checkbox
                onClick={() => {
                  setUsesTotp(!usesTotp);
                  if (!usesTotp) {
                    generateTotpQrCode();
                  }
                }}
              />
              <FieldContent>
                <FieldTitle>
                  I'd like to use 2-factor authentication via TOTP (time-based
                  one-time passwords)
                </FieldTitle>
              </FieldContent>
            </Field>
            {usesTotp && (
              <Field style={{ marginTop: "1em" }}>
                <FieldLabel>
                  Scan this QR code with your authenticator app to initialize
                  TOTP
                </FieldLabel>
                {qrCodeLink == null && (
                  <p>Please wait for the QR code to load...</p>
                )}
                {qrCodeLink != null && (
                  <div style={{ background: "white", padding: "16px" }}>
                    <QRCode value={qrCodeLink} size={300} />
                  </div>
                )}
              </Field>
            )}
            <br />
            <CardFooter>
              <Field>
                <Button type="submit" className="btn btn-primary">
                  Register
                </Button>
                <p style={{ marginTop: "2vh" }}>
                  Already have an account?
                  <br />
                  <Button asChild variant="link">
                    <Link to={"/login"}>Log in</Link>
                  </Button>
                </p>
              </Field>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
              <DialogDescription>
                Failed to register. {errorStatus}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <DialogClose asChild>
                <Button type="button">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </DialogTrigger>
      </Dialog>
    </div>
  );
}

export default RegisterUser;
