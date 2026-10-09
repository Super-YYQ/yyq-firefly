---
title: Windows 安装 JDK 8 与 JDK 21：免登录下载与版本切换
updated: 2026-10-09T00:00:00.000Z
tags:
  - Java
  - JDK
  - Windows
  - 环境配置
category: 软件开发
published: 2026-10-09T00:00:00.000Z
draft: false
---
<span id="windows-安装-jdk-8-与-jdk-21免登录下载与版本切换"></span>

本文介绍如何从官方渠道下载 JDK 8、JDK 21，在同一台 Windows 电脑上安装两个版本，并配置终端和开发工具使用合适的 JDK。

**适用环境：Windows 10 / Windows 11，Intel 或 AMD 的 x64 电脑。** ARM 电脑需要根据发行版的支持情况选择对应安装包，不能把本文的 x64 下载链接当作原生 ARM 安装包。Corretto 的 Windows 支持范围见 [JDK 8 平台说明](https://docs.aws.amazon.com/corretto/latest/corretto-8-ug/windows-info.html)和 [JDK 21 平台说明](https://docs.aws.amazon.com/corretto/latest/corretto-21-ug/windows-info.html)。

> 示例统一使用 `C:\Java\jdk8` 和 `C:\Java\jdk21`。这些是建议目录，不是安装器保证使用的默认目录。执行命令前请替换为实际 JDK 根目录。

## 1. 先了解几个概念

| 名称 | 含义 | 本文中的用途 |
|---|---|---|
| JDK | 包含 Java 运行环境、编译器等开发工具 | 下载和安装的对象 |
| JRE | Java 运行环境 | 开发时直接安装 JDK 即可 |
| OpenJDK 发行版 | 厂商基于 OpenJDK 提供的构建，如 Corretto、Zulu | 获取 JDK 的官方渠道 |
| `JAVA_HOME` | 指向 JDK 根目录的环境变量 | 供 Maven 等工具定位 Java |
| `PATH` | 系统查找可执行文件时使用的目录列表 | 决定直接输入 `java`、`javac` 时找到哪个程序 |
| 项目 SDK | IDE 为具体项目选择的 JDK | 让不同项目使用不同 Java 版本 |

JDK 与 JRE 的区别，以及项目 SDK 的作用，见 [IntelliJ IDEA SDK 文档](https://www.jetbrains.com/help/idea/sdk.html)。

**关键区别：只修改 `JAVA_HOME`，不会保证终端中的 `java` 已切换。** 还需要让 `PATH` 优先找到目标 JDK 的 `bin` 目录。

## 2. 免登录官方下载地址

### 2.1 推荐：Amazon Corretto

Amazon Corretto 是亚马逊提供的免费 OpenJDK 发行版，符合 Java SE 标准。下面的公开下载链接无需 Oracle 或 AWS 账号。普通 Java 开发可以使用；若项目明确指定了 JDK 厂商或版本，则遵循项目要求。参见 [Corretto 官方介绍](https://aws.amazon.com/corretto/)和 [官方 FAQ](https://aws.amazon.com/corretto/faqs/)。

| 版本 | MSI 安装包 | ZIP 压缩包 | 官方下载说明 |
|---|---|---|---|
| JDK 8 / Windows x64 | [下载 MSI](https://corretto.aws/downloads/latest/amazon-corretto-8-x64-windows-jdk.msi) | [下载 ZIP](https://corretto.aws/downloads/latest/amazon-corretto-8-x64-windows-jdk.zip) | [JDK 8 下载页](https://docs.aws.amazon.com/corretto/latest/corretto-8-ug/downloads-list.html) |
| JDK 21 / Windows x64 | [下载 MSI](https://corretto.aws/downloads/latest/amazon-corretto-21-x64-windows-jdk.msi) | [下载 ZIP](https://corretto.aws/downloads/latest/amazon-corretto-21-x64-windows-jdk.zip) | [JDK 21 下载页](https://docs.aws.amazon.com/corretto/latest/corretto-21-ug/downloads-list.html) |

这些 `latest` 链接会重定向到对应大版本的最新更新：JDK 8 链接始终下载 Java 8 的更新，JDK 21 链接始终下载 Java 21 的更新。需要复现特定环境时，应从官方页面的版本记录选择固定版本，并记录完整版本号。

### 2.2 备用：Azul Zulu

可以使用 [Azul Zulu 官方下载页](https://www.azul.com/downloads/)，选择公开的 Zulu 构建：

1. `Java Version`：分别选择 Java 8、Java 21。
2. `Operating System`：选择 Windows。
3. `Architecture`：选择 x86 64-bit。
4. `Java Package`：选择 JDK。
5. 下载 MSI 或 ZIP 文件。

### 2.3 选择 MSI 还是 ZIP

| 格式 | 使用方式 | 适合的情况 |
|---|---|---|
| MSI | 双击运行安装向导 | 希望按安装向导完成安装 |
| ZIP | 解压到独立目录，手动配置环境变量 | 希望自行管理多个版本或使用无安装器的方式 |

两种方式任选一种即可，同一个版本无需同时安装 MSI 和 ZIP。

## 3. 安装两个 JDK

### 3.1 方式一：使用 MSI

1. 下载 JDK 8、JDK 21 对应的 x64 MSI 文件。
2. 分别双击文件，按向导完成安装。
3. 为两个版本使用不同目录，记下实际路径。可以按需自定义为 `C:\Java\jdk8`、`C:\Java\jdk21`。
4. 安装结束后检查实际目录：JDK 根目录内应包含 `bin\java.exe` 和 `bin\javac.exe`。
5. 按第 4 节配置默认版本，再按第 5 节验证。

安装器默认路径可能包含更新版本号。若安装到了 `C:\Program Files\Amazon Corretto\`，应继续找到其中包含 `bin` 的具体 JDK 目录，而不是直接使用上层厂商目录。

Corretto 8 官方安装说明还列出了 Visual C++ Redistributable 的前置要求；首次安装或启动失败时，按官方说明检查该运行库。参见 [JDK 8 Windows 安装说明](https://docs.aws.amazon.com/corretto/latest/corretto-8-ug/windows-install.html)和 [JDK 21 Windows 安装说明](https://docs.aws.amazon.com/corretto/latest/corretto-21-ug/windows-install.html)。

### 3.2 方式二：使用 ZIP

1. 下载两个版本的 ZIP 文件。
2. 分别解压，找到内部包含 `bin`、`lib` 等内容的 JDK 根目录。
3. 将两个 JDK 根目录分别放到 `C:\Java\jdk8`、`C:\Java\jdk21`，也可以保留原来的版本目录名称。
4. 确认没有多套一层目录：应能直接找到 `C:\Java\jdk8\bin\javac.exe`，而不是 `C:\Java\jdk8\另一个目录\bin\javac.exe`。

用 PowerShell 检查建议目录：

```powershell
Test-Path -LiteralPath 'C:\Java\jdk8\bin\java.exe'
Test-Path -LiteralPath 'C:\Java\jdk8\bin\javac.exe'
Test-Path -LiteralPath 'C:\Java\jdk21\bin\java.exe'
Test-Path -LiteralPath 'C:\Java\jdk21\bin\javac.exe'
```

四项都应返回 `True`。使用其他目录时，先修改命令中的路径。

可选：在官方下载页查看对应文件的 SHA256，并用 `Get-FileHash -Algorithm SHA256 -LiteralPath '实际下载文件路径'` 计算本地文件摘要进行比对。摘要与下载包的具体更新版本对应。

## 4. 配置长期使用的默认版本

下面以 **JDK 21 作为终端默认版本**为例。维护旧项目时可以将默认值改成 JDK 8，或使用第 6 节的临时切换方法。

### 4.1 打开环境变量设置

1. 打开 Windows 开始菜单，搜索“编辑系统环境变量”。
2. 在“系统属性”窗口中点击“环境变量”。
3. 个人电脑上可以在“系统变量”中设置以下内容；修改系统变量通常需要管理员权限。
4. 修改前记录已有 `JAVA_HOME` 和 Java 相关 `Path` 项，保留其他软件的路径。

### 4.2 设置 `JAVA_HOME`

新建或编辑：

| 变量名 | 示例值 |
|---|---|
| `JAVA_HOME` | `C:\Java\jdk21` |

填写的是 **JDK 根目录**，不包含 `\bin`，也不在环境变量值里额外添加引号。

### 4.3 配置 `Path`

编辑同一范围内的 `Path`，添加：

```text
%JAVA_HOME%\bin
```

使目标 JDK 路径优先于其他 Java 路径。不要用这一项替换整个 `Path`。

如果用户变量和系统变量中都定义了 `JAVA_HOME`，需要检查实际生效的值；不同范围的 `Path` 也会合并。最终以第 5 节的命令输出为准。

### 4.4 让新设置生效

保存后关闭并重新打开 PowerShell。若新窗口仍保留旧值，退出并重新打开 Windows Terminal 或 IDE 后再检查。

环境变量变更及进程继承规则见 [Microsoft PowerShell 环境变量文档](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables)。JDK 根目录与 `Path` 的设置方式见 [Corretto Windows 安装说明](https://docs.aws.amazon.com/corretto/latest/corretto-21-ug/windows-install.html)。

## 5. 验证安装和默认版本

在新打开的 PowerShell 中执行：

```powershell
java -version
javac -version
$env:JAVA_HOME
Get-Command java, javac | Select-Object Name, Source
where.exe java
where.exe javac
```

检查以下结果：

- 默认设为 JDK 21 时，`java`、`javac` 的大版本均为 `21`。
- 切换到 JDK 8 后，版本通常以 `1.8.0_` 开头；`1.8` 就是 Java 8。
- `JAVA_HOME` 指向目标 JDK 根目录。
- 命令解析得到的 `java.exe`、`javac.exe` 来自预期 JDK。
- `where.exe` 可能列出多个位置，优先位置应符合你的选择。

PowerShell 中使用 `where.exe`，避免把 `where` 别名当作 Windows 的可执行文件查找工具。

若需要绕过环境变量，直接验证两套 JDK：

```powershell
& 'C:\Java\jdk8\bin\java.exe' -version
& 'C:\Java\jdk8\bin\javac.exe' -version
& 'C:\Java\jdk21\bin\java.exe' -version
& 'C:\Java\jdk21\bin\javac.exe' -version
```

带引号的可执行文件路径在 PowerShell 中使用 `&` 调用。

## 6. 在当前 PowerShell 窗口切换版本

以下命令只修改当前 PowerShell 进程及其之后启动的子进程环境，不修改系统中的持久环境变量，也不改变已经运行的 IDE 或其他终端。

### 6.1 切换到 JDK 8

```powershell
$jdkTarget = 'C:\Java\jdk8'
if (-not (Test-Path -LiteralPath "$jdkTarget\bin\javac.exe")) {
    throw '没有找到目标 JDK，请检查目录。'
}
$env:JAVA_HOME = $jdkTarget
$env:Path = "$jdkTarget\bin;$env:Path"
java -version
javac -version
```

### 6.2 切换到 JDK 21

```powershell
$jdkTarget = 'C:\Java\jdk21'
if (-not (Test-Path -LiteralPath "$jdkTarget\bin\javac.exe")) {
    throw '没有找到目标 JDK，请检查目录。'
}
$env:JAVA_HOME = $jdkTarget
$env:Path = "$jdkTarget\bin;$env:Path"
java -version
javac -version
```

每次切换会把目标 `bin` 加到当前 `Path` 最前面。频繁执行会累积重复项，关闭窗口后这些临时修改即结束；重新打开的终端会使用长期默认设置。

这些示例使用 PowerShell 语法，不能原样粘贴到 CMD。环境变量作用范围见 [Microsoft 官方说明](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables)。

## 7. 为不同项目配置开发工具

### 7.1 IntelliJ IDEA

1. 打开 `File → Project Structure → Platform Settings → SDKs`。
2. 分别添加 JDK 8、JDK 21 的根目录。如果未自动识别，使用 `Add JDK from disk` 或对应版本的添加本地 JDK 选项。
3. 在 `Project Settings → Project` 中为当前项目选择 SDK。
4. 旧项目按项目要求选择 JDK 8；需要 Java 21 的项目选择 JDK 21。
5. 检查模块 SDK 是否继承项目 SDK，以及编译目标版本是否符合项目要求。

IDE 自身使用的运行时、项目 SDK、构建工具 JVM 和终端 Java 可能分别配置。菜单名称可能因 IDEA 版本或界面语言略有变化，参见 [IDEA SDK 官方文档](https://www.jetbrains.com/help/idea/sdk.html)。

### 7.2 Maven

若已经安装 Maven，在准备执行构建的终端中检查：

```powershell
mvn -v
```

查看输出中的 Java version 和 Java home。使用项目 Maven Wrapper 时，在包含 `mvnw.cmd` 的项目根目录执行：

```powershell
.\mvnw.cmd -v
```

IDE 内运行 Maven 时，还应检查 Maven 导入和运行相关的 JDK 设置。项目使用 Toolchains、独立编译器配置等机制时，Maven 自身运行的 JDK 与实际编译 JDK 可能不同。参见 [Maven 安装与版本验证说明](https://maven.apache.org/install.html)和 [Maven Toolchains 指南](https://maven.apache.org/guides/mini/guide-using-toolchains.html)。

### 7.3 Gradle

在包含 Gradle Wrapper 的项目根目录执行：

```powershell
.\gradlew.bat --version
```

检查 Gradle 版本以及输出中的 JVM 信息。**用来运行 Gradle 的 JDK，与编译、测试项目代码的 JDK，可以不同。**

Gradle 官方兼容表列出：使用 Java 21 运行 Gradle 需要 Gradle 8.5 或更高版本；Java 8 可运行的 Gradle 范围为 2.0 至 8.14.x。不要因为安装了 JDK 21，就直接把旧项目的 Gradle JVM 改为 21；先核对项目 Wrapper 和插件兼容性。参见 [Gradle Java 兼容表](https://docs.gradle.org/current/userguide/compatibility.html#java_runtime)。

## 8. 编译运行一个最小示例

在自己的练习目录中新建 `HelloJdk.java`：

```java
public class HelloJdk {
    public static void main(String[] args) {
        System.out.println("Java version: " + System.getProperty("java.version"));
        System.out.println("Java home: " + System.getProperty("java.home"));
    }
}
```

切换到需要验证的 JDK，在该文件所在目录执行：

```powershell
javac HelloJdk.java
if ($LASTEXITCODE -eq 0) {
    java HelloJdk
}
```

先在 JDK 8 下验证，再切换到 JDK 21 重新编译并运行。输出的大版本应与所选 JDK 一致。JDK 8 的 `java.home` 可能指向 JDK 内部的 `jre` 目录，这是正常现象。

运行命令是 `java HelloJdk`，不要加 `.java` 或 `.class` 后缀。上面的 `if` 用于避免编译失败后继续运行旧的 class 文件。

## 9. 常见问题与排查

| 现象 | 主要检查点 | 处理方法 |
|---|---|---|
| `java` 或 `javac` 未被识别 | `bin` 未进入有效 `Path`，或终端尚未刷新 | 重新打开终端，检查 `Get-Command` 与 `where.exe` |
| `java` 可用但 `javac` 不可用 | 下载了 JRE，或两个命令指向不同目录 | 确认下载的是 JDK，并检查两者来源 |
| `JAVA_HOME` 是 21，`java -version` 却是 8 | `Path` 中旧 Java 路径优先 | 调整 Java 路径顺序，或按第 6 节临时切换 |
| `java` 与 `javac` 大版本不同 | 环境中混入多套 Java 路径 | 检查两个命令实际位置，统一到目标 JDK |
| 设置后新终端仍显示旧版本 | 父程序继承了旧环境，或用户变量覆盖系统变量 | 重启终端宿主程序，检查重复变量 |
| MSI 安装后找不到示例目录 | 实际安装到了默认版本目录 | 找到包含 `bin` 的实际根目录，并替换示例路径 |
| Maven 使用的 Java 与预期不同 | 当前环境、IDE 设置或 Toolchains 配置不同 | 检查 `mvn -v` 和项目构建配置 |
| Gradle 在 JDK 21 下无法启动 | Wrapper 或插件与该 JVM 不兼容 | 查兼容表，使用项目支持的 Gradle JVM |
| `UnsupportedClassVersionError` | 运行时不支持 class 文件版本 | 使用匹配的运行 JDK，或按项目要求设置兼容的编译目标 |
| 启动时提示缺少运行库 DLL | Corretto 8 的运行库前置要求可能未满足 | 按官方安装说明安装所需 Visual C++ Redistributable |
| 下载链接发生跳转 | `latest` 链接重定向到具体版本 | 正常现象；下载失败时从官方版本列表重新选择 |

## 10. 完成检查

- [ ] 下载的是 JDK 8、JDK 21 的 Windows x64 JDK 包。
- [ ] 两套 JDK 分别位于不同目录，均包含 `java.exe` 与 `javac.exe`。
- [ ] 默认 `JAVA_HOME` 指向 JDK 根目录，`Path` 能找到目标 `bin`。
- [ ] 在新终端中确认 `java`、`javac` 来源和大版本一致。
- [ ] 能按第 6 节分别切换到 JDK 8 和 JDK 21。
- [ ] 能在两个版本下分别编译运行 `HelloJdk.java`。
- [ ] 使用 IDE 或构建工具时，确认项目 SDK、构建 JVM 与项目要求一致。

## 11. 官方资料与维护说明

- [Amazon Corretto 官方介绍](https://aws.amazon.com/corretto/)
- [Amazon Corretto FAQ](https://aws.amazon.com/corretto/faqs/)
- [Corretto 8 官方下载页](https://docs.aws.amazon.com/corretto/latest/corretto-8-ug/downloads-list.html)
- [Corretto 21 官方下载页](https://docs.aws.amazon.com/corretto/latest/corretto-21-ug/downloads-list.html)
- [Corretto 8 Windows 安装说明](https://docs.aws.amazon.com/corretto/latest/corretto-8-ug/windows-install.html)
- [Corretto 21 Windows 安装说明](https://docs.aws.amazon.com/corretto/latest/corretto-21-ug/windows-install.html)
- [Azul Zulu 官方下载页](https://www.azul.com/downloads/)
- [PowerShell 环境变量说明](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_environment_variables)
- [IntelliJ IDEA SDK 配置](https://www.jetbrains.com/help/idea/sdk.html)
- [Maven 安装与版本验证说明](https://maven.apache.org/install.html)
- [Maven Toolchains 指南](https://maven.apache.org/guides/mini/guide-using-toolchains.html)
- [Gradle Java 兼容表](https://docs.gradle.org/current/userguide/compatibility.html#java_runtime)

资料核对日期：**2026-10-09**。安装包更新版本、下载页面选项及 IDE 界面可能变化，以官方页面和本机实际输出为准。本文中的练习代码和命令用于读者验证安装，不代表已经在读者电脑上完成安装或运行。
