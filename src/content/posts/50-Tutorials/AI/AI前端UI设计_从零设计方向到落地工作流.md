---
title: AI 前端 UI 设计：从零设计方向到落地工作流
updated: 2026-09-23T00:00:00.000Z
tags:
  - AI
  - 前端
  - UI
  - Claude Code
  - Codex
  - 工作流
aliases:
  - AI 前端 UI 设计工作流
  - 从零设计方向到落地页面
category: AI 工具与实践
published: 2026-09-23T00:00:00.000Z
draft: false
---

# AI 前端 UI 设计：从零设计方向到落地工作流

相关笔记：[[AI 编程工具与代理 MOC]]、[[Codex 与 Claude Code 规则文件统一]]

> 更新日期：2026-09-23  
> 适用场景：你知道产品/功能要做什么，但**完全没有 UI 设计方向**；希望 Claude Code、Codex、v0、Figma Make 等工具先帮你找到设计方向，再生成一套美观、统一、可维护的前端页面。  
> 核心原则：**不要让 AI 在没有视觉依据的情况下直接写 UI。先研究 → 再定设计系统 → 再实现 → 最后视觉验收。**

---

## 1. 最终推荐工作流

如果当前只有一句：

> “我要做一个技术知识库 / SaaS 后台 / 个人网站，但是不知道页面该长什么样。”

**不要直接让 Claude Code 或 Codex 开始写 CSS。**

推荐流程：

```text
产品需求
  │
  ▼
理解产品类型 / 用户 / 主要任务
  │
  ▼
设计探索
  ├── Google Stitch
  ├── Refero Styles
  ├── Refero MCP
  ├── Landbook
  ├── Mobbin
  └── UI/UX Pro Max
  │
  ▼
整理 3 个明显不同的视觉方向
  │
  ▼
选择一个方向
  │
  ▼
形成 DESIGN.md
  │
  ▼
Anthropic frontend-design
  +
21st.dev / shadcn / Aceternity
  │
  ▼
先实现 1 个代表页面
  │
  ▼
真实浏览器截图
  │
  ▼
Impeccable critique
  │
  ▼
Impeccable audit
  │
  ▼
Impeccable polish
  │
  ▼
确认后再推广到全部页面
```

最重要的是：

```text
错误：
需求 → “帮我做漂亮一点” → AI 直接写代码

正确：
需求 → 找参考 → 定设计方向 → DESIGN.md → 实现 → 截图审查 → Polish
```

---

## 2. DESIGN.md：整套工作流的核心中间产物

### 2.1 它是什么

`DESIGN.md` 可以理解成：

> **给 AI Coding Agent 看的设计系统 README。**

里面不是业务代码，而是明确告诉 Claude Code / Codex：

- 页面应该是什么气质
- 主色和辅助色是什么
- 字体怎么选
- 标题层级怎么处理
- 页面最大宽度
- 间距体系
- 圆角大小
- Card 是否应该大量使用
- Border / Shadow 怎么使用
- Button / Input / Navigation 的视觉规则
- 动效原则
- Mobile 怎么处理
- 哪些设计明确禁止

Google Stitch 已将 DESIGN.md 作为跨设计/编码工具共享设计规则的一种格式；Refero Styles 和 Impeccable 也围绕它提供实际工作流。

### 2.2 建议项目结构

```text
project/
├─ DESIGN.md
├─ PRODUCT.md                 # 如果使用 Impeccable
├─ AGENTS.md
├─ CLAUDE.md
├─ src/
└─ ...
```

### 2.3 一个简单例子

```md
# Design System

## Overview

这是一个面向开发者的个人技术知识库。

视觉方向：
- content-first
- calm
- technical
- editorial
- high readability
- restrained decoration

拒绝：
- 紫蓝渐变
- 大量 Glassmorphism
- 页面全部 Card 化
- 巨大圆角
- 无意义发光
- 过度动画

## Colors

Background: #F7F6F2
Surface: #FFFFFF
Text Primary: #1D1D1F
Text Secondary: #686868
Border: #E4E1DA
Accent: #C65D32

## Typography

Article:
- Serif / readable long-form font

UI:
- Clean Sans Serif

Code:
- Monospace

## Layout

Article max-width: 760px
App shell max-width: 1440px
Sidebar: 260px

## Shapes

Buttons: 6px
Inputs: 6px
Cards: 8px
Avoid 16px+ radius unless there is a clear reason.

## Components

Article cards should behave like list rows rather than floating cards.

## Do's and Don'ts

DO:
- prioritize reading
- use whitespace for hierarchy
- maintain visible information density

DON'T:
- wrap every section in a card
- add badges only for decoration
```

### 2.4 实际使用

把 `DESIGN.md` 放进项目根目录后，对 Claude Code / Codex 说：

```text
开始 UI 工作之前先完整读取 DESIGN.md。

DESIGN.md 是本项目视觉设计的 Source of Truth。

实现页面时必须遵循其中：
- Typography
- Color
- Spacing
- Layout
- Component
- Motion
- Anti-pattern

如果当前代码和 DESIGN.md 冲突：
先指出冲突，不要自行覆盖 DESIGN.md。
```

---

## 3. Google Stitch：完全没方向时先探索设计

官方：
- https://stitch.withgoogle.com/
- https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/
- https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/

### 3.1 它解决什么问题

Stitch 最适合：

> **“我连自己喜欢什么风格都不知道。”**

它不是单纯的“文字 → 一个页面”。

比较理想的使用方式是：

```text
业务目标
↓
让 Stitch 同时探索不同视觉方向
↓
比较
↓
继续迭代其中一个
↓
形成 DESIGN.md
↓
把设计规则交给 Codex / Claude Code
```

### 3.2 实际模拟：做一个技术知识库

你不要输入：

```text
做一个漂亮的个人知识库。
```

建议输入：

```text
我要设计一个个人技术知识库。

主要内容：
- Java 后端
- AI Coding
- Windows
- Linux / Server
- 网络与代理
- 开发工具

用户主要行为：
1. 浏览分类
2. 搜索文章
3. 阅读长篇技术文档
4. 查看代码块
5. 在不同技术主题之间跳转

目前我没有视觉方向。

暂时不要收敛成一个方案。

请探索 3 个明显不同的设计方向：

A. 技术工具 / Developer Tool 风格
B. Editorial / 长文阅读风格
C. 现代 Product / SaaS 风格

三个方向必须在：
Typography
Color
Navigation
Density
Surface
Article Layout
Code Block
Spacing
Motion

方面有明显区别。

避免：
- 紫蓝渐变
- 大量卡片
- Glassmorphism
- 巨型圆角
- 典型 AI SaaS Landing Page

先做视觉探索，不要急着完成最终页面。
```

#### 你会做什么

你只需要比较：

```text
A：看着像开发工具，我喜欢
B：阅读体验舒服，我喜欢
C：太像 SaaS，我不喜欢
```

然后继续：

```text
以 B 为主。

保留 B 的：
- Typography
- 内容布局
- 阅读宽度
- 页面留白

加入 A 的：
- 左侧导航
- 搜索体验
- Code Block
- 技术感细节

重新整理成一个统一方向。
```

最后：

```text
请将目前确定的视觉规则整理为 DESIGN.md。
要求能够直接提供给 Claude Code / Codex 使用。
```

#### 最适合使用 Stitch 的时候

- 新项目
- 完全没设计方向
- 想同时比较多个方向
- 想通过视觉结果而不是文字描述挑风格
- 想最后输出 DESIGN.md

---

## 4. Refero Styles：不知道目标网站时如何找风格

官网：

https://styles.refero.design/

DESIGN.md 示例：

https://styles.refero.design/ai-agents/design-md-examples

### 4.1 最容易误解的地方

Refero Styles **不是必须先知道某个网站名称才可以使用。**

在完全没方向时，不应该先搜：

```text
Linear
Notion
Stripe
```

而应该先按以下几个维度找：

#### 产品类型

```text
documentation
developer tools
SaaS
dashboard
analytics
knowledge base
portfolio
blog
AI startup
productivity
finance
```

#### 页面类型

```text
landing page
docs
dashboard
settings
pricing
article
editorial
onboarding
authentication
search
```

#### 视觉气质

```text
minimal technical
warm editorial
quiet
premium
monochrome
dark technical
clean SaaS
soft
playful
brutalist
high contrast
warm paper
```

#### Typography / Color

```text
serif editorial
monospace technical
warm cream
black and white
dark blue
earth tones
high contrast typography
```

### 4.2 实际模拟：完全不知道网站目标

假设你要做：

> 个人技术知识库。

#### 第一轮搜索

先不要带品牌名。

```text
documentation
developer tools
editorial
content rich
knowledge base
```

先观察你更容易被哪种视觉类型吸引。

假设结果显示你明显喜欢：

- Warm paper
- Serif title
- Clean navigation
- 高阅读性
- 少 Card

那么进入第二轮。

#### 第二轮搜索

```text
warm editorial
editorial tech
technical journal
warm paper
minimal editorial
```

#### 第三轮收敛

假设最终看到三个喜欢的 Design：

```text
A：Warm Editorial
B：Technical Journal
C：Minimal Documentation
```

这时候不要问：

> 哪个品牌最牛？

而应该比较：

```text
A 的 Typography 最喜欢
B 的导航最喜欢
C 的代码块和文档结构最喜欢
```

然后把三者交给 Agent：

```text
我选择了 3 个 Refero Styles 参考。

参考 A：
主要借鉴 Typography、文章阅读感。

参考 B：
主要借鉴 Sidebar、页面层级。

参考 C：
主要借鉴 Code Block、Documentation Layout。

不要复制任何网站。

请抽象这些参考共同适合当前项目的规则，
形成一套新的 DESIGN.md。

如果规则冲突：
优先级为：
1. 阅读体验
2. 信息层级
3. 技术感
4. 装饰性
```

### 4.3 找到一个喜欢的 DESIGN.md 后怎么用

假设 Refero Styles 某个页面提供 DESIGN.md。

复制到项目：

```text
DESIGN-REFERENCE.md
```

不要直接说：

```text
照着它复制。
```

推荐：

```text
读取 DESIGN-REFERENCE.md。

这是视觉参考，不是需要复制的网站。

先分析其中：
- Color
- Typography
- Spacing
- Layout
- Surface
- Border
- Shadow
- Radius
- Navigation
- Content hierarchy

结合当前产品实际需求，
重新生成本项目自己的 DESIGN.md。

允许继承其设计语言，
禁止复制：
- 品牌
- 文案
- Logo
- 独特业务组件
- 页面内容
```

### 4.4 最适合 Refero Styles 的时候

- 不知道具体网站
- 但可以通过“看图”判断喜欢不喜欢
- 想得到具体 DESIGN.md，而不是一句“高级、现代”
- 希望 Claude/Codex 有明确的 Typography / Color / Spacing 参考

---

## 5. Refero MCP + Refero Skill：让 Agent 自动研究真实产品

官网：

https://refero.design/mcp

Refero Skill 官方安装方式：

```bash
npx skills add https://github.com/referodesign/refero_skill
```

> MCP 当前属于 Refero Pro 能力。首次调用会进行浏览器授权，之后 Agent 可以直接搜索 Refero 的真实产品页面与 Flow。

### 5.1 它和 Refero Styles 的区别

#### Refero Styles

你自己：

```text
搜索 → 看 → 选 → 给 AI
```

#### Refero MCP

Agent：

```text
理解需求
↓
自己搜索真实 UI
↓
比较多个产品
↓
提取模式
↓
设计
```

更适合 Claude Code / Codex 工作流。

### 5.2 实际模拟：让 Agent 自己找参考

对 Claude Code / Codex：

```text
当前项目没有明确 UI 方向。

禁止直接写页面。

先使用 Refero 做设计研究。

项目类型：
个人技术知识库。

重点页面：
- 首页
- 分类页
- 文章详情
- 搜索
- 移动端文章阅读

研究任务：

1. 搜索真实 Documentation / Developer Tool / Knowledge Base 产品。
2. 至少分析 10 个相关页面。
3. 不要只分析 Landing Page。
4. 优先查看：
   - Sidebar
   - Article layout
   - Search
   - Table of contents
   - Code blocks
   - Mobile navigation
5. 提取共同模式。
6. 再提出 3 个视觉方向。

暂时不要修改代码。
```

#### 第二轮

```text
三个方向中我选择方向 B。

继续使用 Refero 搜索与方向 B 最接近的真实产品页面。

重点验证：
- 内容宽度
- Sidebar 密度
- Typography
- Code block
- Search
- Article navigation

不要复制某一个产品，
而是从多个参考中归纳设计规律。

完成后生成 DESIGN.md。
```

### 5.3 MCP 的最大价值

普通 AI：

```text
“Settings 页面应该怎么设计？”
→ 根据训练记忆想象
```

Refero MCP：

```text
“Settings 页面应该怎么设计？”
→ 搜真实产品
→ 看布局
→ 看信息结构
→ 比较
→ 再设计
```

所以它更像：

> **给 Coding Agent 增加一个 UI 研究员。**

---

## 6. Anthropic frontend-design：Claude 官方前端设计 Skill

官方仓库：

https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design

Skill：

https://github.com/anthropics/skills/tree/main/skills/frontend-design

当前 Claude Code 官方插件仓库中也存在 `frontend-design`。

常见安装方式：

```text
/plugin install frontend-design@claude-plugins-official
```

> 如果当前 Claude Code 版本 / Plugin 配置存在问题，优先查看官方 `claude-plugins-official` 和本机 `/plugin` 列表，不要使用网络上较旧的 marketplace 名称。

### 6.1 它干什么

它不是一个组件库。

它主要改变 Claude 在设计 UI 时的决策方式：

```text
普通 Claude
→ 安全
→ 常规
→ AI SaaS
→ Inter
→ 蓝紫渐变
→ Card

frontend-design
→ 先决定明确 aesthetic direction
→ Typography
→ Color
→ Composition
→ Motion
→ Visual details
```

### 6.2 不推荐这样用

```text
帮我设计一个后台。
```

虽然会触发 Skill，但是你仍然把太多设计选择留给了模型。

### 6.3 推荐实际用法

```text
使用 frontend-design skill。

这是一个新的技术知识库项目。

先不要实现。

读取：
- PRODUCT.md
- DESIGN.md
- 当前页面代码

先总结：
1. 产品是什么
2. 用户主要任务
3. 当前视觉方向
4. 当前 DESIGN.md 最重要的 10 条约束

然后设计 Article Detail 页面。

要求：
- DESIGN.md 是视觉 Source of Truth
- 内容阅读优先
- 不要为了视觉效果降低信息密度
- 不要引入与 DESIGN.md 冲突的新颜色
- 不要自行换 Typography
- 不要添加无意义 Card / Badge / Gradient

先给页面结构方案，
确认结构合理后再实现。
```

### 6.4 完全没有 DESIGN.md 时

```text
使用 frontend-design skill。

当前项目没有 DESIGN.md，也没有确定的 UI 方向。

暂时不要写代码。

请根据：
- 产品属性
- 目标用户
- 页面任务
- 内容密度

提出 3 个明显不同的视觉方向。

三个方向不能只是换颜色。

每个方向分别定义：
- Design philosophy
- Typography
- Color
- Layout
- Density
- Navigation
- Surface
- Radius
- Shadow
- Motion
- Anti-pattern

完成后等待选择。
```

---

## 7. Impeccable：设计审查、Polish 与去 AI 味

GitHub：

https://github.com/pbakaus/impeccable

官网：

https://impeccable.style/

当前推荐安装：

```bash
npx impeccable install
```

它可以检测 Claude、Codex、Cursor 等不同环境，并安装对应 Skill / Hook。

Codex 中通常通过 Skills 使用，例如：

```text
$impeccable
```

Claude Code 中使用：

```text
/impeccable <command>
```

### 7.1 重要命令

```text
/impeccable init
/impeccable craft
/impeccable shape
/impeccable document
/impeccable critique
/impeccable audit
/impeccable polish
/impeccable typeset
/impeccable layout
/impeccable colorize
/impeccable animate
/impeccable harden
/impeccable quieter
/impeccable bolder
/impeccable distill
```

#### 含义

```text
init
→ 初始化产品上下文，形成 PRODUCT.md

shape
→ 写代码前规划 UX/UI

document
→ 从现有实现整理 DESIGN.md

critique
→ 从设计角度批评当前页面

audit
→ 无障碍、响应式、性能等质量检查

polish
→ 最终设计打磨
```

### 7.2 最适合你的使用方式

不要把 Impeccable 当：

> “一键把丑页面变漂亮。”

最好当：

> **设计 QA + 第二个设计师。**

#### 实际工作流

```text
/impeccable init
```

接着完成一个页面。

然后：

```text
/impeccable critique article page
```

让它找：

- hierarchy
- typography
- spacing
- information density
- visual balance
- generic AI patterns

修复后：

```text
/impeccable audit article page
```

检查：

- accessibility
- responsive
- interaction state
- overflow
- performance

最后：

```text
/impeccable polish article page
```

### 7.3 实际模拟 Prompt

即使不用 slash command，也可以这样表达：

```text
使用 Impeccable 对当前首页做 critique。

暂时不要修改代码。

从以下维度逐项检查：
- 页面视觉焦点
- Typography hierarchy
- Layout rhythm
- Spacing
- Alignment
- Color
- Contrast
- Information density
- Component repetition
- Card nesting
- Radius
- Shadow
- Decorative elements
- Mobile
- AI-generated UI patterns

把问题按：
P0 / P1 / P2

分级。

每个问题说明：
1. 在哪里
2. 为什么有问题
3. 应该怎么改

先只输出审查报告。
```

之后：

```text
根据刚才 critique 的 P0/P1 问题做一次集中修复。

不要借机整体重构页面。
不要改变已经确认的 DESIGN.md。
```

最后：

```text
/impeccable polish
```

---

## 8. 21st.dev MCP / CLI：搜索真实组件而不是让 AI 瞎造

官网：

https://21st.dev/

Agent / MCP：

https://21st.dev/mcp

它的核心思想：

> Agent 不需要每次从模型记忆中重新发明 Pricing、Hero、Navbar、Dialog、Settings。

可以直接：

```bash
21st search "pricing table"
```

或者生成多个候选：

```bash
21st generate "a pricing table" --variants 3
```

### 8.1 实际模拟：Dashboard

对 Agent：

```text
不要自己从零设计 Dashboard Summary Cards。

使用 21st 搜索现有高质量组件。

需求：
- React
- Tailwind
- 不要大面积 Gradient
- 不要 Glassmorphism
- Radius <= 10px
- Desktop 信息密度中高
- 支持 Dark Mode
- Hover 要克制

先搜索候选。

给我 3 个方向，
暂时不要安装。
```

或者 CLI：

```bash
21st search "analytics dashboard cards"
```

### 8.2 确认后再安装 / 使用

```text
选择候选 2。

安装以后不要原样使用。

请根据 DESIGN.md 修改：
- Color
- Typography
- Radius
- Border
- Spacing
- Interaction

最终效果必须属于我们自己的设计系统。
```

### 8.3 21st 特别适合做什么

```text
Hero
Pricing
Dashboard card
Navbar
Settings panel
Data visualization container
CTA
Testimonials
Feature section
Command menu
```

### 8.4 一个很好的探索命令

自然语言：

```text
show me three directions for this page
```

这是正确顺序：

```text
先看三个方向
→ 再选
→ 再 Build
```

而不是：

```text
直接 Build
→ 不喜欢
→ 重写
→ 又不喜欢
```

---

## 9. UI/UX Pro Max：自动生成设计系统候选

GitHub：

https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

官网：

https://uupm.cc

当前 Skill 数据包括大量：

- UI styles
- Color palettes
- Font pairings
- UX guidelines
- Chart types
- Tech stacks

### 9.1 安装

Claude：

```bash
npx ui-ux-pro-max-cli init --ai claude
```

Codex：

```bash
npx ui-ux-pro-max-cli init --ai codex
```

### 9.2 最适合做什么

它非常适合：

> **从产品描述推导设计系统候选。**

例如：

```text
knowledge base
developer docs
technical editorial
```

让它在自己的设计数据库里找：

```text
Style
Color
Typography
Effects
UX rules
```

### 9.3 实际模拟

对 Agent：

```text
使用 UI/UX Pro Max。

项目：
个人技术知识库。

关键词：
developer documentation
technical editorial
content-first
calm
high readability

请先生成 design system。

不要实现页面。

输出：
- 推荐 Style
- Color palette
- Font pairing
- Layout
- Density
- Effects
- Anti-patterns
```

它内部的新项目工作流会使用 `--design-system`。

手动执行示意：

```bash
python "<skill-path>/scripts/search.py" \
  "developer documentation technical editorial" \
  --design-system \
  -p "Personal Knowledge Base"
```

如果想更大胆：

```text
variance = 8
```

如果想低动效：

```text
motion = 3
```

如果是 Dashboard：

```text
density = 8
```

例如：

```bash
python "<skill-path>/scripts/search.py" \
  "internal analytics dashboard" \
  --design-system \
  --variance 7 \
  --motion 4 \
  --density 8 \
  -p "Ops Console"
```

### 9.4 正确定位

推荐：

```text
UI/UX Pro Max
→ 设计知识 / 候选 Design System
```

不要：

```text
UI/UX Pro Max
→ 无脑把已有项目全部重构
```

如果已经有成熟的 DESIGN.md：

> DESIGN.md 的优先级应该高于新生成的候选风格。

---

## 10. Figma Make：用可视化方式探索多个方案

官网：

https://www.figma.com/make/

Figma Make 支持：

```text
Prompt
↓
生成页面 / Prototype
↓
视觉编辑
↓
继续 Prompt
↓
代码
```

它特别适合：

> 你不知道自己要什么，但是看到图后知道“这个喜欢 / 这个不喜欢”。

### 10.1 实际模拟

输入：

```text
Create three substantially different design directions
for a developer-focused personal knowledge base.

The site contains:
- technical articles
- category navigation
- global search
- table of contents
- code blocks
- dark mode

Direction A:
technical product UI

Direction B:
warm editorial journal

Direction C:
minimal documentation

Do not just change colors.
Change typography, density, navigation,
surface treatment and content composition.

Avoid generic AI SaaS styling.
```

生成之后：

```text
我喜欢 B。

但是：
- Sidebar 使用 A
- Code block 使用 C
- 保留 B 的文章 Typography
- 降低装饰性
- 提高文章列表信息密度

Create a unified version.
```

### 10.2 最终怎么交给 Coding Agent

你可以：

```text
Figma Make
↓
截图 / Frame / Design Context
↓
Claude Code / Codex
```

给 Coding Agent：

```text
这里是已经确认的 UI 设计。

不要重新进行视觉设计。

请分析：
- Layout
- Font hierarchy
- Spacing
- Color
- Radius
- Border
- Component structure

先整理 DESIGN.md，
再进行实现。
```

---

## 11. v0：截图/参考图到高质量前端

官网：

https://v0.app/

Screenshot 文档：

https://v0.app/docs/screenshots

Design Mode：

https://v0.app/docs/design-mode

### 11.1 最适合什么场景

当你已经：

> **看到一个页面 / 截图，觉得它很好看。**

但你不会描述它为什么好看。

直接把截图给 v0。

v0 可以分析：

- layout
- color
- component hierarchy
- likely interactions

### 11.2 实际模拟

上传截图，然后：

```text
不要复制截图中的：
- 品牌
- Logo
- 文案
- 图片素材
- 业务内容

只分析它的设计语言：

- overall composition
- typography hierarchy
- spacing rhythm
- navigation
- surface treatment
- border
- shadow
- radius
- information density
- responsive behavior

基于这些规律，
重新设计一个个人技术知识库首页。

技术栈：
Next.js + Tailwind + shadcn/ui。
```

### 11.3 Design Mode 怎么用

假设生成后的 Hero：

> 字太大。

不需要重新 Prompt 整页。

进入 Design Mode：

```text
选中 Hero Title
→ 调 Font size
→ Line height
→ Width
→ Margin
```

再对选中区域：

```text
Make this section quieter.
Reduce visual dominance without making it generic.
```

最后 Apply。

---

## 12. Landbook：找网站整体视觉方向

官网：

https://land-book.com/

Landbook 更偏：

> **网站 / Landing Page / Portfolio / Marketing Site 的整体视觉灵感。**

可以按：

- Industry
- Style
- Type
- Typography
- Color

过滤。

### 12.1 实际模拟：完全没方向

做一个 Developer Tool 官网。

先筛：

```text
Industry:
Tech

Type:
SaaS / Software

Style:
Dark Colors
Visible Borders
Big Type

Typography:
Sans Serif
```

然后不要一次存 30 个。

只保留：

```text
参考 1：喜欢 Hero
参考 2：喜欢 Typography
参考 3：喜欢 Navigation
参考 4：喜欢 Footer
```

交给 AI：

```text
下面有 4 个视觉参考截图。

不要复制页面。

分别分析：
- 参考 1 的 Hero 为什么有效
- 参考 2 的 Typography hierarchy
- 参考 3 的 Navigation
- 参考 4 的 Footer composition

然后把这些规律组合成一个一致的 Design System。

不允许出现“拼凑感”。
```

### 12.2 不适合 Landbook 的场景

如果你要研究：

```text
Settings
Checkout
Onboarding
Complex dashboard
Search interaction
```

Mobbin / Refero 更适合。

---

## 13. Mobbin：找真实产品页面和完整用户流程

官网：

https://mobbin.com/

Mobbin 的重点不是“漂亮 Landing Page”，而是：

> **真实 App / Web 产品实际怎么做。**

适合：

```text
Login
Onboarding
Settings
Checkout
Subscription
Home
Account
Search
Empty State
```

### 13.1 实际模拟：设计 Settings

假设你要设计：

> AI Coding Tool 的 Settings。

不要直接让 AI 写。

先在 Mobbin 找：

```text
Settings
Preferences
Account
Appearance
Integrations
```

选 5~10 个真实产品。

然后对 Agent：

```text
这些截图来自不同真实产品的 Settings 页面。

请做 UX pattern analysis。

不要评价哪个最好。

统计和总结：
- Sidebar / Tabs 使用方式
- Section grouping
- Label + description 结构
- Toggle placement
- Dangerous actions
- Save behavior
- Mobile behavior

最后设计适合当前产品的 Settings 信息架构。

暂时不要处理视觉风格。
```

然后再结合 DESIGN.md 处理视觉。

这会把两个问题拆开：

```text
Mobbin / Refero
→ UX Structure

DESIGN.md
→ Visual Style
```

---

## 14. Aceternity UI：找高视觉表现力组件

官网：

https://ui.aceternity.com/

它提供很多：

- Hero
- Background
- Animation
- Cards
- Spotlight
- Grid
- Text Effect
- Shader

目前也提供面向 AI Agent 的使用方式 / MCP。

### 14.1 适合什么

尤其适合：

```text
Landing Page
Portfolio
Marketing
产品首页视觉焦点
特殊 Hero
背景效果
微交互
```

### 14.2 实际模拟

假设：

> 当前首页太平淡。

不要直接要求：

```text
加点酷炫动画。
```

而是：

```text
从 Aceternity UI 中寻找适合当前首页 Hero 的视觉增强方案。

约束：
- 只允许一个主要视觉效果
- 不要 Gradient Blob
- 不要大量发光
- 不影响文字阅读
- prefers-reduced-motion 下必须安全降级
- Mobile 降低动效
- 必须符合 DESIGN.md

先给 3 个候选。
不要安装。
```

选中之后：

```text
使用候选 2。

只借用交互机制，
重新适配：
- 当前项目 Colors
- Typography
- Radius
- Motion duration

不要让页面变成 Aceternity Demo。
```

### 14.3 重点

Aceternity 应该是：

> **调味品。**

不是：

> 全站每个 Section 都套动画。

---

## 15. shadcn/ui Blocks：找稳健、可维护的产品型页面骨架

官网：

https://ui.shadcn.com/blocks

shadcn Blocks 更适合：

- Dashboard
- Login
- Signup
- Sidebar
- Data Table
- 产品后台页面

例如官方 Dashboard Block 可以直接：

```bash
npx shadcn add dashboard-01
```

### 15.1 实际模拟

需求：

> 快速做一个后台。

正确：

```text
先从 shadcn Blocks 中寻找一个结构最接近当前需求的 Dashboard。

不要把它当最终设计。

它只负责：
- layout skeleton
- responsive behavior
- component structure

安装后再根据 DESIGN.md 修改：
- color
- typography
- density
- border
- radius
- navigation
- charts
```

### 15.2 最佳定位

```text
shadcn
= 稳定产品骨架

DESIGN.md
= 设计语言

21st / Aceternity
= 个别高级组件

frontend-design
= 视觉实现

Impeccable
= 最后审查
```

这是比“所有东西都从零写”更稳的组合。

---

## 16. 浏览器视觉验收：Playwright / Chrome DevTools MCP

这是整个 AI UI 工作流里非常容易被忽略的一步。

AI 修改代码 ≠ 页面真的好看。

必须：

```text
Build
↓
启动
↓
打开真实浏览器
↓
Desktop 截图
↓
Mobile 截图
↓
分析
↓
一次集中修复
```

### 16.1 实际 Prompt

```text
页面实现完成后不要直接结束。

使用浏览器实际打开页面。

检查以下 viewport：

Desktop:
1440 x 900

Laptop:
1280 x 800

Mobile:
390 x 844

分别截图。

从截图而不是源码推测视觉问题。

检查：
- hierarchy
- alignment
- spacing
- text wrapping
- overflow
- content width
- navigation
- empty space
- card density
- mobile stacking
- button sizes
- code block overflow

把发现的问题一次汇总。

然后集中修复一轮。

修复后最多再进行一次确认截图，
不要陷入无限视觉微调。
```

这和 Impeccable 当前强调的“bounded visual iteration”思路是相符的：

> 完整实现 → 一轮批量检查 → 集中修复 → 最多再确认一轮。

---

## 17. 从零开始的完整实战模拟

下面模拟一个真实项目：

> “我要做一个个人技术知识库，但没有任何 UI 方向。”

---

### Phase 1：Agent 理解产品

给 Claude Code / Codex：

```text
当前任务是设计本项目 UI。

现在不要写代码。

先完整分析项目：

1. 产品是什么
2. 谁会使用
3. 最主要的 5 个用户任务
4. 页面类型
5. 内容密度
6. 当前技术栈
7. 已有组件
8. 已有 CSS / Theme
9. 是否已经存在 DESIGN.md
10. 是否有不能破坏的已有 UI

输出 UI Design Brief。
```

预期得到：

```text
产品：
个人技术知识库

主要任务：
- 找文章
- 浏览分类
- 阅读技术文章
- 复制代码
- 页面间跳转

核心：
阅读体验 > 营销视觉
```

---

### Phase 2：Refero / Mobbin 研究

```text
使用 Refero 搜索：

developer documentation
knowledge base
technical editorial
content-heavy docs

至少分析 10 个相关真实页面。

重点研究：
- Navigation
- Search
- Article
- TOC
- Code block
- Mobile docs

不要开始 Build。
```

---

### Phase 3：Refero Styles 找视觉方向

自己搜索：

```text
documentation
developer tools
editorial
warm editorial
technical journal
minimal technical
```

保存 3~5 个喜欢的 Style / DESIGN.md。

---

### Phase 4：生成三个方向

```text
结合：
- 当前项目需求
- Refero Research
- Refero Styles
- PRODUCT.md

提出 3 个明显不同的视觉方向。

A：
Developer Tool

B：
Warm Technical Editorial

C：
Minimal Documentation

不能只是换颜色。

分别定义：
Typography
Color
Layout
Navigation
Surface
Density
Radius
Border
Shadow
Motion
Article
Code Block
Mobile
```

---

### Phase 5：人工只做一个决定

你只需要：

```text
选 B。

但是导航采用 A，
代码块采用 C。
```

---

### Phase 6：形成 DESIGN.md

```text
现在将已确认设计整理为项目根目录 DESIGN.md。

这份文件是未来所有页面的视觉 Source of Truth。

需要定义：
Overview
Colors
Typography
Layout
Elevation & Depth
Shapes
Components
Do's and Don'ts
Responsive
Motion
Accessibility

不要包含单个页面的临时决定。
```

---

### Phase 7：实现一个代表页面

选择：

> Article Detail。

因为它是知识库的核心页面。

```text
读取 DESIGN.md。

使用 frontend-design skill。

只实现 Article Detail。

需要包含：
- Sidebar
- Breadcrumb
- Article header
- Article content
- Code block
- TOC
- Previous / Next
- Mobile layout

不要同时修改其他页面。
```

---

### Phase 8：真实浏览器验收

```text
启动项目。

实际打开 Article Detail。

检查：
1440x900
1280x800
390x844

截图并做视觉检查。

不要根据代码判断 UI。
```

---

### Phase 9：Impeccable

```text
/impeccable critique article
```

修复。

然后：

```text
/impeccable audit article
```

修复。

最后：

```text
/impeccable polish article
```

---

### Phase 10：推广全站

当 Article Detail 已确认后：

```text
当前 Article Detail 已作为 Design Reference。

接下来扩展到：
- 首页
- 分类
- 搜索
- About

必须继续遵循 DESIGN.md。

新页面允许解决新的 UX 问题，
但不得自行创造新的视觉语言。

如果 DESIGN.md 不足：
先提出 DESIGN.md 补充建议，
不要静默新增风格。
```

---

## 18. 适合 Claude Code / Codex 的总 Prompt

可以保存成自己的 Skill / Prompt。

```text
你现在担任本项目的 Product Designer、
UI/UX Designer 和 Frontend Design Engineer。

当前项目可能没有明确视觉方向。

重要规则：

不要因为用户说“做一个页面”就立即开始写代码。

第一阶段永远先判断：
1. 是否已经存在 DESIGN.md
2. 是否存在成熟 UI
3. 是否已经有明确参考
4. 是否需要 Design Discovery

如果没有设计方向：

先理解：
- 产品是什么
- 核心用户
- 用户主要任务
- 页面类型
- 信息密度
- 技术栈
- 已有组件

然后进行设计研究。

如果可用，优先使用：
- Refero / Refero MCP
- Refero Styles
- Mobbin
- Landbook
- 21st
- UI/UX Pro Max

不要只根据模型记忆凭空设计。

至少提出 3 个明显不同的设计方向。

三个方向不能只是颜色不同。

需要在：
- Typography
- Color
- Layout
- Navigation
- Density
- Spacing
- Surface
- Radius
- Border
- Shadow
- Motion
- Content hierarchy

方面具有实际区别。

禁止默认 AI UI：

- purple/blue gradient
- glassmorphism
- every section in a card
- cards nested in cards
- oversized radius
- decorative badges everywhere
- meaningless glow
- giant generic hero
- excessive floating elements
- meaningless animation

选择方向以后，
形成 DESIGN.md。

DESIGN.md 是视觉 Source of Truth。

之后只实现一个最具有代表性的页面。

实现完成必须：
- 运行应用
- 打开真实浏览器
- 检查 Desktop
- 检查 Mobile
- 截图
- 进行 visual critique

如果 Impeccable 可用：
执行 critique → audit → polish。

最多进行两轮截图验证，
不要无限视觉循环。

只有代表页面确认后，
才将同一设计系统扩展到其他页面。

核心优先级：

1. Usability
2. Information hierarchy
3. Consistency
4. Readability
5. Visual identity
6. Decoration

真实产品参考优先于模型凭空想象。
明确设计方向优先于“现代、漂亮、高级”这类模糊形容词。
```

---

## 19. 我的推荐组合

如果不想把所有工具都装一遍，可以分三个级别。

### 19.1 最小方案

```text
Refero Styles
+
Anthropic frontend-design
+
DESIGN.md
+
浏览器截图验收
```

适合：

> 不想增加很多 MCP / Skill，只想明显改善 AI UI。

---

### 19.2 推荐方案

```text
Refero Styles
+
Refero MCP
+
Anthropic frontend-design
+
Impeccable
+
21st.dev
+
DESIGN.md
+
Browser visual review
```

这是最适合 Claude Code / Codex 日常开发的一套。

职责：

```text
Refero
→ 找真实参考

DESIGN.md
→ 固化规则

frontend-design
→ 实现设计

21st
→ 找成熟组件

Impeccable
→ 审查和打磨

Browser
→ 真实视觉反馈
```

---

### 19.3 完全没有任何设计方向的新项目

建议：

```text
Google Stitch
↓
探索 3~5 个方向
↓
选一个
↓
DESIGN.md
↓
Refero 验证真实产品模式
↓
Claude Code / Codex
↓
frontend-design
↓
21st / shadcn
↓
Impeccable
```

这时 Stitch 的价值最大。

---

## 20. 参考链接

### Google Stitch

- https://stitch.withgoogle.com/
- https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/
- https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/
- https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-updates/

### Refero

- https://refero.design/
- https://refero.design/mcp
- https://styles.refero.design/
- https://styles.refero.design/design-md/what-is-design-md
- https://styles.refero.design/ai-agents/design-md-examples

Refero Skill：

```bash
npx skills add https://github.com/referodesign/refero_skill
```

### Anthropic frontend-design

- https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design
- https://github.com/anthropics/skills/tree/main/skills/frontend-design
- https://github.com/anthropics/claude-plugins-official/tree/main/plugins/frontend-design

### Impeccable

- https://github.com/pbakaus/impeccable
- https://impeccable.style/

安装：

```bash
npx impeccable install
```

### 21st.dev

- https://21st.dev/
- https://21st.dev/mcp

示例：

```bash
21st search "pricing table"
21st generate "a pricing table" --variants 3
```

### UI/UX Pro Max

- https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- https://uupm.cc

Claude：

```bash
npx ui-ux-pro-max-cli init --ai claude
```

Codex：

```bash
npx ui-ux-pro-max-cli init --ai codex
```

### Figma Make

- https://www.figma.com/make/
- https://www.figma.com/solutions/ai-web-design/
- https://www.figma.com/solutions/ai-design-generator/

### v0

- https://v0.app/
- https://v0.app/docs/screenshots
- https://v0.app/docs/design-mode

### 灵感 / 组件

Landbook：

https://land-book.com/

Mobbin：

https://mobbin.com/

Aceternity UI：

https://ui.aceternity.com/

shadcn Blocks：

https://ui.shadcn.com/blocks

---

## 一句话总结

以后遇到：

> “我要做前端，但是我完全没有设计方向。”

不要直接进入代码阶段。

把默认流程改成：

```text
Understand Product
→ Research Real Interfaces
→ Explore 3 Directions
→ Choose
→ DESIGN.md
→ Build One Representative Page
→ Browser Screenshot
→ Critique
→ Audit
→ Polish
→ Scale to the Rest of the Product
```

真正决定 AI UI 质量的，不是某一个“神级 Prompt”。

而是：

> **不要让模型凭空猜审美，要让它先看到真实设计、形成明确规则，再写代码。**
