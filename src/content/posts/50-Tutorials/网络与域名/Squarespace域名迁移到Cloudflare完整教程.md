---
title: Squarespace 域名迁移到 Cloudflare：完整实操教程
updated: 2026-09-26T00:00:00.000Z
tags:
  - 域名
  - Squarespace
  - Cloudflare
  - DNS
category: 网络与服务器
published: 2026-09-25T00:00:00.000Z
draft: false
---

# Squarespace 域名迁移到 Cloudflare：完整实操教程

> 适用场景：域名注册在 **Squarespace**，希望把 **DNS 管理权迁移到 Cloudflare**，域名本身仍留在 Squarespace 续费和持有。\
> 本文按实际操作流程整理，并统一使用 **中文（English）** 菜单名称。
>
> **示例说明**：域名、Nameserver、DS Digest 和服务器 IP 均使用示例值；实际操作时复制自己控制台中的值。NS 和 DS 本身是公开 DNS 数据。

开始前准备好 Squarespace 域名管理权限、Cloudflare 账号，并保存现有 DNS 记录清单。下面先解释相关概念，再按添加域名、核对记录、切换 NS、恢复 DNSSEC 的顺序操作。

---

## 1. 先理解：迁移到 Cloudflare 到底迁了什么

迁移前：

```text
域名注册 / 续费：Squarespace
DNS 管理：Squarespace
邮箱：可能是 Google Workspace
```

迁移后：

```text
域名注册 / 续费：Squarespace
        │
        │ Nameserver（NS）
        ▼
DNS 管理：Cloudflare
        │
        ├─ A / AAAA
        ├─ CNAME
        ├─ MX
        ├─ TXT
        ├─ 子域名
        └─ DNSSEC
```

也就是说：

- **域名没有转移到 Cloudflare**
- **续费仍然在 Squarespace**
- Cloudflare 只接管 **权威 DNS**
- 以后新增 `xxx.example.com` 之类的子域名，都在 Cloudflare 配置

---

## 2. NS、DNS 记录、邮箱是什么关系

很多教程会把“绑定 Cloudflare”“改 NS”“配置邮箱”混在一起，实际是三件事。

### 2.1 Nameserver（NS）

NS 决定：

> “这个域名的 DNS 记录应该去哪里查询？”

例如：

```text
原来：
nse1.squarespacedns.com
nse2.squarespacedns.com

迁移后：
xxxx.ns.cloudflare.com
yyyy.ns.cloudflare.com
```

一旦 NS 改成 Cloudflare，以后真正生效的 DNS 记录就以 Cloudflare 为准。

---

### 2.2 DNS 记录

常见类型：

```text
A       → 指向 IPv4 地址
AAAA    → 指向 IPv6 地址
CNAME   → 指向另一个域名
MX      → 邮箱收信服务器
TXT     → SPF / DKIM / 验证信息等
```

---

### 2.3 Google Workspace 邮箱

Google Workspace 邮箱通常依赖这些 DNS 记录：

```text
MX
SPF（TXT）
DKIM（TXT）
DMARC（TXT）
```

如果 Google Workspace 已取消：

- 域名不会失效
- Squarespace 不会自动删掉旧 MX / SPF / DKIM
- 旧记录会继续留在 DNS 中
- 后续可以按需清理

这里的“取消”指 Workspace 办公套件订阅。域名续费要单独保持有效；如果还通过 Google 身份管理域名，保留组织账号和登录方式。删除组织账号前需先处理 Squarespace 的登录关联，见 [Google 取消 Workspace 说明](https://knowledge.workspace.google.com/admin/billing/cancel-google-workspace)。

---

## 3. Cloudflare 添加域名

进入 Cloudflare：

```text
域（Domains）
→ 添加域（Add a domain / Onboard a domain）
```

输入：

```text
example.com
```

不要输入：

```text
www.example.com
https://example.com
```

只填根域名即可。

---

## 4. 选择套餐

选择：

```text
免费（Free）
```

个人域名、知识库、博客、状态页、普通服务器解析等场景，Free 基本足够。

---

## 5. 导入现有 DNS 记录

Cloudflare 会扫描 Squarespace 当前的 DNS。**扫描结果可能不完整**：切换 NS 前，把 A / AAAA、CNAME、MX、SPF、DKIM、DMARC 和验证记录逐项与原控制台比较，补齐漏项。先保存原记录清单，便于排查和回退。参见 [Cloudflare 完整接入步骤](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)。

常见可能导入：

```text
A       @
A       @
A       @
A       @
CNAME   www
CNAME   _domainconnect
MX      @
TXT     @
TXT     google._domainkey
```

其中可能包括：

- Squarespace 网站记录
- Squarespace Domain Connect
- Google Workspace MX
- Google Workspace SPF
- Google Workspace DKIM

---

### 5.1 第一次迁移建议先使用“仅 DNS”

迁移过程中建议把扫描到的 Web 记录先改成：

```text
仅 DNS（DNS only）
```

而不是：

```text
已代理（Proxied）
```

这样做的目的是：

- 先保证 DNS 迁移本身正常
- 避免同时引入 Cloudflare 代理、SSL、源站兼容问题
- 迁移成功后再决定哪些服务开启橙云

尤其像：

```text
_domainconnect
```

这类验证 / 第三方连接用途记录，更适合保持：

```text
仅 DNS（DNS only）
```

---

## 6. Cloudflare 会分配两条 Nameserver

Cloudflare 会给出两条专属 NS，例如：

```text
xxxx.ns.cloudflare.com
yyyy.ns.cloudflare.com
```

注意：

- 不要照抄别人的 NS
- 每个域名实际分配的 NS 可能不同
- 必须使用 Cloudflare 页面为当前域名显示的两条

此时 **不要先乱删旧 DNS 记录**。

---

## 7. 在 Squarespace 修改 Nameserver

进入 Squarespace 域名管理：

```text
DNS
→ 域名名称服务器（Domain Nameservers）
```

不要进入：

```text
名称服务器注册（Nameserver Registration）
```

后者主要用于自己创建类似：

```text
ns1.example.com
ns2.example.com
```

这样的 Glue Record，与本次迁移无关。

---

### 7.1 选择自定义 Nameserver

点击：

```text
使用自定义名称服务器（Use Custom Nameservers）
```

如果域名最初通过 Google Workspace 渠道购买，Squarespace 可能提示：

```text
This domain is managed by Google Workspace
```

并要求使用原 Google 身份再次验证。

这是 Squarespace / Google Workspace 历史关联导致的验证流程，不代表域名仍由 Google 管理 DNS。

---

### 7.2 Google 验证弹窗被拦截怎么办

可能出现：

```text
accounts.google.com
ERR_BLOCKED_BY_RESPONSE
```

可尝试：

- 允许 `account.squarespace.com` 弹窗
- 允许 `accounts.google.com` 登录
- 暂时关闭广告拦截 / 隐私类扩展
- 使用 Chrome 无痕窗口重新登录
- 确认当前 Google 身份是当初绑定的账号

验证成功后即可继续。

---

## 8. 修改 NS 前先关闭 DNSSEC

Squarespace 可能提示：

```text
Disable DNSSEC in order to make changes
```

这是正常且重要的一步。

正确顺序：

```text
关闭 Squarespace DNSSEC，确认注册局已移除旧 DS
        ↓
等待旧 DS 的 TTL 缓存过期
        ↓
修改 Nameserver
        ↓
等待 Cloudflare 激活
        ↓
再开启 Cloudflare DNSSEC
```

不要在旧 DNSSEC 仍有效时直接切 NS，否则可能出现：

```text
SERVFAIL
DNS 无法解析
Cloudflare 一直 Pending
```

---

## 9. 填入 Cloudflare 两条 Nameserver

在 Squarespace：

```text
名称服务器 1（Nameserver 1）
xxxx.ns.cloudflare.com

名称服务器 2（Nameserver 2）
yyyy.ns.cloudflare.com
```

然后：

```text
保存（Save）
```

Cloudflare Free 通常只需要两条 NS。

---

## 10. 回到 Cloudflare 确认激活

回 Cloudflare 后点击类似：

```text
我已更新名称服务器
（I have updated my nameservers / Check nameservers）
```

可能出现：

```text
等待中（Pending）
```

这是正常的。

最终应变成：

```text
有效（Active）
```

或出现类似：

```text
您的域现在受 Cloudflare 保护
```

这表示 Cloudflare 已正式成为权威 DNS，但不代表每条业务记录都已正确导入。继续打开网站、测试邮箱收发，并核对关键子域名。

在本机 PowerShell 中可查询 NS；将 `example.com` 换成自己的域名，结果应与控制台分配的 NS 一致：

```powershell
Resolve-DnsName -Name example.com -Type NS
```

若暂时仍返回旧 NS，先检查注册商是否保存成功，再等待缓存更新。

---

## 11. 迁移成功后的最终结构

```text
Squarespace
├─ 域名注册
├─ 域名续费
└─ NS → Cloudflare
          │
          ├─ DNS
          ├─ 子域名
          ├─ CDN / Proxy
          ├─ SSL
          └─ DNSSEC
```

从这时开始：

> 新增或修改 A / CNAME / MX / TXT 等 DNS 记录，主要都在 Cloudflare 操作。

---

## 12. 重新开启 DNSSEC

迁移完成并确认 Cloudflare 已：

```text
有效（Active）
```

后，确认旧 NS 的缓存也已过期，再处理 DNSSEC。

进入 Cloudflare：

```text
DNS
→ 设置（Settings）
→ DNSSEC
→ 启用 DNSSEC（Enable DNSSEC）
```

Cloudflare 会显示若干信息，例如：

```text
DS 记录（DS Record）
密钥标记（Key Tag）
算法（Algorithm）
摘要类型（Digest Type）
摘要（Digest）
公钥（Public Key）
标志（Flags）
```

Squarespace 不需要全部填写。

---

### 12.1 Cloudflare 与 Squarespace 字段对应关系

Squarespace：

```text
DNS
→ DNSSEC
→ 添加记录（Add Record）
```

对应填写：

| Cloudflare 中文（English） | Squarespace |
|---|---|
| 密钥标记（Key Tag） | KEY TAG |
| 算法（Algorithm） | ALGORITHM |
| 摘要类型（Digest Type） | DIGEST TYPE |
| 摘要（Digest） | DIGEST |

以下 Cloudflare 字段通常不需要单独填：

```text
DS 记录（DS Record）
公钥（Public Key）
标志（Flags）
```

因为 Squarespace 使用的是拆分后的 DS 字段输入方式。

---

### 12.2 注意：Digest 必须完整复制

例如：

```text
DIGEST
ABCD1234...（很长的一整串）
```

必须：

- 完整复制
- 不要手打
- 不要截断
- 不要把整条 DS Record 填进 Digest

---

## 13. DNSSEC 成功的判断方式

回 Cloudflare：

```text
DNS
→ 设置（Settings）
→ DNSSEC
```

如果看到：

```text
成功
DNSSEC 已启用
```

并且按钮变成：

```text
禁用 DNSSEC（Disable DNSSEC）
```

还需要确认 Cloudflare 已验证注册商发布的 DS，DNSSEC 状态为有效。**仅出现“Disable DNSSEC”按钮不足以证明信任链完整**；如果仍提示等待 DS，就返回 Squarespace 核对字段并等待更新。可按 [Cloudflare DNSSEC 文档](https://developers.cloudflare.com/dns/dnssec/)检查状态。

此时整体结构是：

```text
Squarespace
├─ 注册 / 续费
├─ NS → Cloudflare
└─ DS → Cloudflare DNSSEC

Cloudflare
├─ 权威 DNS
└─ DNSSEC 已启用
```

---

## 14. 旧 Squarespace / Google Workspace 记录怎么处理

迁移后 Cloudflare 可能保留一些旧记录。

例如：

```text
4 条 A → Squarespace
CNAME www → Squarespace
CNAME _domainconnect → Squarespace
MX → Google Workspace
TXT SPF → Google
TXT DKIM → Google
```

---

### 14.1 不删会怎样

短期通常不会影响 Cloudflare 本身。

但这些记录仍然有实际含义。

#### Squarespace 网站记录

例如：

```text
A @ → Squarespace
CNAME www → Squarespace
```

意味着：

```text
example.com
www.example.com
```

仍然会指向 Squarespace。

如果以后要把根域名改成自己的主页，需要修改这些记录。

---

#### `_domainconnect`

通常属于 Squarespace Domain Connect 自动配置辅助记录。

如果已经完全不用 Squarespace 网站，可后续清理。

---

#### Google Workspace MX / SPF / DKIM

如果 Workspace 已取消：

```text
MX
SPF
DKIM
```

会成为旧配置。

不一定立即造成故障，但长期建议清理，避免：

- 邮件仍尝试投递到已取消的 Google Workspace
- SPF 继续声明 Google 有发信权限
- DKIM 留下无效旧公钥

---

### 14.2 可以暂时不删

如果不确定，完全可以暂时保留。

特别是：

```text
status.example.com
kb.example.com
panel.example.com
```

这些新子域名通常不会与旧的根域名记录冲突。

以后真正要使用：

```text
example.com
www.example.com
@example.com 邮箱
```

时，再针对性调整即可。

---

## 15. Cloudflare Free 的 DNS 记录数量

Cloudflare Free 一个 Zone 的 DNS 记录数量有上限；具体额度以 [Cloudflare DNS 记录配额说明](https://developers.cloudflare.com/dns/manage-dns-records/#dns-records-quota)及自己的控制台为准。

可以简单理解成：

```text
1 条 A / CNAME / MX / TXT
≈ 占 1 条 DNS 记录
```

如果一个子域名只使用一条记录，例如：

```text
status.example.com → 1 条 A
```

那么可以配置很多不同子域名。

但注意：

> 限制的是“DNS 记录数量”，不是“子域名数量”。

例如一个邮件系统可能会占多条：

```text
MX
SPF
DKIM
DMARC
```

---

## 16. 后续如何新增子域名

进入：

```text
DNS
→ 记录（Records）
→ 添加记录（Add record）
```

例如：

```text
类型（Type）：A
名称（Name）：status
IPv4 地址（IPv4 address）：203.0.113.10
代理状态（Proxy status）：仅 DNS（DNS only）
```

结果：

```text
status.example.com
```

---

## 17. “仅 DNS” 与 “已代理” 怎么选

### 仅 DNS（DNS only）

Cloudflare 只负责 DNS 解析：

```text
域名 → 真实服务器 IP
```

适合：

- SSH
- 数据库
- 特殊 TCP / UDP 服务
- 不希望走 Cloudflare 代理的服务
- 迁移期间

---

### 已代理（Proxied）

即 Cloudflare 橙云。

路径变成：

```text
访问者
  ↓
Cloudflare
  ↓
源站
```

适合：

- HTTP / HTTPS 网站
- 博客
- 普通 Web 面板
- 希望使用 CDN / WAF / 隐藏源站 IP 的站点

注意：

> Cloudflare 普通橙云并不能代理任意端口和任意协议。

---

## 18. Cloudflare 基础配置完成后，还需要改什么

对于普通个人域名，完成下面这些后已经足够：

```text
✅ NS 已迁到 Cloudflare
✅ Cloudflare 状态 Active
✅ DNSSEC 已重新启用
✅ DNS 记录已成功迁移
```

以下功能不需要为了“配置完整”而强行开启：

```text
多签名者 DNSSEC（Multi-signer DNSSEC）
多提供商 DNS（Multi-provider DNS）
复杂 WAF
Zero Trust
Tunnel
Email Security
```

有具体需求时再配置即可。

---

## 19. 后续推荐的域名结构

根域名：

```text
example.com
```

通常适合做：

```text
个人主页 / 导航主页 / 总入口
```

然后将具体服务拆分成：

```text
kb.example.com        → 知识库
docs.example.com      → 文档
blog.example.com      → 博客
tools.example.com     → 工具
status.example.com    → 状态页
panel.example.com     → 面板
api.example.com       → API
```

这种结构比把所有功能都堆在根域名上更清晰。

---

## 20. Cloudflare Pages / GitHub 自动部署项目如何绑定域名

如果已有：

```text
GitHub
  ↓
Cloudflare Pages 自动构建
  ↓
project.pages.dev
```

希望增加：

```text
kb.example.com
```

应优先从 Pages 项目本身配置。

路径：

```text
计算（Compute）
→ Workers 和 Pages（Workers & Pages）
→ 选择项目
→ 自定义域（Custom domains）
→ 设置自定义域（Set up a custom domain）
```

输入：

```text
kb.example.com
```

这样：

```text
project.pages.dev
kb.example.com
```

可以同时指向同一个 Pages 项目。

不建议只手工在：

```text
DNS → 记录（Records）
```

里创建一个 CNAME 就认为 Pages 自定义域已经配置完成。先在 Pages 中关联域名，再按界面要求添加或确认 DNS 记录，最后访问 HTTPS 地址检查证书与页面。参见 [Pages 自定义域文档](https://developers.cloudflare.com/pages/configuration/custom-domains/)。

---

## 21. 完整迁移流程速查

```text
1. Cloudflare 添加根域名
        ↓
2. 选择 Free
        ↓
3. 自动扫描 Squarespace DNS
        ↓
4. 检查原记录是否完整
        ↓
5. 初次迁移建议 Web 记录先改 DNS only
        ↓
6. Cloudflare 生成两条 NS
        ↓
7. Squarespace → Domain Nameservers
        ↓
8. 如有 DNSSEC，先关闭，确认旧 DS 已移除并等待 TTL 过期
        ↓
9. 填 Cloudflare 两条 NS
        ↓
10. 保存
        ↓
11. Cloudflare 检查 Nameserver
        ↓
12. 等待 Active
        ↓
13. Cloudflare 开启 DNSSEC
        ↓
14. Squarespace 添加 Cloudflare DS
        ↓
15. Cloudflare DNSSEC 显示成功
        ↓
16. 根据需要清理旧 Squarespace / Google Workspace DNS
```

---

## 22. 常见错误

### 错误 1：把 Cloudflare 当成“域名转移”

不是。

```text
Squarespace：域名注册商
Cloudflare：DNS 服务商
```

两者可以同时存在。

---

### 错误 2：改 NS 后还在 Squarespace DNS Settings 加记录

一旦 NS 已经指向 Cloudflare：

```text
Squarespace DNS Settings
```

一般不再是权威解析来源。

以后应优先在：

```text
Cloudflare
→ DNS
→ 记录（Records）
```

操作。

---

### 错误 3：旧 DNSSEC 没关就直接切 NS

可能造成解析失败。

正确顺序：

```text
关闭旧 DNSSEC，确认旧 DS 已移除并等待 TTL 过期
→ 切 NS
→ Cloudflare Active
→ 开启新 DNSSEC
→ 注册商填写 DS
```

---

### 错误 4：把整条 DS Record 填进 Digest

Squarespace 通常要求拆分字段：

```text
Key Tag
Algorithm
Digest Type
Digest
```

只填对应字段。

---

### 错误 5：Google Workspace 已取消，但以为旧 MX 会自动消失

不会。

旧 DNS 记录可能一直存在，需自行清理。

---

## 23. 推荐最终状态

```text
Squarespace
├─ 域名持有
├─ 域名续费
├─ Nameserver → Cloudflare
└─ DS → Cloudflare DNSSEC

Cloudflare
├─ 权威 DNS
├─ DNSSEC
├─ 子域名管理
├─ Pages 自定义域
├─ SSL / CDN（按需）
└─ Proxy / WAF（按需）
```

---

## 结论

对于“域名注册在 Squarespace，但以后会挂多个个人服务”的场景，比较清晰的做法是：

```text
Squarespace 负责：域名所有权与续费
Cloudflare 负责：DNS、子域名、SSL、代理、Pages、自定义域
```

迁移完成后，日常最常用的页面基本就是：

```text
DNS
→ 记录（Records）
```

以后添加：

```text
kb.example.com
status.example.com
panel.example.com
docs.example.com
```

都可以在 Cloudflare 统一管理。
