/**
 * Cross-platform local nginx reverse proxy helper (Windows / macOS).
 * Usage:
 *   node local-dev/proxy.js start
 *   node local-dev/proxy.js stop
 *   node local-dev/proxy.js status
 */
const fs = require('fs');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

const ROOT = __dirname;
const RUNTIME = path.join(ROOT, '.runtime');
const FRONT_HOST = 'srm-front.fat0.qa.nt.ctripcorp.com';
const API_UPSTREAM = 'srm-api.fat0.qa.nt.ctripcorp.com';
const FRONT_PORT = 8000;
const LISTEN_PORT = 80;
const isWin = process.platform === 'win32';

function ensureRuntime() {
  fs.mkdirSync(path.join(RUNTIME, 'logs'), { recursive: true });
  fs.mkdirSync(path.join(RUNTIME, 'temp'), { recursive: true });
}

function findNginx() {
  if (isWin) {
    try {
      const where = execSync('where nginx', { encoding: 'utf8' }).trim().split(/\r?\n/)[0];
      if (where && fs.existsSync(where)) return where;
    } catch (_) {}
    const wingetLinks = path.join(
      process.env.LOCALAPPDATA || '',
      'Microsoft',
      'WinGet',
      'Links',
      'nginx.exe'
    );
    if (fs.existsSync(wingetLinks)) {
      const real = fs.readlinkSync ? null : null;
      try {
        const target = fs.realpathSync(wingetLinks);
        if (fs.existsSync(target)) return target;
      } catch (_) {
        return wingetLinks;
      }
    }
    return null;
  }
  try {
    const which = execSync('command -v nginx', { encoding: 'utf8', shell: '/bin/bash' }).trim();
    if (which) return which;
  } catch (_) {}
  return null;
}

function findMimeTypes(nginxBin) {
  const candidates = [];
  if (!isWin) {
    try {
      const brewPrefix = execSync('brew --prefix nginx', { encoding: 'utf8' }).trim();
      candidates.push(path.join(brewPrefix, '..', '..', 'etc', 'nginx', 'mime.types'));
      candidates.push('/opt/homebrew/etc/nginx/mime.types');
      candidates.push('/usr/local/etc/nginx/mime.types');
    } catch (_) {
      candidates.push('/opt/homebrew/etc/nginx/mime.types');
      candidates.push('/usr/local/etc/nginx/mime.types');
    }
  }
  if (nginxBin) {
    const home = path.dirname(path.dirname(nginxBin));
    candidates.push(path.join(home, 'conf', 'mime.types'));
    candidates.push(path.join(path.dirname(nginxBin), 'conf', 'mime.types'));
  }
  candidates.push(path.join(ROOT, 'mime.types'));
  for (const p of candidates) {
    try {
      const abs = path.resolve(p);
      if (fs.existsSync(abs)) return abs.replace(/\\/g, '/');
    } catch (_) {}
  }
  return null;
}

function toPosix(p) {
  return p.replace(/\\/g, '/');
}

function writeNginxConf(mimeTypes) {
  const confPath = path.join(RUNTIME, 'nginx.conf');
  const errorLog = toPosix(path.join(RUNTIME, 'logs', 'error.log'));
  const pidFile = toPosix(path.join(RUNTIME, 'nginx.pid'));
  const conf = `
worker_processes  1;
error_log  ${errorLog};
pid        ${pidFile};

events {
    worker_connections  1024;
}

http {
    include       ${mimeTypes};
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout  65;

    upstream srm_gateway {
        server ${API_UPSTREAM}:80;
    }

    upstream srm_front_dev {
        server 127.0.0.1:${FRONT_PORT};
    }

    server {
        listen       ${LISTEN_PORT};
        server_name  ${FRONT_HOST} localhost 127.0.0.1;

        proxy_connect_timeout  600;
        proxy_send_timeout     600;
        proxy_read_timeout     600;
        client_max_body_size   500m;
        proxy_http_version     1.1;

        location /oauth {
            proxy_pass http://srm_gateway;
            proxy_set_header Host              $host;
            proxy_set_header X-Real-IP         $remote_addr;
            proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
            proxy_set_header Cookie            $http_cookie;
            proxy_buffering off;
        }

        location ~ ^/(hpfm|iam|hmsg|hfle|hwfp|hitf|himp|hrpt|hsdr|hadm|hmde|hagd|hnlp|hdtt|hptl|hwfl|hdtw)/ {
            proxy_pass http://srm_gateway;
            proxy_set_header Host              $host;
            proxy_set_header X-Real-IP         $remote_addr;
            proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto https;
            proxy_set_header Cookie            $http_cookie;
            proxy_buffering off;
        }

        location / {
            proxy_pass http://srm_front_dev;
            proxy_http_version 1.1;
            proxy_set_header Host              $host;
            proxy_set_header Upgrade           $http_upgrade;
            proxy_set_header Connection        "upgrade";
            proxy_set_header X-Real-IP         $remote_addr;
            proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_read_timeout 86400s;
        }
    }
}
`.trimStart();
  fs.writeFileSync(confPath, conf, 'utf8');
  return confPath;
}

function runNginx(nginxBin, confPath, args) {
  const prefix = toPosix(RUNTIME) + '/';
  const confRel = 'nginx.conf';
  // Use absolute -c when needed; -p for prefix (logs already absolute)
  const cmdArgs = ['-p', prefix, '-c', toPosix(confPath), ...args];
  return spawnSync(nginxBin, cmdArgs, { stdio: 'inherit', shell: false });
}

function killNginx() {
  if (isWin) {
    spawnSync('taskkill', ['/F', '/IM', 'nginx.exe'], { stdio: 'ignore' });
    return;
  }
  try {
    execSync('pkill -f "nginx: master process" 2>/dev/null || true', { shell: '/bin/bash' });
  } catch (_) {}
  const pidFile = path.join(RUNTIME, 'nginx.pid');
  if (fs.existsSync(pidFile)) {
    try {
      fs.unlinkSync(pidFile);
    } catch (_) {}
  }
}

function printUsageHint() {
  console.log('');
  console.log('Hosts entry required:');
  console.log(`  127.0.0.1 ${FRONT_HOST}`);
  if (isWin) {
    console.log('  File: C:\\Windows\\System32\\drivers\\etc\\hosts (Admin)');
  } else {
    console.log('  File: /etc/hosts  (sudo)');
  }
  console.log('');
  console.log('Start order:');
  console.log('  1) yarn start');
  console.log('  2) yarn proxy:start   # needs admin/sudo for port 80');
  console.log(`  3) open http://${FRONT_HOST}/`);
  console.log('');
}

function start() {
  ensureRuntime();
  const nginxBin = findNginx();
  if (!nginxBin) {
    console.error('nginx not found.');
    if (isWin) {
      console.error('Install: winget install --id nginxinc.nginx -e');
    } else {
      console.error('Install: brew install nginx');
    }
    process.exit(1);
  }
  const mime = findMimeTypes(nginxBin);
  if (!mime) {
    console.error('mime.types not found. Keep local-dev/mime.types in repo.');
    process.exit(1);
  }
  const confPath = writeNginxConf(mime);

  // stop old instance first
  const stopResult = runNginx(nginxBin, confPath, ['-s', 'stop']);
  if (stopResult.status !== 0) {
    // ignore
  }

  const test = runNginx(nginxBin, confPath, ['-t']);
  if (test.status !== 0) {
    console.error('nginx config test failed');
    process.exit(1);
  }

  const startResult = runNginx(nginxBin, confPath, []);
  if (startResult.status !== 0 && startResult.status !== null) {
    console.error('nginx start failed. On macOS use: sudo yarn proxy:start');
    console.error('On Windows run PowerShell as Administrator.');
    process.exit(1);
  }

  console.log('');
  console.log('Proxy started on port 80');
  console.log(`  App:  http://${FRONT_HOST}/`);
  console.log(`  yarn: http://127.0.0.1:${FRONT_PORT}`);
  printUsageHint();
}

function stop() {
  ensureRuntime();
  const nginxBin = findNginx();
  const confPath = path.join(RUNTIME, 'nginx.conf');
  if (nginxBin && fs.existsSync(confPath)) {
    runNginx(nginxBin, confPath, ['-s', 'stop']);
  }
  killNginx();
  console.log('Nginx stopped.');
}

function status() {
  const pidFile = path.join(RUNTIME, 'nginx.pid');
  if (fs.existsSync(pidFile)) {
    console.log('pid file:', fs.readFileSync(pidFile, 'utf8').trim());
  } else {
    console.log('no pid file (may still be running as system nginx)');
  }
}

const cmd = process.argv[2] || 'start';
if (cmd === 'start') start();
else if (cmd === 'stop') stop();
else if (cmd === 'status') status();
else {
  console.log('Usage: node local-dev/proxy.js [start|stop|status]');
  process.exit(1);
}
