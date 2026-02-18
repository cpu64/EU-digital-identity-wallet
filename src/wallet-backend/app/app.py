import os
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer

SERVICE_NAME = os.getenv("SERVICE_NAME", "Unknown Service")

URLS = [
    "https://relying-party.wallet.test",
    "https://trusted-list.wallet.test",
    "https://pid-provider.wallet.test",
    "https://wallet-frontend.wallet.test"
]


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Create table headers
        table = [["URL", "Service Name"]]

        # Query each URL
        for url in URLS:
            try:
                with urllib.request.urlopen(url, timeout=2) as resp:
                    text = resp.read().decode("utf-8").strip()
            except Exception as e:
                text = f"Error: {e}"
            table.append([url, text])

        # Convert table to plain text
        col_widths = [max(len(row[i]) for row in table) for i in range(2)]
        lines = []
        for row in table:
            lines.append(f"{row[0].ljust(col_widths[0])} | {row[1].ljust(col_widths[1])}")
        response = "\n".join(lines) + "\n"

        # Send HTTP response
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(response.encode("utf-8"))


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8000), Handler)
    print(f"Server running on port 8000... (SERVICE_NAME={SERVICE_NAME})")
    server.serve_forever()
