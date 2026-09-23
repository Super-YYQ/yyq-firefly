---
title: Codex 与 Claude Code 规则文件统一
updated: 2026-09-23T00:00:00.000Z
tags:
  - windows
  - Codex
  - Claude Code
  - AGENTS.md
  - 配置
aliases:
  - Codex Claude Code 规则统一
  - AGENTS.md 与 CLAUDE.md
published: 2026-09-23T00:00:00.000Z
draft: false
category: tutorial
---

# Codex 与 Claude Code 规则文件统一

相关笔记：[[Claude Code Hook 通知与提示音配置]]、[[Codex Claude 软件级代理设置教程]]

> 适用场景：同一台电脑同时使用 Codex 和 Claude Code，希望个人规则和项目规则都只维护一份。
>
> - 全局规则只写 `~/.codex/AGENTS.md`
> - Claude Code 通过 `@` 引用这份规则
> - 新项目只写 `AGENTS.md`
> - 只有 `CLAUDE.md` 的旧项目由 Codex fallback 兼容

## 1. 最终结构

```text
全局：
~/.codex/AGENTS.md      ← 唯一维护的个人规则
~/.claude/CLAUDE.md     ← 只写 @~/.codex/AGENTS.md

项目：
project/AGENTS.md       ← 唯一维护的项目规则
project/CLAUDE.md       ← 可选；需要时只写 @AGENTS.md
```

Windows 上的用户目录对应：

```text
C:\Users\<用户名>\.codex\AGENTS.md
C:\Users\<用户名>\.claude\CLAUDE.md
```

不使用软链接，也不再增加第三份公共规则文件。

## 2. 全局规则

`~/.codex/AGENTS.md` 保存真正的个人规则，例如：

```markdown
# Global Instructions

- 未经用户明确授权禁止 git push。
- 修改代码时优先最小改动。
- 不做与当前任务无关的重构。
- 修改完成后执行必要验证。
- Git 操作前注意敏感信息。
```

`~/.claude/CLAUDE.md` 只保留：

```markdown
@~/.codex/AGENTS.md
```

Claude Code 会在载入用户级 `CLAUDE.md` 时导入这份文件。用户级 `~/.claude/CLAUDE.md` 不算项目规则，因此不会阻止项目中的 `AGENTS.md` 被读取。

```text
~/.codex/AGENTS.md
        ├─→ Codex
        └─→ ~/.claude/CLAUDE.md ─→ Claude Code
```

## 3. 新项目

新项目只保留：

```text
project/
└─ AGENTS.md
```

Codex 会直接读取它。Claude Code 在默认模式下发现项目没有 `CLAUDE.md`，也会读取 `AGENTS.md`。这是维护成本最低的形式。

## 4. 兼容旧项目

旧项目可能只有：

```text
project/
└─ CLAUDE.md
```

Codex 默认不读取它。在 `~/.codex/config.toml` 的顶层增加：

```toml
project_doc_fallback_filenames = ["CLAUDE.md"]
```

它必须是顶层字段，不能写进某个 `[section]` 下面。

fallback 的含义是“没有标准规则文件时才读取”，不是两份一起读取：

```text
AGENTS.override.md 存在 → 使用它
否则 AGENTS.md 存在     → 使用它
否则 CLAUDE.md 存在     → 使用它
```

因此，项目里已经有 `AGENTS.md` 时，Codex 不会再加载同目录的 `CLAUDE.md`。

## 5. 两边都有文件时

如果项目同时保留两份文件，默认读取结果会不同：

| 项目文件 | Codex（已配置 fallback） | Claude Code 默认模式 |
| --- | --- | --- |
| 只有 `AGENTS.md` | `AGENTS.md` | `AGENTS.md` |
| 只有 `CLAUDE.md` | `CLAUDE.md` | `CLAUDE.md` |
| 两份都有 | 只用 `AGENTS.md` | 只用 `CLAUDE.md` |

要消除最后一行的差异，让 `CLAUDE.md` 只负责导入：

```markdown
@AGENTS.md
```

Claude Code 仍从 `CLAUDE.md` 进入，但实际规则来自 `AGENTS.md`；Codex 则直接读取 `AGENTS.md`。不要把 `@` 写进 `AGENTS.md`，Codex 不会处理这种导入。

如果确实需要 Claude Code 同时主动加载两份独立内容，可以在 `/config` 的 Project instructions 中改为 `claude-md-and-agents-md`。同一份由 `@AGENTS.md` 导入的内容会去重。没有这种需求时，保持默认的 `claude-md-or-agents-md` 即可。

## 6. 多层目录

Codex 会从全局目录一直读到当前工作目录，更靠近当前目录的规则更具体：

```text
~/.codex/AGENTS.md
        ↓
project/AGENTS.md
        ↓
project/module-a/AGENTS.md
```

根目录写通用规则，模块目录只写该模块的特殊规则，不要把根规则整份复制到子目录。

## 7. 迁移顺序

1. 全局只维护 `~/.codex/AGENTS.md`，让 `~/.claude/CLAUDE.md` 引用它。
2. 给 Codex 配置 `CLAUDE.md` fallback，先兼容旧项目。
3. 新项目只创建 `AGENTS.md`。
4. 整理旧项目时，把规则移入 `AGENTS.md`，原 `CLAUDE.md` 改为 `@AGENTS.md`。
5. 确认所用 Claude Code 能直接读取 `AGENTS.md` 后，再考虑删除仅作兼容的 `CLAUDE.md`。

修改配置后重新打开会话。Claude Code 可用 `/context` 查看实际载入的规则文件，并用 `/config` 确认 Project instructions 的模式。Codex 可以在临时项目中分别放入内容明显不同的 `AGENTS.md` 和 `CLAUDE.md`，用新会话确认实际读取了哪一份。

## 参考

- [OpenAI Codex：Model guidance / Using agents.md](https://developers.openai.com/api/docs/guides/latest-model)
- [OpenAI Codex：Configuration reference](https://developers.openai.com/docs/config-file/config-reference)
- [OpenAI Codex：Basic configuration](https://developers.openai.com/docs/config-file/config-basic)
- [Claude Code：Memory / CLAUDE.md / AGENTS.md](https://code.claude.com/docs/en/memory)
- [Claude Code agents-md 插件说明](https://github.com/anthropics/claude-code/blob/main/mods/agents-md/README.md)
