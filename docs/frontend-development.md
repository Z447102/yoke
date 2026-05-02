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

## 8. 登录模块

登录模块统一放在用户相关业务目录中维护：

```text
src
├── api
│   └── auth.js              # 登录、换取 token、手机号绑定等接口
├── pages
│   └── login
│       └── index.vue        # 需要用户主动操作的登录页
├── stores
│   └── user.js              # token、用户信息、登录状态
└── utils
    └── auth.js              # 登录态读取、跳转、权限判断等工具
```

登录方式分为两类：

- 微信授权静默登录：进入小程序后通过 `uni.login` 获取临时 code，调用后端接口换取登录态。
- 手机号登录：用户点击手机号授权按钮，获取手机号授权凭证后调用后端完成登录或绑定。

### 8.1 登录状态

登录状态由 `src/stores/user.js` 统一维护，页面不直接读写本地缓存。

建议维护字段：

- `token`：后端登录凭证。
- `profile`：用户基础信息。
- `openid` / `unionid`：如业务需要，由后端返回后保存。
- `loginType`：登录来源，例如 `wechat_silent`、`phone`。

本地缓存只保存必要登录态，例如 `token` 和基础用户信息。退出登录时需要同时清理 Pinia 状态和本地缓存。

### 8.2 微信授权静默登录

静默登录用于小程序启动、进入首页或需要识别用户身份但不需要用户主动输入手机号的场景。

流程：

1. 小程序启动或进入需要登录态的页面。
2. 前端调用 `uni.login` 获取微信临时 `code`。
3. 前端调用后端静默登录接口，传递 `code`。
4. 后端使用 `code` 换取微信身份信息，并返回业务 token、用户基础信息和是否需要绑定手机号。
5. 前端写入 Pinia 和本地缓存。
6. 如果后端返回 `needBindPhone: true`，引导用户进入手机号登录或绑定流程。

示例：

```js
import { silentLogin } from '@/api/auth'
import { useUserStore } from '@/stores/user'

export function loginByWechatCode() {
  const userStore = useUserStore()

  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: async ({ code }) => {
        try {
          const data = await silentLogin({ code })
          userStore.setLoginState({
            token: data.token,
            profile: data.profile,
            loginType: 'wechat_silent'
          })
          resolve(data)
        } catch (error) {
          reject(error)
        }
      },
      fail: reject
    })
  })
}
```

注意事项：

- `code` 只能使用一次，失效后需要重新调用 `uni.login`。
- 静默登录不应强制弹出授权弹窗，避免影响首页首屏体验。
- 后端未返回有效 token 时，前端应保持游客态或引导手机号登录。

### 8.3 手机号登录

手机号登录用于需要实名手机号、下单、报名、会员绑定等必须确认用户手机号的场景。

流程：

1. 页面展示手机号登录按钮。
2. 用户点击授权按钮。
3. 前端从回调中获取手机号授权凭证。
4. 前端调用后端手机号登录接口。
5. 后端解密或换取手机号后返回业务 token 和用户信息。
6. 前端更新 Pinia、本地缓存，并返回原页面或进入首页。

按钮示例：

```vue
<template>
  <button open-type="getPhoneNumber" @getphonenumber="handlePhoneLogin">
    手机号快捷登录
  </button>
</template>

<script setup>
import { phoneLogin } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

async function handlePhoneLogin(event) {
  const { code, errMsg } = event.detail

  if (!code) {
    uni.showToast({
      title: errMsg || '未授权手机号',
      icon: 'none'
    })
    return
  }

  const data = await phoneLogin({ code })
  userStore.setLoginState({
    token: data.token,
    profile: data.profile,
    loginType: 'phone'
  })
}
</script>
```

注意事项：

- 新版微信小程序手机号能力优先使用 `code` 换取手机号，避免在前端处理敏感加密数据。
- 用户拒绝授权时，只提示必要信息，不重复打扰。
- 手机号登录成功后，应统一走 `setLoginState`，保证状态写入逻辑一致。

### 8.4 接口约定

建议接口放在 `src/api/auth.js`：

```js
import { request } from '@/utils/request'

export function silentLogin(data) {
  return request({
    url: '/auth/wechat/silent-login',
    method: 'POST',
    data
  })
}

export function phoneLogin(data) {
  return request({
    url: '/auth/phone/login',
    method: 'POST',
    data
  })
}

export function logout() {
  return request({
    url: '/auth/logout',
    method: 'POST'
  })
}
```

建议后端返回结构：

```json
{
  "token": "token value",
  "profile": {
    "id": "user id",
    "nickname": "用户昵称",
    "avatar": "头像地址",
    "phone": "手机号"
  },
  "needBindPhone": false
}
```

### 8.5 路由与权限

- 普通页面可先静默登录，失败时允许游客访问。
- 必须登录的页面在进入前检查 `userStore.isLogin`。
- 必须绑定手机号的页面额外检查用户手机号字段。
- 登录成功后优先返回来源页面，没有来源页面时进入首页。
- token 失效时由请求封装统一处理，清理登录态并跳转登录页或提示重新登录。

## 9. 样式规范

- 小程序页面尺寸优先使用 `rpx`。
- 全局变量放在 `src/uni.scss` 或 `src/styles/variables.scss`。
- 通用样式放在 `src/styles`，页面私有样式写在页面内并使用 `scoped`。
- 颜色、间距、字号应尽量使用设计变量，避免散落魔法值。

## 10. 静态资源规范

- 小图标和本地图片可放在 `src/static`。
- 业务图片优先使用 CDN 或后端返回地址。
- 图片命名使用语义化英文，例如 `icon-user-default.png`。
- 避免提交未压缩的大体积图片。

## 11. 开发流程

1. 从目标基础分支创建功能分支。
2. 根据页面或模块拆分开发任务。
3. 先补充页面结构、路由配置和基础状态。
4. 再接入接口请求和异常处理。
5. 使用微信开发者工具进行页面、授权、网络和真机验证。
6. 提交前检查格式、构建结果和核心流程。

## 12. 提交与分支约定

推荐分支命名：

- `feature/<module-name>`
- `fix/<issue-name>`
- `docs/<topic>`

推荐提交信息：

- `feat: add home page`
- `fix: handle login expired state`
- `docs: update frontend development guide`

## 13. 后续待补充内容

后续可继续扩展以下章节：

- 业务页面清单
- 接口字段说明
- 登录模块接口字段细化
- 分包策略
- 权限与隐私弹窗
- 错误码与异常处理
- 埋点规范
- 发布与回滚流程
- 常见问题

