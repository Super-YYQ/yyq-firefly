---
title: Squarespace 域名迁移到 Cloudflare DNS
published: 2026-09-26T00:00:00.000Z
updated: 2026-09-26T00:00:00.000Z
tags:
  - 域名
  - Squarespace
  - Cloudflare
draft: false
category: tutorial
---

# Squarespace 域名迁移到 Cloudflare DNS

本文适合**域名仍由 Squarespace 注册和续费，只想让 Cloudflare 管理 DNS** 的读者。这是更换权威名称服务器（NS），不是转移域名注册商。操作会影响网站、邮箱和域名验证记录；请先备份，再切换。本文使用 `example.com` 作示例，不包含真实账户或域名数据。

## 迁移前：记录现状

1. 在 Squarespace 导出或逐项记录现有 DNS：`A`、`AAAA`、`CNAME`、`MX`、`TXT`、`CAA` 以及所有子域名。特别检查网站、邮箱的 MX/SPF/DKIM/DMARC 和第三方服务验证记录。
2. 记下当前 NS 和 DNSSEC 状态。如果正在使用 DNSSEC，还要记录注册商处的 DS 状态与生存时间（TTL）。
3. 列出必须持续可用的服务，准备迁移后逐项验证。重要域名宜安排维护窗口。

Cloudflare 的自动扫描只是起点，**不会保证找到全部记录**。在修改 NS 前，把扫描结果与原配置逐条对照，缺少的记录先在 Cloudflare 补齐。[Cloudflare 完整接入指南](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)对此有明确提醒。

## 1. 在 Cloudflare 添加域名并核对记录

在 Cloudflare 的 **Domains → Onboard a domain** 输入根域名，例如 `example.com`，按需要选择套餐。Cloudflare 会为该域名分配两条 NS；只使用当前域名页面显示的值，不复制别人的示例。

到 **DNS → Records** 核对导入结果。迁移期间可以先让网站的 `A`、`AAAA`、`CNAME` 保持 **DNS only**，待解析和源站都验证正常后，再决定是否启用 Cloudflare 代理。邮箱相关记录按服务商给出的值配置；MX 和 TXT 本身不使用 Cloudflare 的 HTTP 代理。不要因为看到旧记录就立即删除，先确认实际服务依赖。[记录管理说明](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)

## 2. 处理旧 DNSSEC，再更换 NS

如果域名原来启用了 DNSSEC，先在 Squarespace 关闭旧 DNSSEC 或移除旧 DS，**等待旧 DS 的 TTL 到期**，再切换 NS。仅关闭开关后立刻切换，缓存中的旧 DS 仍可能使验证解析器返回 `SERVFAIL`。Cloudflare 给出的常见等待范围是 24–48 小时，具体以该域名的 DS TTL 为准。[Cloudflare DNSSEC 迁移说明](https://developers.cloudflare.com/dns/dnssec/)

随后在 Squarespace 域名详情页进入 **DNS → Domain Nameservers → Use Custom Nameservers**，按提示重新验证账户，填入 Cloudflare 分配的两条 NS 并保存。Squarespace 提醒：使用自定义 NS 后，其 DNS 设置页里的记录将不再对该域名生效；网站和邮箱所需记录必须在新 DNS 提供商处存在。[Squarespace 更换 NS 指南](https://support.squarespace.com/hc/en-us/articles/4404183898125-Review-change-or-reset-your-domain-s-nameservers)

## 3. 等待激活并逐项验证

Cloudflare 显示 **Active** 后，先从外部网络检查网站和关键子域名，再用另一邮箱测试收发邮件。新 NS 的全球生效可能需要时间；Squarespace 提示最长可达 48 小时。若 Cloudflare 长时间停在 Pending，核对注册商处两条 NS 是否完全一致；若出现 `SERVFAIL`，优先检查旧 DS 是否仍在注册局或缓存中。

确认解析稳定后，可以在 **Cloudflare DNS → Settings → DNSSEC** 启用 DNSSEC，并按照 Cloudflare 显示的 DS 参数，在 Squarespace 添加对应的第三方 DNSSEC 记录。字段应逐项对应、完整复制；不要把整条 DS 文本塞进单独的 Digest 字段。最后再次验证 DNSSEC 状态与网站、邮箱解析。[Cloudflare 启用 DNSSEC](https://developers.cloudflare.com/dns/dnssec/) · [Squarespace DNSSEC 说明](https://support.squarespace.com/hc/en-us/articles/31094668921229-DNSSEC-for-Squarespace-domains)

## 迁移后：只清理确认不再使用的记录

如果 Squarespace 网站或 Google Workspace 邮箱已停用，可以检查其旧 A/CNAME/MX/SPF/DKIM 记录是否仍被导入 Cloudflare。删除前先确认没有服务依赖，并保留必要的第三方验证记录。旧 Squarespace DNS 面板中有记录，并不代表它们在自定义 NS 生效后仍是权威答案。

若还要给 Cloudflare Pages 绑定 `kb.example.com`，先在 Pages 项目的 **Custom domains** 添加该子域名，再按向导配置 DNS；只手动建一条 CNAME 并不能完成项目绑定。[Pages 自定义域名指南](https://developers.cloudflare.com/pages/configuration/custom-domains/)

迁移完成后的分工是：Squarespace 管理域名注册与续费，Cloudflare 管理权威 DNS、DNSSEC 和按需启用的代理功能。以后新增子域名，通常在 Cloudflare 的 DNS 记录页操作。
