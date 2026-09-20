# 私有内容发布

Firefly 公共仓库只接收私有知识库中允许公开的内容。正常流程由两个 GitHub Actions 工作流自动完成：私有库校验通过后发送携带 `source_sha` 的 `repository_dispatch`，Firefly checkout 该 SHA、验证一致后同步内容、执行第二道 Secret 扫描、运行检查和完整生产构建，最后提交到 `master`。Cloudflare Pages 通过 Git 集成自动构建部署，不需要额外触发。

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

输出文件会删除 `publish` 字段，并把 `published`、`date` 或 `created` 映射到 Firefly 必需的 `published` 字段。`updated` 只表示最后更新时间，不作为首次发布日期的来源。缺少合法日期的 `publish: true` 笔记会在私有库校验和公共仓同步两层都失败，同步脚本不再使用源文件修改时间兜底。`type` 会映射为 `category`。只有 Markdown/MDX 会同步，私有笔记、模板、治理目录和附件都会跳过。

提交前，同步工作流会对 `src/content/posts` 中实际生成的内容执行第二道 Secret 扫描（`scripts/audit-synced-content.ts`）。私库扫描覆盖全部文本，公共仓这道扫描只看即将公开的内容，high 和 medium 风险都会阻止提交。随后依次运行 `pnpm check`、`pnpm type-check` 和完整 `pnpm build`，全部通过才会提交，保证公共仓的同步 commit 已经是经过生产构建验证的可部署快照。

`--prune` 使用 `src/content/posts/.private-content-sync.json` 记录同步文件。下次同步时，如果源文件不再是 `publish: true`，只删除 manifest 中登记的对应公共文件，不删除演示文章或其他人工内容。

本地排查时可以先预览：

```powershell
pnpm run sync:published -- --source "D:\path\to\private-content" --output "src/content/posts" --prune --dry-run
```

日常不需要在本地执行脚本。不要把私有仓库中的密钥、环境文件或 `.obsidian` 目录作为内容源同步；脚本只同步严格 `publish: true` 的 Markdown/MDX，并跳过 `.git`、`.obsidian`、`_private`、`_assets-private`、`docs`、`scripts`、`80-Templates`、`90-AI` 等目录。

## 手动重试

`Sync private knowledge base` 的 `workflow_dispatch` 需要填写 `source_sha` 输入，即要重新发布的私有库提交 SHA。工作流会 checkout 并验证该 SHA，不会默认发布 `main` 最新版本。

## 同步内容禁止直接编辑

`src/content/posts` 中由 `.private-content-sync.json` 管理的文件属于自动生成内容。禁止直接编辑这些文章；内容修改必须回到 `Super-YYQ/yyq-firefly-private` 中进行，下一次同步会覆盖公共仓中的直接修改。仓库中其他人工创建的文章不受此限制。
