<script setup>
/**
 * 兼容桩：部分真机/开发者工具在缓存下仍会请求 `pages/components/NavBar2.js`。
 * 实现委托给 MineVipNavBar（父级传入的 props / 事件会透传到单根子组件）。
 */
import MineVipNavBar from './MineVipNavBar.vue'
</script>

<template>
  <MineVipNavBar />
</template>
