// 商品批量上下架审批个性化
// 采购方单元
const purchaseCode = {
  CATA_BASE_INFO: 'SMPC.WORKFLOW.CATA_SHELF_APPROVE.BASE_INFO',
  CATA_PRICE_INFO: 'SMPC.WORKFLOW.CATA_SHELF_APPROVE.PRICE_INFO',
  CATA_ITEM_INFO: 'SMPC.WORKFLOW.CATA_SHELF_APPROVE.ITEM_INFO',
  EC_BASE_INFO: 'SMPC.WORKFLOW.EC_SHELF_APPROVE.BASE_INFO',
  EC_PRICE_INFO: 'SMPC.WORKFLOW.EC_SHELF_APPROVE.PRICE_INFO',
  EC_ITEM_INFO: 'SMPC.WORKFLOW.EC_SHELF_APPROVE.ITEM_INFO',
};

const supplierCode = {};

export default {
  custFuncs: {},
  setCustFuncs(nextCustFuncs = {}) {
    this.custFuncs = { ...this.custFuncs, ...nextCustFuncs };
  },
  getCustFuncs() {
    return this.custFuncs;
  },
  customCode: {},
  setCustomCode(isSup = false) {
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
