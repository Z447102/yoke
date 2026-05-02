# uni-app 小程序前端开发文档

本文档用于约定基于 `uni-app + Vue3 + JavaScript + Pinia` 的小程序前端开发方式。后续业务模块、接口说明、页面交互和发布流程可在本文档基础上持续补充。

## 1. 技术栈

- 框架：uni-app
- 视图层：Vue 3
- 开发语言：JavaScript
- 状态管理：Pinia
- 构建工具：Vite
- 目标端：微信小程序为主，兼容其他小程序平台时需单独验证

## 2. 推荐项目结构

```text
.
├── src
│   ├── api                 # 接口请求模块
│   ├── assets              # 静态资源
│   ├── components          # 通用组件
│   ├── constants           # 常量配置
│   ├── hooks               # 组合式函数
│   ├── pages               # 页面目录
│   ├── static              # uni-app 静态资源
│   ├── stores              # Pinia 状态管理
│   ├── styles              # 全局样式
│   ├── utils               # 工具函数
│   ├── App.vue
│   ├── main.js
│   ├── manifest.json
│   ├── pages.json
│   └── uni.scss
├── package.json
└── README.md
```

目录命名优先使用小写短横线或语义化英文，业务模块目录应与页面、接口和状态模块保持一致。

## 3. 环境与启动

推荐使用 Node.js LTS 版本。依赖安装和本地运行命令以项目实际 `package.json` 为准，通常可参考：

```bash
npm install
npm run dev:mp-weixin
npm run build:mp-weixin
```

微信小程序调试流程：

1. 执行小程序端开发命令。
2. 使用微信开发者工具打开构建产物目录。
3. 配置 AppID、基础库版本和合法域名。
4. 真机预览核心页面和授权、支付、定位等平台能力。

## 4. 基础配置约定

### 4.1 页面路由

页面统一在 `src/pages.json` 中维护：

- 主包页面放在 `pages`。
- 业务体量较大的模块优先使用 `subPackages`。
- 页面标题、导航栏颜色、下拉刷新等配置应靠近页面声明维护。

示例：

```json
{
  "pages": [
    {
      "path": "pages/home/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    }
  ]
}
```

### 4.2 应用配置

`src/manifest.json` 用于维护应用名称、平台能力和小程序配置。涉及平台审核、隐私接口、权限弹窗和 AppID 的配置变更，需要在合并前确认影响范围。

### 4.3 底部 tabBar

小程序底部导航统一在 `src/pages.json` 的 `tabBar` 中配置。主体项目默认保留三个底部入口：

- 首页：`pages/home/index`
- 分类：`pages/category/index`
- 我的：`pages/mine/index`

示例：

```json
{
  "pages": [
    {
      "path": "pages/home/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    },
    {
      "path": "pages/category/index",
      "style": {
        "navigationBarTitleText": "分类"
      }
    },
    {
      "path": "pages/mine/index",
      "style": {
        "navigationBarTitleText": "我的"
      }
    }
  ],
  "tabBar": {
    "color": "#8a8a8a",
    "selectedColor": "#1677ff",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/home/index",
        "text": "首页",
        "iconPath": "static/tabbar/home.png",
        "selectedIconPath": "static/tabbar/home-active.png"
      },
      {
        "pagePath": "pages/category/index",
        "text": "分类",
        "iconPath": "static/tabbar/category.png",
        "selectedIconPath": "static/tabbar/category-active.png"
      },
      {
        "pagePath": "pages/mine/index",
        "text": "我的",
        "iconPath": "static/tabbar/mine.png",
        "selectedIconPath": "static/tabbar/mine-active.png"
      }
    ]
  }
}
```

注意事项：

- `tabBar.list` 中的 `pagePath` 必须已在 `pages` 中声明。
- 图标建议放在 `src/static/tabbar`，保持普通态和选中态成对命名。
- 小程序 tabBar 通常支持 2 到 5 个入口，后续新增入口时需同步页面路由和图标资源。

### 4.4 环境变量

建议按环境拆分接口域名和开关配置：

- 开发环境：本地联调、测试接口。
- 测试环境：稳定测试接口。
- 生产环境：正式接口。

前端代码中不要硬编码接口域名、AppID、密钥或 token。密钥类信息不得提交到仓库。

## 5. Vue 3 开发约定

- 页面和组件优先使用 `<script setup>`。
- 组件名称使用 PascalCase，文件夹和页面路径使用语义化命名。
- 页面只处理页面生命周期、交互编排和轻量状态，复杂逻辑下沉到 `hooks`、`stores` 或 `utils`。
- 组件通过 `props` 输入、`emit` 输出，避免直接修改父级状态。
- 可复用业务逻辑封装到 `hooks/use-*.js`。

页面示例：

```vue
<template>
  <view class="page-home">
    <text>{{ title }}</text>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const title = ref('首页')
</script>

<style lang="scss" scoped>
.page-home {
  padding: 32rpx;
}
</style>
```

## 6. Pinia 状态管理约定

Pinia store 统一放在 `src/stores`。按业务领域拆分 store，避免把全部状态集中到单个文件。

推荐命名：

- 文件：`user.js`、`cart.js`、`app.js`
- Store ID：`user`、`cart`、`app`
- Hook：`useUserStore`、`useCartStore`、`useAppStore`

示例：

```js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    profile: null
  }),
  getters: {
    isLogin: (state) => Boolean(state.token)
  },
  actions: {
    setToken(token) {
      this.token = token
    },
    setProfile(profile) {
      this.profile = profile
    },
    logout() {
      this.token = ''
      this.profile = null
    }
  }
})
```

`main.js` 中注册 Pinia：

```js
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  app.use(createPinia())
  return {
    app
  }
}
```

## 7. 接口请求约定

接口模块放在 `src/api`，底层请求封装放在 `src/utils/request.js`。

建议约定：

- 所有接口统一通过请求封装调用。
- 请求拦截中处理基础 URL、token、公共 header。
- 响应拦截中处理登录失效、错误提示和统一数据结构。
- 页面不直接调用 `uni.request`。

示例：

```js
export function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
          return
        }
        reject(res)
      },
      fail: reject
    })
  })
}
```

业务接口示例：

```js
import { request } from '@/utils/request'

export function getUserProfile() {
  return request({
    url: '/user/profile',
    method: 'GET'
  })
}
```

## 8. 样式规范

- 小程序页面尺寸优先使用 `rpx`。
- 全局变量放在 `src/uni.scss` 或 `src/styles/variables.scss`。
- 通用样式放在 `src/styles`，页面私有样式写在页面内并使用 `scoped`。
- 颜色、间距、字号应尽量使用设计变量，避免散落魔法值。

## 9. 静态资源规范

- 小图标和本地图片可放在 `src/static`。
- 业务图片优先使用 CDN 或后端返回地址。
- 图片命名使用语义化英文，例如 `icon-user-default.png`。
- 避免提交未压缩的大体积图片。

## 10. 开发流程

1. 从目标基础分支创建功能分支。
2. 根据页面或模块拆分开发任务。
3. 先补充页面结构、路由配置和基础状态。
4. 再接入接口请求和异常处理。
5. 使用微信开发者工具进行页面、授权、网络和真机验证。
6. 提交前检查格式、构建结果和核心流程。

## 11. 提交与分支约定

推荐分支命名：

- `feature/<module-name>`
- `fix/<issue-name>`
- `docs/<topic>`

推荐提交信息：

- `feat: add home page`
- `fix: handle login expired state`
- `docs: update frontend development guide`

## 12. 后续待补充内容

后续可继续扩展以下章节：

- 业务页面清单
- 接口字段说明
- 登录与授权流程
- 分包策略
- 权限与隐私弹窗
- 错误码与异常处理
- 埋点规范
- 发布与回滚流程
- 常见问题

