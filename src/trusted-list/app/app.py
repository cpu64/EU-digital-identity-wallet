import os
from http.server import BaseHTTPRequestHandler, HTTPServer

SERVICE_NAME = os.getenv("SERVICE_NAME", "Unknown Service")

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        response = f"{SERVICE_NAME}\n"
        self.wfile.write(response.encode("utf-8"))

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8000), Handler)
    print(f"Server running on port 8000... (SERVICE_NAME={SERVICE_NAME})")
    server.serve_forever()
