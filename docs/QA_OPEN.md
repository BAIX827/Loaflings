# 验收：点图标打开

日常验收不跑 `npm start`，直接点 **Loaflings**。

## 位置

- `/Applications/Loaflings.app`
- 桌面：`~/Desktop/Loaflings.app`

第一次打开后：Dock 图标右键 → **选项** → **在 Dock 中保留**。

## 辅助功能

打包版勾 **Loaflings**（不是 Electron）。每次换新 `.app` 后若计数停了，去系统设置重新勾一下。

## 更新验收包（开发）

```bash
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/Loaflings
git pull
npm run install:qa
```

会重打 `dist/mac-arm64/Loaflings.app` 并覆盖应用程序 + 桌面。
