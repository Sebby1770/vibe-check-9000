"""Local server for the game: Python's http.server with a deep listen queue. The game asks for about a hundred
ES modules at once; `python3 -m http.server` queues only five pending connections, and a connection dropped from
that queue can leave one module request unanswered, so the module graph never finishes and the page sits on a
blank title forever (about one load in four on a busy machine).

    python3 tools/serve.py [port] [root]    (defaults: 8000, the repo) """
import functools
import http.server
import pathlib
import sys


class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 256
    daemon_threads = True


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
root = sys.argv[2] if len(sys.argv) > 2 else str(pathlib.Path(__file__).resolve().parent.parent)
print(f"Serving {root} at http://127.0.0.1:{port}/")
Server(("127.0.0.1", port), functools.partial(Quiet, directory=root)).serve_forever()
