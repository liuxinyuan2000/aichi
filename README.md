# 模型港 AI API 中转站

模型港在本地提供独立首页、协议示例和接入文档。登录、用户控制台、用量管理和模型转发由 [Sub2API v0.2.24](https://github.com/Wei-Shaw/sub2api/releases/tag/v0.2.24) 提供，适用 [LGPL-3.0](https://github.com/Wei-Shaw/sub2api/blob/v0.2.24/LICENSE)。Nginx 在同一个端口提供网页和 API，PostgreSQL 与 Redis 使用独立的 Docker 数据卷。

## 本地访问

- 首页为 [http://127.0.0.1:3080/](http://127.0.0.1:3080/)。
- 控制台登录为 [http://127.0.0.1:3080/login](http://127.0.0.1:3080/login)。
- 健康检查为 [http://127.0.0.1:3080/health](http://127.0.0.1:3080/health)。
- OpenAI 兼容客户端的 Base URL 为 `http://127.0.0.1:3080/v1`。

初始管理员为 `operator@modelport.local`。初始密码保存在本目录 `.env` 的 `ADMIN_PASSWORD` 项。首次进入管理区，按页面提示阅读并确认 Sub2API 的使用条款。新实例可在后台系统设置中把站点名称设为「模型港」、副标题设为「统一 AI 模型接入与用量管理」。

## 开通模型

1. 登录管理区，创建对应平台的分组。
2. 添加经授权的上游账号或 API 凭据，并将账号加入分组。在后台测试该账号可用的模型。
3. 在用户区的密钥管理创建站内 API Key，选择该分组。按需设置配额。使用首页示例验证请求，并检查用量。
4. 如需开放注册、启用第三方登录或收款，通过后台配置对应开关、OAuth 应用或支付商户信息。

首页列出了协议入口。模型是否可用取决于分组和上游账号。真实模型调用、Google 登录和支付需要各自的外部配置。

## 重新启动或迁移

从本目录执行以下命令。初始化脚本会生成本地凭据，并复用已有的 `.env`。如需修改宿主机端口，在 `.env` 中设置 `PORTAL_PORT`。

```sh
./init-env
docker compose up -d --wait
docker compose ps
```

使用 `docker compose stop` 停止服务。迁移时应备份 `.env` 和 Compose 的 PostgreSQL、应用及 Redis 数据卷。原工作区的 New API 实例使用单独的 Compose 配置和数据。

## 部署到 Vercel

先在支持常驻 Docker 容器的服务器部署本目录，将 Nginx 入口配置为可访问的 HTTPS 域名。Sub2API、PostgreSQL 和 Redis 在该服务器上运行。Vercel 提供 `/home` 和静态资源，并把控制台和 API 请求转发到同一个源站。连接源站后，访问域名根路径会进入 `/dashboard`，由 Sub2API 处理登录。

通过 GitHub 集成部署时，将仓库根目录设为 Vercel 项目根目录，添加 Production 环境变量 `MODELPORT_ORIGIN`，再重新部署。缺少源站地址时，Git 构建会发布标明状态的中文首页预览。

在本目录执行以下命令。把示例域名换成自己的 HTTPS 源站。

```sh
vercel link
MODELPORT_ORIGIN=https://gateway.example.com node build-vercel.mjs
vercel deploy --prebuilt
```

验证预览环境的注册、登录和模型调用后，用 `vercel deploy --prebuilt --prod` 发布。源站凭据留在服务器上。

暂时没有公网源站时，可用 `node build-vercel.mjs --preview` 生成仅含中文首页的预览，再执行 `vercel deploy --prebuilt`。
