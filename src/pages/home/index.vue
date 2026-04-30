<template>
  <view class="page">
    <view class="top">
      <view>
        <text class="brand">有客</text>
        <text class="brand-en">YOKE</text>
      </view>
      <view class="date">4.22 星期三</view>
      <view class="capsule">
        <text></text>
        <text></text>
      </view>
    </view>

    <view class="score-card">
      <view class="score-title">今日爆款评分</view>
      <view class="filters">
        <text>平台</text>
        <text>行业</text>
      </view>
      <view class="score-row">
        <view class="score">92<text>分</text></view>
        <view>
          <text class="label">销售额</text>
          <text class="value">1.3万</text>
        </view>
        <view>
          <text class="label">浏览量</text>
          <text class="value">3,278</text>
        </view>
        <view>
          <text class="label">转化率</text>
          <text class="value">2.1%</text>
        </view>
      </view>
      <view class="tip">小提示：紧跟爆款趋势，客户转化将提升。</view>
    </view>

    <section-title title="今日爆款内容" action="换一批" />
    <scroll-view scroll-x class="cards-scroll" show-scrollbar="false">
      <view class="content-card" v-for="item in hotList" :key="item.title">
        <view class="cover" :class="item.theme"></view>
        <text class="content-title">{{ item.title }}</text>
        <view class="content-meta">
          <text>{{ item.tag }}</text>
          <text>{{ item.hot }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="quick-actions">
      <view class="quick-btn">
        <view class="quick-icon camera-icon"></view>
        <text>AI一键成片</text>
      </view>
      <view class="quick-btn">
        <view class="quick-icon chart-icon"></view>
        <text>引流数据</text>
      </view>
    </view>

    <section-title title="数字人视频" action="全部形象" />
    <view class="avatar-panel">
      <view class="create-avatar">
        <text class="plus">+</text>
        <text>创建数字形象</text>
      </view>
      <view class="avatar-card" v-for="avatar in avatars" :key="avatar.name">
        <view class="avatar-face" :class="avatar.theme"></view>
        <text>{{ avatar.name }}</text>
      </view>
    </view>

    <section-title title="视频创作" action="创作技巧" />
    <view class="creation-card">
      <text>数字人创作</text>
      <text>作品 289</text>
      <button>开始创作</button>
    </view>

    <view class="tool-grid">
      <view class="tool-card" v-for="tool in tools" :key="tool.name">
        <text>{{ tool.name }}</text>
        <text>{{ tool.en }}</text>
      </view>
    </view>

    <YokeTabBar active-key="home" />
  </view>
</template>

<script>
import SectionTitle from './section-title.vue'
import YokeTabBar from '@/components/YokeTabBar.vue'

export default {
  components: {
    SectionTitle,
    YokeTabBar
  },
  data() {
    return {
      hotList: [
        { title: '探店场景这样拍', tag: '美食', hot: '3.2w', theme: 'orange' },
        { title: '招商话术排练', tag: '招商', hot: '2.1w', theme: 'green' },
        { title: '团购引流这样做', tag: '生活', hot: '2.0w', theme: 'blue' }
      ],
      avatars: [
        { name: '热门数字人', theme: 'warm' },
        { name: '新鲜事', theme: 'cool' }
      ],
      tools: [
        { name: '文案生成', en: 'Text to Image' },
        { name: '人物换装', en: 'Outfit Swap' },
        { name: '图片高清化', en: 'HD Enhance' }
      ]
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 20rpx 20rpx 170rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, #ff9635 0, #ffab44 250rpx, #f7f7f7 250rpx, #f7f7f7 100%);
  color: #222;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 30rpx 0 18rpx;
  color: #1f1f1f;
  font-size: 28rpx;
  font-weight: 800;

  text:last-child {
    color: #999;
    font-size: 20rpx;
    font-weight: 400;
  }
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 84rpx;
  padding-top: 10rpx;
}

.brand {
  font-size: 38rpx;
  font-weight: 800;
}

.brand-en {
  margin-left: 8rpx;
  font-size: 18rpx;
  font-weight: 700;
  color: #fff8e8;
}

.date {
  font-size: 22rpx;
  color: #fff7e8;
}

.capsule {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  width: 88rpx;
  height: 38rpx;
  border-radius: 22rpx;
  background: #fff6eb;

  text {
    width: 8rpx;
    height: 8rpx;
    border-radius: 50%;
    background: #111;
  }
}

.score-card {
  margin-top: 18rpx;
  padding: 22rpx;
  border-radius: 26rpx;
  background: rgba(255, 237, 214, 0.9);
  box-shadow: 0 14rpx 30rpx rgba(178, 96, 17, 0.16);
}

.score-title,
.label {
  font-size: 22rpx;
  color: #76542d;
}

.filters {
  float: right;
  display: flex;
  gap: 14rpx;
  margin-top: -30rpx;

  text {
    padding: 8rpx 28rpx;
    border-radius: 20rpx;
    background: #fff5e7;
    font-size: 20rpx;
    color: #8c6030;
  }
}

.score-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 18rpx;
}

.score {
  color: #2d3640;
  font-size: 54rpx;
  font-weight: 800;

  text {
    margin-left: 4rpx;
    color: #ffae39;
    font-size: 24rpx;
  }
}

.value {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  font-weight: 700;
}

.tip {
  margin-top: 18rpx;
  padding: 10rpx 22rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.5);
  font-size: 18rpx;
  color: #9b7b53;
}

.cards-scroll {
  white-space: nowrap;
}

.content-card {
  display: inline-flex;
  flex-direction: column;
  width: 154rpx;
  height: 210rpx;
  margin-right: 14rpx;
  padding: 8rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.08);
  vertical-align: top;
}

.cover {
  height: 112rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #ffb45a, #ffd7a4);
}

.cover.green {
  background: linear-gradient(135deg, #a5ce7c, #e7f3cc);
}

.cover.blue {
  background: linear-gradient(135deg, #80b5e7, #e5f1fb);
}

.content-title {
  margin-top: 10rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.content-meta {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  font-size: 18rpx;
  color: #ff9c3f;
}

.quick-actions {
  display: flex;
  gap: 20rpx;
  margin: 30rpx 0;
}

.quick-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 18rpx 26rpx;
  border-radius: 50rpx;
  background: #fff0da;
  color: #4d4034;
  font-size: 28rpx;
  font-weight: 700;
}

.quick-icon {
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  background: #f58620;
}

.chart-icon {
  border-radius: 8rpx;
}

.avatar-panel {
  display: flex;
  gap: 14rpx;
}

.create-avatar,
.avatar-card {
  width: 142rpx;
  height: 178rpx;
  border-radius: 28rpx;
  overflow: hidden;
}

.create-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #ffc983;
  color: #fff;
  font-size: 22rpx;
}

.plus {
  width: 40rpx;
  height: 40rpx;
  margin-bottom: 16rpx;
  border-radius: 50%;
  background: #fff;
  color: #ffc983;
  text-align: center;
  line-height: 40rpx;
}

.avatar-card {
  position: relative;
  background: #fff;
}

.avatar-card text {
  position: absolute;
  left: 12rpx;
  top: 12rpx;
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
}

.avatar-face {
  height: 100%;
  background: radial-gradient(circle at 50% 35%, #ffe0c9 0 26rpx, transparent 27rpx),
    linear-gradient(135deg, #815138, #e7b190);
}

.avatar-face.cool {
  background: radial-gradient(circle at 50% 35%, #ffe0c9 0 26rpx, transparent 27rpx),
    linear-gradient(135deg, #273851, #7aa3c8);
}

.creation-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #54514e, #151515);
  color: #fff;
}

.creation-card text {
  font-size: 24rpx;
}

.creation-card button {
  height: 48rpx;
  padding: 0 28rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.7);
  border-radius: 28rpx;
  background: transparent;
  color: #fff;
  font-size: 22rpx;
  line-height: 44rpx;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18rpx;
  margin-top: 30rpx;
}

.tool-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 126rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.04);
}

.tool-card text:first-child {
  color: #4b4b4b;
  font-size: 24rpx;
  font-weight: 700;
}

.tool-card text:last-child {
  margin-top: 8rpx;
  color: #bbb;
  font-size: 16rpx;
}
</style>
