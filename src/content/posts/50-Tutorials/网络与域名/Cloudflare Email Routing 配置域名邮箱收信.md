---
title: Cloudflare Email Routing 配置域名邮箱收信
published: 2026-09-26T00:00:00.000Z
updated: 2026-09-26T00:00:00.000Z
tags:
  - 域名邮箱
  - Cloudflare
draft: false
category: tutorial
---

# Cloudflare Email Routing 配置域名邮箱收信

想用 `contact@example.com` 收信，又不想维护邮件服务器，可以把域名邮件转发到已有邮箱。Cloudflare Email Routing 提供**入站转发**，也支持 catch-all 接收未单独配置的地址；它不会为每个地址创建独立邮箱，也不是完整的域名发信服务。[Cloudflare Email Routing 文档](https://developers.cloudflare.com/email-service/get-started/route-emails/)

## 前置条件

- 拥有自己的域名，且该域名使用 Cloudflare DNS。
- 有一个可接收验证邮件的目标邮箱。
- 若原来有域名邮箱，先保存原有 MX、SPF、DKIM、DMARC 记录并确认迁移方案。启用 Email Routing 会改变邮件入站路由，不宜在仍依赖旧邮箱时直接覆盖配置。

## 1. 启用邮件路由

在 Cloudflare 控制台选中域名，进入 **Compute → Email Service → Email Routing**，按向导开通域名邮件路由。Cloudflare 会提示添加入站 MX 及相关 TXT 记录；按控制台给出的实际值核对，而不是照抄旧教程中的固定记录。DNS 改动传播后，在 Email Routing 页面确认域名配置正常。[官方入门步骤](https://developers.cloudflare.com/email-service/get-started/route-emails/)

## 2. 验证目标邮箱并建立地址

添加目标邮箱，例如 `your-name@gmail.com`，打开 Cloudflare 发来的邮件完成验证。然后建立 `contact@example.com` 到该目标邮箱的路由规则。未验证目标地址时，规则不会正常转发。用**另一邮箱**发送测试邮件，检查目标邮箱的收件箱与垃圾邮件箱。[路由规则与目标地址](https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/)

## 3. 按需开启 catch-all

如果希望 `anything@example.com` 这样的未单独配置地址也能收信，在 **Routing Rules** 中启用 **Catch-all rule**，把动作设为转发到已验证邮箱，再用不同的地址各发一封测试邮件。catch-all 也会接收拼错的地址和更多垃圾邮件；若只需要几个固定地址，单独创建规则更容易管理。[Catch-all 规则说明](https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/#catch-all-rule)

## 发信是另一项配置

Email Routing 解决的是**收信**。如果要用 `contact@example.com` 发信，需要支持该域名的 SMTP 发信服务，并依其要求设置 SPF、DKIM 和 DMARC；发一封邮件到外部邮箱，检查实际发件人及认证结果。[Cloudflare 邮件 DNS 记录说明](https://developers.cloudflare.com/dns/manage-dns-records/how-to/email-records/)

原始网络教程建议借助 Gmail 的“以此地址发送”功能。Google 目前提示：**自 2027 年 1 月起，Gmail 将不再支持第三方邮箱地址的此项发信功能**；因此不要把它当作长期可用的域名发信方案。具体影响与例外以 [Gmail 官方帮助](https://support.google.com/mail/answer/22370?hl=en) 为准。

> 参考来源：[linux.do 的原始讨论](https://linux.do/t/topic/927225)。本文只整理经官方文档核对的收信流程，未转载原帖图片或步骤。
