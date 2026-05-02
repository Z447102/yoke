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

静默登录请求参数建议：

```json
{
  "code": "wechat login code"
}
```

手机号登录请求参数建议：

```json
{
  "code": "phone number code"
}
```

统一返回结构建议：

```json
{
  "token": "token value",
  "profile": {
    "id": "user id",
    "nickname": "用户昵称",
    "avatar": "头像地址",
    "phone": "手机号"
  },
  "needBindPhone": false,
  "expiresIn": 7200
}
```

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

## 9. 分包策略

分包用于控制小程序主包体积、提升首屏加载速度，并按业务模块拆分页面资源。主体项目建议主包只保留首页、核心 tabBar 页面、登录页和公共能力，非首屏业务页面放入分包。

### 9.1 适用场景

建议使用分包的模块：

- 订单、报名、活动详情等非首屏业务模块。
- 页面数量较多、资源较重的独立业务。
- 使用频率较低但功能完整的模块，例如设置、帮助中心、协议说明。
- 后续可能独立迭代的业务域。

不建议放入分包的内容：

- 首页、tabBar 页面和登录页。
- 全局组件、全局样式、Pinia store、请求封装等公共基础能力。
- 多个分包都依赖的大型公共资源。

### 9.2 推荐目录结构

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

### 9.3 pages.json 配置

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

### 9.4 主包与分包边界

- 主包只放启动必需页面、tabBar 页面、登录页和公共基础代码。
- 分包页面可以依赖主包中的 `api`、`stores`、`utils`、`components` 等公共模块。
- 分包之间不要直接相互依赖业务组件或页面逻辑，公共能力应上移到主包公共目录。
- 分包资源优先放在对应业务目录或 `static/sub/<module>`，避免把低频资源放入主包。
- tabBar 页面必须在主包中声明，不能作为分包页面。

### 9.5 分包预下载

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

### 9.6 注意事项

- 分包路径、页面跳转路径和 `pages.json` 声明必须保持一致。
- 分包新增页面后，需要在微信开发者工具中验证首次进入加载是否正常。
- 公共代码过多会继续进入主包，分包不能替代基础包体积治理。
- 大图、视频等资源优先使用 CDN，不建议随分包提交到仓库。
- 后续接入 CI 时，可增加主包和分包体积检查。

## 10. 样式规范

- 小程序页面尺寸优先使用 `rpx`。
- 全局变量放在 `src/uni.scss` 或 `src/styles/variables.scss`。
- 通用样式放在 `src/styles`，页面私有样式写在页面内并使用 `scoped`。
- 颜色、间距、字号应尽量使用设计变量，避免散落魔法值。

## 11. 静态资源规范

- 小图标和本地图片可放在 `src/static`。
- 业务图片优先使用 CDN 或后端返回地址。
- 图片命名使用语义化英文，例如 `icon-user-default.png`。
- 避免提交未压缩的大体积图片。

## 12. 开发流程

1. 从目标基础分支创建功能分支。
2. 根据页面或模块拆分开发任务。
3. 先补充页面结构、路由配置和基础状态。
4. 再接入接口请求和异常处理。
5. 使用微信开发者工具进行页面、授权、网络和真机验证。
6. 提交前检查格式、构建结果和核心流程。

## 13. 提交与分支约定

推荐分支命名：

- `feature/<module-name>`
- `fix/<issue-name>`
- `docs/<topic>`

推荐提交信息：

- `feat: add home page`
- `fix: handle login expired state`
- `docs: update frontend development guide`

## 14. 后续待补充内容

后续可继续扩展以下章节：

- 业务页面清单
- 接口字段说明
- 登录模块接口字段细化
- 权限与隐私弹窗
- 错误码与异常处理
- 埋点规范
- 发布与回滚流程
- 常见问题

