import { createContext } from 'react';

export default createContext({
  hiddenSku: 'n', // 是否隐藏商品切换
  showHistory: false, // 是否对比形式
  onSkuChange: (e) => e, // 商品切换
  // 工作流审批用到的：
  onViewChange: () => null, // 视图切换
  onlyShowUpdateItem: false, // 仅显示变更项视图
  changeFlag: false, // 是否已变更单据
});
