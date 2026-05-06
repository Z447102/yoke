# uni-app 小程序前端开发文档

本文档用于约定基于 `uni-app + Vue3 + JavaScript + Pinia` 的小程序前端开发方式。后续业务模块、接口说明、页面交互和发布流程可在本文档基础上持续补充。

## 0. 开发到上线流程总览

本文档按小程序前端从开发到上线的实际流程组织，推荐阅读和执行顺序如下：

1. 项目准备：确认技术栈、项目结构、环境与启动命令。
2. 基础配置：维护 `pages.json`、`manifest.json`、环境变量、tabBar 和分包。
3. 页面开发：按 Vue 3 约定编写页面，按组件规范引入通用组件和业务组件。
4. 数据管理：使用 Pinia 按业务模块维护跨页面状态。
5. 接口联调：通过统一请求封装和业务 API 模块调用后端接口。
6. 业务能力：接入登录、手机号授权、权限判断等核心流程。
7. 质量检查：完成自测、真机验证、构建检查和代码提交。
8. 构建上线：生成小程序构建产物，提交微信审核，发布后持续观察问题。

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

### 5.1 组件引入规范

组件按复用范围拆分到不同目录，页面只引入当前页面真正使用的组件，避免把业务组件集中注册为全局组件。

推荐目录：

```text
src
├── components
│   ├── base                 # 基础通用组件，例如按钮、空状态、弹窗
│   ├── business             # 跨页面复用业务组件
│   └── layout               # 页面布局类组件
└── pages
    └── home
        └── components       # 首页私有组件
```

命名约定：

- 组件文件名使用 PascalCase，例如 `BaseEmpty.vue`、`UserCard.vue`。
- 基础组件建议使用 `Base` 前缀，例如 `BaseButton`、`BasePopup`。
- 业务组件使用业务名词命名，例如 `OrderCard`、`ActivityItem`。
- 页面私有组件放在页面目录下的 `components`，不向其他业务模块直接暴露。

组件引入方式：

```vue
<template>
  <view class="page-home">
    <BaseEmpty v-if="isEmpty" text="暂无数据" />
    <OrderCard
      v-for="item in list"
      :key="item.id"
      :order="item"
      @click="handleOrderClick"
    />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import BaseEmpty from '@/components/base/BaseEmpty.vue'
import OrderCard from '@/components/business/OrderCard.vue'

const props = defineProps({
  list: {
    type: Array,
    default: () => []
  }
})

const isEmpty = computed(() => props.list.length === 0)

function handleOrderClick(order) {
  uni.navigateTo({
    url: `/pages-sub/order/detail?id=${order.id}`
  })
}
</script>
```

使用规范：

- 页面组件优先显式 `import`，便于追踪依赖关系。
- 全局组件只放高频基础组件，且需要在项目配置中统一声明。
- 组件通过 `props` 接收数据，通过 `emit` 通知外部事件，不直接修改 Pinia store。
- 组件内部不直接调用业务接口；需要数据时由页面、hooks 或 store 获取后传入。
- 组件样式默认使用 `scoped`，跨组件复用样式放入 `src/styles`。
- 分包私有组件优先放在对应分包目录，多个分包共用时再上移到 `src/components`。

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

### 6.1 多模块数据管理

数据管理按业务领域拆分为多个 store，每个 store 只维护自己领域内的状态、派生数据和修改方法，避免出现一个全局大 store。

推荐模块：

| 模块 | 文件 | 职责 |
| --- | --- | --- |
| 应用配置 | `src/stores/app.js` | 主题、系统信息、启动参数、全局开关 |
| 用户登录 | `src/stores/user.js` | token、用户信息、手机号绑定状态 |
| 首页数据 | `src/stores/home.js` | 首页缓存、轮播、推荐列表 |
| 分类数据 | `src/stores/category.js` | 分类树、当前分类、筛选条件 |
| 订单数据 | `src/stores/order.js` | 订单列表筛选、订单详情缓存 |
| 购物车或业务篮 | `src/stores/cart.js` | 商品数量、选中项、结算数据 |
| 位置能力 | `src/stores/location.js` | 定位授权、经纬度、城市信息 |

目录示例：

```text
src
└── stores
    ├── app.js
    ├── user.js
    ├── home.js
    ├── category.js
    ├── order.js
    ├── cart.js
    └── location.js
```

模块拆分原则：

- 按业务领域拆分，不按页面机械拆分；多个页面共用的状态应沉淀为业务 store。
- 页面临时 UI 状态优先放在页面组件内，例如弹窗开关、输入框内容、局部 loading。
- 接口返回的大列表不默认全部放入 store，只有跨页面复用、需要缓存或需要统一修改的数据才进入 store。
- store 中不直接写页面跳转和弹窗交互，页面或 hooks 负责交互编排。
- store action 可以调用接口，但复杂流程建议放到 `hooks` 中组合多个 store 和接口。

多模块调用示例：

```js
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { getOrderList } from '@/api/order'

export const useOrderStore = defineStore('order', {
  state: () => ({
    list: [],
    query: {
      status: 'all',
      page: 1
    }
  }),
  actions: {
    async fetchList() {
      const userStore = useUserStore()

      if (!userStore.isLogin) {
        this.list = []
        return
      }

      const data = await getOrderList(this.query)
      this.list = data.list || []
    },
    reset() {
      this.list = []
      this.query = {
        status: 'all',
        page: 1
      }
    }
  }
})
```

持久化边界：

- 建议持久化：`token`、用户基础信息、主题配置、城市信息等恢复体验必要的数据。
- 不建议持久化：接口临时列表、分页参数、一次性授权 code、支付参数、敏感业务数据。
- 退出登录时需要清理用户相关模块，例如 `user`、`order`、`cart`，避免切换账号后看到旧数据。

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

### 7.1 接口调用规范

接口调用按“请求封装 -> 业务 API -> hooks/store -> 页面”的层次组织，页面不直接拼接 URL，也不直接处理通用错误码。

推荐目录：

```text
src
├── api
│   ├── auth.js              # 登录相关接口
│   ├── user.js              # 用户资料接口
│   ├── order.js             # 订单相关接口
│   └── home.js              # 首页相关接口
├── hooks
│   └── use-order.js         # 复杂业务流程编排
└── utils
    └── request.js           # uni.request 统一封装
```

分层职责：

| 层级 | 职责 | 不应处理 |
| --- | --- | --- |
| `utils/request.js` | baseURL、header、token、状态码、通用错误提示 | 具体业务字段组装 |
| `api/*.js` | 声明接口地址、方法、参数 | 页面交互、Pinia 状态写入 |
| `hooks/use-*.js` | 组合多个接口、store 和页面流程 | 底层请求细节 |
| `stores/*.js` | 维护跨页面共享状态和缓存 | 页面弹窗、复杂跳转 |
| `pages/*.vue` | 触发业务动作、展示 loading 和结果 | 直接调用 `uni.request` |

业务 API 示例：

```js
import { request } from '@/utils/request'

export function getOrderList(params) {
  return request({
    url: '/orders',
    method: 'GET',
    data: params
  })
}

export function createOrder(data) {
  return request({
    url: '/orders',
    method: 'POST',
    data
  })
}
```

页面调用示例：

```vue
<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getOrderList } from '@/api/order'

const loading = ref(false)
const list = ref([])

async function fetchOrderList() {
  try {
    loading.value = true
    const data = await getOrderList({
      page: 1,
      pageSize: 10
    })
    list.value = data.list || []
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  fetchOrderList()
})
</script>
```

调用约定：

- `GET` 请求参数统一通过 `data` 传递，由请求封装适配到 `uni.request`。
- `POST` / `PUT` 请求体统一使用 `data`，不要在页面中拼接 query 字符串。
- 页面只处理当前页面的 loading、空状态和轻量提示。
- 登录失效、网络异常、服务端错误等通用错误由请求封装统一处理。
- 需要跨页面复用的数据，接口结果写入 Pinia；只在当前页面使用的数据保留在页面局部状态。
- 多接口串联、提交前校验、提交后跳转等复杂流程优先封装到 `hooks/use-*.js`。
- 接口文件按业务模块拆分，避免出现 `api/index.js` 包含所有接口。

## 8. 登录模块

登录模块负责建立小程序用户身份、维护本地登录态，并在需要手机号的业务场景中完成手机号授权。当前约定支持两种方式：

- 微信授权静默登录：通过 `uni.login` 获取微信临时 `code`，后端换取微信身份并返回业务登录态。
- 手机号登录：用户主动点击手机号授权按钮，后端换取手机号并完成登录或绑定。

设计原则：

- 静默登录优先，不打断首页和普通浏览流程。
- 手机号登录必须由用户主动触发，只在业务确实需要手机号时出现。
- 登录态只由 Pinia store 统一写入和清理，页面不直接维护 token。
- token 失效、退出登录、手机号绑定成功都走统一状态更新方法。

### 8.1 目录职责

登录相关代码按职责拆分：

```text
src
├── api
│   └── auth.js              # 静默登录、手机号登录、退出登录等接口
├── hooks
│   └── use-login.js         # 登录流程编排，可按业务需要拆分
├── pages
│   └── login
│       └── index.vue        # 需要用户主动操作的登录页
├── stores
│   └── user.js              # token、用户信息、手机号绑定状态
└── utils
    └── auth.js              # token 读写、来源页跳转、权限判断等工具
```

职责边界：

- `api/auth.js` 只描述接口，不处理页面跳转。
- `stores/user.js` 只维护登录态和用户信息，不直接调用页面组件方法。
- `hooks/use-login.js` 负责串联 `uni.login`、接口请求、状态写入和异常提示。
- `pages/login/index.vue` 只承载用户主动登录、手机号授权和失败重试入口。

### 8.2 登录状态模型

登录状态由 `src/stores/user.js` 统一维护，建议字段如下：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `token` | `String` | 后端业务登录凭证 |
| `profile` | `Object \| null` | 用户基础信息 |
| `openid` | `String` | 微信用户标识，按后端返回决定是否保存 |
| `unionid` | `String` | 微信开放平台标识，按业务需要保存 |
| `phone` | `String` | 已绑定手机号 |
| `needBindPhone` | `Boolean` | 是否需要引导手机号授权 |
| `loginType` | `String` | `wechat_silent` 或 `phone` |

Store 方法建议：

- `setLoginState(payload)`：统一写入 token、用户信息、手机号绑定状态和缓存。
- `setProfile(profile)`：更新用户资料。
- `setNeedBindPhone(value)`：更新是否需要绑定手机号。
- `clearLoginState()`：清理 Pinia 状态和本地缓存。

本地缓存只保存必要登录态，例如 `token`、`profile` 和 `needBindPhone`。不要在前端缓存手机号授权临时 `code`、微信 session key 或其他敏感信息。

### 8.3 微信授权静默登录

静默登录适用于小程序启动、进入首页、恢复登录态、普通页面识别用户身份等场景。静默登录失败时不应阻塞普通浏览，除非当前页面明确要求登录。

流程：

1. 应用启动或页面进入时读取本地缓存。
2. 如果已有有效 token，优先恢复 Pinia 登录态。
3. 如果没有 token 或后端判定 token 失效，调用 `uni.login({ provider: 'weixin' })` 获取临时 `code`。
4. 调用后端静默登录接口，传递 `code`。
5. 后端返回 token、用户信息和 `needBindPhone`。
6. 前端调用 `setLoginState` 写入 Pinia 和本地缓存。
7. 如果 `needBindPhone` 为 `true`，在需要手机号的页面引导用户进行手机号登录。

示例：

```js
import { silentLogin } from '@/api/auth'
import { useUserStore } from '@/stores/user'

let silentLoginTask = null

export function loginByWechatCode() {
  if (silentLoginTask) {
    return silentLoginTask
  }

  const userStore = useUserStore()

  silentLoginTask = new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: async ({ code }) => {
        if (!code) {
          reject(new Error('微信登录 code 为空'))
          return
        }

        try {
          const data = await silentLogin({ code })
          userStore.setLoginState({
            token: data.token,
            profile: data.profile,
            phone: data.profile?.phone || '',
            needBindPhone: data.needBindPhone,
            loginType: 'wechat_silent'
          })
          resolve(data)
        } catch (error) {
          reject(error)
        }
      },
      fail: reject
    })
  }).finally(() => {
    silentLoginTask = null
  })

  return silentLoginTask
}
```

注意事项：

- `code` 只能使用一次，接口失败后需要重新调用 `uni.login` 获取新 `code`。
- 静默登录期间要避免多页面并发重复请求，可用 `silentLoginTask` 复用进行中的 Promise。
- 静默登录失败时保留游客态；必须登录的页面再跳转登录页或提示用户操作。
- 后端返回 `needBindPhone: true` 不等于登录失败，只表示部分业务能力需要手机号。

### 8.4 手机号登录

手机号登录适用于下单、报名、会员绑定、联系服务等必须确认手机号的场景。手机号授权需要用户主动点击按钮触发，不能在静默流程中自动弹出。

流程：

1. 进入需要手机号的页面，检查 `userStore.isLogin` 和 `userStore.hasPhone`。
2. 未登录时先执行静默登录。
3. 已登录但缺少手机号时展示手机号授权按钮。
4. 用户点击按钮后，从 `event.detail.code` 获取手机号授权凭证。
5. 调用后端手机号登录或绑定接口。
6. 后端返回 token、用户信息、手机号绑定状态。
7. 前端调用 `setLoginState` 或 `setProfile` 更新状态，并返回来源页面或继续当前业务。

按钮示例：

```vue
<template>
  <button
    type="primary"
    open-type="getPhoneNumber"
    :loading="loading"
    @getphonenumber="handlePhoneLogin"
  >
    手机号快捷登录
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { phoneLogin } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const loading = ref(false)
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

  try {
    loading.value = true
    const data = await phoneLogin({ code })
    userStore.setLoginState({
      token: data.token,
      profile: data.profile,
      phone: data.profile?.phone || '',
      needBindPhone: false,
      loginType: 'phone'
    })
  } finally {
    loading.value = false
  }
}
</script>
```

注意事项：

- 新版微信小程序手机号能力优先使用 `code` 换取手机号，避免在前端处理敏感加密数据。
- 用户拒绝授权时只提示必要信息，不要循环弹窗或阻断非强制业务。
- 手机号登录可能是“首次登录”，也可能是“已静默登录后的手机号绑定”，接口需与后端确认是否合并。
- 手机号授权按钮不要封装成自动触发逻辑，必须保留真实用户点击。

### 8.5 接口约定

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

前端实现（`src/api/auth.js` + `src/config/env.js`）在配置 `VITE_API_BASE_URL` 后走真实请求：

- **静默会话**：默认 **`POST /api/auth/wechat/session`**，请求体 `{ "loginCode": "<uni.login 的微信 code>" }`；响应 `data` 含 `needPhoneAuthorization`、`uuid`、`loginResult.token` 等，归一化后写入 `user` store（含 `wxSessionUuid`）。路径可用 **`VITE_AUTH_WECHAT_SILENT_PATH`** 覆盖。
- **手机号授权登录**：默认 **`POST /api/auth/wechat/mobile-login`**，请求体 `{ "uuid": "<session 返回的预登录会话 id>", "phoneCode": "<getPhoneNumber 的 code>" }`，**不携带** `Authorization`（仅 `uuid` + `phoneCode`）。成功 `data` 常见仅含 `token`、`expiresIn`、`newUser`；无 `profile` 时前端保留原 `profile` 与 `points`。路径可用 **`VITE_AUTH_WECHAT_MOBILE_LOGIN_PATH`** 覆盖。
- 业务外壳成功码默认与后端 **`200`** 对齐，可通过 **`VITE_API_BIZ_CODE_SUCCESS`** 修改。

静默登录请求参数建议：

```json
{
  "loginCode": "wechat login code"
}
```

手机号授权登录请求参数建议：

```json
{
  "uuid": "pre-login session id from /api/auth/wechat/session",
  "phoneCode": "phone number code from getPhoneNumber"
}
```

手机号登录成功 `data` 示例（可与静默登录全量结构不同）：

```json
{
  "token": "token value",
  "expiresIn": 7200,
  "newUser": false
}
```

若后端同时返回用户资料，可扩展为与静默登录一致的 `profile` 结构，前端归一化逻辑可继续补充。

错误码建议：

| 错误码 | 场景 | 前端处理 |
| --- | --- | --- |
| `TOKEN_EXPIRED` | token 过期或无效 | 清理登录态，重新静默登录或跳转登录页 |
| `WECHAT_CODE_INVALID` | 微信 code 失效 | 重新调用 `uni.login` 后重试一次 |
| `PHONE_AUTH_DENIED` | 用户拒绝手机号授权 | 轻提示，不强制重复授权 |
| `PHONE_REQUIRED` | 当前业务必须绑定手机号 | 引导手机号登录 |

### 8.6 路由、权限与异常处理

- 普通页面可先尝试静默登录，失败时保持游客态。
- 必须登录的页面在进入前检查 `userStore.isLogin`，未登录时跳转登录页并携带来源地址。
- 必须绑定手机号的页面额外检查 `userStore.hasPhone` 或 `profile.phone`。
- 登录成功后优先回到来源页面，没有来源页面时进入首页。
- 请求封装中统一处理 token 失效，避免每个页面重复判断。
- 退出登录时先调用后端退出接口，再执行 `clearLoginState`；后端接口失败时也应清理本地状态。

推荐页面权限判断：

```js
import { useUserStore } from '@/stores/user'

export function ensureLogin() {
  const userStore = useUserStore()

  if (userStore.isLogin) {
    return true
  }

  uni.navigateTo({
    url: '/pages/login/index'
  })
  return false
}
```

## 9. 登录后首页

登录后首页以设计图为准，作为小程序核心工作台页面。页面需要承载用户今日数据、内容推荐、AI 创作入口、智能工具和底部导航，开发时应优先保证首屏加载速度、模块边界清晰和接口异常可降级。

### 9.1 页面定位

首页路径建议为 `pages/home/index`，属于主包和 tabBar 页面。用户完成静默登录或手机号登录后，默认进入首页。

页面目标：

- 展示用户今日概览数据，帮助用户快速判断账号状态。
- 提供内容、数字人、视频创作、智能工具、文案工作站等高频入口。
- 承接底部 tabBar 的第一个入口，保持登录后主要操作都能从首页触达。
- 对部分接口失败场景提供默认空态，避免首页白屏。

### 9.2 页面模块拆分

根据设计图，首页从上到下拆分为以下模块：

| 模块 | 建议组件 | 说明 |
| --- | --- | --- |
| 顶部导航 | `HomeHeader` | 展示品牌、日期、平台胶囊区域，可适配微信小程序状态栏 |
| 今日爆款评分 | `TodayScoreCard` | 展示评分、线索数、浏览数、转化率、平台和行业筛选 |
| 今日爆款内容 | `HotContentList` | 横向内容卡片列表，支持“换一批” |
| 快捷操作 | `HomeQuickActions` | `AI 一键成片`、`引流数据` 等核心按钮；`AI 一键成片` 跳转 `pages/create/index` |
| 数字人视频 | `DigitalHumanSection` | 数字人形象创建、已创建数字人列表、全部形象入口 |
| 视频创作 | `VideoCreationSection` | 数字人创作、开始创作、图片转视频、视频剪辑入口 |
| 智能工具库 | `SmartToolGrid` | 文字生图、人物换装、图片高清化、智能提取、人脸融合等工具 |
| 文案工作站 | `CopywritingGrid` | 企业宣传、文案仿写、电商带货、口播文案、AI 标题等入口 |
| 底部 tabBar | `pages.json tabBar` | 首页、创作、我的等主入口，按项目最终 tabBar 配置调整 |

目录建议：

```text
src
├── pages
│   └── home
│       ├── index.vue
│       └── components
│           ├── HomeHeader.vue
│           ├── TodayScoreCard.vue
│           ├── HotContentList.vue
│           ├── HomeQuickActions.vue
│           ├── DigitalHumanSection.vue
│           ├── VideoCreationSection.vue
│           ├── SmartToolGrid.vue
│           └── CopywritingGrid.vue
├── api
│   └── home.js
└── stores
    └── home.js
```

### 9.3 首页数据模型

首页数据建议由 `src/stores/home.js` 统一管理，页面负责触发加载和组织展示。

建议字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `scoreSummary` | `Object` | 今日爆款评分、线索数、浏览数、转化率 |
| `scoreFilters` | `Object` | 当前平台、行业筛选条件 |
| `hotContents` | `Array` | 今日爆款内容卡片列表 |
| `digitalHumans` | `Array` | 数字人形象列表 |
| `creationStats` | `Object` | 数字人创作、图片转视频、视频剪辑作品数量 |
| `smartTools` | `Array` | 智能工具入口列表 |
| `copywritingTools` | `Array` | 文案工具入口列表 |
| `loading` | `Boolean` | 首页整体加载状态 |
| `loaded` | `Boolean` | 是否已完成首次加载 |

Store 示例：

```js
import { defineStore } from 'pinia'
import { getHomeDashboard } from '@/api/home'

export const useHomeStore = defineStore('home', {
  state: () => ({
    scoreSummary: null,
    scoreFilters: {
      platform: '',
      industry: ''
    },
    hotContents: [],
    digitalHumans: [],
    creationStats: {
      digitalHuman: 0,
      imageToVideo: 0,
      videoEdit: 0
    },
    smartTools: [],
    copywritingTools: [],
    loading: false,
    loaded: false
  }),
  actions: {
    async fetchDashboard() {
      this.loading = true
      try {
        const data = await getHomeDashboard(this.scoreFilters)
        this.scoreSummary = data.scoreSummary
        this.hotContents = data.hotContents || []
        this.digitalHumans = data.digitalHumans || []
        this.creationStats = data.creationStats || this.creationStats
        this.smartTools = data.smartTools || []
        this.copywritingTools = data.copywritingTools || []
        this.loaded = true
      } finally {
        this.loading = false
      }
    }
  }
})
```

### 9.4 接口约定

首页接口建议放在 `src/api/home.js`，按模块拆分接口，避免所有首页数据强依赖单个接口。首屏可使用聚合接口，非首屏模块可延迟加载。

```js
import { request } from '@/utils/request'

export function getHomeDashboard(params) {
  return request({
    url: '/home/dashboard',
    method: 'GET',
    data: params
  })
}

export function getHotContents(params) {
  return request({
    url: '/home/hot-contents',
    method: 'GET',
    data: params
  })
}

export function getHomeTools() {
  return request({
    url: '/home/tools',
    method: 'GET'
  })
}
```

接口返回建议：

```json
{
  "scoreSummary": {
    "score": 92,
    "clueCount": 13000,
    "viewCount": 3278,
    "conversionRate": 2.1
  },
  "hotContents": [],
  "digitalHumans": [],
  "creationStats": {
    "digitalHuman": 289,
    "imageToVideo": 123,
    "videoEdit": 96
  },
  "smartTools": [],
  "copywritingTools": []
}
```

### 9.5 页面交互规范

- 顶部评分筛选切换后，只刷新评分和爆款内容模块，不重置整个首页。
- “换一批”只刷新 `hotContents`，失败时保留上一批数据并给轻提示。
- “AI 一键成片”点击后跳转 `pages/create/index`，进入一键成片表单页。
- “AI 一键成片”“开始创作”等按钮跳转前需要检查登录态和手机号绑定状态。
- 创建数字人、视频创作、工具入口建议统一通过工具配置跳转，避免页面内写大量分支。
- 工具宫格支持后端控制开关、角标和排序；前端保留默认配置作为接口失败兜底。
- 首屏优先渲染顶部区域、评分卡和快捷入口，工具区可在首屏后延迟加载。

### 9.6 样式与适配规范

- 页面主色以设计图橙色系为主，建议沉淀为样式变量，例如 `$primary-color`、`$primary-gradient`。
- 卡片圆角、阴影、间距需要统一封装，避免每个模块重复写魔法值。
- 横向内容卡片使用 `scroll-view`，注意小程序滚动性能和图片懒加载。
- 底部 tabBar 避免遮挡页面内容，页面底部需要预留安全区高度。
- 顶部导航需要兼容微信状态栏和胶囊按钮，避免内容与系统区域重叠。
- 数字人头像、内容图片等远程图片需要设置默认占位图和加载失败兜底。

### 9.7 验收要点

- 登录后进入首页不白屏，静默登录失败时可展示游客态或登录引导。
- 今日爆款评分、内容卡片、作品数量和工具入口能按接口数据正常展示。
- 三张设计图中的不同数据状态都能覆盖：有作品数量、无作品数量、不同筛选条件。
- 核心入口点击后能跳转到对应页面或分包页面。
- 下拉刷新能重新拉取首页核心数据。
- 弱网、接口失败、空数据场景均有 loading、空态或轻提示。
- 真机验证页面滚动、横向卡片滑动、底部 tabBar 和安全区表现正常。

## 10. AI 一键成片

AI 一键成片页面以设计图为准，用于在生成视频前收集商户基础信息。首页点击“AI 一键成片”后进入该页面，用户完善行业、主营业务、店铺/公司名称和位置信息后进入下一步。

### 10.1 页面定位

页面路径建议为 `pages/create/index`，标题为“一键成片”。该页面属于主包页面，可从首页快捷入口、创作 tab 或其他创作入口进入。

页面目标：

- 引导用户补全商业信息，为后续精准成片提供上下文。
- 收集行业、主营业务、主营业务范围、店铺/公司名称和位置。
- 对必填项做前端校验，未完成时禁用或拦截“下一步”。
- 提示用户后续可在“我的 - 主营业务”中修改相关信息。

### 10.2 页面模块拆分

| 模块 | 建议组件 | 说明 |
| --- | --- | --- |
| 自定义导航 | `CreateHeader` | 返回按钮、页面标题、微信胶囊占位 |
| 欢迎说明 | `CreateWelcome` | 展示欢迎文案和说明文字 |
| 行业选择 | `CreateIndustryPopup` | 必填，点击后展示底部弹出层行业网格 |
| 主营业务选择 | `CreateBusinessPage` | 必填，点击后跳转主营业务选择页；类目数据、分组和选择规则按行业由后端返回 |
| 主营业务范围 | `CreateTextareaField` | 多行输入，右下角清空按钮 |
| 店铺/公司名称 | `CreateInputField` | 必填，输入店铺或公司名称 |
| 店铺/公司位置 | `CreateLocationInput` / `CreateLocationPage` | 必填，可手动填写，也可点击地图选点跳转位置选择页 |
| 底部操作 | `CreateFooter` | 下一步按钮和修改提示，信息填写完毕后跳转生成视频页 |
| 生成视频配置 | `CreateGeneratePage` | 选择视频模板、上传照片、选择出镜形象、编辑视频文案并生成视频 |
| 画质与模型弹窗 | `CreateQualitySheet`（可与生成页同文件） | 底部弹出：视频分辨率、生成模型；两者选项相互独立，见 10.4.1 |

目录建议：

```text
src
├── pages
│   └── create
│       ├── index.vue
│       ├── business
│       │   └── index.vue
│       ├── location
│       │   └── index.vue
│       ├── generate
│       │   └── index.vue
│       └── components
│           ├── CreateHeader.vue
│           ├── CreateWelcome.vue
│           ├── CreateIndustryPopup.vue
│           ├── CreateBusinessPage.vue
│           ├── CreateSelectField.vue
│           ├── CreateTextareaField.vue
│           ├── CreateInputField.vue
│           ├── CreateLocationInput.vue
│           ├── CreateLocationPage.vue
│           ├── CreateGeneratePage.vue
│           └── CreateFooter.vue
├── api
│   └── create.js
└── stores
    └── create.js
```

### 10.3 表单数据模型

建议由页面局部状态或 `src/stores/create.js` 管理。若信息需要跨步骤复用，应放入 Pinia。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `industry` | `String` | 是 | 行业 |
| `businessType` | `Object` | 是 | 主营业务选择结果，包含核心品类、风格、经营场景和自定义标签 |
| `businessScope` | `String` | 否 | 主营业务范围 |
| `shopName` | `String` | 是 | 店铺/公司名称 |
| `locationText` | `String` | 是 | 用户手动填写的店铺或公司位置 |

示例：

```js
const form = reactive({
  industry: '',
  businessType: '',
  businessScope: '',
  shopName: '',
  locationText: ''
})
```

### 10.4 交互规范

- 首页点击“AI 一键成片”使用 `uni.navigateTo({ url: '/pages/create/index' })`。
- 返回按钮优先 `uni.navigateBack()`，无页面栈时回到首页。
- 行业选择使用底部弹出层，遮罩覆盖当前页面，弹层内按四列网格展示行业选项。
- 行业选项点击后只更新弹层内临时选中态，点击“确定”后再回填到表单。
- 点击遮罩关闭弹层时不提交临时选择，保留原行业值。
- 主营业务点击后跳转 `pages/create/business/index`，并携带当前行业参数。
- 主营业务选择页顶部展示返回按钮、标题“主营业务”和当前行业；主体按后端返回的分组展示类目。
- 类目数据与所选行业挂钩，进入页面后通过行业请求后端类目配置；具体分几级、每级是否单选或多选由后端返回决定，前端不写死级数。
- 设计图中的“核心品类”为必填单选分组，用户选择核心品类后才展示后续分组。
- 设计图中的“风格 / 菜系”“经营场景”为多选分组，可选择多个标签；选中态使用橙色描边和浅橙背景。
- 自定义分组用于展示用户已添加标签和“添加”入口，自定义标签需要与后端返回标签一并参与提交。
- 当前层级或分组存在子级时，选中后重置其后续依赖分组，并继续展示下一层；当前选项无子级时视为该路径已完成。
- 只有所有后端标记为必填的分组都完成选择后，“确定”按钮才变为可点击状态；未完成时按钮保持置灰并拦截点击。
- 点击“确定”后返回上一页；后续接入状态共享时通过 Pinia 或页面事件回填完整 `businessType` 选择结果。
- 主营业务范围支持清空按钮；清空仅清除当前输入内容。
- 店铺/公司位置为必填项，用户可手动输入门店名称、商圈、街道或详细地址。
- 点击“地图选点”跳转 `pages/create/location/index`，进入位置选择页。
- 位置选择页顶部展示地图区域、取消和发送按钮，底部展示搜索框和候选位置列表。
- 用户选择候选位置后高亮选中项，点击“发送”后返回上一页；后续接入状态共享时通过 Pinia 或页面事件回填 `locationText`。
- “下一步”点击时校验必填项，缺失字段需要提示具体项。
- 信息填写完毕后点击“下一步”跳转 `pages/create/generate/index`，进入生成视频配置页。
- 生成视频配置页需要允许用户确认主营业务和平台，选择视频模板，上传门头照片、内部环境、菜品照片和其他照片，选择出镜形象，编辑视频文案后再生成视频。
- 生成视频配置页底部固定展示当前分辨率与当前模型摘要、消耗点数和「生成视频」按钮；分辨率与模型的详细选择在底部弹窗内完成，见 10.4.1；生成前需要校验模板、必要照片、出镜形象和文案。

### 10.4.1 画质与模型（底部弹窗）

页面路径为 `pages/create/generate/index`。底部左侧区域展示**当前选中的视频分辨率**与**当前选中的生成模型**两行摘要（例如 `720P` / `Seedance2.0`），右侧为下拉示意符；用户点击该区域后，从底部弹出白色圆角面板（遮罩压暗背景），用于配置成片参数。

弹窗内需包含与设计图一致的两个区块：

1. **选择视频分辨率**：横向展示的卡片选项（如 `720P`——生成速度更快、`1080P`、`4K`——可与设计稿一致的说明文案）。`1080P`、`4K` 等与高清相关的档位若面向会员，可在选项角标展示 `VIP`，样式与非会员档位区分一致。用户点击 `1080P` 或 `4K` 时，若当前账号点数低于单次成片消耗（与底部展示的消耗点数一致，如 20 点），应弹出套餐购买弹窗（YOKE VIP：套餐档位、协议勾选、开通按钮），**不切换分辨率**；点数充足则正常选中该项。具体点数来源与支付接入由产品与后端约定。
2. **选择模型**：横向排列的模型卡片（如 `Seedance2.0`、`Vidu Q3`、`Happy horse1.0` 等），展示模型名称与简短说明文案。

**独立性约定**：分辨率与模型为两套独立状态，互不构成前置条件——切换分辨率不得自动改写已选模型，切换模型也不得自动改写已选分辨率；仅在发起生成任务时一并提交两个字段（或对应后端枚举）。接口设计时应对 `resolution`、`model`（或等价字段）分别定义，避免捆成单一组合码（除非后端明确要求）。

弹窗底部可提供与设计图一致的「生成视频」主按钮及点数消耗展示；点击后可关闭弹窗并触发与页面主按钮相同的提交流程（具体是否合并为同一函数由实现决定）。页面底部主按钮「生成视频」在关闭弹窗后同样使用当前分辨率与当前模型。

### 10.5 接口约定

如需保存商户信息，接口建议放在 `src/api/create.js`：

```js
import { request } from '@/utils/request'

export function saveBusinessProfile(data) {
  return request({
    url: '/create/business-profile',
    method: 'POST',
    data
  })
}

export function getBusinessCategories(params) {
  return request({
    url: '/create/business-categories',
    method: 'GET',
    data: params
  })
}
```

主营业务类目配置返回结构建议：

```json
[
  {
    "id": "core",
    "title": "核心品类",
    "required": true,
    "multiple": false,
    "options": [
      {
        "id": "hotpot",
        "name": "火锅",
        "children": [
          {
            "id": "style",
            "title": "风格 / 菜系（可多选）",
            "required": false,
            "multiple": true,
            "options": [
              {
                "id": "chongqing",
                "name": "重庆老火锅"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "custom",
    "title": "自定义",
    "required": false,
    "multiple": true,
    "custom": true,
    "options": []
  }
]
```

### 10.6 验收要点

- 首页点击“AI 一键成片”能进入一键成片页面。
- 页面顶部、欢迎文案、表单区域和底部按钮布局与设计图一致。
- 点击行业按钮后出现底部弹出层，选项按四列网格展示，选中项高亮，点击“确定”后回填行业。
- 点击主营业务按钮能进入主营业务选择页，并按当前行业加载对应类目配置。
- 主营业务选择页至少覆盖核心品类、风格 / 菜系、经营场景和自定义分组；实际分组和层级以接口返回为准。
- 核心品类未选择时不展示依赖分组；选择核心品类后再展示风格、经营场景等后续分组。
- 单选分组只能选一个，多选分组允许多个标签同时选中，自定义分组支持展示已添加标签和添加入口。
- 未完成所有必填分组时“确定”按钮置灰且不可提交，完成后按钮变为橙色并可点击。
- 必填项未填写时点击“下一步”有明确提示。
- 清空主营业务范围按钮可正常清空输入。
- 店铺/公司位置输入框可正常输入，未填写时点击“下一步”有明确提示。
- 点击地图选点能进入位置选择页，搜索框、候选位置、选中态和发送按钮展示符合设计图。
- 信息填写完毕后点击“下一步”能进入生成视频配置页。
- 生成视频配置页的视频模板、上传照片、出镜形象、视频文案和底部生成按钮展示符合设计图。
- 点击底部画质摘要区域可弹出「分辨率 + 模型」底部面板；分辨率与模型选项相互独立，切换其一不影响另一项的已选状态。
- 弹窗内分辨率、模型卡片的选中态与 VIP 角标（若有）符合设计图；弹窗底部操作区与安全区适配正常。
- 真机验证输入框、选择器、底部按钮和安全区显示正常。

## 11. 我的模块

我的模块以设计图为准，作为用户登录后的个人中心页面。页面需要承载用户资料、会员状态、点数资产、会员/点数入口、作品列表和底部导航，开发时应优先保证登录态读取稳定、资产数据准确、作品列表可分页加载。

### 11.1 页面定位

我的页面路径建议为 `pages/mine/index`，属于主包页面和底部导航入口。用户从底部导航进入后，应展示当前账号的个人资料、会员状态、点数余额和作品数据。

页面目标：

- 展示用户头像、昵称、会员状态和兑换码入口。
- 展示点数余额、主营业务入口；双卡展示 **VIP 会员中心** 与 **点数充值**（文案与活动价以后端/运营配置为准）。
- 聚合展示视频作品、我的形象、图片作品、文案作品等个人资产。
- 支持作品管理、分类切换和作品卡片跳转详情。
- 对未登录、会员未开通、作品为空等状态提供清晰引导。

### 11.2 页面模块拆分

根据设计图，我的页面从上到下拆分为以下模块：

| 模块 | 建议组件 | 说明 |
| --- | --- | --- |
| 顶部用户信息 | `MineUserHeader` | 展示头像、昵称、会员状态、会员兑换码按钮和橙色背景 |
| 资产快捷卡片 | `MineAssetBar` | 展示「我的点数」「主营业务」两个横向入口；点数取自 `userStore.points`（与登录态持久化一致） |
| 权益入口 | `MineBenefitCards` | 左右双卡：**VIP 会员中心**（橙渐变）、**点数充值**（深灰渐变）；圆内箭头图标经构建引入 SVG，勿写死 `/src/static/...` 路径（小程序端无法解析） |
| 作品分类 Tabs | `MineWorkTabs` | 视频作品、我的形象、图片作品、文案作品切换 |
| 作品概览 | `MineWorkSummary` | 展示“您已创作 xxx 条视频作品”和管理按钮 |
| 作品列表 | `MineWorkGrid` | 三列作品卡片，展示封面、播放按钮、时长和日期 |
| 我的设置 | `MineSettings` | 展示账号与安全、退出登录等设置项，退出登录入口统一放在此区域 |
| 底部导航 | `HomeTabBar` 或公共 `AppTabBar` | 首页、创作、我的三个入口，我的入口高亮 |

目录建议：

```text
src
├── pages
│   └── mine
│       ├── index.vue
│       └── components
│           ├── MineUserHeader.vue
│           ├── MineAssetBar.vue
│           ├── MineBenefitCards.vue
│           ├── MineWorkTabs.vue
│           ├── MineWorkSummary.vue
│           ├── MineWorkGrid.vue
│           └── MineSettings.vue
├── api
│   └── mine.js
└── stores
    └── mine.js
```

### 11.3 我的模块数据模型

我的模块数据建议由 `src/stores/mine.js` 管理，用户基础登录态仍由 `src/stores/user.js` 维护。`mine` store 只维护个人中心展示所需的资产、会员权益和作品列表。

建议字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `profile` | `Object` | 昵称、头像、会员状态等个人资料快照 |
| `points` | `Number` | 当前点数余额 |
| `member` | `Object` | 会员状态、会员标题、会员有效期、活动倒计时 |
| `recharge` | `Object` | 点数中心充值文案、充值档位和权益提示 |
| `workTabs` | `Array` | 作品分类 tab 配置 |
| `activeWorkType` | `String` | 当前选中的作品分类 |
| `workSummary` | `Object` | 当前分类作品数量和管理权限 |
| `works` | `Array` | 当前分类作品列表 |
| `settings` | `Array` | 我的设置项，例如账号与安全、退出登录 |
| `pagination` | `Object` | 页码、分页大小、是否还有更多 |
| `loading` | `Boolean` | 页面或列表加载状态 |

Store 示例：

```js
import { defineStore } from 'pinia'
import { getMineDashboard, getMineWorks } from '@/api/mine'

export const useMineStore = defineStore('mine', {
  state: () => ({
    profile: null,
    points: 0,
    member: null,
    recharge: null,
    workTabs: [
      { key: 'video', name: '视频作品' },
      { key: 'digitalHuman', name: '我的形象' },
      { key: 'image', name: '图片作品' },
      { key: 'copywriting', name: '文案作品' }
    ],
    activeWorkType: 'video',
    workSummary: {
      total: 0,
      unit: '条视频作品'
    },
    works: [],
    settings: [
      {
        key: 'account',
        name: '账号与安全',
        desc: '手机号、登录状态与账号资料'
      },
      {
        key: 'logout',
        name: '退出登录',
        desc: '退出当前账号并清理本地登录态'
      }
    ],
    pagination: {
      page: 1,
      pageSize: 12,
      hasMore: true
    },
    loading: false
  }),
  actions: {
    async fetchDashboard() {
      const data = await getMineDashboard()
      this.profile = data.profile
      this.points = data.points || 0
      this.member = data.member
      this.recharge = data.recharge
      this.workSummary = data.workSummary || this.workSummary
    },
    async fetchWorks(reset = false) {
      if (reset) {
        this.pagination.page = 1
        this.works = []
      }

      this.loading = true
      try {
        const data = await getMineWorks({
          type: this.activeWorkType,
          page: this.pagination.page,
          pageSize: this.pagination.pageSize
        })
        this.works = reset ? data.list || [] : this.works.concat(data.list || [])
        this.pagination.hasMore = Boolean(data.hasMore)
        this.pagination.page += 1
      } finally {
        this.loading = false
      }
    },
    switchWorkType(type) {
      if (this.activeWorkType === type) return
      this.activeWorkType = type
      this.fetchWorks(true)
    }
  }
})
```

### 11.4 接口约定

我的模块接口建议放在 `src/api/mine.js`。页面首屏可使用聚合接口获取用户资料、点数、会员卡片和作品概览，作品列表按分类分页接口获取。

```js
import { request } from '@/utils/request'

export function getMineDashboard() {
  return request({
    url: '/mine/dashboard',
    method: 'GET'
  })
}

export function getMineWorks(params) {
  return request({
    url: '/mine/works',
    method: 'GET',
    data: params
  })
}
```

接口返回建议：

```json
{
  "profile": {
    "nickname": "Cat - 先生",
    "avatar": "https://example.com/avatar.png",
    "memberStatus": "未开通会员"
  },
  "points": 344,
  "member": {
    "title": "会员中心",
    "subtitle": "永久免费 限时出货",
    "activityEndText": "活动 6天23:09:29"
  },
  "recharge": {
    "title": "点数中心",
    "subtitle": "充值折扣 限时优惠",
    "benefitText": "充1000点 得1200点"
  },
  "workSummary": {
    "total": 389,
    "unit": "条视频作品"
  },
  "works": []
}
```

作品列表字段建议：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `String` | 作品 ID |
| `type` | `String` | `video`、`digitalHuman`、`image`、`copywriting` |
| `cover` | `String` | 封面图地址 |
| `duration` | `String` | 视频时长，例如 `30s` |
| `createdDate` | `String` | 展示日期，例如 `26-4-20` |
| `title` | `String` | 作品标题，可用于详情页 |
| `status` | `String` | 作品状态，例如 `normal`、`processing`、`failed` |

### 11.5 页面交互规范

- 页面进入时先检查登录态；未登录时跳转登录页或展示登录引导。
- 会员兑换码按钮点击后进入兑换弹窗或兑换页面，兑换成功后刷新会员状态。
- 我的点数点击进入点数明细（或占位提示）；主营业务点击进入主营业务编辑/配置页（与一键成片表单联动，当前可为 toast 占位）。
- VIP 会员中心、点数充值卡片点击进入对应分包或业务页面（或占位提示）。
- 作品分类切换时只刷新作品列表和作品概览，不重置顶部用户信息。
- 作品管理按钮进入批量管理模式，支持选择、删除、移动分类等后续能力。
- 作品卡片点击进入作品详情；视频作品需要展示播放图标、时长和日期。
- 退出登录入口统一放在“我的设置”区域，不放在首页、启动弹窗、广告位或高频业务入口中。
- 点击退出登录时先展示确认弹窗，用户确认后调用后端退出接口；即使后端退出接口失败，也应清理本地登录态。
- 本地退出时调用 `userStore.clearLoginState()`，同时清理与账号强相关的 `mine`、`order`、`cart` 等模块缓存。
- 退出登录成功后给轻提示，并根据业务需要跳转登录页或在当前页面展示未登录状态。
- 下拉刷新重新获取用户资产、会员权益和当前作品列表。
- 上拉加载更多只请求当前 `activeWorkType` 的下一页作品。

### 11.6 样式与适配规范

- 顶部区域使用橙色渐变背景，可叠加弱纹理或半透明图层，但不应影响头像和文字可读性。
- 用户头像建议使用圆形裁切，缺省时展示默认头像。
- 会员中心和点数中心卡片使用左右双卡布局，宽度、圆角、阴影和间距保持一致。
- 作品分类 tab 使用横向均分布局，选中态使用橙色文字和短横线。
- 作品列表使用三列网格，封面比例建议接近设计图的竖向卡片比例。
- 作品卡片底部信息使用半透明黑色蒙层，保证白色文字在不同封面上可读。
- 我的设置区域使用独立白色卡片，设置项之间使用浅色分割线，退出登录文字可使用主色或警示色弱提示。
- 底部导航需要预留安全区高度，避免遮挡最后一行作品。

### 11.7 验收要点

- 登录后进入我的页面不白屏，用户头像、昵称、会员状态和点数能正常展示。
- 会员兑换、我的点数、主营业务、VIP 会员中心、点数充值均可点击并有明确跳转或提示。
- 视频作品 tab 默认选中，作品数量、封面、播放按钮、时长和日期展示正确。
- 切换“我的形象 / 图片作品 / 文案作品”时列表能刷新，空数据时展示空态。
- 退出登录入口位于我的设置区域，点击后出现确认弹窗，确认后清理登录态并更新页面状态。
- 下拉刷新和上拉加载更多逻辑正常，弱网或接口失败时保留已有数据并给轻提示。
- 真机验证顶部安全区、底部导航、安全区和作品网格滚动表现正常。

## 12. 分包策略

分包用于控制小程序主包体积、提升首屏加载速度，并按业务模块拆分页面资源。主体项目建议主包只保留首页、核心 tabBar 页面、登录页和公共能力，非首屏业务页面放入分包。

### 12.1 适用场景

建议使用分包的模块：

- 订单、报名、活动详情等非首屏业务模块。
- 页面数量较多、资源较重的独立业务。
- 使用频率较低但功能完整的模块，例如设置、帮助中心、协议说明。
- 后续可能独立迭代的业务域。

不建议放入分包的内容：

- 首页、tabBar 页面和登录页。
- 全局组件、全局样式、Pinia store、请求封装等公共基础能力。
- 多个分包都依赖的大型公共资源。

### 12.2 推荐目录结构

```text
src
├── pages                       # 主包页面
│   ├── home
│   ├── category
│   ├── mine
│   └── login
├── pages-sub                   # 分包页面统一目录
│   ├── order
│   │   ├── list.vue
│   │   └── detail.vue
│   ├── activity
│   │   ├── list.vue
│   │   └── detail.vue
│   └── settings
│       └── index.vue
└── static
    ├── tabbar
    └── sub                    # 分包可复用静态资源
```

分包目录命名建议：

- 统一使用 `pages-sub/<module>` 或 `subpackages/<module>`，项目内保持一种风格。
- 分包模块名使用语义化英文，例如 `order`、`activity`、`settings`。
- 分包内页面文件可按 `list.vue`、`detail.vue`、`index.vue` 命名。

### 12.3 pages.json 配置

`src/pages.json` 中通过 `subPackages` 声明分包。示例：

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
    },
    {
      "path": "pages/login/index",
      "style": {
        "navigationBarTitleText": "登录"
      }
    }
  ],
  "subPackages": [
    {
      "root": "pages-sub/order",
      "pages": [
        {
          "path": "list",
          "style": {
            "navigationBarTitleText": "订单列表"
          }
        },
        {
          "path": "detail",
          "style": {
            "navigationBarTitleText": "订单详情"
          }
        }
      ]
    },
    {
      "root": "pages-sub/activity",
      "pages": [
        {
          "path": "list",
          "style": {
            "navigationBarTitleText": "活动列表"
          }
        },
        {
          "path": "detail",
          "style": {
            "navigationBarTitleText": "活动详情"
          }
        }
      ]
    }
  ]
}
```

分包页面跳转示例：

```js
uni.navigateTo({
  url: '/pages-sub/order/detail?id=123'
})
```

### 12.4 主包与分包边界

- 主包只放启动必需页面、tabBar 页面、登录页和公共基础代码。
- 分包页面可以依赖主包中的 `api`、`stores`、`utils`、`components` 等公共模块。
- 分包之间不要直接相互依赖业务组件或页面逻辑，公共能力应上移到主包公共目录。
- 分包资源优先放在对应业务目录或 `static/sub/<module>`，避免把低频资源放入主包。
- tabBar 页面必须在主包中声明，不能作为分包页面。

### 12.5 分包预下载

对用户进入概率较高的分包，可使用 `preloadRule` 做预下载。示例：

```json
{
  "preloadRule": {
    "pages/home/index": {
      "network": "wifi",
      "packages": ["pages-sub/order"]
    }
  }
}
```

使用建议：

- 只预下载高频路径对应的分包，避免增加无效流量。
- 优先在 Wi-Fi 下预下载资源较大的分包。
- 预下载规则应结合埋点数据和真实入口路径调整。

### 12.6 注意事项

- 分包路径、页面跳转路径和 `pages.json` 声明必须保持一致。
- 分包新增页面后，需要在微信开发者工具中验证首次进入加载是否正常。
- 公共代码过多会继续进入主包，分包不能替代基础包体积治理。
- 大图、视频等资源优先使用 CDN，不建议随分包提交到仓库。
- 后续接入 CI 时，可增加主包和分包体积检查。

## 13. 样式规范

- 小程序页面尺寸优先使用 `rpx`。
- 全局变量放在 `src/uni.scss` 或 `src/styles/variables.scss`。
- 通用样式放在 `src/styles`，页面私有样式写在页面内并使用 `scoped`。
- 颜色、间距、字号应尽量使用设计变量，避免散落魔法值。

## 14. 静态资源规范

- 小图标和本地图片可放在 `src/static`。
- 业务图片优先使用 CDN 或后端返回地址。
- 图片命名使用语义化英文，例如 `icon-user-default.png`。
- 避免提交未压缩的大体积图片。

**图标与符号图（团队必读）**：为避免「黑底白标」「白底浅线」等与页面底色冲突导致图标不显示或糊成一团，新增或替换图标须遵守 **[静态资源与图标规范](./static-assets-icons.md)**（导出透明底、命名目录、小程序真机验收等）。提交 PR 前请对照该文档第五节自检清单。

## 15. 开发到上线流程

本章节用于约定从需求开发到小程序上线的完整执行顺序。每个功能模块应尽量按以下流程推进，避免只完成页面开发而遗漏联调、真机验证和上线检查。

### 15.1 需求与分支准备

1. 明确本次需求影响的页面、接口、状态模块、分包和权限范围。
2. 确认是否需要新增页面路由、tabBar、分包、Pinia store 或接口模块。
3. 从目标基础分支创建功能分支。
4. 拆分开发任务，优先确定页面结构、接口字段和状态流转。

准备清单：

- 页面入口和跳转路径已确认。
- 后端接口路径、请求方法、字段和错误码已确认。
- 是否需要登录、手机号授权、定位、支付等平台能力已确认。
- 是否需要新增分包或调整主包资源已确认。

### 15.2 本地开发

开发顺序建议：

1. 配置 `pages.json` 路由、导航栏、tabBar 或分包。
2. 编写页面骨架和局部组件。
3. 按组件规范引入通用组件、业务组件和页面私有组件。
4. 按业务领域补充 Pinia store。
5. 在 `src/api` 中新增业务接口函数。
6. 使用 hooks 或页面方法串联接口、状态和页面交互。
7. 补充 loading、空状态、错误提示和登录态处理。

开发注意事项：

- 页面不直接调用 `uni.request`，统一通过业务 API 调用。
- 组件不直接调用业务接口，不直接修改 Pinia store。
- 跨页面状态进入 Pinia，页面临时 UI 状态保留在页面内部。
- 分包页面新增后同步检查跳转路径和 `pages.json` 声明。

### 15.3 联调与自测

接口联调：

1. 使用开发或测试环境接口域名。
2. 检查请求参数、响应结构、错误码和 token 失效逻辑。
3. 验证登录态、手机号授权、权限拦截和退出登录流程。
4. 检查弱网、接口失败、空数据和分页加载等异常场景。

页面自测：

- 首次进入页面是否正常加载。
- 下拉刷新、上拉加载、返回上一页是否正常。
- tabBar 页面切换是否保持预期状态。
- 分包页面首次进入是否能正常下载和打开。
- 表单提交是否有防重复提交和必要校验。

### 15.4 真机与小程序能力验证

涉及微信能力的功能必须使用微信开发者工具和真机验证：

- 微信静默登录 `uni.login`。
- 手机号授权 `open-type="getPhoneNumber"`。
- 定位、相册、扫码、订阅消息、支付等平台能力。
- 合法域名、隐私协议、授权弹窗和基础库兼容性。
- 不同网络环境和不同机型上的页面表现。

### 15.5 提交前检查

提交前建议完成以下检查：

```bash
npm run build:mp-weixin
```

如项目后续补充 lint、format、test 脚本，提交前需要同步执行。

检查清单：

- 构建命令执行成功。
- 控制台无明显运行时报错。
- 新增页面已在 `pages.json` 中声明。
- 新增分包页面可通过路径正常进入。
- 新增接口已通过统一请求封装调用。
- 登录态、token 失效、手机号授权等关键流程已验证。
- 静态资源体积合理，大图优先走 CDN。

### 15.6 构建与提审

上线前流程：

1. 使用生产环境配置执行小程序构建。
2. 使用微信开发者工具打开构建产物。
3. 确认 AppID、版本号、基础库版本和服务器域名配置。
4. 预览核心页面，验证首页、tabBar、登录、关键业务路径。
5. 上传代码并填写版本说明。
6. 提交微信审核。

版本说明建议包含：

- 本次新增或调整的功能。
- 影响的页面或业务模块。
- 是否涉及登录、手机号、支付、定位等敏感能力。
- 是否存在需要运营或后端配合的配置项。

### 15.7 发布、回滚与上线后观察

发布前确认：

- 审核通过版本与预期提交一致。
- 后端生产接口、域名、证书和配置已准备完成。
- 必要的运营配置、开关配置和活动配置已生效。

发布后观察：

- 首页、登录、核心业务路径是否正常。
- 接口错误率、登录失败率、白屏或异常反馈是否增加。
- 用户反馈和客服问题是否集中在某个页面或机型。

回滚建议：

- 如果微信后台支持回退到上一稳定版本，优先回退小程序版本。
- 如果问题由配置引起，优先通过后端配置或运营配置回滚。
- 如果问题由接口兼容引起，前后端需要确认字段兼容和默认值策略。

## 16. 提交与分支约定

推荐分支命名：

- `feature/<module-name>`
- `fix/<issue-name>`
- `docs/<topic>`

推荐提交信息：

- `feat: add home page`
- `fix: handle login expired state`
- `docs: update frontend development guide`

## 17. 后续待补充内容

后续可继续扩展以下章节：

- 业务页面清单
- 接口字段说明
- 登录模块接口字段细化
- 权限与隐私弹窗
- 错误码与异常处理
- 埋点规范
- 上线检查模板
- 回滚操作记录模板
- 常见问题

