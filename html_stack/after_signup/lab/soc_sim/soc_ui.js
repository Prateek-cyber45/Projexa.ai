/**
 * soc_ui.js — Shared UI functionality for all SOC Simulator pages
 * Handles: Lockdown overlay, theme toggle, notifications dropdown,
 *          global toast helper, and header button wiring.
 */
(function () {
    'use strict';

    /* ─────────────────────────────────────────
       LOCKDOWN OVERLAY
    ───────────────────────────────────────── */
    function triggerLockdown() {
        if (window.SOC) window.SOC.score('escalate', 'Critical');

        const overlay = document.createElement('div');
        overlay.id = 'lockdown-overlay';
        overlay.style.cssText = `
            position:fixed;inset:0;z-index:99999;
            background:rgba(220,0,0,0.08);
            border:3px solid rgba(220,0,0,0.6);
            display:flex;flex-direction:column;
            align-items:center;justify-content:center;
            backdrop-filter:blur(6px);
            animation:lockdownIn 0.25s ease-out;
        `;
        overlay.innerHTML = `
            <style>
                @keyframes lockdownIn{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}
                @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
                #lockdown-overlay .blink{animation:blink 0.8s infinite}
            </style>
            <div style="text-align:center;font-family:'JetBrains Mono',monospace;">
                <div class="blink" style="font-size:clamp(32px,6vw,72px);font-weight:900;color:#ff2222;letter-spacing:0.15em;text-shadow:0 0 40px rgba(255,34,34,0.8);">
                    ⚠ LOCKDOWN INITIATED ⚠
                </div>
                <div style="color:#ff6666;font-size:14px;margin-top:16px;letter-spacing:0.2em;">
                    ALL NON-CRITICAL CIRCUITS SEVERED
                </div>
                <div style="color:rgba(255,100,100,0.6);font-size:11px;margin-top:8px;letter-spacing:0.15em;">
                    SENTINEL SOC — EMERGENCY PROTOCOL ALPHA-7 ACTIVE
                </div>
                <div id="lockdown-timer" style="color:#ff4444;font-size:28px;font-weight:700;margin-top:24px;"></div>
                <button onclick="document.getElementById('lockdown-overlay').remove()" 
                    style="margin-top:32px;background:rgba(255,34,34,0.15);border:1px solid rgba(255,34,34,0.5);
                           color:#ff6666;padding:10px 32px;border-radius:8px;font-family:'JetBrains Mono',monospace;
                           font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;cursor:pointer;">
                    DISMISS / RESUME MONITORING
                </button>
            </div>
        `;
        document.body.appendChild(overlay);

        let count = 5;
        const timerEl = overlay.querySelector('#lockdown-timer');
        function tick() {
            if (!timerEl || !overlay.isConnected) return;
            timerEl.textContent = `AUTO-DISMISS: ${count}s`;
            if (count-- <= 0) { overlay.remove(); return; }
            setTimeout(tick, 1000);
        }
        tick();
    }

    /* ─────────────────────────────────────────
       THEME TOGGLE  (dark ↔ light)
    ───────────────────────────────────────── */
    function initThemeToggle() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        const saved = localStorage.getItem('soc_theme') || 'dark';
        applyTheme(saved, btn);

        btn.addEventListener('click', () => {
            const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next, btn);
            localStorage.setItem('soc_theme', next);
        });
    }

    function applyTheme(theme, btn) {
        if (theme === 'light') {
            document.documentElement.classList.remove('dark');
            document.body.style.background = '#f0f4f8';
            document.body.style.color = '#1a202c';
            if (btn) btn.textContent = 'dark_mode';
        } else {
            document.documentElement.classList.add('dark');
            document.body.style.background = '';
            document.body.style.color = '';
            if (btn) btn.textContent = 'light_mode';
        }
    }

    /* ─────────────────────────────────────────
       NOTIFICATIONS DROPDOWN
    ───────────────────────────────────────── */
    function initNotifications() {
        const bell = document.querySelector('.material-symbols-outlined[textContent="notifications"], button.material-symbols-outlined');
        // find the notifications span
        document.querySelectorAll('.material-symbols-outlined').forEach(el => {
            if (el.textContent.trim() === 'notifications') {
                el.style.cursor = 'pointer';
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleNotifDropdown(el);
                });
            }
        });
    }

    function toggleNotifDropdown(anchor) {
        let existing = document.getElementById('notif-dropdown');
        if (existing) { existing.remove(); return; }

        const dropdown = document.createElement('div');
        dropdown.id = 'notif-dropdown';
        dropdown.style.cssText = `
            position:fixed;top:68px;right:60px;z-index:9999;
            background:#171717;border:1px solid rgba(0,242,255,0.2);
            border-radius:12px;width:320px;
            box-shadow:0 20px 60px rgba(0,0,0,0.6);
            font-family:'JetBrains Mono',monospace;
            animation:slideDown 0.15s ease-out;
        `;
        dropdown.innerHTML = `
            <style>@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}</style>
            <div style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;font-weight:700;letter-spacing:0.2em;color:rgba(255,255,255,0.4);text-transform:uppercase;">
                Live Alerts — 3 New
            </div>
            ${[
                {color:'#ff4444',label:'CRITICAL',msg:'Ransomware variant detected on CORE-SRV-04', time:'2m ago'},
                {color:'#fb923c',label:'HIGH',msg:'C2 beacon: Cobalt Strike profile — 172.16.22.45', time:'5m ago'},
                {color:'#facc15',label:'MEDIUM',msg:'SQL injection attempt on WEB-01 login endpoint', time:'12m ago'},
            ].map(n => `
                <div style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.04);cursor:pointer;transition:background 0.2s;" 
                     onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background=''">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                        <span style="color:${n.color};font-size:9px;font-weight:700;letter-spacing:0.15em;">${n.label}</span>
                        <span style="color:rgba(255,255,255,0.2);font-size:9px;">${n.time}</span>
                    </div>
                    <div style="color:rgba(255,255,255,0.7);font-size:11px;line-height:1.4;">${n.msg}</div>
                </div>
            `).join('')}
            <div style="padding:10px 16px;text-align:center;">
                <a href="alerts_management.html" style="color:#00f2ff;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;">View All Alerts →</a>
            </div>
        `;
        document.body.appendChild(dropdown);
        setTimeout(() => document.addEventListener('click', () => dropdown.remove(), { once: true }), 10);
    }

    /* ─────────────────────────────────────────
       GLOBAL TOAST  (accessible externally)
    ───────────────────────────────────────── */
    window.SOC_UI = window.SOC_UI || {};
    window.SOC_UI.toast = function (msg, type) {
        const el = document.createElement('div');
        const colors = {
            success: 'border-[#00ffa3]/50 bg-[#00ffa3]/10 text-[#00ffa3]',
            error:   'border-red-500/50 bg-red-950/20 text-red-400',
            info:    'border-[#00f2ff]/40 bg-[#00f2ff]/5 text-[#00f2ff]',
            warn:    'border-yellow-500/50 bg-yellow-950/20 text-yellow-300',
        };
        el.className = `fixed bottom-24 left-6 z-[9998] px-4 py-3 rounded-lg border font-mono text-sm shadow-2xl`;
        el.style.cssText = `background:rgba(10,10,10,0.95);border:1px solid;animation:slideInLeft 0.25s ease-out;`;
        const c = {success:'#00ffa3',error:'#ff4444',info:'#00f2ff',warn:'#facc15'}[type]||'#00f2ff';
        el.style.borderColor = c + '55';
        el.style.color = c;
        el.textContent = msg;
        document.body.appendChild(el);
        const style = document.createElement('style');
        style.textContent = '@keyframes slideInLeft{from{transform:translateX(-110%);opacity:0}to{transform:translateX(0);opacity:1}}';
        document.head.appendChild(style);
        setTimeout(() => el.remove(), 3000);
    };

    window.SOC_UI.triggerLockdown = triggerLockdown;

    /* ─────────────────────────────────────────
       BOOT
    ───────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', () => {
        // Wire Lockdown button(s)
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.trim().toUpperCase().includes('LOCKDOWN')) {
                btn.addEventListener('click', triggerLockdown);
            }
        });

        initThemeToggle();
        initNotifications();
    });

})();
