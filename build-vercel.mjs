import { cp, mkdir, writeFile } from 'node:fs/promises';

const rawOrigin = process.env.MODELPORT_ORIGIN;
let gateway;
try {
  gateway = new URL(rawOrigin);
} catch {
  throw new Error('请将 MODELPORT_ORIGIN 设为已部署模型港网关的公网 HTTPS 地址。');
}

if (gateway.protocol !== 'https:' || gateway.username || gateway.password
    || gateway.pathname !== '/' || gateway.search || gateway.hash
    || gateway.hostname === 'localhost' || !gateway.hostname.includes('.')
    || gateway.hostname.startsWith('127.')) {
  throw new Error('MODELPORT_ORIGIN 必须是公网 HTTPS 源站地址，仅包含协议、主机和可选端口。');
}

const output = new URL('./.vercel/output/', import.meta.url);
await mkdir(output, { recursive: true });
await cp(new URL('./web/', import.meta.url), new URL('static/', output), { recursive: true });
await writeFile(new URL('config.json', output), JSON.stringify({
  version: 3,
  routes: [
    { src: '^/(?:home/?)?$', dest: '/index.html', methods: ['GET', 'HEAD'] },
    { handle: 'filesystem' },
    { src: '^/(.*)$', dest: `${gateway.origin}/$1` },
  ],
}, null, 2) + '\n');
