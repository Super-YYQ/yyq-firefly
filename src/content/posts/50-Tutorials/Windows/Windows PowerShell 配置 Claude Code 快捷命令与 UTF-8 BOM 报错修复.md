---
title: Windows PowerShell 配置 Claude Code 快捷命令与 UTF-8 BOM 报错修复
description: >-
  Windows PowerShell 5.1 / PowerShell 7 配置 Claude Code 快捷启动命令，并排查 Profile
  文件编码导致的语法错误
updated: 2026-10-09T00:00:00.000Z
tags:
  - Windows
  - PowerShell
  - Claude Code
  - 故障排查
category: AI 工具与实践
published: 2026-10-08T00:00:00.000Z
draft: false
---
<span id="windows-powershell-配置-claude-code-快捷命令与-utf-8-bom-报错修复"></span>

> **适用环境**：Windows 10 / Windows 11、Windows PowerShell 5.1 / PowerShell 7。  
> **目标**：在任意工作目录输入短命令，即可启动 Claude Code；完整记录 Windows PowerShell 5.1 因配置文件采用 UTF-8 无 BOM 编码引起的启动报错及解决办法。  
> **实际验证结果**：将 `Microsoft.PowerShell_profile.ps1` 转换为 **UTF-8 BOM** 编码后，启动报错消失。

相关笔记：[[Codex Claude 软件级代理设置教程]]、[[Claude Code Hook 通知与提示音配置]]

## 一、先明确快捷命令对应关系

以下按照**当前实际使用的配置**整理：

| 终端 | 快捷命令 | 实际执行 | 说明 |
| --- | --- | --- | --- |
| PowerShell | `c` | `claude --enable-auto-mode` | 启用 Claude Code 自动模式（以当前版本支持为前提） |
| PowerShell | `ccd` | `claude --dangerously-skip-permissions` | 跳过工具权限确认，**风险较高** |
| Git Bash（另行配置） | `cc` | `claude --enable-auto-mode` | Bash 的快捷别名，不与 PowerShell 共享配置 |

> **注意**：函数名与参数的对应关系可以按个人习惯调整。如果希望 `ccd` 启动自动模式而不是跳过权限确认，只需把相应函数体替换为 `claude --enable-auto-mode @args`。

`--dangerously-skip-permissions` 会绕过 Claude Code 的权限保护，不应在来源不明的仓库、包含敏感凭据的目录或不受信任的环境中使用。即使是可信项目，也应特别留意可能影响文件、Git 仓库和外部资源的操作。

## 二、确认 Claude Code CLI 已安装

打开 PowerShell，执行：

```powershell
Get-Command claude
claude --version
claude --help
```

确认 `claude` 可执行，并检查当前版本是否支持 `--enable-auto-mode`、`--dangerously-skip-permissions`。若某个参数不被支持，快捷函数可以成功创建，但实际启动仍会报参数错误；应以**本机 `claude --help`** 为准。

## 三、找到并创建 PowerShell 配置文件

PowerShell 会在启动时读取用户配置脚本（Profile）。先查看本次会话使用的文件路径：

```powershell
$PROFILE
```

常见路径如下：

| 终端版本 | 常见配置文件路径 |
| --- | --- |
| Windows PowerShell 5.1 | `C:\Users\<用户名>\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1` |
| PowerShell 7 | `C:\Users\<用户名>\Documents\PowerShell\Microsoft.PowerShell_profile.ps1` |

报错提示中出现的路径通常形如：

```text
C:\Users\<用户名>\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
```

**文件不存在时**，用以下两条命令创建父目录和文件（不会清空已有配置）：

```powershell
New-Item -ItemType Directory -Path (Split-Path -Parent $PROFILE) -Force | Out-Null
if (-not (Test-Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE | Out-Null
}
```

编辑：

```powershell
notepad $PROFILE
```

也可以在 Notepad++ 里打开 `$PROFILE` 输出的完整路径。

> **关键提醒（Windows PowerShell 5.1）**：如果配置中有中文注释、中文消息等非 ASCII 字符，建议从一开始就以 **UTF-8 BOM** 格式保存 `.ps1` 文件，以避免部分系统上的错误解码。

## 四、配置 Claude Code 快捷命令

在现有 `$PROFILE` 文件末尾**追加**以下内容。若已有同名函数，请编辑原函数，不要重复定义：

```powershell
# Claude Code：自动模式
function c {
    & claude --enable-auto-mode @args
}

# Claude Code：跳过权限确认（高风险，仅在可信环境使用）
function ccd {
    & claude --dangerously-skip-permissions @args
}
```

### 为什么用 `function` 而不是 `Set-Alias`？

PowerShell 的普通 `Set-Alias` 主要将名称映射到**命令名**，不适合绑定固定的额外启动参数。函数则可以带上固定参数，并通过 `@args` 转发其他输入：

```powershell
c
c --continue
c --resume

ccd
ccd --continue
```

其中：

- `&`：PowerShell 调用运算符，执行 `claude` 命令；直接写 `claude ...` 也可以。
- `@args`：将调用快捷命令时追加的参数传给 Claude Code。
- `c`、`ccd` 是个人自定义函数名，可以自行调整。

**可选：** 如果还希望 PowerShell 里使用 `cc`，追加：

```powershell
function cc {
    & claude --enable-auto-mode @args
}
```

## 五、保存为 UTF-8 BOM（PowerShell 5.1 推荐）

这一步是**启动报错的实际修复点**。

### 方案 A：Notepad++ 图形界面转换（已验证成功）

1. 使用 Notepad++ 打开 `Microsoft.PowerShell_profile.ps1`。
2. 点击 **编码（Encoding）** 菜单。
3. 选择 **转为 UTF-8-BOM 编码（Convert to UTF-8-BOM）**。不同版本菜单措辞可能略有不同。
4. 按 `Ctrl + S` 保存。
5. 关闭当前 PowerShell 窗口，重新打开，检查是否还有红色报错。

**注意**：要选择带 **BOM** 的 UTF-8，不是普通的 **UTF-8（无 BOM）**；不要选择“以 ANSI 编码”来回避问题，以免损坏中文内容。

### 方案 B：PowerShell 命令行转换（备用）

如果不使用 Notepad++，可以在 PowerShell 里手动为文件写入 UTF-8 BOM。**先备份**：

```powershell
Copy-Item $PROFILE "$PROFILE.bak" -Force
```

然后执行以下命令（明确按 UTF-8 读取原文件，再按 UTF-8 BOM 写入）：

```powershell
$path = $PROFILE
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$utf8Bom = New-Object System.Text.UTF8Encoding($true)
[System.IO.File]::WriteAllText($path, $content, $utf8Bom)
```

> 此方案适用于**原文件确实是 UTF-8 无 BOM** 的情况。如果文本已经被错误保存为乱码，转换编码并不能自动恢复损坏的字符，应使用备份恢复原始内容后再转换。

## 六、立即加载与验证

保存文件后，在 PowerShell 执行：

```powershell
. $PROFILE
```

注意最前面的点和后面的空格：这是 PowerShell 的 **dot sourcing**，即在当前会话执行该配置文件。

确认函数存在：

```powershell
Get-Command c, ccd
```

若同时设置了可选的 `cc`：

```powershell
Get-Command c, cc, ccd
```

正常情况下，`CommandType` 应为 `Function`。

然后可以在任意目录输入：

```powershell
c
```

或在充分确认风险后使用：

```powershell
ccd
```

也可以先**只检查函数定义而不真正执行 Claude Code**：

```powershell
(Get-Command c).Definition
(Get-Command ccd).Definition
```

### 检查 BOM 是否写入成功

Windows PowerShell 5.1 下可以执行：

```powershell
Format-Hex -Path $PROFILE | Select-Object -First 1
```

正常的 UTF-8 BOM 文件，开头三个字节应为：

```text
EF BB BF
```

**成功标准**：启动时不再出现红色 ParserError，`. $PROFILE` 无错误，`Get-Command` 能找到对应函数，执行快捷命令能够调用 `claude`。

## 七、报错案例：启动提示字符串缺少终止符、缺少右括号

### 1. 实际现象

打开 Windows PowerShell 5.1 时，屏幕直接显示红色错误，例如：

```text
所在位置 ...\Microsoft.PowerShell_profile.ps1:42 字符: 21
字符串缺少终止符: '。

所在位置 ...\Microsoft.PowerShell_profile.ps1:16 字符: 50
语句块或类型定义中缺少右“}”。

所在位置 ...\Microsoft.PowerShell_profile.ps1:9 字符: 13
语句块或类型定义中缺少右“}”。

CategoryInfo          : ParserError
FullyQualifiedErrorId : TerminatorExpectedAtEndOfString
```

报错发生时，配置中已有 `c`、`ccd` 函数，以及一个带中文注释和中文提示文本的 `gh` GitHub CLI 代理函数（见 [[Codex Claude 软件级代理设置教程]]）。编辑器内观察花括号基本配对，但 PowerShell 仍报告末尾字符串没有闭合。

### 2. 为什么看着语法正确却报错？

关键原因是 **Windows PowerShell 5.1 对没有 BOM 的 UTF-8 脚本文件，可能按照系统的传统 ANSI 代码页进行解码**。

处理流程大致是：

```text
Profile 文件：UTF-8 无 BOM
          ↓
Windows PowerShell 5.1 按非 UTF-8 编码解析
          ↓
中文注释 / 中文字符串等内容可能被误解码
          ↓
解析器认为字符串未闭合
          ↓
连带报告缺少右花括号 }
```

**所以“第 42 行缺少单引号”不一定表示第 42 行真的漏写了 `'`**；后面的多个错误可能只是同一次解码失败造成的连锁反应。

> 与此相对，PowerShell 7 对无 BOM UTF-8 的支持更好。两者使用不同的 `$PROFILE` 目录，因此出现“PowerShell 7 没事、Windows PowerShell 5.1 启动报错”并不奇怪。

### 3. 最终处理结果

无需删除 `gh` 函数，也无需重写 `c` 或 `ccd`：

```text
Notepad++ 打开 $PROFILE
        ↓
编码 → 转为 UTF-8-BOM 编码
        ↓
保存并重新打开 Windows PowerShell
        ↓
启动 ParserError 消失
```

这是此次排查中**已经验证有效**的解决办法。以后遇到类似的中文配置文件异常，应先检查编码，再判断是否真有引号或括号错误。

### 4. 编码转换后仍报错怎么办？

按下面的顺序检查：

1. **确认编辑的是实际加载的文件**：先运行 `$PROFILE`，不要把 PowerShell 7 和 5.1 的配置文件混淆。
2. **确认开头有 `EF BB BF`**：用 `Format-Hex` 检查 BOM，不能只依赖编辑器状态栏。
3. **检查是否存在真正的语法错误**：例如未闭合的 `'`、`"`、`}`、PowerShell 续行反引号 `` ` `` 错放。
4. **检查文件是否已乱码**：编码转换只能纠正以后如何读取文件，不能自动修复之前保存时已损坏的字符。
5. **排除其他 Profile 的影响**：可以用 `powershell.exe -NoProfile` 启动不加载 Profile 的会话，再逐个核查配置。

可以尝试运行以下 PowerShell 解析检查（不会执行配置文件）：

```powershell
$tokens = $null
$errors = $null
[System.Management.Automation.Language.Parser]::ParseFile(
    $PROFILE,
    [ref]$tokens,
    [ref]$errors
) | Out-Null
$errors
```

若输出为空，说明该文件通过了 PowerShell 语法解析检查；但这不代表其中所有外部命令或启动参数一定有效。

## 八、其他常见问题

### 1. `c` / `ccd` 不是可识别的命令

检查：

```powershell
Get-Command c, ccd -ErrorAction SilentlyContinue
```

如果没有结果，检查 `$PROFILE` 路径、文件是否保存，并尝试重新运行：

```powershell
. $PROFILE
```

### 2. 提示系统禁止运行脚本

这与 UTF-8 BOM **不是同一个问题**。检查当前执行策略：

```powershell
Get-ExecutionPolicy -List
```

在个人设备上，如没有更高优先级的组织策略限制、且已确认 Profile 内容可信，可考虑：

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

公司电脑受组织策略限制时，不应绕过企业管控。

### 3. 函数存在，但是找不到 `claude`

检查：

```powershell
Get-Command claude
```

若没有找到，需要先修复 Claude Code CLI 的安装或 `PATH` 环境变量；这不是函数配置或文件编码问题。

### 4. PowerShell 7 能用，Windows PowerShell 5.1 不能用

分别在两个终端运行：

```powershell
$PSVersionTable.PSVersion
$PROFILE
```

两个版本默认使用不同的配置文件路径，需要各自配置。若要在同一 PowerShell 版本下多个宿主共享函数，可以评估使用 `$PROFILE.CurrentUserAllHosts`。

### 5. Git Bash 中为什么不能直接使用 PowerShell 函数？

因为 Git Bash 和 PowerShell 是不同的 Shell。Git Bash 需要在 `~/.bashrc` 中单独配置：

```bash
alias cc='claude --enable-auto-mode'
```

这与 PowerShell 的 `$PROFILE` 和 `.ps1` 文件没有直接关系。

## 九、如何修改或删除快捷命令

编辑配置：

```powershell
notepad $PROFILE
```

修改相应函数并保存。如果只想在**当前会话临时移除**：

```powershell
Remove-Item Function:\c
Remove-Item Function:\ccd
```

永久取消，需要从 `$PROFILE` 删除函数定义，并重新启动 PowerShell。

## 十、最简复现步骤（收藏版）

```powershell
# 1. 查看 Profile 路径
$PROFILE

# 2. 确保目录和文件存在
New-Item -ItemType Directory -Path (Split-Path -Parent $PROFILE) -Force | Out-Null
if (-not (Test-Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE | Out-Null
}

# 3. 编辑文件，加入下方函数，并使用 UTF-8 BOM 编码保存
notepad $PROFILE
```

在文件中添加：

```powershell
function c {
    & claude --enable-auto-mode @args
}

function ccd {
    & claude --dangerously-skip-permissions @args
}
```

使用 Notepad++ 时：**编码（Encoding）→ 转为 UTF-8-BOM 编码（Convert to UTF-8-BOM）→ 保存**。

最后验证：

```powershell
. $PROFILE
Get-Command c, ccd
Format-Hex -Path $PROFILE | Select-Object -First 1
```

---

**结论**：PowerShell 中带启动参数的快捷命令宜使用 `function`；Windows PowerShell 5.1 的 Profile 如果包含中文，优先保存为 **UTF-8 BOM**。“字符串缺少终止符 / 缺少右 `}`”的启动错误，已通过转换编码解决。
