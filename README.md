# yoke

基于 uni-app Vue2 的底部自定义 tabBar 示例，按设计图实现三栏底部导航：

- 左侧：首页入口，橙色选中态
- 中间：悬浮渐变圆形主按钮
- 右侧：我的入口，灰色未选中态

## 本地运行

```bash
npm install
npm run dev:h5
```

## 构建

```bash
npm run build:h5
```

## 关键文件

- `src/components/YokeTabBar.vue`：底部自定义 tabBar
- `src/pages.json`：关闭原生 tabBar，配置三个页面
- `src/pages/home/index.vue`：设计图页面示例
