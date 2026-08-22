# Git：无法切换分支（HEAD Permission denied）

> **现象**：Cursor / VS Code 弹窗 `Git: unable to write symref for HEAD: Permission denied`；终端 `git checkout main` 同样失败。  
> **环境**：Windows 10 · Cursor 占用仓库 · 发生日 2026-08-22  
> **本次结果**：已切到 `main`，本地 `feat/p2-remote-ops` 已删；`origin/main` 在 `3028b16`。

---

## 一、`.git/HEAD` 是什么

`.git/HEAD` 是 Git 用来记住「你现在站在哪」的一个小文本文件，不是提交历史本身。

本次处理结束后，仓库里的内容是：

```text
ref: refs/heads/main
```

意思是：当前检出的是 **main 分支**。真正的提交号写在 `.git/refs/heads/main` 里；`HEAD` 只是一根指针，指过去。

| `HEAD` 里写什么 | 含义 |
|-----------------|------|
| `ref: refs/heads/main` | 在分支上（正常开发） |
| `ref: refs/heads/feat/p2-remote-ops` | 当时卡住时的状态：还在功能分支上 |
| 一长串 hash（如 `3028b16...`） | **游离 HEAD**（detached），直接钉在某次提交上 |

可以把它想成书签：书（仓库历史）还在，书签告诉 Git 你正翻到哪一页。

`git checkout main`、`git switch`、Cursor 里点切分支，本质都是在改这个文件：从 `feat/p2-remote-ops` 改成 `main`。文件被 Cursor 开着不放，Git 就换不了指针，于是报 Permission denied。

---

## 二、这不是「没权限」

容易误判成：`.git` 只读、要用管理员、要改 ACL。

核对过：

| 检查 | 结果 |
|------|------|
| `.git/HEAD` 的只读属性 | 否 |
| NTFS ACL（当前用户） | `Authenticated Users` 有修改权 |
| 往 `.git/` 里新建文件 | 可以 |
| **独占打开** `.git/HEAD` | **失败**：文件正被另一进程使用 |

真正原因：**有进程把 `.git/HEAD` 开着**（共享模式只允许别人读，不允许删/替换）。Cursor 的 Git 状态监视会这样做。

---

## 三、为什么 `git checkout` 一定会失败

换分支时 Git 不会直接改 `HEAD` 里的字，而是：

```text
1. 写入  .git/HEAD.lock
2. 把 HEAD.lock 改名成 HEAD   ← Windows 上等于「删掉旧 HEAD 再换上新文件」
```

旧 `HEAD` 还被 Cursor 握着 → 第 2 步报：

```text
error: unable to write symref for HEAD: Permission denied
fatal: unable to update HEAD
```

IDE 里点切分支走同一条路，所以会一直失败。

用 PowerShell 验证共享模式时：

- `ReadWrite + Read`：能打开（说明对方允许别人读、也允许我们写内容）
- `ReadWrite + None` / `Delete`：失败（说明**不能替换这个文件**）

所以：**原地改文件内容可以，Git 那种「换文件」不行。**

---

## 四、本次怎么处理的

当时 `feat/p2-remote-ops` 和 `main` 已是同一提交 `3028b16`（刚推过 `origin/main`），工作区没有未提交的功能改动，可以只改指针、不用迁文件。

### 4.1 原地把 HEAD 指到 main

不要 `git checkout`，直接改 `.git/HEAD` 的**内容**（不删文件）：

```powershell
$p = 'D:\code2\software\vue\program\DetectSystem\.git\HEAD'
$bytes = [System.Text.Encoding]::ASCII.GetBytes("ref: refs/heads/main`n")
$fs = [System.IO.File]::Open($p, 'Open', 'Write', 'Read')
$fs.SetLength(0)
$fs.Write($bytes, 0, $bytes.Length)
$fs.Flush()
$fs.Close()
```

然后：

```powershell
git status
# On branch main
# Your branch is up to date with 'origin/main'.
```

### 4.2 删本地功能分支

```powershell
git branch -d feat/p2-remote-ops
```

会看到一句 `could not write config file .git/config: Permission denied`：同样是 Cursor 占着 `.git/config`，清配置项失败。**分支引用已经删掉**，可忽略。

```powershell
git branch -vv
# * main 3028b16 [origin/main] feat(ui): unify glass overlays and split home recent-analysis
```

---

## 五、下次再遇到（按顺序）

1. **先看是不是同一句错误**（`write symref for HEAD`）。若是权限/只读，走 ACL；若是占用，走下面。
2. **重启 Cursor**（最省事）。释放对 `.git/HEAD` 的句柄后再 `git checkout main`。
3. 仍失败、且当前提交已经和目标分支一样：用 §四 原地写 `HEAD`，不要用 `git checkout`。
4. 不要用管理员乱改 `.git` 权限，也**不要** `git checkout --force` 当万能药——这次失败点不在工作区冲突。

两分支**提交不同**、工作区还有改动时，不要只改 `HEAD`：会让 Git 以为已经在 main，文件却还是旧分支的状态。那种情况应先 **stash / 提交**，再重启 Cursor 后正常 `checkout`。

---

## 六、和「提交到 main」的关系

2026-08-22 的 UI 提交已经在 `origin/main`（`3028b16`）。当时 Cursor 占着 `HEAD`，`git checkout main` 失败，所以用 `git branch -f main feat/p2-remote-ops` 把**本地 main 指针**快进到该提交并 `git push origin main`。远程已经是 main；卡住的只是**当前工作区还显示在功能分支**。本文解决的是后半段：让工作区真正停在 main，并删掉已合并的 `feat/p2-remote-ops`。

---

**文档版本**：V1.1  
**最后更新**：2026-08-22
