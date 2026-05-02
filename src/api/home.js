const mockHomeDashboard = {
  scoreSummary: {
    score: 92,
    scoreTrend: 'up',
    clueCount: '1.3万',
    viewCount: '3,278',
    conversionRate: '2.1%',
    platform: '平台',
    industry: '行业'
  },
  hotContents: [
    {
      id: 1,
      title: '探店视频这样拍',
      desc: '吸引转化客户',
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=300&h=220&fit=crop',
      tag: '家居',
      heat: '3.2w'
    },
    {
      id: 2,
      title: '招聘海报这样拍',
      desc: '让老板人看了有食欲',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=220&fit=crop',
      tag: '商超餐饮',
      heat: '2.1w'
    },
    {
      id: 3,
      title: '团购引流这样拍',
      desc: '让老人都爱买真特色',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=220&fit=crop',
      tag: '团购生活',
      heat: '2.1w'
    }
  ],
  digitalHumans: [
    {
      id: 1,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=220&h=260&fit=crop',
      tag: '视频脚本',
      playable: false
    },
    {
      id: 2,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=220&h=260&fit=crop',
      tag: '新程女士',
      playable: true
    }
  ],
  creationStats: {
    digitalHuman: 289,
    imageToVideo: 123,
    videoEdit: 96
  },
  smartTools: [
    { key: 'textToImage', name: '文字生图', desc: 'Text to Image', icon: '🖼' },
    { key: 'outfitSwap', name: '人物换装', desc: 'Outfit Swap', icon: '👕' },
    { key: 'hdImage', name: '图片高清化', desc: 'HD Enhance', icon: 'HD' },
    { key: 'extract', name: '智能提取', desc: 'Smart Extract', icon: '▥' }
  ],
  copywritingTools: [
    { key: 'brand', name: '企业宣传', desc: 'Co. Promotion', icon: '♨' },
    { key: 'rewrite', name: '文案仿写', desc: 'Copy Rewriting', icon: '↝' },
    { key: 'ecommerce', name: '电商带货', desc: 'Copy Extraction', icon: '♪' }
  ]
}

export function getHomeDashboard() {
  return Promise.resolve(mockHomeDashboard)
}
