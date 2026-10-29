from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2'}

root = Path(__file__).resolve().parents[4] / 'dist'
print(f'Serving {root} on http://127.0.0.1:5191', flush=True)
ThreadingHTTPServer(('127.0.0.1', 5191), partial(Handler, directory=str(root))).serve_forever()
