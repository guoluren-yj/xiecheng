// 商品创建的个性化

// 采购方单元
const purchaseCode = {
  // 基本信息
  BASE_INFO: 'SMPC.WORKBENCH_PUR.BASE_INFO',
  // 商品组名称
  SPU_INFO: 'SMPC.WORKBENCH_PUR.SPU_INFO',
  // 商品行表格
  SKU_LIST: 'SMPC.WORKBENCH_PUR.SKU_LIST',
  // 基本属性扩展表单
  SKU_ATTRS: 'SMPC.WORKBENCH_PUR.SKU_ATTRS',
  // 价格信息表格
  SALE_INFO: 'SMPC.WORKBENCH_PUR.EDIT.SALE_INFO',
  // 物料信息表单
  ITEM_INFO: 'SMPC.WORKBENCH_PUR.ITEM_INFO',
  // 商品属性区域卡片
  ATTR_CARD: 'SMPC.WORKBENCH_PUR.ATTR_CARD',
  // 售后退货单元
  AFS_RETURN: 'SMPC.WORKBENCH_PUR.AFS_RETURN',
  // 售后换货单元
  AFS_EXCHANGE: 'SMPC.WORKBENCH_PUR.AFS_EXCHANGE',
  // 售后 质保单元
  // AFS_QUANTITY: 'SMPC.WORKBENCH_PUR.AFS_QUANTITY',
  // 第三方信息
  THIRD_INFO: 'SMPC.WORKBENCH_PUR.EDIT.THIRD_INFO',
  // 快速编辑卡片
  QUICK_EDIT: 'SMPC.WORKBENCH_PUR.QUICK_EDIT',
};
// 供应商单元
const supplierCode = {
  // 基本信息
  BASE_INFO: 'SMPC.WORKBENCH_SUP.BASE_INFO',
  // 商品组名称
  SPU_INFO: 'SMPC.WORKBENCH_SUP.SPU_INFO',
  // 商品行表格
  SKU_LIST: 'SMPC.WORKBENCH_SUP.SKU_LIST',
  // 基本属性扩展表单
  SKU_ATTRS: 'SMPC.WORKBENCH_SUP.SKU_ATTRS',
  // 价格信息表格
  SALE_INFO: 'SMPC.WORKBENCH_SUP.EDIT.SALE_INFO',
  // 物料信息表单
  ITEM_INFO: 'SMPC.WORKBENCH_SUP.ITEM_INFO',
  // 商品属性区域卡片
  ATTR_CARD: 'SMPC.WORKBENCH_SUP.ATTR_CARD',
  // 售后退货单元
  AFS_RETURN: 'SMPC.WORKBENCH_SUP.AFS_RETURN',
  // 售后换货单元
  AFS_EXCHANGE: 'SMPC.WORKBENCH_SUP.AFS_EXCHANGE',
  // 售后 质保单元
  //  AFS_QUANTITY: 'SMPC.WORKBENCH_SUP.AFS_QUANTITY',
  // 第三方信息
  THIRD_INFO: 'SMPC.WORKBENCH_SUP.EDIT.THIRD_INFO',
  // 快速编辑卡片
  QUICK_EDIT: 'SMPC.WORKBENCH_SUP.QUICK_EDIT',
};

const receiveCode = {
  // 基本信息
  BASE_INFO: 'SMPC.WORKBENCH_PUR.RECEIVE.BASE_INFO',
  // 商品行表格
  SKU_LIST: 'SMPC.WORKBENCH_PUR.RECEIVE.SKU_LIST',
  // 快速编辑卡片
  QUICK_EDIT: 'SMPC.WORKBENCH_PUR.RECEIVE.QUICK_EDIT',
  // 价格信息表格
  SALE_INFO: 'SMPC.WORKBENCH_PUR.RECEIVE.SALE_INFO',
  // 物料信息表单
  ITEM_INFO: 'SMPC.WORKBENCH_PUR.RECEIVE.ITEM_INFO',
  // 基本属性扩展表单
  SKU_ATTRS: 'SMPC.WORKBENCH_PUR.RECEIVE.SKU_ATTRS',
};

export default {
  custFuncs: {},
  setCustFuncs(nextCustFuncs = {}) {
    this.custFuncs = { ...this.custFuncs, ...nextCustFuncs };
  },
  getCustFuncs() {
    return this.custFuncs;
  },
  customCode: {},
  setCustomCode(isSup) {
    const { isReceive } = this.state;
    if (isReceive) {
      this.customCode = receiveCode;
    } else {
      this.customCode = isSup ? supplierCode : purchaseCode;
    }
  },
  getCustomCode(codeKey) {
    return this.customCode[codeKey];
  },
  getAllCustomCode: () => {
    const codes = []
      .concat(Object.values(purchaseCode))
      .concat(Object.values(supplierCode))
      .concat(Object.values(receiveCode));
    return [...new Set(codes)];
  },
  // 个性化配置
  custConfig: {},
  setCustConfig(custConfig) {
    if (custConfig) {
      this.custConfig = custConfig;
    }
  },
  getCustConfig(codeKey) {
    const code = this.customCode[codeKey];
    return this.custConfig[code];
  },
  // 一些通用的持久化状态
  state: {},
  setState(key, value) {
    this.state[key] = value;
  },
  getState(key) {
    return key ? this.state[key] : this.state;
  },
};
