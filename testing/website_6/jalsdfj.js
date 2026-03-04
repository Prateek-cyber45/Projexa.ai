<<<<<<< HEAD
/**
 * pirata6 Academy — Full Backend
 * Pure Node.js: HTTP + Server-Sent Events + REST API
 * Zero npm dependencies.
 */

const http   = require('http');
const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

const PORT = 3001;

// ─── Seed data ──────────────────────────────────────────────────────────────

const PATHS_SEED = [
  {
    id: 'path-pentest',
    title: 'Penetration Testing Fundamentals',
    level: 'beginner',
    color: '#0a84ff',
    icon: '🎯',
    description: 'Learn the foundations of ethical hacking, reconnaissance, exploitation, and responsible disclosure.',
    totalModules: 26,
    completedModules: 12,
    xpReward: 2600,
    certId: 'cert-pentest-fundamentals',
    tags: ['recon', 'exploitation', 'reporting', 'tools'],
    estimatedHours: 40,
    enrolledCount: 3842,
  },
  {
    id: 'path-soc',
    title: 'SOC Analyst Professional',
    level: 'intermediate',
    color: '#30d158',
    icon: '🛡️',
    description: 'Master security operations, SIEM platforms, log analysis, and incident triage at scale.',
    totalModules: 24,
    completedModules: 8,
    xpReward: 3200,
    certId: 'cert-soc-analyst',
    tags: ['SIEM', 'incident response', 'log analysis', 'triage'],
    estimatedHours: 52,
    enrolledCount: 2190,
  },
  {
    id: 'path-malware',
    title: 'Malware Analysis & Reverse Engineering',
    level: 'advanced',
    color: '#ff9f0a',
    icon: '🔬',
    description: 'Deep-dive into static and dynamic malware analysis, disassembly, and behavioral profiling.',
    totalModules: 20,
    completedModules: 3,
    xpReward: 4800,
    certId: 'cert-malware-analyst',
    tags: ['static analysis', 'dynamic analysis', 'IDA', 'YARA'],
    estimatedHours: 68,
    enrolledCount: 901,
  },
  {
    id: 'path-cloud',
    title: 'Cloud Security Engineering',
    level: 'intermediate',
    color: '#bf5af2',
    icon: '☁️',
    description: 'Secure AWS, Azure, and GCP environments — IAM hardening, misconfiguration hunting, and CSPM.',
    totalModules: 22,
    completedModules: 0,
    xpReward: 3600,
    certId: 'cert-cloud-security',
    tags: ['AWS', 'Azure', 'IAM', 'CSPM'],
    estimatedHours: 48,
    enrolledCount: 1450,
  },
  {
    id: 'path-threat-intel',
    title: 'Threat Intelligence & Hunting',
    level: 'advanced',
    color: '#ff3b30',
    icon: '🕵️',
    description: 'Build threat intelligence programs, hunt adversaries using MITRE ATT&CK, and operationalize IOCs.',
    totalModules: 18,
    completedModules: 0,
    xpReward: 4200,
    certId: 'cert-threat-intel',
    tags: ['MITRE', 'IOCs', 'hunting', 'OSINT'],
    estimatedHours: 56,
    enrolledCount: 1107,
  },
  {
    id: 'path-webapp',
    title: 'Web Application Security',
    level: 'intermediate',
    color: '#ffd60a',
    icon: '🌐',
    description: 'Master OWASP Top 10, Burp Suite, API hacking, and modern web exploitation techniques.',
    totalModules: 28,
    completedModules: 0,
    xpReward: 3400,
    certId: 'cert-webapp-security',
    tags: ['OWASP', 'Burp Suite', 'API', 'XSS', 'SQLi'],
    estimatedHours: 44,
    enrolledCount: 4215,
  },
];

const MODULES_SEED = {
  'path-pentest': [
    { id: 'm-001', order: 1,  title: 'Ethical Hacking Foundations',      type: 'theory',  duration: 45,  xp: 100, completed: true,  locked: false },
    { id: 'm-002', order: 2,  title: 'Reconnaissance Techniques',        type: 'theory',  duration: 60,  xp: 150, completed: true,  locked: false },
    { id: 'm-003', order: 3,  title: 'OSINT Framework Lab',              type: 'lab',     duration: 90,  xp: 200, completed: true,  locked: false },
    { id: 'm-004', order: 4,  title: 'Network Scanning with Nmap',       type: 'lab',     duration: 75,  xp: 175, completed: true,  locked: false },
    { id: 'm-005', order: 5,  title: 'Vulnerability Assessment',         type: 'theory',  duration: 55,  xp: 125, completed: true,  locked: false },
    { id: 'm-006', order: 6,  title: 'Metasploit Framework Basics',      type: 'lab',     duration: 120, xp: 250, completed: true,  locked: false },
    { id: 'm-007', order: 7,  title: 'Web App Enumeration',              type: 'lab',     duration: 85,  xp: 200, completed: true,  locked: false },
    { id: 'm-008', order: 8,  title: 'SQL Injection Fundamentals',       type: 'lab',     duration: 100, xp: 225, completed: true,  locked: false },
    { id: 'm-009', order: 9,  title: 'XSS & CSRF Attacks',               type: 'lab',     duration: 90,  xp: 200, completed: true,  locked: false },
    { id: 'm-010', order: 10, title: 'Password Attacks',                 type: 'lab',     duration: 70,  xp: 175, completed: true,  locked: false },
    { id: 'm-011', order: 11, title: 'Privilege Escalation (Linux)',     type: 'lab',     duration: 110, xp: 250, completed: true,  locked: false },
    { id: 'm-012', order: 12, title: 'Privilege Escalation (Windows)',   type: 'lab',     duration: 110, xp: 250, completed: true,  locked: false },
    { id: 'm-013', order: 13, title: 'Post-Exploitation Techniques',     type: 'lab',     duration: 95,  xp: 225, completed: false, locked: false },
    { id: 'm-014', order: 14, title: 'Lateral Movement',                 type: 'theory',  duration: 65,  xp: 150, completed: false, locked: true  },
    { id: 'm-015', order: 15, title: 'Persistence Mechanisms',           type: 'theory',  duration: 70,  xp: 150, completed: false, locked: true  },
    { id: 'm-016', order: 16, title: 'Anti-Forensics & Evasion',         type: 'theory',  duration: 80,  xp: 175, completed: false, locked: true  },
    { id: 'm-017', order: 17, title: 'Reporting & Documentation',        type: 'theory',  duration: 55,  xp: 125, completed: false, locked: true  },
    { id: 'm-018', order: 18, title: 'Final CTF Challenge',              type: 'challenge',duration:180, xp: 500, completed: false, locked: true  },
  ],
  'path-soc': [
    { id: 's-001', order: 1, title: 'SOC Roles & Responsibilities',   type: 'theory',   duration: 40,  xp: 100, completed: true,  locked: false },
    { id: 's-002', order: 2, title: 'SIEM Architecture',              type: 'theory',   duration: 60,  xp: 150, completed: true,  locked: false },
    { id: 's-003', order: 3, title: 'Splunk Fundamentals Lab',        type: 'lab',      duration: 120, xp: 250, completed: true,  locked: false },
    { id: 's-004', order: 4, title: 'Log Analysis Deep Dive',         type: 'lab',      duration: 90,  xp: 200, completed: true,  locked: false },
    { id: 's-005', order: 5, title: 'Alert Triage Methodology',       type: 'theory',   duration: 55,  xp: 125, completed: true,  locked: false },
    { id: 's-006', order: 6, title: 'Incident Response Playbooks',    type: 'theory',   duration: 70,  xp: 175, completed: true,  locked: false },
    { id: 's-007', order: 7, title: 'Network Traffic Analysis',       type: 'lab',      duration: 100, xp: 225, completed: true,  locked: false },
    { id: 's-008', order: 8, title: 'Threat Intel Integration',       type: 'theory',   duration: 65,  xp: 150, completed: true,  locked: false },
    { id: 's-009', order: 9, title: 'Ransomware IR Simulation',       type: 'challenge',duration: 150, xp: 350, completed: false, locked: false },
    { id: 's-010', order:10, title: 'Digital Forensics Basics',       type: 'theory',   duration: 80,  xp: 175, completed: false, locked: true  },
  ],
  'path-malware': [
    { id: 'ma-001', order: 1, title: 'Malware Taxonomy',              type: 'theory',  duration: 45,  xp: 100, completed: true,  locked: false },
    { id: 'ma-002', order: 2, title: 'Safe Lab Environment Setup',    type: 'lab',     duration: 60,  xp: 150, completed: true,  locked: false },
    { id: 'ma-003', order: 3, title: 'Static Analysis with PE Tools', type: 'lab',     duration: 90,  xp: 200, completed: true,  locked: false },
    { id: 'ma-004', order: 4, title: 'Dynamic Analysis & Sandboxing', type: 'lab',     duration: 120, xp: 250, completed: false, locked: false },
    { id: 'ma-005', order: 5, title: 'x86 Assembly Primer',           type: 'theory',  duration: 100, xp: 225, completed: false, locked: true  },
  ],
};

const CERTS_SEED = [
  { id: 'cert-pentest-fundamentals', title: 'Certified Pentest Fundamentals',     earned: false, pathId: 'path-pentest', issueDate: null },
  { id: 'cert-soc-analyst',          title: 'Certified SOC Analyst Professional', earned: false, pathId: 'path-soc',     issueDate: null },
  { id: 'cert-malware-analyst',      title: 'Certified Malware Analyst',          earned: false, pathId: 'path-malware', issueDate: null },
  { id: 'cert-cloud-security',       title: 'Certified Cloud Security Engineer',  earned: false, pathId: 'path-cloud',   issueDate: null },
  { id: 'cert-threat-intel',         title: 'Certified Threat Intel Analyst',     earned: false, pathId: 'path-threat-intel', issueDate: null },
  { id: 'cert-webapp-security',      title: 'Certified Web App Security Tester',  earned: false, pathId: 'path-webapp',  issueDate: null },
];

const LEADERBOARD_SEED = [
  { rank: 1,  username: 'h4xorwl0lf',  xp: 48200, badge: '🏆', streak: 142, level: 'elite'    },
  { rank: 2,  username: 'n3t_phantom',  xp: 44750, badge: '🥈', streak: 98,  level: 'expert'   },
  { rank: 3,  username: 'voidb1t',      xp: 41100, badge: '🥉', streak: 77,  level: 'expert'   },
  { rank: 4,  username: 'cr0wbar',      xp: 38900, badge: '⭐', streak: 55,  level: 'advanced' },
  { rank: 5,  username: 'zeroday_j',    xp: 35400, badge: '⭐', streak: 44,  level: 'advanced' },
  { rank: 6,  username: 'shellsh0ck',   xp: 29800, badge: '⭐', streak: 31,  level: 'advanced' },
  { rank: 7,  username: 'p1rata_you',   xp: 15750, badge: '📘', streak: 7,   level: 'intermediate', isUser: true },
  { rank: 8,  username: 'sk1ll3d',      xp: 12300, badge: '📘', streak: 5,   level: 'intermediate' },
];

// ─── In-memory state ─────────────────────────────────────────────────────────

const state = {
  paths:       JSON.parse(JSON.stringify(PATHS_SEED)),
  modules:     JSON.parse(JSON.stringify(MODULES_SEED)),
  certs:       JSON.parse(JSON.stringify(CERTS_SEED)),
  leaderboard: JSON.parse(JSON.stringify(LEADERBOARD_SEED)),
  user: {
    username:   'p1rata_you',
    xp:          15750,
    xpToNext:    20000,
    level:       12,
    streak:      7,
    streakMax:   14,
    totalTime:   3640,         // minutes
    rank:        7,
    badges:      ['🎯','🛡️','🔬'],
    joinDate:    '2024-09-01',
    lastActive:  new Date().toISOString(),
  },
  activity: [],
  quizSessions: {},
  sseClients: new Map(),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() { return crypto.randomBytes(6).toString('hex'); }
function ts()  { return new Date().toLocaleTimeString('en-GB'); }
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function calcProgress(path) {
  return path.totalModules > 0
    ? Math.round((path.completedModules / path.totalModules) * 100)
    : 0;
}

function addActivity(type, message, xp = 0) {
  const entry = { id: uid(), type, message, xp, ts: ts(), createdAt: Date.now() };
  state.activity.unshift(entry);
  if (state.activity.length > 50) state.activity.pop();
  broadcast('activity', entry);
  return entry;
}

// ─── SSE broadcast ────────────────────────────────────────────────────────────

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const [, res] of state.sseClients) {
    try { res.write(payload); } catch (_) {}
  }
}

// ─── Simulated "other learner" activity ──────────────────────────────────────

const ACTIVITY_TEMPLATES = [
  { type: 'module_complete', fn: () => `${rand(['n3t_phantom','voidb1t','cr0wbar','zeroday_j'])} completed "${rand(['SQL Injection Fundamentals','Nmap Lab','SIEM Basics','Log Analysis'])}"`, xp: () => randInt(100, 250) },
  { type: 'badge_earned',    fn: () => `${rand(['h4xorwl0lf','shellsh0ck','sk1ll3d'])} earned the "${rand(['🎯 Recon Pro','🛡️ SOC Hero','🔬 Malware Savant'])}" badge`, xp: () => 0 },
  { type: 'cert_earned',     fn: () => `${rand(['n3t_phantom','voidb1t'])} earned Certified ${rand(['Pentest','SOC Analyst','Malware Analyst'])} certificate`, xp: () => 0 },
  { type: 'streak_milestone',fn: () => `${rand(['cr0wbar','zeroday_j'])} hit a ${rand([30,60,90])}-day learning streak 🔥`, xp: () => 0 },
  { type: 'challenge',       fn: () => `${rand(['h4xorwl0lf','shellsh0ck'])} solved the "${rand(['Final CTF','Ransomware IR','Web App CTF'])}" challenge`, xp: () => randInt(300, 500) },
];

function startActivitySimulator() {
  function emit() {
    const tpl = rand(ACTIVITY_TEMPLATES);
    addActivity(tpl.type, tpl.fn(), tpl.xp());
    // Update a random leaderboard XP
    const learner = state.leaderboard.find(l => !l.isUser && Math.random() > 0.6);
    if (learner) {
      learner.xp += randInt(50, 200);
      broadcast('leaderboard', state.leaderboard);
    }
    setTimeout(emit, randInt(8000, 22000));
  }
  setTimeout(emit, 4000);
}

// ─── Quiz question bank ───────────────────────────────────────────────────────

const QUIZ_BANK = {
  'path-pentest': [
    { q: 'Which Nmap flag performs a SYN (stealth) scan?', options: ['-sS','-sV','-sU','-sT'], answer: 0 },
    { q: 'What does OSINT stand for?', options: ['Open Source Intelligence','Operational Security Intel','Open System Interface Network','Offensive Security Integration'], answer: 0 },
    { q: 'Which HTTP response code indicates a successful SQL injection bypass login?', options: ['200','302','403','500'], answer: 0 },
    { q: 'In Metasploit, which command shows active sessions?', options: ['sessions -l','show sessions','list sessions','active sessions'], answer: 0 },
    { q: 'What is the default port for SMB?', options: ['445','139','443','8080'], answer: 0 },
  ],
  'path-soc': [
    { q: 'What does SIEM stand for?', options: ['Security Information and Event Management','System Intrusion Event Monitor','Security Intel and Event Mapping','Secure Infrastructure Event Module'], answer: 0 },
    { q: 'Which log source is most valuable for detecting lateral movement?', options: ['Windows Event Logs','Apache access logs','DNS logs','DHCP logs'], answer: 0 },
    { q: 'What is the MITRE ATT&CK tactic for initial access?', options: ['TA0001','TA0002','TA0003','TA0004'], answer: 0 },
  ],
  'path-malware': [
    { q: 'What tool is commonly used for static PE analysis?', options: ['PEStudio','Wireshark','Nmap','Ghidra'], answer: 0 },
    { q: 'What does the PE header MZ signature indicate?', options: ['A Windows executable','A Linux ELF binary','A PDF file','A ZIP archive'], answer: 0 },
  ],
};

// ─── HTTP Infrastructure ──────────────────────────────────────────────────────

function setCORS(res) {
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
    req.on('end', () => { try { resolve(JSON.parse(buf)); } catch (_) { resolve({}); } });
  });
}

// ─── Route definitions ────────────────────────────────────────────────────────

const routes = {

  // SSE stream
  'GET /api/stream': (req, res) => {
    const cid = uid();
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(`event: connected\ndata: {"clientId":"${cid}"}\n\n`);
    res.write(`event: state\ndata: ${JSON.stringify({
      paths:       state.paths,
      user:        state.user,
      certs:       state.certs,
      leaderboard: state.leaderboard,
      activity:    state.activity.slice(0, 15),
    })}\n\n`);
    state.sseClients.set(cid, res);
    const hb = setInterval(() => { try { res.write(':ping\n\n'); } catch (_) { clearInterval(hb); } }, 15000);
    req.on('close', () => { state.sseClients.delete(cid); clearInterval(hb); });
  },

  // Paths
  'GET /api/paths': (req, res) => json(res, 200, state.paths.map(p => ({ ...p, progress: calcProgress(p) }))),

  'GET /api/paths/:id': (req, res, p) => {
    const path = state.paths.find(x => x.id === p.id);
    if (!path) return json(res, 404, { error: 'not found' });
    const mods = state.modules[p.id] || [];
    json(res, 200, { ...path, progress: calcProgress(path), modules: mods });
  },

  // Modules
  'GET /api/paths/:id/modules': (req, res, p) => {
    json(res, 200, state.modules[p.id] || []);
  },

  'POST /api/paths/:pathId/modules/:moduleId/complete': async (req, res, p) => {
    const mods = state.modules[p.pathId];
    if (!mods) return json(res, 404, { error: 'path not found' });
    const mod = mods.find(m => m.id === p.moduleId);
    if (!mod) return json(res, 404, { error: 'module not found' });
    if (mod.locked) return json(res, 403, { error: 'module locked' });
    if (mod.completed) return json(res, 200, { ok: true, alreadyDone: true });

    mod.completed = true;

    // Unlock next module
    const next = mods.find(m => m.order === mod.order + 1);
    if (next) next.locked = false;

    // Update path progress
    const pathObj = state.paths.find(x => x.id === p.pathId);
    if (pathObj) {
      pathObj.completedModules = mods.filter(m => m.completed).length;
    }

    // XP & streak
    state.user.xp     += mod.xp;
    state.user.streak  = Math.min(state.user.streak + 1, 365);
    state.user.totalTime += mod.duration;
    addActivity('module_complete', `You completed "${mod.title}"`, mod.xp);

    // Update leaderboard entry for user
    const lb = state.leaderboard.find(l => l.isUser);
    if (lb) { lb.xp = state.user.xp; lb.streak = state.user.streak; }

    // Check cert
    if (pathObj && pathObj.completedModules === pathObj.totalModules) {
      const cert = state.certs.find(c => c.id === pathObj.certId);
      if (cert && !cert.earned) {
        cert.earned    = true;
        cert.issueDate = new Date().toISOString().split('T')[0];
        addActivity('cert_earned', `You earned: ${cert.title}`, 0);
        broadcast('cert_earned', cert);
      }
    }

    broadcast('user_update', state.user);
    broadcast('path_update', { ...pathObj, progress: calcProgress(pathObj), modules: mods });
    json(res, 200, { ok: true, xpEarned: mod.xp, user: state.user });
  },

  // User
  'GET /api/user': (req, res) => json(res, 200, state.user),

  'PATCH /api/user': async (req, res) => {
    const body = await readBody(req);
    Object.assign(state.user, body);
    broadcast('user_update', state.user);
    json(res, 200, state.user);
  },

  // Leaderboard
  'GET /api/leaderboard': (req, res) => {
    const sorted = [...state.leaderboard].sort((a, b) => b.xp - a.xp).map((l, i) => ({ ...l, rank: i + 1 }));
    json(res, 200, sorted);
  },

  // Certifications
  'GET /api/certs': (req, res) => json(res, 200, state.certs),

  // Activity feed
  'GET /api/activity': (req, res) => json(res, 200, state.activity.slice(0, 30)),

  // Quiz
  'GET /api/quiz/:pathId': (req, res, p) => {
    const bank = QUIZ_BANK[p.pathId];
    if (!bank) return json(res, 404, { error: 'no quiz for this path' });
    const shuffled = [...bank].sort(() => Math.random() - 0.5).slice(0, 5);
    const sessionId = uid();
    state.quizSessions[sessionId] = { pathId: p.pathId, questions: shuffled, answers: [], started: Date.now() };
    // Send questions without answers
    json(res, 200, { sessionId, questions: shuffled.map(({ q, options }) => ({ q, options })) });
  },

  'POST /api/quiz/:sessionId/submit': async (req, res, p) => {
    const body    = await readBody(req);
    const session = state.quizSessions[p.sessionId];
    if (!session) return json(res, 404, { error: 'session not found' });

    const { answers } = body; // array of selected indices
    let correct = 0;
    const results = session.questions.map((q, i) => {
      const isCorrect = answers[i] === q.answer;
      if (isCorrect) correct++;
      return { q: q.q, selected: answers[i], correct: q.answer, isCorrect };
    });

    const score  = Math.round((correct / session.questions.length) * 100);
    const xpGain = score >= 80 ? randInt(150, 300) : score >= 60 ? randInt(50, 150) : 0;
    if (xpGain) {
      state.user.xp += xpGain;
      addActivity('quiz_passed', `Quiz passed (${score}%) on ${session.pathId.replace('path-','')}`, xpGain);
    }

    delete state.quizSessions[p.sessionId];
    broadcast('user_update', state.user);
    json(res, 200, { score, correct, total: session.questions.length, xpGain, results });
  },

  // Stats summary
  'GET /api/stats': (req, res) => {
    const totalCompleted = Object.values(state.modules).flat().filter(m => m.completed).length;
    const totalModules   = Object.values(state.modules).flat().length;
    json(res, 200, {
      totalCompleted,
      totalModules,
      pathsStarted:  state.paths.filter(p => p.completedModules > 0).length,
      certsEarned:   state.certs.filter(c => c.earned).length,
      xp:            state.user.xp,
      streak:        state.user.streak,
      totalTime:     state.user.totalTime,
      rank:          state.user.rank,
    });
  },
};

// ─── HTTP server ──────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  setCORS(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const parsed   = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsed.pathname;

  // Static files
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

  // Route matching with params
  let handler = null, params = {};
  for (const [pattern, fn] of Object.entries(routes)) {
    const [method, ...parts] = pattern.split(' ');
    if (method !== req.method) continue;
    const routeParts = parts.join(' ').split('/').filter(Boolean);
    const reqParts   = pathname.split('/').filter(Boolean);
    if (routeParts.length !== reqParts.length) continue;
    let matched = true;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) params[routeParts[i].slice(1)] = reqParts[i];
      else if (routeParts[i] !== reqParts[i]) { matched = false; break; }
    }
    if (matched) { handler = fn; break; }
    params = {};
  }

  if (handler) handler(req, res, params);
  else json(res, 404, { error: 'endpoint not found' });
});

server.listen(PORT, () => {
  console.log(`\n📘 pirata6 Academy Platform`);
  console.log(`   Server  → http://localhost:${PORT}`);
  console.log(`   API     → http://localhost:${PORT}/api/paths`);
  console.log(`   Stream  → http://localhost:${PORT}/api/stream\n`);
  startActivitySimulator();
=======
/**
 * pirata6 Academy — Full Backend
 * Pure Node.js: HTTP + Server-Sent Events + REST API
 * Zero npm dependencies.
 */

const http   = require('http');
const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

const PORT = 3001;

// ─── Seed data ──────────────────────────────────────────────────────────────

const PATHS_SEED = [
  {
    id: 'path-pentest',
    title: 'Penetration Testing Fundamentals',
    level: 'beginner',
    color: '#0a84ff',
    icon: '🎯',
    description: 'Learn the foundations of ethical hacking, reconnaissance, exploitation, and responsible disclosure.',
    totalModules: 26,
    completedModules: 12,
    xpReward: 2600,
    certId: 'cert-pentest-fundamentals',
    tags: ['recon', 'exploitation', 'reporting', 'tools'],
    estimatedHours: 40,
    enrolledCount: 3842,
  },
  {
    id: 'path-soc',
    title: 'SOC Analyst Professional',
    level: 'intermediate',
    color: '#30d158',
    icon: '🛡️',
    description: 'Master security operations, SIEM platforms, log analysis, and incident triage at scale.',
    totalModules: 24,
    completedModules: 8,
    xpReward: 3200,
    certId: 'cert-soc-analyst',
    tags: ['SIEM', 'incident response', 'log analysis', 'triage'],
    estimatedHours: 52,
    enrolledCount: 2190,
  },
  {
    id: 'path-malware',
    title: 'Malware Analysis & Reverse Engineering',
    level: 'advanced',
    color: '#ff9f0a',
    icon: '🔬',
    description: 'Deep-dive into static and dynamic malware analysis, disassembly, and behavioral profiling.',
    totalModules: 20,
    completedModules: 3,
    xpReward: 4800,
    certId: 'cert-malware-analyst',
    tags: ['static analysis', 'dynamic analysis', 'IDA', 'YARA'],
    estimatedHours: 68,
    enrolledCount: 901,
  },
  {
    id: 'path-cloud',
    title: 'Cloud Security Engineering',
    level: 'intermediate',
    color: '#bf5af2',
    icon: '☁️',
    description: 'Secure AWS, Azure, and GCP environments — IAM hardening, misconfiguration hunting, and CSPM.',
    totalModules: 22,
    completedModules: 0,
    xpReward: 3600,
    certId: 'cert-cloud-security',
    tags: ['AWS', 'Azure', 'IAM', 'CSPM'],
    estimatedHours: 48,
    enrolledCount: 1450,
  },
  {
    id: 'path-threat-intel',
    title: 'Threat Intelligence & Hunting',
    level: 'advanced',
    color: '#ff3b30',
    icon: '🕵️',
    description: 'Build threat intelligence programs, hunt adversaries using MITRE ATT&CK, and operationalize IOCs.',
    totalModules: 18,
    completedModules: 0,
    xpReward: 4200,
    certId: 'cert-threat-intel',
    tags: ['MITRE', 'IOCs', 'hunting', 'OSINT'],
    estimatedHours: 56,
    enrolledCount: 1107,
  },
  {
    id: 'path-webapp',
    title: 'Web Application Security',
    level: 'intermediate',
    color: '#ffd60a',
    icon: '🌐',
    description: 'Master OWASP Top 10, Burp Suite, API hacking, and modern web exploitation techniques.',
    totalModules: 28,
    completedModules: 0,
    xpReward: 3400,
    certId: 'cert-webapp-security',
    tags: ['OWASP', 'Burp Suite', 'API', 'XSS', 'SQLi'],
    estimatedHours: 44,
    enrolledCount: 4215,
  },
];

const MODULES_SEED = {
  'path-pentest': [
    { id: 'm-001', order: 1,  title: 'Ethical Hacking Foundations',      type: 'theory',  duration: 45,  xp: 100, completed: true,  locked: false },
    { id: 'm-002', order: 2,  title: 'Reconnaissance Techniques',        type: 'theory',  duration: 60,  xp: 150, completed: true,  locked: false },
    { id: 'm-003', order: 3,  title: 'OSINT Framework Lab',              type: 'lab',     duration: 90,  xp: 200, completed: true,  locked: false },
    { id: 'm-004', order: 4,  title: 'Network Scanning with Nmap',       type: 'lab',     duration: 75,  xp: 175, completed: true,  locked: false },
    { id: 'm-005', order: 5,  title: 'Vulnerability Assessment',         type: 'theory',  duration: 55,  xp: 125, completed: true,  locked: false },
    { id: 'm-006', order: 6,  title: 'Metasploit Framework Basics',      type: 'lab',     duration: 120, xp: 250, completed: true,  locked: false },
    { id: 'm-007', order: 7,  title: 'Web App Enumeration',              type: 'lab',     duration: 85,  xp: 200, completed: true,  locked: false },
    { id: 'm-008', order: 8,  title: 'SQL Injection Fundamentals',       type: 'lab',     duration: 100, xp: 225, completed: true,  locked: false },
    { id: 'm-009', order: 9,  title: 'XSS & CSRF Attacks',               type: 'lab',     duration: 90,  xp: 200, completed: true,  locked: false },
    { id: 'm-010', order: 10, title: 'Password Attacks',                 type: 'lab',     duration: 70,  xp: 175, completed: true,  locked: false },
    { id: 'm-011', order: 11, title: 'Privilege Escalation (Linux)',     type: 'lab',     duration: 110, xp: 250, completed: true,  locked: false },
    { id: 'm-012', order: 12, title: 'Privilege Escalation (Windows)',   type: 'lab',     duration: 110, xp: 250, completed: true,  locked: false },
    { id: 'm-013', order: 13, title: 'Post-Exploitation Techniques',     type: 'lab',     duration: 95,  xp: 225, completed: false, locked: false },
    { id: 'm-014', order: 14, title: 'Lateral Movement',                 type: 'theory',  duration: 65,  xp: 150, completed: false, locked: true  },
    { id: 'm-015', order: 15, title: 'Persistence Mechanisms',           type: 'theory',  duration: 70,  xp: 150, completed: false, locked: true  },
    { id: 'm-016', order: 16, title: 'Anti-Forensics & Evasion',         type: 'theory',  duration: 80,  xp: 175, completed: false, locked: true  },
    { id: 'm-017', order: 17, title: 'Reporting & Documentation',        type: 'theory',  duration: 55,  xp: 125, completed: false, locked: true  },
    { id: 'm-018', order: 18, title: 'Final CTF Challenge',              type: 'challenge',duration:180, xp: 500, completed: false, locked: true  },
  ],
  'path-soc': [
    { id: 's-001', order: 1, title: 'SOC Roles & Responsibilities',   type: 'theory',   duration: 40,  xp: 100, completed: true,  locked: false },
    { id: 's-002', order: 2, title: 'SIEM Architecture',              type: 'theory',   duration: 60,  xp: 150, completed: true,  locked: false },
    { id: 's-003', order: 3, title: 'Splunk Fundamentals Lab',        type: 'lab',      duration: 120, xp: 250, completed: true,  locked: false },
    { id: 's-004', order: 4, title: 'Log Analysis Deep Dive',         type: 'lab',      duration: 90,  xp: 200, completed: true,  locked: false },
    { id: 's-005', order: 5, title: 'Alert Triage Methodology',       type: 'theory',   duration: 55,  xp: 125, completed: true,  locked: false },
    { id: 's-006', order: 6, title: 'Incident Response Playbooks',    type: 'theory',   duration: 70,  xp: 175, completed: true,  locked: false },
    { id: 's-007', order: 7, title: 'Network Traffic Analysis',       type: 'lab',      duration: 100, xp: 225, completed: true,  locked: false },
    { id: 's-008', order: 8, title: 'Threat Intel Integration',       type: 'theory',   duration: 65,  xp: 150, completed: true,  locked: false },
    { id: 's-009', order: 9, title: 'Ransomware IR Simulation',       type: 'challenge',duration: 150, xp: 350, completed: false, locked: false },
    { id: 's-010', order:10, title: 'Digital Forensics Basics',       type: 'theory',   duration: 80,  xp: 175, completed: false, locked: true  },
  ],
  'path-malware': [
    { id: 'ma-001', order: 1, title: 'Malware Taxonomy',              type: 'theory',  duration: 45,  xp: 100, completed: true,  locked: false },
    { id: 'ma-002', order: 2, title: 'Safe Lab Environment Setup',    type: 'lab',     duration: 60,  xp: 150, completed: true,  locked: false },
    { id: 'ma-003', order: 3, title: 'Static Analysis with PE Tools', type: 'lab',     duration: 90,  xp: 200, completed: true,  locked: false },
    { id: 'ma-004', order: 4, title: 'Dynamic Analysis & Sandboxing', type: 'lab',     duration: 120, xp: 250, completed: false, locked: false },
    { id: 'ma-005', order: 5, title: 'x86 Assembly Primer',           type: 'theory',  duration: 100, xp: 225, completed: false, locked: true  },
  ],
};

const CERTS_SEED = [
  { id: 'cert-pentest-fundamentals', title: 'Certified Pentest Fundamentals',     earned: false, pathId: 'path-pentest', issueDate: null },
  { id: 'cert-soc-analyst',          title: 'Certified SOC Analyst Professional', earned: false, pathId: 'path-soc',     issueDate: null },
  { id: 'cert-malware-analyst',      title: 'Certified Malware Analyst',          earned: false, pathId: 'path-malware', issueDate: null },
  { id: 'cert-cloud-security',       title: 'Certified Cloud Security Engineer',  earned: false, pathId: 'path-cloud',   issueDate: null },
  { id: 'cert-threat-intel',         title: 'Certified Threat Intel Analyst',     earned: false, pathId: 'path-threat-intel', issueDate: null },
  { id: 'cert-webapp-security',      title: 'Certified Web App Security Tester',  earned: false, pathId: 'path-webapp',  issueDate: null },
];

const LEADERBOARD_SEED = [
  { rank: 1,  username: 'h4xorwl0lf',  xp: 48200, badge: '🏆', streak: 142, level: 'elite'    },
  { rank: 2,  username: 'n3t_phantom',  xp: 44750, badge: '🥈', streak: 98,  level: 'expert'   },
  { rank: 3,  username: 'voidb1t',      xp: 41100, badge: '🥉', streak: 77,  level: 'expert'   },
  { rank: 4,  username: 'cr0wbar',      xp: 38900, badge: '⭐', streak: 55,  level: 'advanced' },
  { rank: 5,  username: 'zeroday_j',    xp: 35400, badge: '⭐', streak: 44,  level: 'advanced' },
  { rank: 6,  username: 'shellsh0ck',   xp: 29800, badge: '⭐', streak: 31,  level: 'advanced' },
  { rank: 7,  username: 'p1rata_you',   xp: 15750, badge: '📘', streak: 7,   level: 'intermediate', isUser: true },
  { rank: 8,  username: 'sk1ll3d',      xp: 12300, badge: '📘', streak: 5,   level: 'intermediate' },
];

// ─── In-memory state ─────────────────────────────────────────────────────────

const state = {
  paths:       JSON.parse(JSON.stringify(PATHS_SEED)),
  modules:     JSON.parse(JSON.stringify(MODULES_SEED)),
  certs:       JSON.parse(JSON.stringify(CERTS_SEED)),
  leaderboard: JSON.parse(JSON.stringify(LEADERBOARD_SEED)),
  user: {
    username:   'p1rata_you',
    xp:          15750,
    xpToNext:    20000,
    level:       12,
    streak:      7,
    streakMax:   14,
    totalTime:   3640,         // minutes
    rank:        7,
    badges:      ['🎯','🛡️','🔬'],
    joinDate:    '2024-09-01',
    lastActive:  new Date().toISOString(),
  },
  activity: [],
  quizSessions: {},
  sseClients: new Map(),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() { return crypto.randomBytes(6).toString('hex'); }
function ts()  { return new Date().toLocaleTimeString('en-GB'); }
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function calcProgress(path) {
  return path.totalModules > 0
    ? Math.round((path.completedModules / path.totalModules) * 100)
    : 0;
}

function addActivity(type, message, xp = 0) {
  const entry = { id: uid(), type, message, xp, ts: ts(), createdAt: Date.now() };
  state.activity.unshift(entry);
  if (state.activity.length > 50) state.activity.pop();
  broadcast('activity', entry);
  return entry;
}

// ─── SSE broadcast ────────────────────────────────────────────────────────────

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const [, res] of state.sseClients) {
    try { res.write(payload); } catch (_) {}
  }
}

// ─── Simulated "other learner" activity ──────────────────────────────────────

const ACTIVITY_TEMPLATES = [
  { type: 'module_complete', fn: () => `${rand(['n3t_phantom','voidb1t','cr0wbar','zeroday_j'])} completed "${rand(['SQL Injection Fundamentals','Nmap Lab','SIEM Basics','Log Analysis'])}"`, xp: () => randInt(100, 250) },
  { type: 'badge_earned',    fn: () => `${rand(['h4xorwl0lf','shellsh0ck','sk1ll3d'])} earned the "${rand(['🎯 Recon Pro','🛡️ SOC Hero','🔬 Malware Savant'])}" badge`, xp: () => 0 },
  { type: 'cert_earned',     fn: () => `${rand(['n3t_phantom','voidb1t'])} earned Certified ${rand(['Pentest','SOC Analyst','Malware Analyst'])} certificate`, xp: () => 0 },
  { type: 'streak_milestone',fn: () => `${rand(['cr0wbar','zeroday_j'])} hit a ${rand([30,60,90])}-day learning streak 🔥`, xp: () => 0 },
  { type: 'challenge',       fn: () => `${rand(['h4xorwl0lf','shellsh0ck'])} solved the "${rand(['Final CTF','Ransomware IR','Web App CTF'])}" challenge`, xp: () => randInt(300, 500) },
];

function startActivitySimulator() {
  function emit() {
    const tpl = rand(ACTIVITY_TEMPLATES);
    addActivity(tpl.type, tpl.fn(), tpl.xp());
    // Update a random leaderboard XP
    const learner = state.leaderboard.find(l => !l.isUser && Math.random() > 0.6);
    if (learner) {
      learner.xp += randInt(50, 200);
      broadcast('leaderboard', state.leaderboard);
    }
    setTimeout(emit, randInt(8000, 22000));
  }
  setTimeout(emit, 4000);
}

// ─── Quiz question bank ───────────────────────────────────────────────────────

const QUIZ_BANK = {
  'path-pentest': [
    { q: 'Which Nmap flag performs a SYN (stealth) scan?', options: ['-sS','-sV','-sU','-sT'], answer: 0 },
    { q: 'What does OSINT stand for?', options: ['Open Source Intelligence','Operational Security Intel','Open System Interface Network','Offensive Security Integration'], answer: 0 },
    { q: 'Which HTTP response code indicates a successful SQL injection bypass login?', options: ['200','302','403','500'], answer: 0 },
    { q: 'In Metasploit, which command shows active sessions?', options: ['sessions -l','show sessions','list sessions','active sessions'], answer: 0 },
    { q: 'What is the default port for SMB?', options: ['445','139','443','8080'], answer: 0 },
  ],
  'path-soc': [
    { q: 'What does SIEM stand for?', options: ['Security Information and Event Management','System Intrusion Event Monitor','Security Intel and Event Mapping','Secure Infrastructure Event Module'], answer: 0 },
    { q: 'Which log source is most valuable for detecting lateral movement?', options: ['Windows Event Logs','Apache access logs','DNS logs','DHCP logs'], answer: 0 },
    { q: 'What is the MITRE ATT&CK tactic for initial access?', options: ['TA0001','TA0002','TA0003','TA0004'], answer: 0 },
  ],
  'path-malware': [
    { q: 'What tool is commonly used for static PE analysis?', options: ['PEStudio','Wireshark','Nmap','Ghidra'], answer: 0 },
    { q: 'What does the PE header MZ signature indicate?', options: ['A Windows executable','A Linux ELF binary','A PDF file','A ZIP archive'], answer: 0 },
  ],
};

// ─── HTTP Infrastructure ──────────────────────────────────────────────────────

function setCORS(res) {
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
    req.on('end', () => { try { resolve(JSON.parse(buf)); } catch (_) { resolve({}); } });
  });
}

// ─── Route definitions ────────────────────────────────────────────────────────

const routes = {

  // SSE stream
  'GET /api/stream': (req, res) => {
    const cid = uid();
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(`event: connected\ndata: {"clientId":"${cid}"}\n\n`);
    res.write(`event: state\ndata: ${JSON.stringify({
      paths:       state.paths,
      user:        state.user,
      certs:       state.certs,
      leaderboard: state.leaderboard,
      activity:    state.activity.slice(0, 15),
    })}\n\n`);
    state.sseClients.set(cid, res);
    const hb = setInterval(() => { try { res.write(':ping\n\n'); } catch (_) { clearInterval(hb); } }, 15000);
    req.on('close', () => { state.sseClients.delete(cid); clearInterval(hb); });
  },

  // Paths
  'GET /api/paths': (req, res) => json(res, 200, state.paths.map(p => ({ ...p, progress: calcProgress(p) }))),

  'GET /api/paths/:id': (req, res, p) => {
    const path = state.paths.find(x => x.id === p.id);
    if (!path) return json(res, 404, { error: 'not found' });
    const mods = state.modules[p.id] || [];
    json(res, 200, { ...path, progress: calcProgress(path), modules: mods });
  },

  // Modules
  'GET /api/paths/:id/modules': (req, res, p) => {
    json(res, 200, state.modules[p.id] || []);
  },

  'POST /api/paths/:pathId/modules/:moduleId/complete': async (req, res, p) => {
    const mods = state.modules[p.pathId];
    if (!mods) return json(res, 404, { error: 'path not found' });
    const mod = mods.find(m => m.id === p.moduleId);
    if (!mod) return json(res, 404, { error: 'module not found' });
    if (mod.locked) return json(res, 403, { error: 'module locked' });
    if (mod.completed) return json(res, 200, { ok: true, alreadyDone: true });

    mod.completed = true;

    // Unlock next module
    const next = mods.find(m => m.order === mod.order + 1);
    if (next) next.locked = false;

    // Update path progress
    const pathObj = state.paths.find(x => x.id === p.pathId);
    if (pathObj) {
      pathObj.completedModules = mods.filter(m => m.completed).length;
    }

    // XP & streak
    state.user.xp     += mod.xp;
    state.user.streak  = Math.min(state.user.streak + 1, 365);
    state.user.totalTime += mod.duration;
    addActivity('module_complete', `You completed "${mod.title}"`, mod.xp);

    // Update leaderboard entry for user
    const lb = state.leaderboard.find(l => l.isUser);
    if (lb) { lb.xp = state.user.xp; lb.streak = state.user.streak; }

    // Check cert
    if (pathObj && pathObj.completedModules === pathObj.totalModules) {
      const cert = state.certs.find(c => c.id === pathObj.certId);
      if (cert && !cert.earned) {
        cert.earned    = true;
        cert.issueDate = new Date().toISOString().split('T')[0];
        addActivity('cert_earned', `You earned: ${cert.title}`, 0);
        broadcast('cert_earned', cert);
      }
    }

    broadcast('user_update', state.user);
    broadcast('path_update', { ...pathObj, progress: calcProgress(pathObj), modules: mods });
    json(res, 200, { ok: true, xpEarned: mod.xp, user: state.user });
  },

  // User
  'GET /api/user': (req, res) => json(res, 200, state.user),

  'PATCH /api/user': async (req, res) => {
    const body = await readBody(req);
    Object.assign(state.user, body);
    broadcast('user_update', state.user);
    json(res, 200, state.user);
  },

  // Leaderboard
  'GET /api/leaderboard': (req, res) => {
    const sorted = [...state.leaderboard].sort((a, b) => b.xp - a.xp).map((l, i) => ({ ...l, rank: i + 1 }));
    json(res, 200, sorted);
  },

  // Certifications
  'GET /api/certs': (req, res) => json(res, 200, state.certs),

  // Activity feed
  'GET /api/activity': (req, res) => json(res, 200, state.activity.slice(0, 30)),

  // Quiz
  'GET /api/quiz/:pathId': (req, res, p) => {
    const bank = QUIZ_BANK[p.pathId];
    if (!bank) return json(res, 404, { error: 'no quiz for this path' });
    const shuffled = [...bank].sort(() => Math.random() - 0.5).slice(0, 5);
    const sessionId = uid();
    state.quizSessions[sessionId] = { pathId: p.pathId, questions: shuffled, answers: [], started: Date.now() };
    // Send questions without answers
    json(res, 200, { sessionId, questions: shuffled.map(({ q, options }) => ({ q, options })) });
  },

  'POST /api/quiz/:sessionId/submit': async (req, res, p) => {
    const body    = await readBody(req);
    const session = state.quizSessions[p.sessionId];
    if (!session) return json(res, 404, { error: 'session not found' });

    const { answers } = body; // array of selected indices
    let correct = 0;
    const results = session.questions.map((q, i) => {
      const isCorrect = answers[i] === q.answer;
      if (isCorrect) correct++;
      return { q: q.q, selected: answers[i], correct: q.answer, isCorrect };
    });

    const score  = Math.round((correct / session.questions.length) * 100);
    const xpGain = score >= 80 ? randInt(150, 300) : score >= 60 ? randInt(50, 150) : 0;
    if (xpGain) {
      state.user.xp += xpGain;
      addActivity('quiz_passed', `Quiz passed (${score}%) on ${session.pathId.replace('path-','')}`, xpGain);
    }

    delete state.quizSessions[p.sessionId];
    broadcast('user_update', state.user);
    json(res, 200, { score, correct, total: session.questions.length, xpGain, results });
  },

  // Stats summary
  'GET /api/stats': (req, res) => {
    const totalCompleted = Object.values(state.modules).flat().filter(m => m.completed).length;
    const totalModules   = Object.values(state.modules).flat().length;
    json(res, 200, {
      totalCompleted,
      totalModules,
      pathsStarted:  state.paths.filter(p => p.completedModules > 0).length,
      certsEarned:   state.certs.filter(c => c.earned).length,
      xp:            state.user.xp,
      streak:        state.user.streak,
      totalTime:     state.user.totalTime,
      rank:          state.user.rank,
    });
  },
};

// ─── HTTP server ──────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  setCORS(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const parsed   = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsed.pathname;

  // Static files
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

  // Route matching with params
  let handler = null, params = {};
  for (const [pattern, fn] of Object.entries(routes)) {
    const [method, ...parts] = pattern.split(' ');
    if (method !== req.method) continue;
    const routeParts = parts.join(' ').split('/').filter(Boolean);
    const reqParts   = pathname.split('/').filter(Boolean);
    if (routeParts.length !== reqParts.length) continue;
    let matched = true;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) params[routeParts[i].slice(1)] = reqParts[i];
      else if (routeParts[i] !== reqParts[i]) { matched = false; break; }
    }
    if (matched) { handler = fn; break; }
    params = {};
  }

  if (handler) handler(req, res, params);
  else json(res, 404, { error: 'endpoint not found' });
});

server.listen(PORT, () => {
  console.log(`\n📘 pirata6 Academy Platform`);
  console.log(`   Server  → http://localhost:${PORT}`);
  console.log(`   API     → http://localhost:${PORT}/api/paths`);
  console.log(`   Stream  → http://localhost:${PORT}/api/stream\n`);
  startActivitySimulator();
>>>>>>> ae50ee36fa1955a00a3d89ed2ea63087ac849453
});