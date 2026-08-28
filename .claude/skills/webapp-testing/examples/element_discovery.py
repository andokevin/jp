#!/usr/bin/env python3
"""Discover the interactive elements on a page: buttons, links, inputs.

Run against an already-running server, or via with_server.py:
  python scripts/with_server.py --server "npm run dev" --port 5173 \
    -- python examples/element_discovery.py http://localhost:5173
"""

import sys

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5173"


def describe(locator, attrs):
    for element in locator.all():
        parts = [f"{name}={element.get_attribute(name)!r}" for name in attrs]
        text = (element.inner_text() or "").strip().replace("\n", " ")
        if text:
            parts.insert(0, f"text={text[:60]!r}")
        print(f"  - {', '.join(parts)}")


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(URL)
    page.wait_for_load_state("networkidle")  # CRITICAL: let JS render first

    print(f"title: {page.title()!r}\nurl: {page.url}")

    print("\nbuttons:")
    describe(page.get_by_role("button"), ["id", "name", "disabled"])

    print("\nlinks:")
    describe(page.get_by_role("link"), ["href"])

    print("\ninputs:")
    describe(page.locator("input, textarea, select"), ["type", "name", "id", "placeholder"])

    page.screenshot(path="/tmp/element_discovery.png", full_page=True)
    print("\nscreenshot: /tmp/element_discovery.png")

    browser.close()
