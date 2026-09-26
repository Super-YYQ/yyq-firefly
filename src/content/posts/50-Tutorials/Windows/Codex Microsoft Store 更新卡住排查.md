---
title: Codex Microsoft Store 更新卡住排查
updated: 2026-09-23T00:00:00.000Z
tags:
  - windows
  - Codex
  - Microsoft Store
  - 故障排查
aliases:
  - Codex 商店更新卡住
  - Codex DoSvc 0x80246008
  - Codex InstallService 队列停滞
category: AI 工具与实践
published: 2026-09-23T00:00:00.000Z
draft: false
---

# Codex Microsoft Store 更新卡住排查

相关笔记：[[Codex Windows 微软商店安装包提取与手动更新]]、[[ChatGPT Windows 升级后 Proxifier 网络异常排查]]

> 本文记录一台 Windows 10 电脑在 2026-09-21 至 2026-09-23 的实际案例。故障先后由两个不同问题造成，不能合并成一次“商店更新失败”。
>
> 2026-09-23 复核时，`OpenAI.Codex` 已安装目标版本 `26.917.6896.0`，包状态为 `Ok`。

## 1. 现象

Codex 左下角持续显示更新图标。点击下载后，界面停在“正在安装更新／正在准备”；但“帮助 → 检查更新”却提示没有更新。Microsoft Store 中对应的 **ChatGPT** 项目显示排队或 0%。

这里容易看错对象：商店里的 ChatGPT 项目，在这台电脑上对应程序包 `OpenAI.Codex`。

## 2. 两个阻塞点

| 阶段 | 本机证据 | 结论 |
| --- | --- | --- |
| 下载服务无法启动（9 月 21—22 日） | Codex、Microsoft Store、HP Smart、应用安装程序出现 `0x80246008`；DoSvc 启动后立即停止，退出码为 `2`；系统事件 7023 报“系统找不到指定的文件” | 空的 `Parameters` 子键遮住了上一级有效的 `ServiceDll`。移除该空子键后，服务可以启动。 |
| 商店队列停滞（9 月 23 日） | Codex 与商店购买组件均为 `Pending`、0 字节；此时 DoSvc 已正常运行 | 重启 `InstallService` 后队列开始推进。这只证明重启对这次队列有效，不能说明此前停滞的底层原因。 |

第一阶段修复后，一次仅下载测试曾出现 `0x80072EE2` 网络超时和 0 字节进度。随后同一测试文件下载完成，多个商店应用也更新成功，因此不能根据早期超时认定网络持续故障。

## 3. 修复 DoSvc

`HKLM\SYSTEM\CurrentControlSet\Services\DoSvc` 根键中的 `ServiceDll` 是：

```text
REG_EXPAND_SZ  %SystemRoot%\system32\dosvc.dll
```

文件存在且签名有效，但这台电脑上同级的 `Parameters` 子键存在且完全为空。静态检查 `svchost.exe` 的读取顺序可见：它先从 `Parameters` 读取 `ServiceDll`，只有子键不存在时才回退到服务根键。读取空子键返回错误 `2`，与 DoSvc 的启动失败一致。

2026-09-22 11:27 做了最小修复：

1. 备份 DoSvc 注册表子树、空子键权限和服务状态。
2. 确认该子键没有值、没有下级键。
3. 只删除这个空子键。
4. 对比修复前后的注册表导出，确认差异只有该空子键。

没有修改上一级 `ServiceDll`，也没有清理商店缓存或应用数据。

随后 DoSvc 两次启动都进入 `RUNNING`，退出码为 `0`，不再出现错误 `2`。Microsoft Store、应用安装程序、HP Smart 和 Codex 的已安装版本也都发生了升级。

这个修复有明确前提：`Parameters` 必须完全为空，根键配置必须有效，并且先完成备份。它不是通用的注册表清理方法。

## 4. 推进停滞的商店队列

到 2026-09-23，Codex 已安装 `26.915.4065.0`，商店日志指向待更新版本 `26.917.6896.0`，但 Codex 和 `Microsoft.StorePurchaseApp` 的实时队列仍是 `Pending`、0 字节。

应用更新器日志已经记录商店发现了更新，而应用内的“检查更新”仍提示没有更新。界面文字不能代替包版本和队列状态。商店日志里还出现过一次“RPC 服务器不可用”，它与队列停滞是否有因果关系并未确认。

11:02 确认队列中没有正在安装的项目后，正常停止并重新启动 `InstallService`，没有强制结束进程。两个项目随后从 `Pending` 转为活动状态：

- 商店购买组件下载约 12.2 MB 后安装完成，版本由 `22607.1401.4.0` 升至 `22608.1401.1.0`。
- Codex 先显示 `ReadyToDownload`，随后进入下载。

当天 11:10 的中间状态是：两个服务均为 `RUNNING`、退出码 `0`；Codex 已下载 29,193,019 字节，进度 4%，已安装版本仍是旧版本。当时只能确认下载已开始。

2026-09-23 再次复核时，`OpenAI.Codex` 的已安装版本已经是 `26.917.6896.0`，包状态为 `Ok`。本次没有清空商店缓存、重装 Codex 或修改网络配置。

## 5. 后续判断

- `Pending`、`ReadyToDownload`、`Downloading`、`Installing` 是不同阶段。“正在安装更新”不足以证明已经进入安装。
- 重启 `InstallService` 只说明它解决了这一次队列停滞，不能推广为所有商店更新故障的修复方法。
- 如果下载再次停滞，应按新的时间戳检查队列、已下载字节和事件，不要沿用上一次的错误码。
- 商店更新仍不可用时，可改用[[Codex Windows 微软商店安装包提取与手动更新]]。
