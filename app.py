from flask import Flask, render_template, jsonify, request
import json, time, os
from detector import detect_anomaly, login_counts, timestamps

app = Flask(__name__)

# GLOBALS
alert = "Monitoring for intrusions..."
attack_count = 0
blocked_ips = set()
active_ips = set()
log_file = "./logs/cowrie/cowrie.json"

# Ensure log file
os.makedirs("./logs/cowrie", exist_ok=True)
if not os.path.exists(log_file):
    open(log_file, "w").close()

# Reset runtime state on startup so dashboard begins at 0
try:
    # Clear any existing logs so the UI starts at zero
    open(log_file, 'w', encoding='utf-8').close()
except Exception:
    pass

# Clear detector shared state if present (imported from detector.py)
try:
    login_counts.clear()
    timestamps.clear()
except Exception:
    # if detector doesn't expose clearable objects, ignore
    pass
blocked_ips.clear()
active_ips.clear()
try:
    # Reset blocked IPs file so stale state doesn't persist between runs
    open("blocked_ips.txt", "w", encoding="utf-8").close()
except Exception:
    pass

# Ensure attack_count starts at zero on fresh start
attack_count = 0

# Record startup timestamp and ignore any log entries older than this.
# This guarantees the dashboard starts at 0 even if old log lines exist on disk.
STARTUP_TS = time.time()
# Track read offset so we only process appended lines (non-destructive)
LOG_OFFSET = 0

# ← PASTE check_logs() HERE ←
def check_logs():
    global alert, attack_count, blocked_ips, active_ips  # ← THIS LINE MUST BE INDENTED

    if not os.path.exists(log_file):
        return

    try:
        # Use an offset-based reader so we don't truncate the log file.
        # If the file has been rotated/truncated, reset the offset.
        with open(log_file, 'r', encoding='utf-8') as f:
            f.seek(0, os.SEEK_END)
            file_size = f.tell()
            global LOG_OFFSET
            if file_size < LOG_OFFSET:
                # file shrank (rotation/clear) — start from beginning
                LOG_OFFSET = 0

            f.seek(LOG_OFFSET)
            lines = f.readlines()

        for line in lines:
            line = line.strip()
            if not line or "cowrie.login.failed" not in line:
                continue

            try:
                log = json.loads(line)
                # If the log entry predates our startup, ignore it.
                entry_ts = log.get('timestamp') or 0
                if entry_ts < STARTUP_TS:
                    continue

                ip = log.get('src_ip', 'unknown')

                # Initialize if new
                if ip not in login_counts:
                    login_counts[ip] = 0
                    timestamps[ip] = time.time()

                # Update
                login_counts[ip] += 1
                timestamps[ip] = time.time()
                active_ips.add(ip)

                # Detect & Block
                if detect_anomaly(ip) and ip not in blocked_ips:
                    attack_count += 1
                    blocked_ips.add(ip)
                    alert = f"⚠️ INTRUSION DETECTED! Attack #{attack_count}: {ip} ({login_counts[ip]} failed attempts)"
                    
                    with open("blocked_ips.txt", "a", encoding="utf-8") as f:
                        f.write(f"🚫 INTRUSION: IP {ip} blocked after {login_counts[ip]} failed attempts - {time.strftime('%H:%M:%S')}\n")
                    
                    print(f"[AI] ⚠️ INTRUSION DETECTED! Blocked {ip} at {time.strftime('%H:%M:%S')}")

            except json.JSONDecodeError:
                continue
            except Exception as e:
                print(f"Error processing line: {e}")
                continue

        # Update offset so we won't re-process these lines next time.
        try:
            with open(log_file, 'r', encoding='utf-8') as f:
                f.seek(0, os.SEEK_END)
                LOG_OFFSET = f.tell()
        except Exception:
            # If we fail to update offset, reset it to 0 to be safe next time.
            LOG_OFFSET = 0

        # Clean old IPs (keep those with recent timestamps)
        now = time.time()
        active_ips = {ip for ip in active_ips if now - timestamps.get(ip, 0) < 300}

    except Exception as e:
        print(f"Log read error: {e}")

@app.route('/')
def index():
    check_logs()
    return render_template('index.html',
                         alert=alert,
                         attack_count=attack_count,
                         blocked_count=len(blocked_ips))

@app.route('/status')
def status():
    check_logs()
    return jsonify({
        'alert': alert,
        'total_attacks': attack_count,
        'blocked_count': len(blocked_ips),
        'active_ips': len(active_ips)
    })


@app.route('/blocked')
def blocked():
    """Return JSON with the list of blocked IPs and recent blocked events (tail of blocked_ips.txt)."""
    # Ensure logs processed first
    check_logs()
    recent = []
    try:
        if os.path.exists('blocked_ips.txt'):
            with open('blocked_ips.txt', 'r', encoding='utf-8') as f:
                lines = [l.strip() for l in f.readlines() if l.strip()]
                # return last 10 events
                recent = lines[-10:]
    except Exception:
        recent = []

    return jsonify({
        'blocked': sorted(list(blocked_ips)),
        'recent': recent
    })

@app.route('/unblock')
def unblock():
    """Unblock one or all IPs.
    Query params:
      ip - IP to unblock (if omitted, unblocks all)
    """
    global alert, attack_count
    ip = request.args.get('ip')
    
    if ip:
        if ip in blocked_ips:
            blocked_ips.remove(ip)
            alert = f"Unblocked {ip}"
            try:
                with open("blocked_ips.txt", "a", encoding="utf-8") as f:
                    f.write(f"Unblocked {ip} - {time.strftime('%H:%M:%S')}\n")
            except Exception:
                pass
    else:
        # Clear all
        blocked_ips.clear()
        alert = "Cleared all blocked IPs"
        try:
            with open("blocked_ips.txt", "a", encoding="utf-8") as f:
                f.write(f"Cleared all blocks - {time.strftime('%H:%M:%S')}\n")
        except Exception:
            pass

    return jsonify({
        'status': 'ok',
        'message': alert,
        'blocked_count': len(blocked_ips)
    })


@app.route('/simulate')
def simulate():
    """Simulate failed login attempts for testing.

    Query params:
      ip - source IP to simulate (default 192.168.1.100)
      n  - number of attempts to write (default 3)
    """
    global alert
    ip = request.args.get('ip', '192.168.1.100')
    try:
        n = int(request.args.get('n', '3'))
    except ValueError:
        n = 3

    # Update alert to show simulation is happening
    alert = f"⚡ Simulating {n} failed login attempts from {ip}..."

    # Generate some common usernames/passwords for realism
    usernames = ['admin', 'root', 'administrator', 'system']
    passwords = ['password123', 'admin123', '123456', 'root']
    
    for i in range(n):
        username = usernames[i % len(usernames)]
        password = passwords[i % len(passwords)]
        log_entry = {
            "eventid": "cowrie.login.failed",
            "src_ip": ip,
            "timestamp": time.time(),
            "username": username,
            "password": password,
            "message": f"Login failed: {username}/{password}"
        }
        try:
            with open(log_file, 'a', encoding='utf-8') as f:
                json.dump(log_entry, f)
                f.write('\n')
        except Exception as e:
            print(f"Error writing simulated log: {e}")
        time.sleep(0.1)  # Small delay between attempts for realism
    
    # Process logs immediately so caller gets updated counts
    check_logs()
    return jsonify({
        'status': 'simulated',
        'ip': ip,
        'attempts_written': n,
        'message': f'Simulated {n} failed login attempts from {ip}',
        'total_attacks': attack_count,
        'blocked_count': len(blocked_ips)
    })

if __name__ == '__main__':
    print("OPEN: http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000)