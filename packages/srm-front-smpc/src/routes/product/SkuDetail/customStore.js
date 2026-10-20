// 商品明细的个性化

// 采购方单元
const purchaseCode = {
  // 商品组信息
  SPU_INFO: 'SMPC.WORKBENCH_PUR.BASE_INFO_READ',
  // 商品组信息对比
  SPU_INFO_2: 'SMPC.WORKBENCH_PUR.BASE_INFO_COMPARE',
  // 商品信息
  SKU_INFO: 'SMPC.WORKBENCH_PUR.SKU_INFO_READ',
  // 商品信息对比
  SKU_INFO_2: 'SMPC.WORKBENCH_PUR.SKU_INFO_COMPARE',
  // 价格信息
  PRICE_INFO: 'SMPC.WORKBENCH_PUR.SKU_PRICEINFO_READ',
  WORKFLOW_PRICE_INFO: 'SMPC.WORKBENCH_PUR.SKU_FLOW_PRICE_INFO_READ',
  // 基本属性扩展
  SKU_ATTR: 'SMPC.WORKBENCH_PUR.SKU_ATTRS_READ',
};
// 供应商单元
const supplierCode = {
  // 商品组信息
  SPU_INFO: 'SMPC.WORKBENCH_SUP.BASE_INFO_READ',
  // 商品组信息对比
  SPU_INFO_2: 'SMPC.WORKBENCH_SUP.BASE_INFO_COMPARE',
  // 商品信息
  SKU_INFO: 'SMPC.WORKBENCH_SUP.SKU_INFO_READ',
  // 商品信息对比
  SKU_INFO_2: 'SMPC.WORKBENCH_SUP.SKU_INFO_COMPARE',
  // 价格信息
  PRICE_INFO: 'SMPC.WORKBENCH_SUP.SKU_PRICEINFO_READ',
  // 基本属性扩展
  SKU_ATTR: 'SMPC.WORKBENCH_SUP.SKU_ATTRS_READ',
  DETAIL_BTNS: 'SMPC.WORKBENCH_SUP.BTNS',
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
      this.customCode = {};
    } else {
      this.customCode = isSup ? supplierCode : purchaseCode;
    }
  },
  getCustomCode(codeKey) {
    return this.customCode[codeKey];
  },
  getAllCustomCode: () => {
    const codes = [].concat(Object.values(purchaseCode)).concat(Object.values(supplierCode));
    return [...new Set(codes)];
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
