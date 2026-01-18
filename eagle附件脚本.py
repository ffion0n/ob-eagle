#!/usr/bin/env python3
import argparse
import os
import posixpath
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlsplit

PREFERRED = (
    "image.png", "image.jpg", "image.jpeg", "image.webp",
    "original.png", "original.jpg", "original.jpeg", "original.webp",
    "preview.png", "thumbnail.png"
)
IMAGE_EXTS = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp")

def translate_path(path, root):
    path = urlsplit(path).path
    path = posixpath.normpath(unquote(path))
    words = [w for w in path.split("/") if w]
    out = root
    for w in words:
        if os.path.dirname(w) or w in (os.curdir, os.pardir):
            continue
        out = os.path.join(out, w)
    return out

class EagleHandler(SimpleHTTPRequestHandler):
    server_version = "EagleHTTP/0.6"

    def translate_path(self, path):
        return translate_path(path, self.server.root_dir)

    def send_head(self):
        url_path = urlsplit(self.path).path
        if url_path.endswith(".info") or url_path.endswith(".info/"):
            dir_fs = translate_path(url_path, self.server.root_dir)
            if os.path.isdir(dir_fs):
                for name in PREFERRED:
                    cand = os.path.join(dir_fs, name)
                    if os.path.isfile(cand):
                        self.path = url_path.rstrip("/") + "/" + name
                        break
                else:
                    for name in os.listdir(dir_fs):
                        if name.lower().endswith(IMAGE_EXTS):
                            self.path = url_path.rstrip("/") + "/" + name
                            break
        return super().send_head()

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionResetError):
            pass

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", required=True)
    ap.add_argument("--port", type=int, default=6060)
    ap.add_argument("--host", default="0.0.0.0")
    args = ap.parse_args()

    root = os.path.abspath(args.root)
    if not os.path.isdir(root):
        raise SystemExit(f"root not found: {root}")

    if ":" in args.host:
        raise SystemExit("IPv6 host not supported. Use IPv4 like 0.0.0.0 or 127.0.0.1")

    httpd = ThreadingHTTPServer((args.host, args.port), EagleHandler)
    httpd.root_dir = root
    print(f"Serving {root} on {args.host}:{args.port}")
    httpd.serve_forever()

if __name__ == "__main__":
    main()
