#!/usr/bin/env python3
"""Capture console messages, page errors, and failed requests while loading a page.

  python examples/console_logging.py http://localhost:5173
"""

import sys

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5173"

messages = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Attach listeners BEFORE navigating, or early logs are lost.
    page.on("console", lambda msg: messages.append(
        f"[console.{msg.type}] {msg.text}"
        + (f"  ({msg.location['url']}:{msg.location['lineNumber']})" if msg.location else "")
    ))
    page.on("pageerror", lambda exc: messages.append(f"[pageerror] {exc}"))
    page.on("requestfailed", lambda req: messages.append(
        f"[requestfailed] {req.method} {req.url} — {req.failure}"
    ))
    page.on("response", lambda res: res.status >= 400 and messages.append(
        f"[http {res.status}] {res.url}"
    ))

    page.goto(URL)
    page.wait_for_load_state("networkidle")

    for line in messages:
        print(line)
    errors = [m for m in messages if m.startswith(("[pageerror]", "[console.error]"))]
    print(f"\n{len(messages)} message(s), {len(errors)} error(s)")

    browser.close()

sys.exit(1 if errors else 0)
