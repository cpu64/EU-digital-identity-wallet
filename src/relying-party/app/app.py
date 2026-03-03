from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.request

MAIN_URL = "https://trusted-list.wallet.test"
API_URL = "https://public.trusted-list.wallet.test"

class TestClientHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        print("hello")
        # Backend fetch MAIN
        try:
            with urllib.request.urlopen(MAIN_URL, timeout=2) as resp:
                main_text = resp.read().decode("utf-8").strip()
        except Exception as e:
            main_text = f"Error fetching main: {e}"

        # Backend fetch API
        try:
            with urllib.request.urlopen(API_URL, timeout=2) as resp:
                api_text = resp.read().decode("utf-8").strip()
        except Exception as e:
            api_text = f"Error fetching API: {e}"

        # Build HTML response
        html = f"""
        <!DOCTYPE html>
        <html>
        <head><title>Test Client</title></head>
        <body>
            <h1>Backend fetched results</h1>
            <p><strong>Main:</strong> {main_text}</p>
            <p><strong>API:</strong> {api_text}</p>

            <h2>Browser fetches</h2>
            <div id="browser-main"></div>
            <div id="browser-api"></div>

            <script>
            async function fetchData() {{
                try {{
                    const resMain = await fetch("{MAIN_URL}");
                    const textMain = await resMain.text();
                    document.getElementById("browser-main").innerText = "Browser fetched main: " + textMain;
                }} catch(e) {{
                    document.getElementById("browser-main").innerText = "Browser main fetch blocked: " + e;
                }}

                try {{
                    const resApi = await fetch("{API_URL}");
                    const jsonApi = await resApi.text();
                    document.getElementById("browser-api").innerText = "Browser fetched API: " + jsonApi;
                }} catch(e) {{
                    document.getElementById("browser-api").innerText = "Browser API fetch blocked: " + e;
                }}
            }}

            fetchData();
            </script>
        </body>
        </html>
        """

        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(html.encode("utf-8"))


if __name__ == "__main__":
    server_address = ("0.0.0.0", 8000)
    httpd = HTTPServer(server_address, TestClientHandler)
    print("HTTP server running on port 8000...")
    httpd.serve_forever()
