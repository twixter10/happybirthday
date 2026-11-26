
"""Run: python app.py -> opens http://localhost:5173"""

import json
import os
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

NAME = "Carl"
TITLE = "Happy Birthday"

MESSAGE = [
    "Happy birthday to the most special person in my life.",
    "May this year bring you more joy, more peace,",
    "and every little thing your heart has been wishing for.",
    "I'm so proud of you, and I'm always on your side.",
]

PORT = 5173
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(SimpleHTTPRequestHandler):

    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def do_GET(self):

        if self.path.split("?")[0] == "/config.json":

            photo_folder = os.path.join(ROOT, "photos")

            if os.path.isdir(photo_folder):
                photos = sorted(
                    f for f in os.listdir(photo_folder)
                    if f.lower().endswith(
                        (".jpg", ".jpeg", ".png", ".webp")
                    )
                )
            else:
                photos = []

            body = json.dumps({
                "name": NAME,
                "title": TITLE,
                "message": MESSAGE,
                "photos": photos
            }).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        else:

            if self.path == "/":
                self.path = "/index.html"

            super().do_GET()


if __name__ == "__main__":

    print(f"Running at http://localhost:{PORT}")

    webbrowser.open(f"http://localhost:{PORT}")

    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    server.serve_forever()
