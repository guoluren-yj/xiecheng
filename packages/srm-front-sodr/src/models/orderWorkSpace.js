/*
 * planSheet - 订单工作台
 * @date: 2021/8/18 11:49:14
 * @author: mjq <jiaqi.mao@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
const INIT_STATE = {
  redioKey: 'wholeorder',
  activeKey: 'toBeSubmited',
  detailActiveKey: 'detailFeedback',
  initFlag: false,
  referenceRedioKey: 'detail',
  referenceActiveKey: 'wholePurchaseRequest',
  referenceDetailActiveKey: 'purchaseRequest',
  // referenceInitFlag: false,
};
export default {
  namespace: 'orderWorkSpace',

  state: {
    ...INIT_STATE,
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    initState(state) {
      return {
        ...state,
        ...INIT_STATE,
      };
    },
  },
};
