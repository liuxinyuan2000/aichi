'use strict';

const preview = document.body.hasAttribute('data-preview');
const origin = preview ? 'https://gateway.example.com' : window.location.origin;
const examples = {
  openai: {
    path: '/v1/chat/completions',
    headers: ['Authorization: Bearer MODELPORT_KEY'],
    body: '{"model":"MODEL_ID","messages":[{"role":"user","content":"你好"}]}',
  },
  anthropic: {
    path: '/v1/messages',
    headers: ['x-api-key: MODELPORT_KEY', 'anthropic-version: 2023-06-01'],
    body: '{"model":"MODEL_ID","max_tokens":128,"messages":[{"role":"user","content":"你好"}]}',
  },
  gemini: {
    path: '/v1beta/models/MODEL_ID:generateContent',
    headers: ['x-goog-api-key: MODELPORT_KEY'],
    body: '{"contents":[{"parts":[{"text":"你好"}]}]}',
  },
};

const buttons = [...document.querySelectorAll('[data-protocol]')];
const code = document.querySelector('#example-code');
const endpoint = document.querySelector('#endpoint');
const copy = document.querySelector('#copy');
const copyStatus = document.querySelector('#copy-status');
let copyReset;

function selectProtocol(button) {
  const { path, headers, body } = examples[button.dataset.protocol];
  const options = [...headers, 'Content-Type: application/json'].map(header => `  -H '${header}'`);
  code.textContent = [`curl '${origin}${path}'`, ...options, `  -d '${body}'`].join(' \\' + '\n');
  endpoint.textContent = path;
  buttons.forEach(option => option.setAttribute('aria-pressed', String(option === button)));
}

buttons.forEach(button => button.addEventListener('click', () => selectProtocol(button)));
selectProtocol(buttons[0]);
document.querySelector('#base-url').textContent = origin + '/v1';

copy.addEventListener('click', async () => {
  clearTimeout(copyReset);
  try {
    await navigator.clipboard.writeText(code.textContent);
    copy.textContent = '已复制';
    copyStatus.textContent = '调用命令已复制到剪贴板';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(code);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    copy.textContent = '命令已选中';
    copyStatus.textContent = '请使用系统快捷键复制选中的命令';
  }
  copyReset = setTimeout(() => { copy.textContent = '复制命令'; }, 2000);
});

const health = document.querySelector('#health');
if (preview) {
  health.textContent = '首页预览';
} else {
  fetch('/health', { cache: 'no-store', signal: AbortSignal.timeout(5000) })
    .then(response => {
      if (!response.ok) throw new Error('Gateway unavailable');
      document.querySelector('.service').classList.add('online');
      health.textContent = '网关在线';
    })
    .catch(() => { health.textContent = '网关暂不可用'; });
}
