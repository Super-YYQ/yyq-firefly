# 私有内容发布

Firefly 公共仓库只接收私有知识库中允许公开的内容。正常流程由两个 GitHub Actions 工作流自动完成：私有库校验通过后发送 `repository_dispatch`，Firefly 读取私有库、同步内容、运行检查并提交到 `master`，随后触发部署。

私有仓库文章使用 `publish` 字段控制是否发布：

```yaml
---
title: 一篇知识库文章
published: 2026-09-18
publish: true
---
```

同步工作流使用以下脚本导入内容：

```powershell
pnpm run sync:published -- --source "D:\path\to\private-content" --output "src/content/posts" --prune
```

转换规则：

| 私有仓库字段 | Firefly 输出 |
| --- | --- |
| `publish: true` | `draft: false`，同步 |
| `publish: false` | 跳过，不复制 |
| 未填写 `publish` | 跳过，不复制 |

输出文件会删除 `publish` 字段，并把 `published`、`date`、`created` 或 `updated` 映射到 Firefly 必需的 `published` 字段；如果没有这些日期，会使用源文件修改日期作为最后兜底。`type` 会映射为 `category`。只有 Markdown/MDX 会同步，私有笔记、模板、治理目录和附件都会跳过。

`--prune` 使用 `src/content/posts/.private-content-sync.json` 记录同步文件。下次同步时，如果源文件不再是 `publish: true`，只删除 manifest 中登记的对应公共文件，不删除演示文章或其他人工内容。

本地排查时可以先预览：

```powershell
pnpm run sync:published -- --source "D:\path\to\private-content" --output "src/content/posts" --prune --dry-run
```

日常不需要在本地执行脚本。不要把私有仓库中的密钥、环境文件或 `.obsidian` 目录作为内容源同步；脚本只同步严格 `publish: true` 的 Markdown/MDX，并跳过 `.git`、`.obsidian`、`_private`、`_assets-private`、`docs`、`scripts`、`80-Templates`、`90-AI` 等目录。
