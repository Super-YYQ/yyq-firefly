---
title: Windows Node.js 与 npm 使用及排错教程
updated: 2026-10-09T00:00:00.000Z
tags:
  - Windows
  - Node.js
  - npm
  - PowerShell
  - 故障排查
category: 软件开发
published: 2026-10-09T00:00:00.000Z
draft: false
---
<span id="windows-nodejs-与-npm-使用及排错教程"></span>

> 适用环境：Windows、Windows PowerShell 5.1 或 PowerShell 7。  
> 更新日期：2026-10-09（北京时间）。  
> 主题：安装 Node.js 后无法使用 npm，尤其是 `npm.ps1` 被执行策略拦截。  
> 关键词：Node.js、npm、npx、PowerShell、PATH、执行策略。

## 1. 快速判断与处理

在出现问题的终端中，依次执行：

```powershell
node --version
npm --version
npm.cmd --version
```

| 结果 | 优先排查方向 | 下一步 |
| --- | --- | --- |
| 三条命令都输出版本号 | 命令启动正常 | 若安装依赖仍失败，按具体报错排查 |
| `node` 正常，`npm` 报禁止运行脚本，`npm.cmd` 正常 | PowerShell 执行策略 | 使用 `npm.cmd`，或按第 5 节调整策略 |
| `node` 和 `npm.cmd` 都无法识别 | 安装未完成，或终端无法找到安装目录 | 按第 6 节检查安装和 PATH |
| `node` 正常，`npm.cmd` 无法识别或报模块缺失 | npm 安装不完整，或命令来自不同安装目录 | 检查命令路径及安装文件 |

如果已经确认 `npm.cmd` 正常，可直接用它安装项目依赖：

```powershell
# 将路径替换成包含 package.json 的项目目录
Set-Location -LiteralPath 'D:\你的项目目录'
npm.cmd install
```

版本检查用于验证命令能否启动；`install` 会安装依赖并可能执行项目或依赖声明的脚本，请在准备使用的项目中运行。

## 2. 理解 Node.js、npm 与启动文件

| 名称 | 用途 |
| --- | --- |
| Node.js | 在终端等环境中运行 JavaScript |
| npm | 安装依赖、管理包、执行项目脚本 |
| npx | 调用包提供的命令行工具 |
| PATH | 终端查找命令时使用的目录列表 |

Node.js 安装器可以同时安装 Node.js 和 npm；仅下载文件并不等于完成安装。安装后可分别检查版本。参考 [npm 官方安装与版本检查说明](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/)。

本次案例的安装目录是 `D:\develop\nodejs`，其中同时存在 `node.exe`、`npm.ps1` 和 `npm.cmd`。

在本案例中，PowerShell 输入 `npm` 时解析到 `npm.ps1`；显式输入 `npm.cmd` 时则使用 CMD 启动文件。两者都启动 npm，但 PowerShell 的脚本执行策略会限制 `.ps1` 文件。

`Restricted` 允许交互式命令，但不允许运行 PowerShell 脚本，因此会出现“Node 能运行，npm 被拦截”的情况。参考 [微软执行策略说明](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-5.1)。

## 3. 本次案例记录

### 3.1 原始故障：2026-10-08

| 检查项 | 实际结果 |
| --- | --- |
| Node.js 安装位置 | `D:\develop\nodejs\node.exe` |
| `node --version` | `v24.21.0` |
| `npm --version` | 提示禁止运行 `npm.ps1` |
| `npm.cmd --version` | `11.19.0` |
| 有效执行策略 | `Restricted` |
| 各范围策略 | 均为 `Undefined` |

关键报错摘录：

```text
无法加载文件 D:\develop\nodejs\npm.ps1，因为在此系统上禁止运行脚本。
PSSecurityException
```

这些结果说明：Node.js 和 npm 已安装，PATH 能找到它们；当时失败发生在 PowerShell 加载 npm 启动脚本的阶段。

### 3.2 当前复核：2026-10-09

| 检查项 | 实际结果 |
| --- | --- |
| 复核终端版本 | PowerShell `7.6.6` |
| `node --version` | `v24.21.0` |
| `npm --version` | `11.19.0` |
| `npm.cmd --version` | `11.19.0` |
| `npx.cmd --version` | `11.19.0` |
| 有效执行策略 | `RemoteSigned` |
| `LocalMachine` 范围 | `RemoteSigned` |
| 其他范围 | `Undefined` |

当前复核终端中 npm 已能启动。两次检查反映各自终端的状态，不能据此确定谁调整过设置；Windows PowerShell 与 PowerShell 7 的策略设置也应分别检查。参考 [微软关于不同 PowerShell 版本的策略说明](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-executionpolicy?view=powershell-5.1)。

生成本文档时仅执行了只读诊断，没有执行策略修改、依赖安装或 npm 升级。上面的版本号是案例记录，不代表项目必须使用这些版本。

## 4. 标准排查步骤

### 4.1 检查终端与命令位置

在发生错误的同一个终端中运行：

```powershell
$PSVersionTable.PSVersion
Get-Command node,npm,npm.cmd -All -ErrorAction SilentlyContinue |
    Select-Object Name,CommandType,Source
```

重点观察：

- `node` 是否指向预期安装目录。
- `npm` 是否解析到 `npm.ps1`。
- 是否存在 `npm.cmd`。
- 是否出现多个 Node.js 安装目录，导致实际调用的版本与预期不同。

### 4.2 对比两种 npm 启动方式

```powershell
npm --version
npm.cmd --version
```

如果只有前者报“禁止运行脚本”，且后者输出版本号，说明需要处理 PowerShell 启动脚本的限制。

### 4.3 检查实际生效的策略

```powershell
Get-ExecutionPolicy
Get-ExecutionPolicy -List
```

第一条返回有效策略，第二条列出各范围设置。`Undefined` 表示该范围未设置策略，不表示允许脚本。参考 [微软策略查询说明](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-5.1)。

如果 `MachinePolicy` 或 `UserPolicy` 有值，需考虑组策略的优先级；本地修改可能不会改变有效策略。参考 [微软组策略覆盖说明](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-executionpolicy?view=powershell-5.1)。

## 5. 处理 PowerShell 脚本限制

三种方式按需要选择，不必全部执行。若 npm 已正常运行，可直接跳过本节。

### 方式 A：直接使用 npm.cmd

已在本案例中验证：

```powershell
npm.cmd --version
```

项目命令也可以保留同样的参数：

```powershell
# 在包含 package.json 的项目目录中安装依赖
npm.cmd install

# 查看项目声明的脚本
npm.cmd run

# 仅当项目声明了 dev 脚本时运行
npm.cmd run dev
```

此方式直接选择现有的 CMD 启动文件。也可以在 CMD 终端中使用 `npm --version`。

### 方式 B：仅调整当前 PowerShell 会话

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
npm --version
```

如果出现确认提示，输入 `Y`。`Process` 设置随当前会话结束而失效。参考 [微软会话策略说明](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-executionpolicy?view=powershell-5.1)。

### 方式 C：为当前用户保存策略

先记录当前设置，便于需要时恢复：

```powershell
Get-ExecutionPolicy -Scope CurrentUser
Get-ExecutionPolicy -List
```

然后执行：

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
Get-ExecutionPolicy
npm --version
```

如果出现确认提示，输入 `Y`。`CurrentUser` 设置影响当前用户并持续保存，正常情况下无需管理员权限。参考 [微软设置范围说明](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-executionpolicy?view=powershell-5.1)。

`RemoteSigned` 允许本地脚本，带有互联网来源标记的脚本通常需要可信签名；它影响该范围内的 PowerShell 脚本，并不只影响 npm。参考 [微软 RemoteSigned 说明](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-5.1)。

恢复时应使用修改前记录的值。如果原来的 `CurrentUser` 是 `Undefined`，则执行：

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Undefined
Get-ExecutionPolicy
Get-ExecutionPolicy -List
```

恢复某一范围后，有效策略仍由其他范围共同决定。参考 [微软移除范围策略说明](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-executionpolicy?view=powershell-5.1)。

## 6. 其他报错如何区分

| 报错或现象 | 检查方向 |
| --- | --- |
| 无法识别 `node` 或 `npm.cmd` | 是否完成安装、安装目录是否在 PATH、终端是否仍使用旧环境 |
| `Cannot find module`，路径涉及 npm 自身 | npm 文件是否完整、命令是否来自正确的安装目录 |
| `ENOENT`，路径涉及 `package.json` | 当前目录是否是项目目录、文件是否存在 |
| `Missing script: dev` | `package.json` 是否定义 `scripts.dev`，可用 `npm.cmd run` 查看脚本 |
| `ETIMEDOUT`、`ENOTFOUND`、证书错误 | npm 启动后的网络、代理、DNS 或证书问题 |
| `EPERM`、`EACCES` | 报错涉及的文件权限、占用进程及安装位置 |
| 设置策略后仍失败 | 有效策略、组策略、PowerShell 版本，以及是否换成了其他报错 |

### 无法识别命令时

1. 关闭并重新打开终端；若终端来自编辑器或桌面应用，也可重新打开宿主应用后复查。
2. 检查实际安装目录。以本案例为例：

   ```powershell
   Test-Path -LiteralPath 'D:\develop\nodejs\node.exe'
   Test-Path -LiteralPath 'D:\develop\nodejs\npm.cmd'
   ```

3. 如果文件存在，使用完整路径验证：

   ```powershell
   & 'D:\develop\nodejs\node.exe' --version
   & 'D:\develop\nodejs\npm.cmd' --version
   ```

4. 完整路径可以运行，而简短命令无法识别时，在 Windows 的“环境变量”界面检查 PATH 是否包含实际安装目录，例如 `D:\develop\nodejs`。添加目录，不是 `node.exe` 文件路径，并保留其他现有条目。
5. 文件不存在或安装不完整时，核对安装来源与步骤。参考 [npm 官方安装说明](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/)。

以上路径属于本案例；其他电脑应替换成自己的安装目录。

## 7. 验证与完成条件

对原始的脚本限制问题，在原来报错的终端中重新执行：

```powershell
node --version
npm --version
```

使用方式 A 时，验证目标是 `npm.cmd --version` 正常；使用方式 B 或 C 时，验证目标是 `npm --version` 正常，并可用 `Get-ExecutionPolicy` 确认有效策略。

输出版本号说明命令已经能启动，不代表网络访问、依赖安装或某个项目脚本全部正常。只有实际运行过的步骤才能记录为“验证通过”。

## 8. 可复用的问题记录模板

复制下面的字段，用于下一次排查：

```text
检查日期：
终端类型与版本：
Node.js 版本：
npm 版本：
实际执行的命令：
完整报错（隐藏凭据和其他敏感信息）：
node/npm/npm.cmd 的路径：
npm.cmd --version 的结果：
有效执行策略：
各范围策略：
采取的处理方式：
修改前的设置（如有）：
复核结果：
尚未验证的事项：
```
