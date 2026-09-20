---
title: Git 与 GitHub SSH 代理配置教程
updated: 2026-09-20T00:00:00.000Z
tags:
  - windows
  - git
  - 网络代理
  - GitHub
  - GitLab
  - SSH
aliases:
  - Git 代理配置
  - Git HTTPS SSH 代理
  - SSH ProxyCommand 配置
published: 2026-09-20T00:00:00.000Z
draft: false
category: tutorial
---

相关笔记：[[Codex Claude 软件级代理设置教程]]、[[GitHub 提交邮箱隐私与 Git 多身份配置]]、[[Windows 使用 KeePassXC 与 SSH Agent 管理 SSH 密钥]]

> 适用场景：Windows + Git for Windows + 本地代理工具（Clash / FlClash 等）。
>
> - Git 的 **HTTP/HTTPS** 仓库走本地代理端口
> - Git 的 **SSH** 仓库通过 `~/.ssh/config` 走同一个本地代理端口
> - GitHub、GitLab 均可使用
>
> 本文用 `<本地代理端口>` 作为示例占位符，请替换成你实际代理工具监听的端口。

## 1. 先理解两套代理分别管什么

Git 仓库常见有两种地址。

### HTTPS 地址

```text
https://github.com/user/repo.git
https://gitlab.com/user/repo.git
```

这种连接受 Git 的：

```text
http.proxy
https.proxy
```

控制。

### SSH 地址

```text
git@github.com:user/repo.git
git@gitlab.com:user/repo.git
```

这种连接实际上由 `ssh.exe` 建立，**不会读取 Git 的 `http.proxy` / `https.proxy`**。

因此最终方案是：

```text
Git HTTPS
    ↓
~/.gitconfig
    ↓
127.0.0.1:<本地代理端口>

Git SSH
    ↓
~/.ssh/config
    ↓
ProxyCommand
    ↓
127.0.0.1:<本地代理端口>
```

---

## 2. 查看当前 Git 代理配置

推荐先执行：

```powershell
git config --show-origin --show-scope --get-regexp "proxy"
```

它会显示：

- 配置作用域
- 配置文件位置
- 当前代理内容

也可以只查看全局配置：

```powershell
git config --global --get-regexp proxy
```

例如可能看到：

```text
http.https://github.com.proxy http://127.0.0.1:<本地代理端口>
https.https://github.com.proxy http://127.0.0.1:<本地代理端口>
```

这代表之前配置的是“仅 GitHub 使用代理”。

---

## 3. 两种 Git 代理策略怎么选

Git 的 HTTP/HTTPS 代理有两种配法，适用场景相反：

| 策略 | 配置 | 适合 |
| --- | --- | --- |
| 全局代理 | 通用 `http.proxy` / `https.proxy` | 所有 Git 远程都需要走代理，没有必须直连的仓库 |
| URL 级代理 | `http.https://github.com/.proxy` | 只有 GitHub 走代理，GitLab 或公司仓库必须直连 |

如果公司仓库、内网 GitLab 必须直连，用 URL 级配置，只给 GitHub 配代理：

```powershell
git config --global http.https://github.com/.proxy http://127.0.0.1:<本地代理端口>
```

这种配法的详细说明见 [[Codex Claude 软件级代理设置教程]] 的「方案三」，本文不重复。

下面以「所有 Git 仓库统一走代理」为例。如果你已经在用 URL 级配置，可以跳到第 7 节配置 SSH。

---

## 4. 清理旧的 GitHub 专用代理

如果准备恢复为“所有 HTTPS Git 仓库统一走代理”，先删除旧的 GitHub 专用配置：

```powershell
git config --global --unset-all http.https://github.com.proxy
git config --global --unset-all https.https://github.com.proxy
```

如果某条配置不存在，Git 可能返回非 0 状态，不影响后续配置。

再次检查：

```powershell
git config --global --get-regexp proxy
```

---

## 5. 配置所有 Git HTTP/HTTPS 请求走代理

执行：

```powershell
git config --global http.proxy http://127.0.0.1:<本地代理端口>
git config --global https.proxy http://127.0.0.1:<本地代理端口>
```

检查：

```powershell
git config --global --get-regexp proxy
```

正常应看到：

```text
http.proxy http://127.0.0.1:<本地代理端口>
https.proxy http://127.0.0.1:<本地代理端口>
```

Windows 下，全局 Git 配置通常位于：

```text
C:\Users\你的用户名\.gitconfig
```

也可以直接打开：

```powershell
git config --global --edit
```

对应配置大致为：

```ini
[http]
    proxy = http://127.0.0.1:<本地代理端口>

[https]
    proxy = http://127.0.0.1:<本地代理端口>
```

---

## 6. 判断当前仓库使用 HTTPS 还是 SSH

进入 Git 仓库后执行：

```powershell
git remote -v
```

如果看到：

```text
origin  https://github.com/user/repo.git
```

说明当前仓库使用 HTTPS，会读取 Git 全局代理。

如果看到：

```text
origin  git@github.com:user/repo.git
```

说明当前仓库使用 SSH，需要继续配置 `~/.ssh/config`。

---

## 7. 配置 SSH Git 走代理

### 7.1 Windows 下 SSH 配置文件位置

默认位置：

```text
C:\Users\你的用户名\.ssh\config
```

也就是：

```text
~/.ssh/config
```

注意：

```text
config
```

**没有文件后缀**。

如果文件不存在，可以手动创建。

---

### 7.2 先确认 connect.exe 是否存在

在 PowerShell 执行：

```powershell
where.exe connect
```

Git for Windows 常见位置可能是：

```text
C:\Program Files\Git\mingw64\bin\connect.exe
```

或类似路径。

只要：

```powershell
where.exe connect
```

能找到 `connect.exe`，下面的 `ProxyCommand` 一般即可直接使用。

---

### 7.3 给 GitHub 配置 SSH 代理

编辑：

```text
C:\Users\你的用户名\.ssh\config
```

添加：

```sshconfig
Host github.com
    HostName github.com
    User git
    ProxyCommand connect -S 127.0.0.1:<本地代理端口> %h %p
```

其中：

```text
-S 127.0.0.1:<本地代理端口>
```

表示通过本地 SOCKS 代理连接目标服务器。

如果本地代理端口是代理工具的 Mixed Port，一般同时支持 HTTP 和 SOCKS，可直接使用。

---

### 7.4 给 GitLab 配置 SSH 代理

继续添加：

```sshconfig
Host gitlab.com
    HostName gitlab.com
    User git
    ProxyCommand connect -S 127.0.0.1:<本地代理端口> %h %p
```

最终可以写成：

```sshconfig
Host github.com
    HostName github.com
    User git
    ProxyCommand connect -S 127.0.0.1:<本地代理端口> %h %p

Host gitlab.com
    HostName gitlab.com
    User git
    ProxyCommand connect -S 127.0.0.1:<本地代理端口> %h %p
```

---

## 8. 如果已经配置 SSH Key

如果你原本的 SSH 配置已经包含：

```sshconfig
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github
```

不要重新再写一个相同的 `Host github.com`，直接把代理配置追加进去即可：

```sshconfig
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github
    ProxyCommand connect -S 127.0.0.1:<本地代理端口> %h %p
```

GitLab 同理：

```sshconfig
Host gitlab.com
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_gitlab
    ProxyCommand connect -S 127.0.0.1:<本地代理端口> %h %p
```

---

## 9. 测试 GitHub SSH

确保 本地代理工具 正在运行，并且 本地代理端口正常监听。

执行：

```powershell
ssh -T git@github.com
```

首次连接可能提示确认主机指纹：

```text
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

确认域名无误后输入：

```text
yes
```

认证正常时，通常会看到类似：

```text
Hi xxx! You've successfully authenticated, but GitHub does not provide shell access.
```

这表示 SSH Key 和 SSH 代理均已经工作。

---

## 10. 测试 GitLab SSH

执行：

```powershell
ssh -T git@gitlab.com
```

正常情况下会出现 GitLab 的欢迎或认证成功信息。

---

## 11. 测试 Git HTTPS

可以使用现有 HTTPS 仓库：

```powershell
git fetch
```

或者：

```powershell
git pull
```

只要仓库 Remote 是：

```text
https://...
```

就会读取：

```text
http.proxy
https.proxy
```

并通过：

```text
127.0.0.1:<本地代理端口>
```

访问。

---

## 12. 查看本机代理端口是否正在监听

PowerShell：

```powershell
Get-NetTCPConnection -LocalPort <本地代理端口> -ErrorAction SilentlyContinue
```

也可以：

```powershell
netstat -ano | findstr :<本地代理端口>
```

如果能看到监听状态，例如：

```text
LISTENING
```

说明本地代理端口已经启动。

---

## 13. 查看 Git 实际使用哪个 ssh.exe

Windows 上可能同时存在：

```text
C:\Windows\System32\OpenSSH\ssh.exe
```

和：

```text
C:\Program Files\Git\usr\bin\ssh.exe
```

查看：

```powershell
where.exe ssh
```

还可以检查 Git 是否单独指定 SSH：

```powershell
git config --show-origin --get core.sshCommand
```

以及环境变量：

```powershell
$env:GIT_SSH
$env:GIT_SSH_COMMAND
```

如果这些都没有特殊设置，Git 一般按照当前环境找到可用的 `ssh.exe`。

---

## 14. 查看 SSH 最终展开后的配置

OpenSSH 可以查看某个 Host 最终会使用哪些配置：

```powershell
ssh -G github.com
```

可以重点寻找：

```text
hostname
user
proxycommand
identityfile
```

例如：

```powershell
ssh -G github.com | Select-String "hostname|user|proxycommand|identityfile"
```

如果配置生效，应能看到对应的：

```text
proxycommand connect -S 127.0.0.1:<本地代理端口> ...
```

---

## 15. 最终推荐配置

### Git HTTPS

全局：

```powershell
git config --global http.proxy http://127.0.0.1:<本地代理端口>
git config --global https.proxy http://127.0.0.1:<本地代理端口>
```

对应：

```text
C:\Users\你的用户名\.gitconfig
```

---

### Git SSH

```text
C:\Users\你的用户名\.ssh\config
```

内容：

```sshconfig
Host github.com
    HostName github.com
    User git
    ProxyCommand connect -S 127.0.0.1:<本地代理端口> %h %p

Host gitlab.com
    HostName gitlab.com
    User git
    ProxyCommand connect -S 127.0.0.1:<本地代理端口> %h %p
```

如果已经配置 SSH Key，则将 `ProxyCommand` 加入原有对应 `Host` 块中。

---

## 16. 最终流量结构

```text
HTTPS GitHub / GitLab / 其他 Git
                │
                ▼
          Git .gitconfig
                │
                ▼
       http://127.0.0.1:<本地代理端口>
                │
                ▼
             本地代理工具


SSH GitHub / GitLab
                │
                ▼
           ssh.exe
                │
                ▼
          ~/.ssh/config
                │
                ▼
 ProxyCommand connect -S 127.0.0.1:<本地代理端口>
                │
                ▼
             本地代理工具
```

这样 HTTP/HTTPS 和 SSH 两套 Git 连接都可以统一经过本地代理。

---

## 17. 撤销 Git HTTP/HTTPS 代理

如果以后不想让 Git HTTP/HTTPS 走代理：

```powershell
git config --global --unset-all http.proxy
git config --global --unset-all https.proxy
```

检查：

```powershell
git config --global --get-regexp proxy
```

没有输出即代表 Git 全局代理已删除。

---

## 18. 撤销 SSH 代理

打开：

```text
C:\Users\你的用户名\.ssh\config
```

删除 GitHub / GitLab Host 块中的：

```sshconfig
ProxyCommand connect -S 127.0.0.1:<本地代理端口> %h %p
```

例如从：

```sshconfig
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github
    ProxyCommand connect -S 127.0.0.1:<本地代理端口> %h %p
```

恢复为：

```sshconfig
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github
```

即可。

---

## 19. 常见问题

### 问题 1：配置了 Git 全局 proxy，为什么 SSH 不走代理？

因为：

```text
http.proxy
https.proxy
```

属于 Git HTTP 传输层配置。

而：

```text
git@github.com:...
```

调用的是 SSH，两者完全独立。

因此 SSH 必须通过：

```text
~/.ssh/config
```

或其他 SSH/系统级代理方式单独处理。

---

### 问题 2：为什么推荐 `.ssh/config`，而不是 Proxifier 接管 ssh.exe？

两种方案都可以。

使用 `.ssh/config` 的优点是：

- 配置属于 SSH 自身
- 哪些域名走代理一目了然
- 不依赖 Proxifier 的进程匹配
- 不影响其他使用 `ssh.exe` 的场景
- SSH Key 和代理规则可以放在一起管理

如果 GitHub/GitLab 的 SSH 使用比较固定，`.ssh/config` 通常更加清晰。

---

### 问题 3：本地代理端口到底应该使用 HTTP 还是 SOCKS？

Git HTTPS 使用：

```text
http://127.0.0.1:<本地代理端口>
```

SSH `ProxyCommand connect` 使用：

```text
-S 127.0.0.1:<本地代理端口>
```

后者表示 SOCKS。

如果本地代理端口是代理工具的 Mixed Port，一般可以同时支持这两种方式。

---

### 问题 4：公司 GitLab 不希望走代理怎么办？

不要给公司 GitLab 的 Host 配：

```sshconfig
ProxyCommand
```

例如：

```sshconfig
Host gitlab.company.com
    HostName gitlab.company.com
    User git
    IdentityFile ~/.ssh/id_ed25519_company
```

即可继续直连。

需要注意：如果你同时设置了 Git 全局：

```text
http.proxy
https.proxy
```

那么公司 Git 仓库如果使用 **HTTPS Remote**，仍会尝试走全局 Git HTTP 代理。

这种情况下可以再根据域名做例外配置，或者公司仓库统一使用 SSH。

---

## 20. 日常排查命令速查

查看 Git 代理：

```powershell
git config --show-origin --show-scope --get-regexp proxy
```

查看 Remote：

```powershell
git remote -v
```

查看 SSH：

```powershell
where.exe ssh
```

查看 connect：

```powershell
where.exe connect
```

查看 GitHub SSH 展开配置：

```powershell
ssh -G github.com
```

测试 GitHub：

```powershell
ssh -T git@github.com
```

测试 GitLab：

```powershell
ssh -T git@gitlab.com
```

检查代理端口：

```powershell
netstat -ano | findstr :<本地代理端口>
```

---

## 配置总结

最终只需要记住两处：

```text
C:\Users\你的用户名\.gitconfig
```

负责：

```text
Git HTTP / HTTPS
```

以及：

```text
C:\Users\你的用户名\.ssh\config
```

负责：

```text
Git SSH
```

统一指向：

```text
127.0.0.1:<本地代理端口>
```

即可。
