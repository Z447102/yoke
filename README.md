# yoke

## 项目说明

本项目为基于 `uni-app + Vue3 + JavaScript + Pinia` 的小程序前端工程。当前已按照登录后首页设计图搭建首页主体，包含今日爆款评分、今日爆款内容、AI 快捷入口、数字人视频、视频创作、智能工具库、文案工作站和底部导航等模块。

## 本地运行

```bash
npm install
npm run dev:mp-weixin
```

### 微信小程序开发者工具（易错点）

本仓库是 **uni-app（Vite）CLI 工程**，**不能**把仓库根目录 `yoke` 或 `src` 当作小程序根目录导入，否则会报「缺少 app.json / 无法编译」等错误。

1. 先在本机执行 **`npm run dev:mp-weixin`**，保持该命令**不要关**（负责监听与重新编译）。
2. 打开 **微信开发者工具** → **导入**（或打开项目）→ 选择本机目录：  
   **`E:\project\yoke\dist\dev\mp-weixin`**（与终端里提示的 `dist\dev\mp-weixin` 一致）。
3. 若你使用 **测试号** 或自己的 AppID，在开发者工具里可勾选 **不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**（仅本地调试用），避免接口 / 图片域名被拦。

**仅打开发包、不跑 dev 时**：先执行 `npm run build:mp-weixin`，再导入 **`dist\build\mp-weixin`**（不是 `dist\dev\mp-weixin`）。

若仍无法启动，请把开发者工具 **「详情 → 本地设置」** 与 **控制台 / 编译区完整报错原文** 贴出，便于对照（不同基础库/工具版本提示差异很大）。

## 构建

```bash
npm run build:mp-weixin
```

## 文档

- [uni-app 小程序前端开发文档](docs/frontend-development.md)
- [静态资源与图标规范（团队）](docs/static-assets-icons.md)
