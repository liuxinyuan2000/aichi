import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

const preview = process.argv.includes('--preview');
let gateway;
if (!preview) {
  try {
    gateway = new URL(process.env.MODELPORT_ORIGIN);
  } catch {
    throw new Error('请将 MODELPORT_ORIGIN 设为已部署模型港网关的公网 HTTPS 地址。');
  }
  if (gateway.protocol !== 'https:' || gateway.username || gateway.password
      || gateway.pathname !== '/' || gateway.search || gateway.hash
      || gateway.hostname === 'localhost' || !gateway.hostname.includes('.')
      || gateway.hostname.startsWith('127.')) {
    throw new Error('MODELPORT_ORIGIN 必须是公网 HTTPS 源站地址，仅包含协议、主机和可选端口。');
  }
}

const output = new URL('./.vercel/output/', import.meta.url);
await mkdir(output, { recursive: true });
await cp(new URL('./web/', import.meta.url), new URL('static/', output), { recursive: true });

const routes = [
  { src: '^/(?:home/?)?$', dest: '/index.html', methods: ['GET', 'HEAD'] },
  { handle: 'filesystem' },
];
if (preview) {
  const page = new URL('static/index.html', output);
  const html = await readFile(page, 'utf8');
  await writeFile(page, html
    .replace('<body>', '<body data-preview>')
    .replace(/href="\/(?:login|keys|usage)"/g, 'href="#preview-status"')
    .replace('<main class="wrap">', '<main class="wrap"><p class="preview-notice" id="preview-status">这是中文首页预览。连接公网网关后，可使用登录、注册及模型调用。</p>'));
} else {
  routes.push({ src: '^/(.*)$', dest: `${gateway.origin}/$1` });
}
await writeFile(new URL('config.json', output), JSON.stringify({ version: 3, routes }, null, 2) + '\n');
