const { spawn } = require('child_process');
const fs = require('fs');

const CLOUDFLARED_PATH = 'e:\\fyp-management-system\\cloudflared.exe';
const URL_FILE = 'e:\\fyp-management-system\\CURRENT_LIVE_URL.txt';

let tunnelProcess = null;
let isShuttingDown = false;

function startTunnel() {
  if (isShuttingDown) return;

  console.log('[TunnelManager] Starting Cloudflare Tunnel with --edge-ip-version 4...');
  // --edge-ip-version 4 bypasses broken IPv6 routes on local ISP Wi-Fi
  tunnelProcess = spawn(
    CLOUDFLARED_PATH,
    ['tunnel', '--edge-ip-version', '4', '--url', 'http://127.0.0.1:5000'],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  let currentUrl = null;

  const handleOutput = (data) => {
    const text = data.toString();
    process.stdout.write(text);

    // Detect Cloudflare URL
    const match = text.match(/https:\/\/[a-z0-9\-]+\.trycloudflare\.com/i);
    if (match && !match[0].includes('api.trycloudflare.com') && match[0] !== currentUrl) {
      currentUrl = match[0];
      fs.writeFileSync(URL_FILE, currentUrl, 'utf8');
      console.log(`\n======================================================`);
      console.log(`[TunnelManager] LIVE CLOUDFLARE URL ACTIVE:`);
      console.log(`>>> ${currentUrl} <<<`);
      console.log(`======================================================\n`);
    }

    // Detect fatal connection drop
    if (text.includes('Unauthorized: Tunnel not found') || text.includes('failed to dial to edge')) {
      console.warn('[TunnelManager] Tunnel disconnected/expired. Restarting in 3 seconds...');
      if (tunnelProcess) {
        try {
          tunnelProcess.kill();
        } catch (e) {}
      }
    }
  };

  tunnelProcess.stdout.on('data', handleOutput);
  tunnelProcess.stderr.on('data', handleOutput);

  tunnelProcess.on('exit', (code) => {
    console.log(`[TunnelManager] Tunnel process exited with code ${code}.`);
    if (!isShuttingDown) {
      console.log('[TunnelManager] Reconnecting in 3s...');
      setTimeout(startTunnel, 3000);
    }
  });

  tunnelProcess.on('error', (err) => {
    console.error('[TunnelManager] Failed to spawn cloudflared:', err.message);
    if (!isShuttingDown) {
      setTimeout(startTunnel, 5000);
    }
  });
}

process.on('SIGINT', () => {
  isShuttingDown = true;
  if (tunnelProcess) tunnelProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  isShuttingDown = true;
  if (tunnelProcess) tunnelProcess.kill();
  process.exit(0);
});

// If cloudflared is already running as task-3270, we can also wrap it or run manager
startTunnel();
