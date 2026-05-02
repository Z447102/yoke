const businessCategoryTree = {
  '餐饮': [
    {
      id: 'hot-pot',
      name: '火锅',
      children: [
        { id: 'sichuan-hot-pot', name: '川渝火锅' },
        { id: 'beef-hot-pot', name: '牛肉火锅' },
        { id: 'fish-hot-pot', name: '鱼火锅' }
      ]
    },
    {
      id: 'barbecue',
      name: '烧烤',
      children: [
        { id: 'night-barbecue', name: '夜宵烧烤' },
        { id: 'korean-barbecue', name: '韩式烤肉' }
      ]
    },
    {
      id: 'fast-food',
      name: '快餐（面 / 饭）',
      children: [
        { id: 'rice-set', name: '盖饭套餐' },
        { id: 'noodle', name: '面馆' }
      ]
    },
    { id: 'snack', name: '小吃' },
    { id: 'seafood', name: '海鲜' },
    { id: 'roast-meat', name: '烤肉' },
    { id: 'restaurant', name: '正餐（家常菜 / 酒楼）' },
    { id: 'western-food', name: '西餐 / 异国料理' },
    { id: 'drink', name: '饮品' },
    { id: 'dessert', name: '甜品烘焙' }
  ],
  '美业': [
    {
      id: 'hair',
      name: '美发',
      children: [
        { id: 'hair-cut', name: '剪发造型' },
        { id: 'hair-color', name: '染烫护理' }
      ]
    },
    { id: 'nail', name: '美甲美睫' },
    { id: 'skin-care', name: '皮肤管理' }
  ]
}

export function getBusinessCategories(industry = '餐饮') {
  return Promise.resolve({
    industry,
    levels: businessCategoryTree[industry] || businessCategoryTree['餐饮']
  })
}
