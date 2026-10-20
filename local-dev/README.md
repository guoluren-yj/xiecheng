# 本地开发说明（Windows / macOS）

本地有两种调试方式：**账号登录** 与 **SSO 登录**。按需选择，不要混用。

## 公共准备：配置 hosts

两种方式都需要把 front 域名指到本机：

```text
127.0.0.1 srm-front.fat0.qa.nt.ctripcorp.com
127.0.0.1 srm-front-sup.fat0.qa.nt.ctripcorp.com
```

- macOS：`sudo vim /etc/hosts`
- Windows：管理员编辑 `C:\Windows\System32\drivers\etc\hosts`

---

## 方式一：账号登录（不使用 Nginx）

适用：不测 SSO，用账号密码登录。

### 步骤

1. **删除**（如存在）本地配置，避免走同源 authorize 导致循环：

   ```bash
   # macOS / Linux
   rm -f src/config/.env.development.local.yml

   # Windows
   del src\config\.env.development.local.yml
   ```

2. **不要**启动 Nginx（如已启动先停掉）：

   ```bash
   # macOS
   ./local-dev/stop-proxy.sh

   # Windows
   .\local-dev\stop-proxy.ps1
   ```

3. **用 80 端口启动前端**（需管理员 / sudo，因 80 为特权端口）：

   ```bash
   # macOS
   sudo PORT=80 yarn start

   # Windows（管理员 PowerShell）
   $env:PORT=80; yarn start
   ```

4. 浏览器访问：

   ```text
   http://srm-front-sup.fat0.qa.nt.ctripcorp.com/
   ```

5. 当浏览器跳转到类似下面这种带一长串参数的授权地址时（`/oauth` 后面还有内容）：

   ```text
   http://srm-api.fat0.qa.nt.ctripcorp.com/oauthsrm-front.fat0.qa.nt.ctripcorp.com/
   ```

   **手动改成**只保留到 `/oauth`，回车进入登录页：

   ```text
   http://srm-api.fat0.qa.nt.ctripcorp.com/oauth
   ```

   在该页面使用**账号密码**登录。

### 说明

- 此方式不启 Nginx，本地只跑前端；OAuth 登录页在 `srm-api` 域名上。
- 若保留了 `src/config/.env.development.local.yml` 又不起 Nginx，会出现登录死循环。

---

## 方式二：SSO 登录（使用 Nginx）

适用：走完整 SAML / SSO 流程。

### 架构

```text
浏览器 http://srm-front.fat0.qa.nt.ctripcorp.com/
        │
        ▼
   Nginx :80
        ├─ /oauth/**  → srm-api.fat0.qa.nt.ctripcorp.com（网关）
        └─ 其他       → 127.0.0.1:8000（yarn start）
```

### 一次性准备

1. **安装 Nginx**

   ```bash
   # macOS
   brew install nginx

   # Windows
   winget install --id nginxinc.nginx -e
   ```

   安装后新开终端，确认 `nginx -v` 可用。

2. **复制本地环境变量**（使 authorize 与 ACS 同域）：

   ```bash
   # macOS / Linux
   cp local-dev/.env.development.local.yml src/config/.env.development.local.yml

   # Windows
   copy local-dev\.env.development.local.yml src\config\.env.development.local.yml
   ```

   `src/config/.env.development.local.yml` 已 gitignore，每人本地一份。

### 日常启动

```bash
# 终端 1：前端（默认 8000，不要设 PORT=80，避免与 Nginx 抢端口）
yarn start

# 终端 2：启用 Nginx 反代（占 80）
# macOS（推荐，自动 sudo）:
./local-dev/start-proxy.sh

# Windows（推荐，自动提权）:
.\local-dev\start-proxy.ps1

# 或（需已具备管理员 / root 权限）:
yarn proxy:start
```

浏览器访问：

```text
http://srm-front.fat0.qa.nt.ctripcorp.com/
```

停止反代：

```bash
# macOS
./local-dev/stop-proxy.sh

# Windows
.\local-dev\stop-proxy.ps1

# 或
yarn proxy:stop
```

### 说明

- 完整 SSO 需公司网络能访问 IdP（如 `sso.infosec.fat358...`）。
- 若报 `Error validating SAML message`，确认 authorize 是否为 `http://srm-front.fat0.../oauth/...`，而不是 `srm-api.fat0...`。

---

## 两种方式对比

| 项目 | 账号登录 | SSO 登录 |
|------|----------|----------|
| `src/config/.env.development.local.yml` | **删除** | **需要**（从 `local-dev/` 复制） |
| Nginx | **不使用** | **必须启用** |
| 前端端口 | **80**（`PORT=80 yarn start`） | **8000**（Nginx 对外 80） |
| 访问入口 | `http://srm-front.fat0.qa.nt.ctripcorp.com/` | 同左 |
| 登录操作 | 跳到 api 授权 URL 后，手动改为 `http://srm-api.fat0.qa.nt.ctripcorp.com/oauth` | 页面内直接走 SSO |

## 相关文件

| 文件 | 说明 |
|------|------|
| `local-dev/.env.development.local.yml` | SSO 用环境变量模板（提交仓库） |
| `src/config/.env.development.local.yml` | 本机生效配置（复制模板，不提交） |
| `src/config/.env.development.yml` | 通用本地配置 |
| `local-dev/.runtime/` | Nginx 运行时文件（已 gitignore） |
