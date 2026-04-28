<<<<<<< HEAD
const http   = require('http');
const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

const PORT = 3000;

// ─── In-memory state ────────────────────────────────────────────────────────

let state = {
  incidents: [],
  honeypots: [
    { id: 'hny-web-01',    status: 'active',  active: true,  hits: 0,   payloads: 0,  ip: '10.0.0.11' },
    { id: 'hny-db-02',     status: 'monitor', active: false, hits: 0,   payloads: 0,  ip: '10.0.0.22' },
    { id: 'hny-iot-03',    status: 'alert',   active: true,  hits: 0,   payloads: 0,  ip: '10.0.0.33' },
    { id: 'hny-cloud-04',  status: 'idle',    active: false, hits: 0,   payloads: 0,  ip: '10.0.0.44' },
    { id: 'hny-smtp-05',   status: 'active',  active: true,  hits: 0,   payloads: 0,  ip: '10.0.0.55' },
  ],
  metrics: {
    totalCaptures: 2410,
    threatsBlocked: 184,
    activeIncidents: 3,
    avgResponseTime: 2.4,
    accuracy: 78,
    patternMatch: 91,
    knowledgeScore: 78,
    behaviorScore: 64,
    threatLevel: 85,
  },
  blockedIPs: [],
  tickets: [],
  logs: [],
  sseClients: new Map(),
  autoResponse: true,
};

// ─── Threat simulation data ──────────────────────────────────────────────────

const ATTACK_TYPES = [
  { type: 'ransomware',      severity: 'critical', pattern: 'Sodinokibi/REvil' },
  { type: 'lateral_move',    severity: 'critical', pattern: 'Pass-the-Hash' },
  { type: 'brute_force',     severity: 'warning',  pattern: 'SSH credential spray' },
  { type: 'data_exfil',      severity: 'critical', pattern: 'DNS tunneling' },
  { type: 'c2_beacon',       severity: 'warning',  pattern: 'Cobalt Strike beacon' },
  { type: 'lsass_dump',      severity: 'critical', pattern: 'Mimikatz LSASS' },
  { type: 'powershell',      severity: 'warning',  pattern: 'AMSI bypass' },
  { type: 'smb_spread',      severity: 'warning',  pattern: 'EternalBlue SMB' },
  { type: 'sql_injection',   severity: 'warning',  pattern: 'UNION-based SQLi' },
  { type: 'phishing',        severity: 'info',     pattern: 'Spear phishing' },
  { type: 'port_scan',       severity: 'info',     pattern: 'Nmap SYN scan' },
  { type: 'rdp_brute',       severity: 'warning',  pattern: 'RDP brute force' },
  { type: 'log4shell',       severity: 'critical', pattern: 'Log4Shell CVE-2021-44228' },
  { type: 'zero_day',        severity: 'critical', pattern: 'Unknown 0-day exploit' },
];

const ATTACKER_IPS = [
  '185.234.218.44', '91.108.4.200', '193.32.162.5', '45.142.212.100',
  '194.165.16.77', '62.233.50.11', '23.183.88.21', '5.188.206.14',
  '103.75.189.33', '178.128.22.165',
];

const LOG_MESSAGES = {
  critical: [
    'CRITICAL: Ransomware pattern detected ({pattern})',
    'CRITICAL: LSASS dump attempt on {target}',
    'CRITICAL: Active C2 communication → {ip}',
    'CRITICAL: Mass file encryption triggered',
    'CRITICAL: Privilege escalation success on {target}',
    'CRITICAL: Data exfiltration started ({size}MB)',
    'CRITICAL: Zero-day exploit fired on {target}',
    'CRITICAL: Lateral movement from {ip}',
  ],
  warning: [
    'WARN: Multiple failed auth attempts (SSH) from {ip}',
    'WARN: Suspicious PowerShell invocation',
    'WARN: DNS beaconing → {ip}',
    'WARN: Unusual egress traffic spike ({size}MB)',
    'WARN: SMB traffic spike on hny-iot-03',
    'WARN: AMSI bypass attempted',
    'WARN: Credential stuffing attack in progress',
    'WARN: RDP brute-force from {ip}',
  ],
  info: [
    'INFO: Honeypot-{n} connection registered',
    'INFO: SIEM correlation complete',
    'INFO: Port scan from {ip} — all decoy',
    'INFO: ML model retrained (accuracy +{score}%)',
    'INFO: TLS certificate validated',
    'INFO: Threat intel feed updated',
    'INFO: Backup verification passed',
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return crypto.randomBytes(6).toString('hex');
}

function ts() {
  return new Date().toLocaleTimeString('en-GB');
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fillTemplate(tpl) {
  return tpl
    .replace('{ip}',     rand(ATTACKER_IPS))
    .replace('{target}', `10.0.${randInt(0,9)}.${randInt(10,99)}`)
    .replace('{size}',   randInt(1, 500))
    .replace('{score}',  randInt(1, 8))
    .replace('{pattern}', rand(ATTACK_TYPES).pattern)
    .replace('{n}',      randInt(1, 5));
}

function buildLogEntry(level) {
  const msgs = LOG_MESSAGES[level];
  return {
    id:        uid(),
    ts:        ts(),
    level,
    message:   fillTemplate(rand(msgs)),
    sourceIp:  rand(ATTACKER_IPS),
    honeypot:  rand(state.honeypots).id,
    createdAt: Date.now(),
  };
}

function buildIncident(attack) {
  return {
    id:         uid(),
    type:       attack.type,
    severity:   attack.severity,
    pattern:    attack.pattern,
    sourceIp:   rand(ATTACKER_IPS),
    target:     `10.0.${randInt(0,3)}.${randInt(10,99)}`,
    honeypot:   rand(state.honeypots).id,
    status:     'active',
    ts:         ts(),
    ttd:        randInt(1, 30) + 's',
    confidence: randInt(70, 99),
    actions:    [],
    createdAt:  Date.now(),
  };
}

// ─── SSE broadcast ───────────────────────────────────────────────────────────

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const [, res] of state.sseClients) {
    try { res.write(payload); } catch(_) {}
  }
}

// ─── Simulation engine ───────────────────────────────────────────────────────

// Emit random logs every 2–5 seconds
function startLogSimulator() {
  function emitLog() {
    const r = Math.random();
    const level = r < 0.15 ? 'critical' : r < 0.45 ? 'warning' : 'info';
    const entry = buildLogEntry(level);
    state.logs.unshift(entry);
    if (state.logs.length > 500) state.logs.pop();

    // Update honeypot hit counts
    const pot = state.honeypots.find(h => h.id === entry.honeypot);
    if (pot) {
      pot.hits++;
      if (level !== 'info') pot.payloads++;
      state.metrics.totalCaptures++;
    }

    broadcast('log', entry);

    // Schedule next
    setTimeout(emitLog, randInt(1800, 5000));
  }
  setTimeout(emitLog, 1000);
}

// Spawn incidents every 15–40 seconds
function startIncidentEngine() {
  function spawnIncident() {
    const attack   = rand(ATTACK_TYPES);
    const incident = buildIncident(attack);
    state.incidents.unshift(incident);
    if (state.incidents.length > 50) state.incidents.pop();

    state.metrics.activeIncidents = state.incidents.filter(i => i.status === 'active').length;
    state.metrics.knowledgeScore  = Math.min(99, state.metrics.knowledgeScore + randInt(-2, 4));
    state.metrics.behaviorScore   = Math.min(99, state.metrics.behaviorScore  + randInt(-3, 5));
    state.metrics.threatLevel     = Math.min(100, Math.max(10, state.metrics.threatLevel + randInt(-5, 10)));

    broadcast('incident', incident);
    broadcast('metrics', state.metrics);

    // Auto-response if enabled
    if (state.autoResponse && incident.severity === 'critical') {
      setTimeout(() => {
        incident.status = 'contained';
        incident.actions.push({ action: 'auto_isolate', ts: ts() });
        state.metrics.threatsBlocked++;
        broadcast('incident_update', incident);
        broadcast('metrics', state.metrics);
      }, randInt(3000, 8000));
    }

    setTimeout(spawnIncident, randInt(15000, 40000));
  }
  setTimeout(spawnIncident, 3000);
}

// Metrics drift
function startMetricsDrift() {
  setInterval(() => {
    state.metrics.avgResponseTime = Math.max(0.5, +(state.metrics.avgResponseTime + (Math.random() - 0.5) * 0.3).toFixed(1));
    state.metrics.accuracy        = Math.min(99, Math.max(50, state.metrics.accuracy + randInt(-1, 2)));
    state.metrics.patternMatch    = Math.min(99, Math.max(60, state.metrics.patternMatch + randInt(-1, 2)));
    broadcast('metrics', state.metrics);
  }, 8000);
}

// ─── Routing ─────────────────────────────────────────────────────────────────

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise(resolve => {
    let buf = '';
    req.on('data', c => buf += c);
    req.on('end', () => {
      try { resolve(JSON.parse(buf)); } catch(_) { resolve({}); }
    });
  });
}

// ─── Route handlers ──────────────────────────────────────────────────────────

const routes = {
  // SSE stream
  'GET /api/stream': (req, res) => {
    const clientId = uid();
    res.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(`event: connected\ndata: {"clientId":"${clientId}"}\n\n`);
    state.sseClients.set(clientId, res);

    // Send current state immediately
    res.write(`event: state\ndata: ${JSON.stringify({
      honeypots: state.honeypots,
      metrics:   state.metrics,
      incidents: state.incidents.slice(0, 10),
      logs:      state.logs.slice(0, 20),
    })}\n\n`);

    req.on('close', () => { state.sseClients.delete(clientId); });
    // Heartbeat
    const hb = setInterval(() => { try { res.write(':ping\n\n'); } catch(_) { clearInterval(hb); } }, 15000);
  },

  // State
  'GET /api/state': (req, res) => {
    json(res, 200, {
      honeypots: state.honeypots,
      metrics:   state.metrics,
      incidents: state.incidents.slice(0, 20),
      logs:      state.logs.slice(0, 50),
      blockedIPs: state.blockedIPs,
    });
  },

  // Incidents
  'GET /api/incidents': (req, res) => json(res, 200, state.incidents),
  'POST /api/incidents/:id/action': async (req, res, params) => {
    const body = await readBody(req);
    const inc  = state.incidents.find(i => i.id === params.id);
    if (!inc) return json(res, 404, { error: 'not found' });

    const action = body.action;
    inc.actions.push({ action, ts: ts(), note: body.note });

    if (['isolate','contain'].includes(action)) {
      inc.status = action === 'isolate' ? 'isolated' : 'contained';
      state.metrics.threatsBlocked++;
    } else if (action === 'escalate') {
      inc.escalated = true;
    } else if (action === 'block_ip') {
      if (!state.blockedIPs.includes(inc.sourceIp)) state.blockedIPs.push(inc.sourceIp);
    } else if (action === 'ticket') {
      const ticket = { id: uid(), incidentId: inc.id, createdAt: ts(), status: 'open', severity: inc.severity };
      state.tickets.push(ticket);
      inc.ticketId = ticket.id;
    }

    state.metrics.activeIncidents = state.incidents.filter(i => i.status === 'active').length;
    state.metrics.knowledgeScore  = Math.min(99, state.metrics.knowledgeScore + 3);
    state.metrics.behaviorScore   = Math.min(99, state.metrics.behaviorScore  + 2);

    broadcast('incident_update', inc);
    broadcast('metrics', state.metrics);
    json(res, 200, { ok: true, incident: inc });
  },

  // Honeypots
  'GET /api/honeypots': (req, res) => json(res, 200, state.honeypots),
  'PATCH /api/honeypots/:id': async (req, res, params) => {
    const body = await readBody(req);
    const pot  = state.honeypots.find(h => h.id === params.id);
    if (!pot) return json(res, 404, { error: 'not found' });
    Object.assign(pot, body);
    broadcast('honeypot_update', pot);
    json(res, 200, pot);
  },

  // Metrics
  'GET /api/metrics': (req, res) => json(res, 200, state.metrics),

  // Logs
  'GET /api/logs': (req, res) => json(res, 200, state.logs.slice(0, 100)),

  // Block IP
  'POST /api/block': async (req, res) => {
    const body = await readBody(req);
    if (body.ip && !state.blockedIPs.includes(body.ip)) {
      state.blockedIPs.push(body.ip);
      state.metrics.threatsBlocked++;
      broadcast('ip_blocked', { ip: body.ip, ts: ts() });
      broadcast('metrics', state.metrics);
    }
    json(res, 200, { ok: true, blockedIPs: state.blockedIPs });
  },

  // Auto-response toggle
  'POST /api/autoresponse': async (req, res) => {
    const body = await readBody(req);
    state.autoResponse = !!body.enabled;
    json(res, 200, { autoResponse: state.autoResponse });
  },

  // Tickets
  'GET /api/tickets': (req, res) => json(res, 200, state.tickets),

  // Scan trigger (simulate)
  'POST /api/scan': async (req, res) => {
    const body = await readBody(req);
    const scanId = uid();
    setTimeout(() => {
      const result = {
        scanId, ts: ts(), target: body.target || 'all',
        vulnsFound: randInt(0, 7),
        openPorts:  [22, 80, 443, randInt(8000, 9000)].filter(() => Math.random() > 0.3),
        riskScore:  randInt(20, 95),
      };
      broadcast('scan_complete', result);
    }, randInt(3000, 7000));
    json(res, 202, { scanId, message: 'Scan initiated' });
  },
};

// ─── HTTP server ─────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  setCORSHeaders(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const parsed   = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsed.pathname;

  // Serve static files (frontend)
  if (req.method === 'GET' && !pathname.startsWith('/api/')) {
    const filePath = pathname === '/' ? '/index.html' : pathname;
    const fullPath = path.join(__dirname, 'public', filePath);
    if (fs.existsSync(fullPath)) {
      const ext  = path.extname(fullPath).slice(1);
      const mime = { html: 'text/html', js: 'application/javascript', css: 'text/css' }[ext] || 'text/plain';
      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(fullPath).pipe(res);
    } else {
      res.writeHead(404); res.end('Not found');
    }
    return;
  }

  // Match parameterised routes
  let handler = null, params = {};

  for (const [pattern, fn] of Object.entries(routes)) {
    const [method, ...parts] = pattern.split(' ');
    if (method !== req.method) continue;

    const routeParts = parts.join(' ').split('/').filter(Boolean);
    const reqParts   = pathname.split('/').filter(Boolean);
    if (routeParts.length !== reqParts.length) continue;

    let matched = true;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = reqParts[i];
      } else if (routeParts[i] !== reqParts[i]) {
        matched = false; break;
      }
    }
    if (matched) { handler = fn; break; }
  }

  if (handler) {
    handler(req, res, params);
  } else {
    json(res, 404, { error: 'endpoint not found' });
  }
});

server.listen(PORT, () => {
  console.log(`\n🔵 pirata6 Labs SOC Platform`);
  console.log(`   Server → http://localhost:${PORT}`);
  console.log(`   API    → http://localhost:${PORT}/api/state\n`);
  startLogSimulator();
  startIncidentEngine();
  startMetricsDrift();
=======
const http   = require('http');
const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

const PORT = 3000;

// ─── In-memory state ────────────────────────────────────────────────────────

let state = {
  incidents: [],
  honeypots: [
    { id: 'hny-web-01',    status: 'active',  active: true,  hits: 0,   payloads: 0,  ip: '10.0.0.11' },
    { id: 'hny-db-02',     status: 'monitor', active: false, hits: 0,   payloads: 0,  ip: '10.0.0.22' },
    { id: 'hny-iot-03',    status: 'alert',   active: true,  hits: 0,   payloads: 0,  ip: '10.0.0.33' },
    { id: 'hny-cloud-04',  status: 'idle',    active: false, hits: 0,   payloads: 0,  ip: '10.0.0.44' },
    { id: 'hny-smtp-05',   status: 'active',  active: true,  hits: 0,   payloads: 0,  ip: '10.0.0.55' },
  ],
  metrics: {
    totalCaptures: 2410,
    threatsBlocked: 184,
    activeIncidents: 3,
    avgResponseTime: 2.4,
    accuracy: 78,
    patternMatch: 91,
    knowledgeScore: 78,
    behaviorScore: 64,
    threatLevel: 85,
  },
  blockedIPs: [],
  tickets: [],
  logs: [],
  sseClients: new Map(),
  autoResponse: true,
};

// ─── Threat simulation data ──────────────────────────────────────────────────

const ATTACK_TYPES = [
  { type: 'ransomware',      severity: 'critical', pattern: 'Sodinokibi/REvil' },
  { type: 'lateral_move',    severity: 'critical', pattern: 'Pass-the-Hash' },
  { type: 'brute_force',     severity: 'warning',  pattern: 'SSH credential spray' },
  { type: 'data_exfil',      severity: 'critical', pattern: 'DNS tunneling' },
  { type: 'c2_beacon',       severity: 'warning',  pattern: 'Cobalt Strike beacon' },
  { type: 'lsass_dump',      severity: 'critical', pattern: 'Mimikatz LSASS' },
  { type: 'powershell',      severity: 'warning',  pattern: 'AMSI bypass' },
  { type: 'smb_spread',      severity: 'warning',  pattern: 'EternalBlue SMB' },
  { type: 'sql_injection',   severity: 'warning',  pattern: 'UNION-based SQLi' },
  { type: 'phishing',        severity: 'info',     pattern: 'Spear phishing' },
  { type: 'port_scan',       severity: 'info',     pattern: 'Nmap SYN scan' },
  { type: 'rdp_brute',       severity: 'warning',  pattern: 'RDP brute force' },
  { type: 'log4shell',       severity: 'critical', pattern: 'Log4Shell CVE-2021-44228' },
  { type: 'zero_day',        severity: 'critical', pattern: 'Unknown 0-day exploit' },
];

const ATTACKER_IPS = [
  '185.234.218.44', '91.108.4.200', '193.32.162.5', '45.142.212.100',
  '194.165.16.77', '62.233.50.11', '23.183.88.21', '5.188.206.14',
  '103.75.189.33', '178.128.22.165',
];

const LOG_MESSAGES = {
  critical: [
    'CRITICAL: Ransomware pattern detected ({pattern})',
    'CRITICAL: LSASS dump attempt on {target}',
    'CRITICAL: Active C2 communication → {ip}',
    'CRITICAL: Mass file encryption triggered',
    'CRITICAL: Privilege escalation success on {target}',
    'CRITICAL: Data exfiltration started ({size}MB)',
    'CRITICAL: Zero-day exploit fired on {target}',
    'CRITICAL: Lateral movement from {ip}',
  ],
  warning: [
    'WARN: Multiple failed auth attempts (SSH) from {ip}',
    'WARN: Suspicious PowerShell invocation',
    'WARN: DNS beaconing → {ip}',
    'WARN: Unusual egress traffic spike ({size}MB)',
    'WARN: SMB traffic spike on hny-iot-03',
    'WARN: AMSI bypass attempted',
    'WARN: Credential stuffing attack in progress',
    'WARN: RDP brute-force from {ip}',
  ],
  info: [
    'INFO: Honeypot-{n} connection registered',
    'INFO: SIEM correlation complete',
    'INFO: Port scan from {ip} — all decoy',
    'INFO: ML model retrained (accuracy +{score}%)',
    'INFO: TLS certificate validated',
    'INFO: Threat intel feed updated',
    'INFO: Backup verification passed',
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return crypto.randomBytes(6).toString('hex');
}

function ts() {
  return new Date().toLocaleTimeString('en-GB');
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fillTemplate(tpl) {
  return tpl
    .replace('{ip}',     rand(ATTACKER_IPS))
    .replace('{target}', `10.0.${randInt(0,9)}.${randInt(10,99)}`)
    .replace('{size}',   randInt(1, 500))
    .replace('{score}',  randInt(1, 8))
    .replace('{pattern}', rand(ATTACK_TYPES).pattern)
    .replace('{n}',      randInt(1, 5));
}

function buildLogEntry(level) {
  const msgs = LOG_MESSAGES[level];
  return {
    id:        uid(),
    ts:        ts(),
    level,
    message:   fillTemplate(rand(msgs)),
    sourceIp:  rand(ATTACKER_IPS),
    honeypot:  rand(state.honeypots).id,
    createdAt: Date.now(),
  };
}

function buildIncident(attack) {
  return {
    id:         uid(),
    type:       attack.type,
    severity:   attack.severity,
    pattern:    attack.pattern,
    sourceIp:   rand(ATTACKER_IPS),
    target:     `10.0.${randInt(0,3)}.${randInt(10,99)}`,
    honeypot:   rand(state.honeypots).id,
    status:     'active',
    ts:         ts(),
    ttd:        randInt(1, 30) + 's',
    confidence: randInt(70, 99),
    actions:    [],
    createdAt:  Date.now(),
  };
}

// ─── SSE broadcast ───────────────────────────────────────────────────────────

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const [, res] of state.sseClients) {
    try { res.write(payload); } catch(_) {}
  }
}

// ─── Simulation engine ───────────────────────────────────────────────────────

// Emit random logs every 2–5 seconds
function startLogSimulator() {
  function emitLog() {
    const r = Math.random();
    const level = r < 0.15 ? 'critical' : r < 0.45 ? 'warning' : 'info';
    const entry = buildLogEntry(level);
    state.logs.unshift(entry);
    if (state.logs.length > 500) state.logs.pop();

    // Update honeypot hit counts
    const pot = state.honeypots.find(h => h.id === entry.honeypot);
    if (pot) {
      pot.hits++;
      if (level !== 'info') pot.payloads++;
      state.metrics.totalCaptures++;
    }

    broadcast('log', entry);

    // Schedule next
    setTimeout(emitLog, randInt(1800, 5000));
  }
  setTimeout(emitLog, 1000);
}

// Spawn incidents every 15–40 seconds
function startIncidentEngine() {
  function spawnIncident() {
    const attack   = rand(ATTACK_TYPES);
    const incident = buildIncident(attack);
    state.incidents.unshift(incident);
    if (state.incidents.length > 50) state.incidents.pop();

    state.metrics.activeIncidents = state.incidents.filter(i => i.status === 'active').length;
    state.metrics.knowledgeScore  = Math.min(99, state.metrics.knowledgeScore + randInt(-2, 4));
    state.metrics.behaviorScore   = Math.min(99, state.metrics.behaviorScore  + randInt(-3, 5));
    state.metrics.threatLevel     = Math.min(100, Math.max(10, state.metrics.threatLevel + randInt(-5, 10)));

    broadcast('incident', incident);
    broadcast('metrics', state.metrics);

    // Auto-response if enabled
    if (state.autoResponse && incident.severity === 'critical') {
      setTimeout(() => {
        incident.status = 'contained';
        incident.actions.push({ action: 'auto_isolate', ts: ts() });
        state.metrics.threatsBlocked++;
        broadcast('incident_update', incident);
        broadcast('metrics', state.metrics);
      }, randInt(3000, 8000));
    }

    setTimeout(spawnIncident, randInt(15000, 40000));
  }
  setTimeout(spawnIncident, 3000);
}

// Metrics drift
function startMetricsDrift() {
  setInterval(() => {
    state.metrics.avgResponseTime = Math.max(0.5, +(state.metrics.avgResponseTime + (Math.random() - 0.5) * 0.3).toFixed(1));
    state.metrics.accuracy        = Math.min(99, Math.max(50, state.metrics.accuracy + randInt(-1, 2)));
    state.metrics.patternMatch    = Math.min(99, Math.max(60, state.metrics.patternMatch + randInt(-1, 2)));
    broadcast('metrics', state.metrics);
  }, 8000);
}

// ─── Routing ─────────────────────────────────────────────────────────────────

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise(resolve => {
    let buf = '';
    req.on('data', c => buf += c);
    req.on('end', () => {
      try { resolve(JSON.parse(buf)); } catch(_) { resolve({}); }
    });
  });
}

// ─── Route handlers ──────────────────────────────────────────────────────────

const routes = {
  // SSE stream
  'GET /api/stream': (req, res) => {
    const clientId = uid();
    res.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(`event: connected\ndata: {"clientId":"${clientId}"}\n\n`);
    state.sseClients.set(clientId, res);

    // Send current state immediately
    res.write(`event: state\ndata: ${JSON.stringify({
      honeypots: state.honeypots,
      metrics:   state.metrics,
      incidents: state.incidents.slice(0, 10),
      logs:      state.logs.slice(0, 20),
    })}\n\n`);

    req.on('close', () => { state.sseClients.delete(clientId); });
    // Heartbeat
    const hb = setInterval(() => { try { res.write(':ping\n\n'); } catch(_) { clearInterval(hb); } }, 15000);
  },

  // State
  'GET /api/state': (req, res) => {
    json(res, 200, {
      honeypots: state.honeypots,
      metrics:   state.metrics,
      incidents: state.incidents.slice(0, 20),
      logs:      state.logs.slice(0, 50),
      blockedIPs: state.blockedIPs,
    });
  },

  // Incidents
  'GET /api/incidents': (req, res) => json(res, 200, state.incidents),
  'POST /api/incidents/:id/action': async (req, res, params) => {
    const body = await readBody(req);
    const inc  = state.incidents.find(i => i.id === params.id);
    if (!inc) return json(res, 404, { error: 'not found' });

    const action = body.action;
    inc.actions.push({ action, ts: ts(), note: body.note });

    if (['isolate','contain'].includes(action)) {
      inc.status = action === 'isolate' ? 'isolated' : 'contained';
      state.metrics.threatsBlocked++;
    } else if (action === 'escalate') {
      inc.escalated = true;
    } else if (action === 'block_ip') {
      if (!state.blockedIPs.includes(inc.sourceIp)) state.blockedIPs.push(inc.sourceIp);
    } else if (action === 'ticket') {
      const ticket = { id: uid(), incidentId: inc.id, createdAt: ts(), status: 'open', severity: inc.severity };
      state.tickets.push(ticket);
      inc.ticketId = ticket.id;
    }

    state.metrics.activeIncidents = state.incidents.filter(i => i.status === 'active').length;
    state.metrics.knowledgeScore  = Math.min(99, state.metrics.knowledgeScore + 3);
    state.metrics.behaviorScore   = Math.min(99, state.metrics.behaviorScore  + 2);

    broadcast('incident_update', inc);
    broadcast('metrics', state.metrics);
    json(res, 200, { ok: true, incident: inc });
  },

  // Honeypots
  'GET /api/honeypots': (req, res) => json(res, 200, state.honeypots),
  'PATCH /api/honeypots/:id': async (req, res, params) => {
    const body = await readBody(req);
    const pot  = state.honeypots.find(h => h.id === params.id);
    if (!pot) return json(res, 404, { error: 'not found' });
    Object.assign(pot, body);
    broadcast('honeypot_update', pot);
    json(res, 200, pot);
  },

  // Metrics
  'GET /api/metrics': (req, res) => json(res, 200, state.metrics),

  // Logs
  'GET /api/logs': (req, res) => json(res, 200, state.logs.slice(0, 100)),

  // Block IP
  'POST /api/block': async (req, res) => {
    const body = await readBody(req);
    if (body.ip && !state.blockedIPs.includes(body.ip)) {
      state.blockedIPs.push(body.ip);
      state.metrics.threatsBlocked++;
      broadcast('ip_blocked', { ip: body.ip, ts: ts() });
      broadcast('metrics', state.metrics);
    }
    json(res, 200, { ok: true, blockedIPs: state.blockedIPs });
  },

  // Auto-response toggle
  'POST /api/autoresponse': async (req, res) => {
    const body = await readBody(req);
    state.autoResponse = !!body.enabled;
    json(res, 200, { autoResponse: state.autoResponse });
  },

  // Tickets
  'GET /api/tickets': (req, res) => json(res, 200, state.tickets),

  // Scan trigger (simulate)
  'POST /api/scan': async (req, res) => {
    const body = await readBody(req);
    const scanId = uid();
    setTimeout(() => {
      const result = {
        scanId, ts: ts(), target: body.target || 'all',
        vulnsFound: randInt(0, 7),
        openPorts:  [22, 80, 443, randInt(8000, 9000)].filter(() => Math.random() > 0.3),
        riskScore:  randInt(20, 95),
      };
      broadcast('scan_complete', result);
    }, randInt(3000, 7000));
    json(res, 202, { scanId, message: 'Scan initiated' });
  },
};

// ─── HTTP server ─────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  setCORSHeaders(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const parsed   = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsed.pathname;

  // Serve static files (frontend)
  if (req.method === 'GET' && !pathname.startsWith('/api/')) {
    const filePath = pathname === '/' ? '/index.html' : pathname;
    const fullPath = path.join(__dirname, 'public', filePath);
    if (fs.existsSync(fullPath)) {
      const ext  = path.extname(fullPath).slice(1);
      const mime = { html: 'text/html', js: 'application/javascript', css: 'text/css' }[ext] || 'text/plain';
      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(fullPath).pipe(res);
    } else {
      res.writeHead(404); res.end('Not found');
    }
    return;
  }

  // Match parameterised routes
  let handler = null, params = {};

  for (const [pattern, fn] of Object.entries(routes)) {
    const [method, ...parts] = pattern.split(' ');
    if (method !== req.method) continue;

    const routeParts = parts.join(' ').split('/').filter(Boolean);
    const reqParts   = pathname.split('/').filter(Boolean);
    if (routeParts.length !== reqParts.length) continue;

    let matched = true;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].slice(1)] = reqParts[i];
      } else if (routeParts[i] !== reqParts[i]) {
        matched = false; break;
      }
    }
    if (matched) { handler = fn; break; }
  }

  if (handler) {
    handler(req, res, params);
  } else {
    json(res, 404, { error: 'endpoint not found' });
  }
});

server.listen(PORT, () => {
  console.log(`\n🔵 pirata6 Labs SOC Platform`);
  console.log(`   Server → http://localhost:${PORT}`);
  console.log(`   API    → http://localhost:${PORT}/api/state\n`);
  startLogSimulator();
  startIncidentEngine();
  startMetricsDrift();
>>>>>>> ae50ee36fa1955a00a3d89ed2ea63087ac849453
});