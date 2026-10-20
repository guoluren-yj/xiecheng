// 有特殊颜色的需要设置dotColor 否则为默认的颜色
const colorMap = {
  green: '#47B881',
  red: '#F56649',
};

// 每个消息编码对应一种类型的icon 和 lineColor
const StyleMap = {
  // 版本管理
  // 创建
  's2ful.region.version.creation': {
    icon: 'add',
  },
  // 启用
  's2ful.region.version.enable': {
    icon: 'finished',
  },
  // 禁用
  's2ful.region.version.disable': {
    icon: 'block',
  },
  // 继承
  's2ful.region.version.extend': {
    icon: 'account_tree-o',
  },
  // 继承成功
  's2ful.region.version.extend.success': {
    icon: 'account_tree-o',
    dotColor: colorMap.green,
  },
  // 继承失败
  's2ful.region.version.extend.failed': {
    icon: 'account_tree-o',
    dotColor: colorMap.red,
  },
  // 租户版本管理
  // 分配
  's2ful.region.version.allot': {
    icon: 'auto_complete',
  },
  // 版本升级
  's2ful.region.version.upgrade': {
    icon: 'arrow_circle_up-o',
  },
};

export {StyleMap};