import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, FileUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

function SignDocument() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setFile(null);
      setError(t("sign_document.err_invalid_pdf"));
    }
  };

  const handleSign = async () => {
    if (!file) {
      setError(t("sign_document.err_no_file"));
      return;
    }

    setLoading(true);
    setError("");

    const form = new FormData();
    form.append("file", file);

    try {
      const response = await fetch(
        "https://wallet-backend.wallet.test/api/sign",
        {
          method: "POST",
          body: form,
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || t("sign_document.err_signing_failed"));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError((err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          {t("sign_document.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={triggerFileInput}
            disabled={loading}
          >
            {t("sign_document.choose_pdf")}
          </Button>
          {file && (
            <span className="text-sm text-muted-foreground truncate flex-1">
              {file.name}
            </span>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleSign}
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("sign_document.signing")}
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              {t("sign_document.sign_download")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default SignDocument;
