#!/usr/bin/env python3
"""Drive a static HTML file straight from disk — no server needed.

  python examples/static_html_automation.py ./index.html
"""

import pathlib
import sys

from playwright.sync_api import sync_playwright

if len(sys.argv) < 2:
    sys.exit("usage: static_html_automation.py PATH_TO_HTML")

html_path = pathlib.Path(sys.argv[1]).resolve()
if not html_path.is_file():
    sys.exit(f"no such file: {html_path}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.goto(html_path.as_uri())  # file:// URL
    page.wait_for_load_state("load")

    print(f"title: {page.title()!r}")
    print(f"headings: {[h.strip() for h in page.locator('h1, h2').all_inner_texts()]}")

    # Example interaction: click the first button, if there is one.
    buttons = page.get_by_role("button")
    if buttons.count():
        buttons.first.click()
        page.wait_for_timeout(250)
        print("clicked the first button")

    page.screenshot(path="/tmp/static_page.png", full_page=True)
    print("screenshot: /tmp/static_page.png")

    browser.close()
