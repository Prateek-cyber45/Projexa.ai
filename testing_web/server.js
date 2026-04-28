const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const redis = require('redis');
const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Ensure log directory exists
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Observability (Winston Logger)
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'labs-backend' },
    transports: [
        new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logDir, 'labs_backend.log') }),
        new winston.transports.Console()
    ]
});

// Caching Session Layer (Redis)
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379/2'
});
redisClient.on('error', (err) => logger.error('Redis Client Error', { error: err.message }));
redisClient.connect().then(() => logger.info('Connected to Redis')).catch(err => logger.error('Redis connection failed', { error: err.message }));

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Telemetry Emitter to AI-Stream
const AI_STREAM_URL = process.env.AI_STREAM_URL || 'http://localhost:8004/ingest';
function emitTelemetry(source, payload) {
    const event = {
        source: source,
        payload: payload,
        timestamp: Date.now() / 1000.0
    };
    
    // Fire and forget
    fetch(AI_STREAM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
    }).catch(err => {
        // AI Stream is down or starting up, just log minimally
        logger.error('[Telemetry Error]', { message: err.message });
    });
}

wss.on('connection', (ws) => {
  logger.info('Client connected to Labs Backend');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      logger.info('Received Payload', { type: data.type });
      
      // Send Telemetry for actionable events
      if (data.type !== 'init' && data.type !== 'siem_subscribe' && data.type !== 'adsb_inject') {
         emitTelemetry('labs_websocket', data);
      }

      if (data.type === 'init') {
        ws.send(JSON.stringify({ type: 'terminal_output', cmd: '', res: 'Connected to Terminal Backend (Labs). Auth user: ' + data.clientId }));
      } else if (data.type === 'command') {
        const cmd = data.cmd;
        let p = cmd.trim().split(' ');
        let main = p[0].toLowerCase();

        let output = '';
        if (main === 'help') {
           output = 'Available commands: help, ls, whoami, pwd, netstat, systemctl';
        } else if (main === 'ls') {
           output = 'bin  boot  dev  etc  home  lib  opt  root  run  sbin  tmp  usr  var';
        } else if (main === 'whoami') {
           output = 'root';
        } else if (main === 'pwd') {
           output = '/root';
        } else if (main === 'netstat') {
           output = 'Active Internet connections (w/o servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State\ntcp        0      0 10.0.0.5:443              192.168.1.100:54321     ESTABLISHED';
        } else if (main === 'systemctl') {
           output = 'UNIT                            LOAD   ACTIVE SUB     DESCRIPTION\nnginx.service                   loaded active running The NGINX HTTP and reverse proxy server\npostgresql.service              loaded active running PostgreSQL RDBMS\nssh.service                     loaded active running OpenBSD Secure Shell server';
        } else {
           output = 'bash: '+main+': command not found';
        }

        ws.send(JSON.stringify({ type: "terminal_output", cmd: cmd, res: output, isRaw: false }));
      } else if (data.type === "atm_cmd") {
        const cmd = (data.cmd || "").toLowerCase().trim();
        let res = "";
        let isJackpot = false;

        if (cmd === "help") {
            res = `<div class="text-slate-400">[SYS] Allowed: help, status, ping, dispense</div>`;
        } else if (cmd === "status") {
            res = `[SYS] Dispenser module OK. Vault locked.`;
        } else if (cmd === "ping") {
            res = `[SYS] Pong! (18ms)`;
        } else if (cmd.includes("dispense") || cmd.includes("jackpot") || cmd.includes("cash")) {
            isJackpot = true;
            res = `<div class="text-emerald-300 font-bold animate-[pulse_0.5s_ease-out_infinite]">\n!!! CRITICAL OVERRIDE DETECTED !!!<br/>[SYS] Dispensing Cassette 1, 2, 3...<br/>[SYS] Cash Output: $34,500.00<br/>[SYS] Vault Empty. Have a nice day.\n</div>`;
        } else {
            res = `<div class="text-amber-400">[ERR] Unknown command. Hardware access restricted.</div>`;
        }

        ws.send(JSON.stringify({ type: "atm_res", res, isJackpot }));
      } else if (data.type === "adsb_inject") {
        const payload = data.payload || {};
        emitTelemetry('labs_adsb', payload);
        if (!payload.hex || !payload.flight) {
           ws.send(JSON.stringify({ type: "adsb_error", message: "Malformed JSON: Missing hex or flight identifier." }));
        } else {     
           setTimeout(() => {
               ws.send(JSON.stringify({ type: "adsb_validated", payload }));    
           }, 800);
        }
      } else if (data.type === "scada_auth") {
        const pin = data.pin;
        if (pin === "1234") {
            ws.send(JSON.stringify({ type: "scada_auth_res", success: true })); 
        } else {
            ws.send(JSON.stringify({ type: "scada_auth_res", success: false }));
        }
      } else if (data.type === "scada_dose") {
        const ppm = parseInt(data.ppm, 10) || 0;
        let newPh = 6.5 + (ppm / 100);
        if (newPh > 14.0) newPh = 14.0;
        const alarm = newPh > 9.0;
        ws.send(JSON.stringify({ type: "scada_dose_res", ppm, ph: newPh.toFixed(2), alarm }));        } else if (data.type === "scada_turbine") {
          const authLevel = parseInt(data.authLevel, 10);
          const bias = parseInt(data.bias, 10);
          
          if (authLevel === 0 && (bias > 10 || bias < -10)) {
              ws.send(JSON.stringify({ type: "scada_turbine_denied", msg: "FUN:06 (Write) DENIED. Auth Level 0 insufficient for >10% bias." }));
          } else {
              let newRPM = 3600 + (bias * 50);
              let newTemp = 142.5 + (bias * 4.5);
              let newHz = 60.00 + (bias * 0.1);
              const alarm = newRPM > 4000;
              ws.send(JSON.stringify({ 
                  type: "scada_turbine_res", 
                  bias, rpm: newRPM, temp: newTemp.toFixed(1), hz: newHz.toFixed(2), alarm 
              }));
          }      } else if (data.type === "siem_subscribe") {
         let logCounter = 4;
         const rawEvents = [
            { level: "INFO", msg: "TLS Handshake successful with 10.0.4.52. Cipher: TLS_AES_256_GCM_SHA384." },
            { level: "WARN", msg: "Memory usage high (88%) on <span class=\"text-[#00f2ff]\">DB-PROD-CLUSTER</span>" },
            { level: "ERROR", msg: "Failed to sync with NTP server pool.ntp.org. Timeout." },
            { level: "INFO", msg: "Container scaling event: Replica count increased to 4 for deployment auth-service." },
            { level: "CRITICAL", msg: "Suspicious outbound connection to known C2 node <span class=\"font-bold text-white\">45.33.21.109</span> from <span class=\"text-[#00f2ff]\">172.16.22.45</span>" },
            { level: "INFO", msg: "Admin user logged in successfully via SSO. Session ID generated." }
         ];

         const interval = setInterval(() => {
            if (ws.readyState !== 1) return clearInterval(interval);
            const index = Math.floor(Math.random() * rawEvents.length);
            const evt = Object.assign({ id: logCounter++ }, rawEvents[index]);  
            ws.send(JSON.stringify({
               type: "siem_event",
               evt: {
                  ...evt,
                  time: new Date().toLocaleTimeString(),
               }
            }));
         }, 3000);
      } else if (data.type === 'soc_subscribe') {
         logger.info('Client Subscribed to SOC Stream');
         
         // Track session state per WebSocket connection
         if (!ws._socSession) {
            ws._socSession = {
                startTime: Date.now(),
                score: 0,
                actions: [],
                userId: data.clientId || 'guest'
            };
         }

         const socInterval = setInterval(() => {
            if (ws.readyState !== 1) return clearInterval(socInterval);
            
            const randAlert = [
                { severity: 'Critical', source: 'Firewall',    msg: 'Multiple failed login attempts from 94.23.12.115', id: `ALT-${Date.now()}-A` },
                { severity: 'High',     source: 'EDR',         msg: 'Suspicious PowerShell execution detected on SRV-FIN-01', id: `ALT-${Date.now()}-B` },
                { severity: 'Medium',   source: 'WAF',         msg: 'SQL Injection payload dropped in POST /api/login', id: `ALT-${Date.now()}-C` },
                { severity: 'Critical', source: 'SIEM',        msg: 'Lateral movement detected: CORE-SRV → DB-PROD-01', id: `ALT-${Date.now()}-D` },
                { severity: 'High',     source: 'Endpoint',    msg: 'Known C2 beacon: TLS traffic to 185.220.101.45:443', id: `ALT-${Date.now()}-E` },
                { severity: 'Medium',   source: 'DNS',         msg: 'Domain generation algorithm (DGA) activity: *.biz domains', id: `ALT-${Date.now()}-F` },
            ];
            
            ws.send(JSON.stringify({
                type: 'soc_alert_stream',
                payload: randAlert[Math.floor(Math.random() * randAlert.length)],
                timestamp: new Date().toISOString()
            }));
         }, 4500);

         ws.on('close', () => clearInterval(socInterval));

      } else if (data.type === 'soc_action') {
         // Player took a scored action on an alert
         const { action, severity, points, running_score } = data;

         if (!ws._socSession) {
            ws._socSession = { startTime: Date.now(), score: 0, actions: [], userId: data.clientId || 'guest' };
         }

         ws._socSession.score = running_score || ws._socSession.score + (points || 0);
         ws._socSession.actions.push({ action, severity, points, ts: Date.now() });

         logger.info('[SOC Action]', { userId: ws._socSession.userId, action, severity, points, running_score });

         // Echo confirmation back to client
         ws.send(JSON.stringify({
            type: 'soc_action_ack',
            action: action,
            points: points,
            running_score: ws._socSession.score
         }));

         // Forward score to main-api if player has accumulated enough actions
         if (ws._socSession.actions.length % 5 === 0) {
            const MAIN_API = process.env.MAIN_API_URL || 'http://localhost:8001';
            
            // Retry with exponential backoff
            const syncScore = async (attempt = 1) => {
                try {
                    const res = await fetch(`${MAIN_API}/api/main/scores`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ score: ws._socSession.score })
                    });
                    if (res.ok) {
                        logger.info('[Score Sync] Success', { score: ws._socSession.score, attempt });
                    } else {
                        throw new Error(`HTTP ${res.status}`);
                    }
                } catch (err) {
                    if (attempt < 3) {
                        const delay = Math.pow(2, attempt) * 500;
                        logger.warn(`[Score Sync] Retry ${attempt}/3 in ${delay}ms`, { error: err.message });
                        setTimeout(() => syncScore(attempt + 1), delay);
                    } else {
                        logger.error('[Score Sync] Failed after 3 retries', { error: err.message });
                        // Cache in Redis for later sync
                        redisClient.lPush('failed_score_sync', JSON.stringify({
                            userId: ws._socSession.userId,
                            score: ws._socSession.score,
                            timestamp: Date.now()
                        })).catch(() => {});
                    }
                }
            };
            syncScore();
         }

         // Emit telemetry to AI stream for behavior scoring
         emitTelemetry('soc_action', { action, severity, points, running_score });

      } // end soc_action

    } catch (err) {
      logger.error('Invalid message format', { error: err.stack });
    }
  });

  ws.on('close', () => {
    logger.info('Client disconnected from Labs Backend');
  });
});

app.get('/api/labs/health', (req, res) => {
    res.json({ status: 'healthy', active_connections: wss.clients.size });
});

app.post('/api/labs/session', (req, res) => {
    res.json({ token: 'labs-temp-session-token', server: 'wss://localhost:4000' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  logger.info(`DeepHunt Labs Backend running on port ${PORT}`);
});
