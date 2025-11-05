// Externalized dashboard JS (moved from template)
function validateIP(ip) {
  return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}

async function showMessage(msg, isError = false) {
  const alertEl = document.getElementById('alert');
  if (!alertEl) return;
  alertEl.innerText = msg;
  alertEl.style.color = isError ? '#f55' : '#0f0';
  setTimeout(() => update(), 2000);  // Restore normal alert after 2s
}

// Attack Patterns
const ATTACK_PATTERNS = {
  bruteforce: {
    name: "Brute Force Attack",
    description: "Attempting common username/password combinations",
    usernames: ["admin", "root", "administrator", "system"],
    passwords: ["password123", "admin123", "123456", "root"],
    delay: 800
  },
  dictionary: {
    name: "Dictionary Attack",
    description: "Using dictionary-based credentials",
    usernames: ["ubuntu", "postgres", "mysql", "apache"],
    passwords: ["qwerty123", "letmein", "welcome1", "database"],
    delay: 600
  },
  targeted: {
    name: "Targeted Attack",
    description: "Focused attempt with specific credentials",
    usernames: ["jenkins", "tomcat", "oracle", "webadmin"],
    passwords: ["jenkins123", "tomcat123", "oracle123", "admin123"],
    delay: 1000
  }
};

// Location Database (sample)
const LOCATIONS = [
  { country: "China", coords: [20, 30] },
  { country: "Russia", coords: [40, 20] },
  { country: "Brazil", coords: [60, 70] },
  { country: "Nigeria", coords: [30, 60] },
  { country: "India", coords: [50, 40] }
];

// Matrix animation
function generateMatrix() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";
  const lines = [];
  for (let i = 0; i < 10; i++) {
    let line = '';
    for (let j = 0; j < 50; j++) {
      line += chars[Math.floor(Math.random() * chars.length)];
    }
    lines.push(line);
  }
  return lines.join('\n');
}

function updateMatrix() {
  const matrix = document.getElementById('matrix_code');
  if (matrix) {
    matrix.innerText = generateMatrix();
  }
}

// Map and Packet Visualization
function initializeAttackMap(sourceIP) {
  const mapContainer = document.querySelector('.map-container');
  const source = document.getElementById('attack_source');
  const target = document.getElementById('attack_target');
  const line = document.getElementById('attack_line');
  if (!mapContainer || !source || !target || !line) return { location: { country: 'Unknown' }, cleanup: () => {} };

  // Clear any existing attack dots
  document.querySelectorAll('.attack-dot').forEach(dot => dot.remove());

  // Random source location
  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const [x, y] = location.coords;

  // Position markers
  source.style.left = x + '%';
  source.style.top = y + '%';
  target.style.left = '90%';
  target.style.top = '50%';

  const dx = 90 - x;
  const dy = 50 - y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  line.style.width = length + '%';
  line.style.left = x + '%';
  line.style.top = y + '%';
  line.style.transform = `rotate(${angle}deg)`;

  let progress = 0;
  const dotCount = 5;
  const dots = [];

  for (let i = 0; i < dotCount; i++) {
    const dot = document.createElement('div');
    dot.className = 'attack-dot';
    mapContainer.appendChild(dot);
    dots.push(dot);
  }

  function updateDots() {
    dots.forEach((dot, index) => {
      const offset = (progress + (index * (100 / dotCount))) % 100;
      const dotX = x + (dx * offset / 100);
      const dotY = y + (dy * offset / 100);
      dot.style.left = dotX + '%';
      dot.style.top = dotY + '%';
    });
    progress = (progress + 1) % 100;
  }

  const animationInterval = setInterval(updateDots, 50);
  return { location, cleanup: () => { clearInterval(animationInterval); dots.forEach(dot => dot.remove()); } };
}

function createPacket() {
  const packet = document.createElement('div');
  packet.className = 'packet';
  const container = document.getElementById('packet_vis');
  if (!container) return packet;
  container.appendChild(packet);
  return packet;
}

function animatePacket() {
  const packet = createPacket();
  if (!packet) return;
  const start = Math.random() * 100;
  packet.style.left = '0%';
  packet.style.top = start + '%';

  packet.animate([
    { left: '0%', opacity: 1 },
    { left: '100%', opacity: 0 }
  ], {
    duration: 1000,
    easing: 'linear'
  }).onfinish = () => packet.remove();
}

// Real-time attack simulation
async function simulateRealAttack(ip, attempts) {
  const modal = document.getElementById('attack_modal');
  const status = document.getElementById('attack_status');
  const details = document.getElementById('attack_details');
  if (modal) modal.style.display = 'block';

  const matrixInterval = setInterval(updateMatrix, 100);
  const packetInterval = setInterval(animatePacket, 200);

  const patterns = Object.values(ATTACK_PATTERNS);
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];

  const { location, cleanup } = initializeAttackMap(ip);
  if (details) details.innerHTML = `
    <strong>Attack Origin:</strong> ${location.country}<br>
    <strong>Attack Type:</strong> ${pattern.name}<br>
    <strong>Pattern:</strong> ${pattern.description}<br>
    <strong>Target:</strong> Local IDS (127.0.0.1:5000)
  `;

  for (let i = 1; i <= attempts; i++) {
    const username = pattern.usernames[i % pattern.usernames.length];
    const password = pattern.passwords[i % pattern.passwords.length];

    if (status) status.innerHTML = `<strong>Attempt ${i}/${attempts}</strong><br>Source IP: ${ip}<br>Trying: ${username}:${password}`;

    try {
      await fetch(`/simulate?ip=${encodeURIComponent(ip)}&n=1`);
      await new Promise(r => setTimeout(r, pattern.delay));
    } catch (e) {
      console.error('Attack simulation failed:', e);
    }
  }

  clearInterval(matrixInterval);
  clearInterval(packetInterval);
  cleanup();
  if (status) status.innerHTML = `<strong>Attack Complete!</strong><br>Generated ${attempts} failed login attempts`;
  setTimeout(() => { if (modal) modal.style.display = 'none'; }, 2500);
}

function generateRandomIP() {
  const segments = [];
  for (let i = 0; i < 4; i++) segments.push(Math.floor(Math.random() * 256));
  return segments.join('.');
}

let currentSuspiciousIP = null;

async function simulateRandom() {
  const ip = generateRandomIP();
  const attempts = Math.floor(Math.random() * 2) + 2;
  showMessage(`⚡ New attack detected from ${ip}...`);
  const last = document.getElementById('last_attack'); if (last) last.innerText = `Incoming attack from: ${ip}`;

  try {
    await simulateRealAttack(ip, attempts);
    currentSuspiciousIP = ip;
    const blockInput = document.getElementById('block_ip'); if (blockInput) blockInput.value = ip;
    const activeThreats = document.getElementById('active_threats'); if (activeThreats) activeThreats.innerHTML = `⚠️ Suspicious Activity Detected!<br>IP: ${ip}<br>${attempts} failed login attempts`;

    const alertEl = document.getElementById('alert'); if (alertEl) {
      alertEl.innerText = `🚨 ALERT: Suspicious activity from ${ip}`;
      alertEl.classList.add('alert-active');
      setTimeout(() => alertEl.classList.remove('alert-active'), 3000);
    }
  } catch (e) { console.error('Simulation failed:', e); showMessage('❌ Simulation failed: ' + e.message, true); }
}

async function manualBlock() {
  const ip = currentSuspiciousIP;
  if (!ip) { showMessage('⚠️ No suspicious IP to block', true); return; }
  showMessage(`🛡️ Initiating manual block for ${ip}...`);
  try {
    const r = await fetch(`/simulate?ip=${encodeURIComponent(ip)}&n=6`);
    await r.json();
    currentSuspiciousIP = null; const bi = document.getElementById('block_ip'); if (bi) bi.value = ''; const at = document.getElementById('active_threats'); if (at) at.innerText = 'No active threats';
    showMessage(`✅ Successfully blocked malicious IP: ${ip}`);
    update();
  } catch (e) { console.error('Manual block failed:', e); showMessage('❌ Block failed: ' + e.message, true); }
}

async function unblock(ip) {
  try { await fetch(`/unblock?ip=${encodeURIComponent(ip)}`); update(); } catch (e) { console.error('Unblock failed:', e); }
}

async function unblockAll() { try { await fetch('/unblock'); update(); } catch (e) { console.error('Unblock all failed:', e); } }

async function update() {
  try {
    const s = await fetch('/status');
    const d = await s.json();
    const ac = document.getElementById('attack_count'); if (ac) ac.innerText = d.total_attacks;
    const bc = document.getElementById('blocked_count'); if (bc) bc.innerText = d.blocked_count;
    const ai = document.getElementById('active_ips'); if (ai) ai.innerText = d.active_ips;
    const al = document.getElementById('alert'); if (al) al.innerText = d.alert;
  } catch (e) {}
  try {
    const b = await fetch('/blocked'); const bd = await b.json(); const listEl = document.getElementById('blocked_list');
    if (listEl) {
      if (bd.blocked && bd.blocked.length) {
        listEl.innerHTML = bd.blocked.map(ip => `<span class="ip-btn" onclick="unblock('${ip}')">${ip}</span>`).join(', ');
      } else { listEl.innerHTML = '(none)'; }
    }
    const recentEl = document.getElementById('recent_events'); if (recentEl) { recentEl.innerText = (bd.recent || []).reverse().join('\n'); recentEl.scrollTop = 0; }
  } catch (e) {}
}

document.addEventListener('keydown', (e) => {
  if (e.key === 's' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); simulateRandom(); }
});

setInterval(update, 2000);
update();
