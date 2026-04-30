<template>
  <view class="yoke-tabbar">
    <view class="tabbar-inner">
      <view
        v-for="item in sideTabs"
        :key="item.key"
        class="tabbar-item"
        :class="{ 'is-active': resolvedActiveKey === item.key }"
        @tap="handleTap(item)"
      >
        <view class="tabbar-icon" :class="['icon-' + item.icon]">
          <template v-if="item.icon === 'home'">
            <view class="home-roof"></view>
            <view class="home-body"></view>
            <view class="home-base"></view>
          </template>
          <template v-else>
            <view class="profile-head profile-head-left"></view>
            <view class="profile-head profile-head-right"></view>
            <view class="profile-body profile-body-left"></view>
            <view class="profile-body profile-body-right"></view>
          </template>
        </view>
        <text class="tabbar-label">{{ item.text }}</text>
      </view>

      <view class="tabbar-center-wrap" @tap="handleTap(centerTab)">
        <view class="tabbar-center" :class="{ 'is-active': resolvedActiveKey === centerTab.key }">
          <view class="center-figure">
            <view class="figure-head"></view>
            <view class="figure-body"></view>
            <view class="figure-arm figure-arm-left"></view>
            <view class="figure-arm figure-arm-right"></view>
            <view class="figure-leg figure-leg-left"></view>
            <view class="figure-leg figure-leg-right"></view>
          </view>
        </view>
        <text class="tabbar-label center-label">{{ centerTab.text }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'YokeTabBar',
  props: {
    activeKey: {
      type: String,
      default: 'home'
    },
    current: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      sideTabs: [
        {
          key: 'home',
          text: '首页',
          icon: 'home',
          url: '/pages/home/index'
        },
        {
          key: 'profile',
          text: '我的',
          icon: 'profile',
          url: '/pages/profile/index'
        }
      ],
      centerTab: {
        key: 'create',
        text: '创作',
        url: '/pages/create/index'
      }
    }
  },
  computed: {
    resolvedActiveKey() {
      return this.current || this.activeKey
    }
  },
  methods: {
    handleTap(item) {
      this.$emit('change', item)

      const pages = getCurrentPages()
      const current = pages[pages.length - 1]
      const currentPath = current && `/${current.route}`

      if (currentPath !== item.url) {
        uni.switchTab({ url: item.url })
      }
    }
  }
}
</script>

<style scoped>
.yoke-tabbar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 99;
  height: calc(98rpx + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: #f4f4f4;
  box-shadow: 0 -8rpx 28rpx rgba(0, 0, 0, 0.04);
}

.tabbar-inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 98rpx;
  padding: 0 46rpx;
}

.tabbar-item {
  display: flex;
  width: 120rpx;
  height: 98rpx;
  align-items: center;
  justify-content: center;
  color: #c8c8c8;
}

.tabbar-item:first-child {
  justify-content: flex-start;
}

.tabbar-item:last-child {
  justify-content: flex-end;
}

.tabbar-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
}

.tabbar-icon {
  position: relative;
  width: 54rpx;
  height: 54rpx;
}

.icon-home {
  color: #ff9d3d;
}

.home-roof {
  position: absolute;
  top: 3rpx;
  left: 7rpx;
  width: 40rpx;
  height: 32rpx;
  border-radius: 10rpx 10rpx 7rpx 7rpx;
  background: currentColor;
  transform: rotate(45deg);
}

.home-body {
  position: absolute;
  right: 5rpx;
  bottom: 8rpx;
  left: 5rpx;
  height: 30rpx;
  border-radius: 7rpx 7rpx 12rpx 12rpx;
  background: currentColor;
}

.home-base {
  position: absolute;
  bottom: 2rpx;
  left: 10rpx;
  width: 34rpx;
  height: 7rpx;
  border-radius: 8rpx;
  background: currentColor;
}

.icon-profile {
  color: #c8c8c8;
}

.profile-head,
.profile-body {
  position: absolute;
  background: currentColor;
}

.profile-head {
  top: 5rpx;
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
}

.profile-head-left {
  left: 8rpx;
}

.profile-head-right {
  right: 8rpx;
}

.profile-body {
  bottom: 5rpx;
  width: 28rpx;
  height: 30rpx;
  border-radius: 22rpx 22rpx 10rpx 10rpx;
}

.profile-body-left {
  left: 2rpx;
}

.profile-body-right {
  right: 2rpx;
}

.tabbar-center-wrap {
  position: absolute;
  top: -38rpx;
  left: 50%;
  display: flex;
  width: 112rpx;
  height: 112rpx;
  align-items: center;
  justify-content: center;
  border: 9rpx solid #fff;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 8rpx 22rpx rgba(255, 165, 61, 0.2);
  transform: translateX(-50%);
}

.tabbar-center {
  position: relative;
  width: 92rpx;
  height: 92rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff9441 0%, #ffc45d 100%);
}

.center-figure {
  position: absolute;
  top: 19rpx;
  left: 50%;
  width: 50rpx;
  height: 58rpx;
  transform: translateX(-50%);
}

.figure-head,
.figure-body,
.figure-arm,
.figure-leg {
  position: absolute;
  background: #fff;
}

.figure-head {
  top: 0;
  left: 23rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
}

.figure-body {
  top: 13rpx;
  left: 25rpx;
  width: 7rpx;
  height: 25rpx;
  border-radius: 8rpx;
  transform: rotate(14deg);
}

.figure-arm {
  top: 19rpx;
  height: 7rpx;
  border-radius: 8rpx;
  transform-origin: right center;
}

.figure-arm-left {
  left: 4rpx;
  width: 26rpx;
  transform: rotate(35deg);
}

.figure-arm-right {
  right: 6rpx;
  width: 24rpx;
  transform: rotate(-54deg);
  transform-origin: left center;
}

.figure-leg {
  top: 34rpx;
  height: 7rpx;
  border-radius: 8rpx;
  transform-origin: top center;
}

.figure-leg-left {
  left: 14rpx;
  width: 27rpx;
  transform: rotate(112deg);
}

.figure-leg-right {
  right: 7rpx;
  width: 28rpx;
  transform: rotate(66deg);
}
</style>
