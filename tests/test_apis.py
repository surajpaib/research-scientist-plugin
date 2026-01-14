#!/usr/bin/env python3
"""
Test API connectivity for Research Scientist plugin.

Usage:
    python test_apis.py

Tests external API endpoints used by the plugin.
"""

import sys
import json
import urllib.request
import urllib.error
from typing import Optional


class APITest:
    def __init__(self, name: str, url: str, expected_keys: list = None):
        self.name = name
        self.url = url
        self.expected_keys = expected_keys or []

    def run(self) -> tuple[bool, str]:
        try:
            req = urllib.request.Request(
                self.url,
                headers={"User-Agent": "research-scientist-plugin-test/1.0"}
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode())

                if self.expected_keys:
                    missing = [k for k in self.expected_keys if k not in str(data)]
                    if missing:
                        return False, f"Missing expected data"

                return True, "Connected"

        except urllib.error.HTTPError as e:
            return False, f"HTTP {e.code}"
        except urllib.error.URLError as e:
            return False, f"Connection failed: {e.reason}"
        except json.JSONDecodeError:
            return True, "Connected (non-JSON response)"
        except Exception as e:
            return False, str(e)


def main():
    tests = [
        APITest(
            "PubMed E-utilities",
            "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=test&retmax=1&retmode=json",
            ["esearchresult"]
        ),
        APITest(
            "OpenAlex",
            "https://api.openalex.org/works?search=test&per_page=1",
            ["results"]
        ),
        APITest(
            "CrossRef",
            "https://api.crossref.org/works?query=test&rows=1",
            ["message"]
        ),
        APITest(
            "Semantic Scholar",
            "https://api.semanticscholar.org/graph/v1/paper/search?query=test&limit=1",
            ["data"]
        ),
    ]

    print("\n" + "=" * 50)
    print("Research Scientist Plugin - API Tests")
    print("=" * 50 + "\n")

    passed = 0
    failed = 0

    for test in tests:
        success, message = test.run()
        status = "✓" if success else "✗"
        color = "\033[92m" if success else "\033[91m"
        reset = "\033[0m"

        print(f"{color}{status}{reset} {test.name}: {message}")

        if success:
            passed += 1
        else:
            failed += 1

    print("\n" + "-" * 50)
    print(f"Results: {passed} passed, {failed} failed")
    print("-" * 50 + "\n")

    # Check for Zotero (local)
    print("Local services:")
    try:
        req = urllib.request.Request("http://localhost:23119/better-bibtex/cayw?probe=true")
        with urllib.request.urlopen(req, timeout=2) as response:
            print("  ✓ Zotero Better BibTeX: Running")
    except:
        print("  ○ Zotero Better BibTeX: Not running (optional)")

    print()
    return failed == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
