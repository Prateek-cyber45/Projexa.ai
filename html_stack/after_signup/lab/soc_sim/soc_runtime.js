/**
 * soc_runtime.js
 * Shared runtime for all SOC Simulator pages.
 * - Establishes WebSocket connection to labs-backend (via Nginx proxy)
 * - Handles auth guard using cyber_auth.js tokens
 * - Provides scoring API: window.SOC.score(action, severity)
 * - Provides event dispatch and subscription
 * - Gracefully degrades to offline mode if backend is unavailable
 */
(function() {
    'use strict';

    // -------------------------
    // WebSocket Connection
    // -------------------------
    const WS_URL = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/labs-ws/';
    let ws = null;
    let reconnectTimer = null;
    let reconnectAttempts = 0;
    const MAX_RECONNECTS = 3;
    let sessionStartTime = Date.now();
    let actionCount = 0;
    let scoreAccumulator = 0;

    // Scoring weights by action type
    const SCORE_WEIGHTS = {
        'isolate':          { Critical: 30, High: 20, Medium: 10, Low: 5 },
        'acknowledge':      { Critical: 10, High: 7,  Medium: 4,  Low: 2 },
        'resolve':          { Critical: 20, High: 15, Medium: 8,  Low: 3 },
        'playbook_step':    { Critical: 15, High: 12, Medium: 6,  Low: 3 },
        'escalate':         { Critical: 25, High: 18, Medium: 8,  Low: 3 },
        'terminal_command': { Critical: 5,  High: 5,  Medium: 5,  Low: 5 },
    };

    function connect() {
        if (reconnectAttempts >= MAX_RECONNECTS) {
            console.warn('[SOC Runtime] Backend offline — running in local simulation mode.');
            updateStatusIndicator('offline');
            return;
        }
        try {
            ws = new WebSocket(WS_URL);
        } catch(e) {
            updateStatusIndicator('offline');
            return;
        }

        ws.onopen = () => {
            console.log('[SOC Runtime] Connected to labs-backend');
            reconnectAttempts = 0;
            updateStatusIndicator(true);
            const stored = localStorage.getItem('cyber_user');
            const userId = stored ? JSON.parse(stored).id : 'guest';
            ws.send(JSON.stringify({
                type: 'init',
                clientId: userId,
                module: 'soc_sim'
            }));
            ws.send(JSON.stringify({ type: 'soc_subscribe', clientId: userId }));
        };

        ws.onclose = () => {
            reconnectAttempts++;
            if (reconnectAttempts < MAX_RECONNECTS) {
                console.warn(`[SOC Runtime] Disconnected. Reconnect ${reconnectAttempts}/${MAX_RECONNECTS}`);
                updateStatusIndicator(false);
                clearTimeout(reconnectTimer);
                reconnectTimer = setTimeout(connect, 3000);
            } else {
                updateStatusIndicator('offline');
            }
        };

        ws.onerror = () => {
            console.warn('[SOC Runtime] WebSocket error — offline mode active');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                (window.SOC._listeners[data.type] || []).forEach(fn => fn(data));
                (window.SOC._listeners['*'] || []).forEach(fn => fn(data));
            } catch (e) {
                console.error('[SOC Runtime] Parse error', e);
            }
        };
    }

    function send(payload) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(payload));
        }
    }

    function updateStatusIndicator(state) {
        const dot = document.getElementById('ws-status-dot');
        const label = document.getElementById('ws-status-label');
        if (!dot || !label) return;
        if (state === true) {
            dot.className = 'w-2 h-2 rounded-full bg-[#00ffa3] animate-pulse shadow-[0_0_8px_#00ffa3]';
            label.textContent = 'System Active';
            label.className   = 'font-bold font-mono text-xs uppercase text-[#00ffa3]';
        } else if (state === 'offline') {
            dot.className = 'w-2 h-2 rounded-full bg-yellow-500';
            label.textContent = 'Offline Mode';
            label.className   = 'font-bold font-mono text-xs uppercase text-yellow-500';
        } else {
            dot.className = 'w-2 h-2 rounded-full bg-red-500 animate-pulse';
            label.textContent = 'Reconnecting...';
            label.className   = 'font-bold font-mono text-xs uppercase text-red-400';
        }
    }

    // -------------------------
    // Scoring
    // -------------------------
    function score(action, severity) {
        severity = severity || 'Medium';
        const weightMap = SCORE_WEIGHTS[action] || SCORE_WEIGHTS['acknowledge'];
        const points = weightMap[severity] || weightMap['Medium'];

        actionCount++;
        scoreAccumulator += points;

        showScoreToast(`+${points} pts`, action, severity);

        send({
            type: 'soc_action',
            action: action,
            severity: severity,
            points: points,
            running_score: scoreAccumulator,
            timestamp: Date.now()
        });

        return points;
    }

    function submitFinalScore() {
        const elapsed = (Date.now() - sessionStartTime) / 1000;
        const speedBonus = elapsed < 600 ? Math.round(50 * (1 - elapsed / 600)) : 0;
        const finalScore = scoreAccumulator + speedBonus;

        if (typeof window.submitLabScore === 'function') {
            window.submitLabScore(finalScore);
        }

        // Show confirmation
        const m = document.createElement('div');
        m.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);font-family:"JetBrains Mono",monospace;';
        m.innerHTML = `
        <div style="background:#111;border:1px solid rgba(0,255,163,0.4);border-radius:16px;padding:48px;text-align:center;max-width:480px;">
            <div style="font-size:48px;margin-bottom:16px;">🏆</div>
            <div style="font-size:32px;font-weight:900;color:#00ffa3;margin-bottom:8px;">${finalScore} pts</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:0.2em;text-transform:uppercase;margin-bottom:4px;">Lab Score Submitted</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:24px;">Speed Bonus: +${speedBonus} pts</div>
            <button onclick="this.closest('[style*=fixed]').remove()" style="background:rgba(0,255,163,0.1);border:1px solid rgba(0,255,163,0.3);color:#00ffa3;padding:10px 28px;border-radius:8px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;cursor:pointer;">Close</button>
        </div>`;
        document.body.appendChild(m);

        return finalScore;
    }

    // -------------------------
    // Toast notification
    // -------------------------
    function showScoreToast(pointsText, action, severity) {
        const toast = document.createElement('div');
        const sevColor = severity === 'Critical' ? '#ff4444'
                       : severity === 'High'     ? '#fb923c'
                       : '#00ffa3';

        toast.style.cssText = `
            position:fixed;bottom:6rem;right:1.5rem;z-index:9999;
            display:flex;align-items:center;gap:12px;
            padding:12px 16px;border-radius:10px;
            border:1px solid ${sevColor}44;
            background:rgba(10,10,10,0.95);
            font-family:'JetBrains Mono',monospace;
            animation:slideInRight 0.25s ease-out;
            max-width:280px;box-shadow:0 8px 32px rgba(0,0,0,0.5);
        `;
        toast.innerHTML = `
            <span style="font-size:18px;font-weight:900;color:${sevColor};">${pointsText}</span>
            <div>
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${sevColor};">${action.replace(/_/g,' ')}</div>
                <div style="font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;">${severity} Severity</div>
            </div>
        `;

        if (!document.head.querySelector('#soc-toast-anim')) {
            const style = document.createElement('style');
            style.id = 'soc-toast-anim';
            style.textContent = '@keyframes slideInRight{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}';
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    // -------------------------
    // Session Score HUD
    // -------------------------
    function injectScoreHUD() {
        if (document.getElementById('soc-score-hud')) return;
        const hud = document.createElement('div');
        hud.id = 'soc-score-hud';
        hud.style.cssText = 'position:fixed;top:72px;right:16px;z-index:999;display:flex;flex-direction:column;align-items:flex-end;gap:6px;pointer-events:none;';
        hud.innerHTML = `
            <div style="background:rgba(15,15,15,0.92);border:1px solid rgba(0,242,255,0.25);backdrop-filter:blur(12px);padding:10px 16px;border-radius:10px;text-align:right;pointer-events:auto;min-width:120px;">
                <div style="font-size:9px;color:rgba(255,255,255,0.3);font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:2px;font-family:'JetBrains Mono',monospace;">Session Score</div>
                <div id="hud-score" style="color:#00f2ff;font-family:'JetBrains Mono',monospace;font-weight:900;font-size:26px;line-height:1;">0</div>
                <div id="hud-actions" style="font-size:9px;color:rgba(255,255,255,0.3);margin-top:2px;font-family:'JetBrains Mono',monospace;">0 actions</div>
            </div>
            <button onclick="window.SOC.submitFinalScore()" style="pointer-events:auto;background:#00ffa3;color:black;font-size:9px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;padding:6px 16px;border-radius:6px;border:none;cursor:pointer;transition:box-shadow 0.2s;" onmouseover="this.style.boxShadow='0 0 14px #00ffa3'" onmouseout="this.style.boxShadow=''">
                Submit Score
            </button>
        `;
        document.body.appendChild(hud);

        setInterval(() => {
            const scoreEl = document.getElementById('hud-score');
            const actEl   = document.getElementById('hud-actions');
            if (scoreEl) scoreEl.textContent = scoreAccumulator;
            if (actEl)   actEl.textContent   = `${actionCount} action${actionCount !== 1 ? 's' : ''}`;
        }, 500);
    }

    // -------------------------
    // Session clock
    // -------------------------
    function startSessionClock() {
        const el = document.getElementById('session-clock');
        if (!el) return;
        let seconds = 0;
        setInterval(() => {
            seconds++;
            const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            el.textContent = `${h}:${m}:${s}`;
        }, 1000);
    }

    // -------------------------
    // Public API
    // -------------------------
    window.SOC = {
        _listeners: {},
        send:             send,
        score:            score,
        submitFinalScore: submitFinalScore,
        on: function(type, fn) {
            if (!this._listeners[type]) this._listeners[type] = [];
            this._listeners[type].push(fn);
        }
    };

    // Boot
    document.addEventListener('DOMContentLoaded', () => {
        connect();
        injectScoreHUD();
        startSessionClock();
    });
})();
