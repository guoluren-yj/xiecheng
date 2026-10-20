import { getResponse } from 'utils/utils';
import { getLayout } from '@/services/roleWorkbenchService';

export default {
  // 角色工作台model
  namespace: 'roleWorkbench',
  state: {
    cardsList: [],
  },
  effects: {
    *fetchLayoutAndInit({ payload }, { call }) {
      const res = yield call(getLayout, payload);
      // const list = getResponse(res);
      // if (list) {
      //   yield put({
      //     type: 'updateState',
      //     payload: {
      //       cardsList: list,
      //     },
      //   });
      // }
      return getResponse(res);
    },

    // // 新建库存组织
    // *insertInventoryData({ payload }, { call }) {
    //   const res = yield call(insertInventoryData, payload);
    //   return getResponse(res);
    // },

    // // 更新库存组织
    // *updateInventoryData({ payload }, { call }) {
    //   const res = yield call(updateInventoryData, payload);
    //   return getResponse(res);
    // },

    // // 批量新建、编辑库存组织
    // *updateAllInventoryData({ payload }, { call }) {
    //   const res = yield call(updateAllInventoryData, payload);
    //   return getResponse(res);
    // },

    // // 禁用库存组织（此方法暂不单用，禁用与编辑一起）
    // *disbledInventory({ payload }, { call }) {
    //   const res = yield call(disableInventory, payload);
    //   return getResponse(res);
    // },
    // // 启用库存组织（此方法暂不单用，启用与编辑一起）
    // *enabledInventory({ payload }, { call }) {
    //   const res = yield call(enableInventory, payload);
    //   return getResponse(res);
    // },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
