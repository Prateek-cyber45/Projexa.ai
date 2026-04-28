const WebSocket = require('ws');
const { spawn } = require('child_process');

console.log('[*] Starting Labs WS Backend for Integration Test...');

const serverProc = spawn('node', ['server.js'], { detached: false, shell: true });
let connected = false;

setTimeout(() => {
    const ws = new WebSocket('ws://localhost:4000');

    ws.on('open', () => {
        console.log('[+] Connected successfully to WS Server.');
        ws.send(JSON.stringify({ type: 'init', clientId: 'test-user-123' }));
    });

    ws.on('message', (data) => {
        const msg = JSON.parse(data);
        console.log('[+] Received message:', msg);
        if (msg.type === 'terminal_output' && msg.res.includes('test-user-123')) {
            console.log('[SUCCESS] Initialization handshake verified.');
            ws.send(JSON.stringify({ type: 'command', cmd: 'whoami' }));
        } else if (msg.type === 'terminal_output' && msg.res.includes('operator')) {
             console.log('[SUCCESS] Terminal command parsed and executed.');
             connected = true;
             ws.close();
        }
    });

    ws.on('close', () => {
        if (connected) {
             console.log('[*] Tests Passed. Closing server.');
             process.kill(serverProc.pid, 'SIGINT');
             process.exit(0);
        } else {
             console.log('[FAIL] WebSocket closed before completing operations.');
             process.kill(serverProc.pid, 'SIGINT');
             process.exit(1);
        }
    });

    ws.on('error', (err) => {
         console.error('[ERROR]', err);
         process.kill(serverProc.pid, 'SIGINT');
         process.exit(1);
    });

}, 2000); 
