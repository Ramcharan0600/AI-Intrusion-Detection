# detector.py
"""Lightweight detector used by the app.

This module exposes shared state objects `login_counts` and `timestamps`
and a function `detect_anomaly(ip)` which decides if an IP should be
blocked. The app (app.py) will import these objects and update
`login_counts`/`timestamps` when processing logs.
"""
from collections import defaultdict
import time

# Shared state (app.py updates these)
login_counts = defaultdict(int)
timestamps = {}


def detect_anomaly(ip: str) -> bool:
    """Return True if the given IP should be considered an intrusion.

    Simple, fast rules (deterministic):
    - 3 or more attempts within 30 seconds => rapid attack
    - 6 or more total attempts => multiple attempts

    The caller must update login_counts[ip] and timestamps[ip]
    before calling this function.
    """
    if ip not in timestamps:
        return False

    count = login_counts.get(ip, 0)
    window = time.time() - timestamps.get(ip, time.time())

    # Rapid attack: 3+ attempts within 30s
    if count >= 3 and window <= 30:
        print(f"[detector] Rapid attack: {ip} attempts={count} window={window:.1f}s")
        return True

    # Multiple attempts overall
    if count >= 6:
        print(f"[detector] Multiple attempts threshold reached: {ip} attempts={count}")
        return True

    return False