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
import { initData } from "@/data/wallet_data";
import { SHA256 } from "crypto-js";
import { Checkbox } from "@/components/ui/checkbox";

type LoginResponse = { token: string } | { error: string };

function LoginUser({ setToken }: { setToken: (t: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState<string>("");
  const [usesTotp, setUsesTotp] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.SyntheticEvent<HTMLFormElement>) {
    try {
      e.preventDefault();

      const request = {
        username: username,
        password: password,
        totp: totp,
      };

      const response = await fetch(
        "https://wallet-backend.wallet.test/api/login",
        {
          method: "POST",
          body: JSON.stringify(request),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        let error = "no info";
        if (response.status == 400) {
          error = (await response.json()).error;
        }
        throw new Error(
          `Login response status: ${response.status}, error: ${error}`,
        );
      }

      const contents: LoginResponse = await response.json();
      if ("token" in contents) {
        // a cookie should be used instead?
        sessionStorage.setItem("token", contents.token);
        sessionStorage.setItem("username", username);
        setToken(contents.token);

        sessionStorage.setItem("blob_key", SHA256(password).toString());
        await initData();

        navigate("/credentials");
      } else {
        throw new Error("Missing token in API response");
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
          <CardTitle>Login to Walletby</CardTitle>
        </div>
        <CardContent>
          <form onSubmit={handleLogin}>
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
              <Checkbox onClick={() => setUsesTotp(!usesTotp)} />
              <FieldContent>
                <FieldTitle>
                  I'm using 2-factor authentication via TOTP
                </FieldTitle>
              </FieldContent>
            </Field>
            {usesTotp && (
              <Field style={{ marginTop: "1em" }}>
                <FieldLabel htmlFor="totp" className="form-label">
                  OTP code from your authenticator app
                </FieldLabel>
                <Input
                  onChange={(e) => {
                    setTotp(e.target.value);
                  }}
                  className="form-control"
                  id="totp"
                  required
                ></Input>
              </Field>
            )}
            <br />
            <CardFooter>
              <Field>
                <Button type="submit" className="btn btn-primary">
                  Log in
                </Button>
                <p style={{ marginTop: "2vh" }}>
                  Don't have an account?
                  <br />
                  <Button asChild variant="link">
                    <Link to={"/register"}>Create an account</Link>
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
                Failed to login. Please check that you have created an account
                and have entered valid credentials.
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

export default LoginUser;
