/*
 * planSheet - 订单工作台
 * @date: 2021/8/18 11:49:14
 * @author: mjq <jiaqi.mao@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import { getResponse } from 'utils/utils';
import { sourceCreate, add, setting } from '@/services/contractMaintainService';
import {
  queryPushExternalSystemData,
  againPushExternalSystemData,
  contractPushExternalSystemData,
  uploads,
} from '@/services/purchaseContractViewService';
import { purchaseNeedVerified, checkCreatePo, fetchLadderOffer } from '@/services/workspaceService';

export default {
  namespace: 'workSpace',
  state: {
    defaultActiveKey: '',
    titleAggregate: {
      toBeSubmitted: 'flat',
      underApprovaled: 'flat',
      released: 'flat',
      approve: 'flat', // 整单待反馈审核
      layoutType: 'flat', // 整单全部
      detailedAll: 'flat', // 明细全部
      datelApprove: 'flat', // 明细待反馈审核
      stageAll: 'flat', // 阶段全部
    },
    /**
     * 协议详情带过来的值
     */
    sourceResultDTOs: [],
    createPurchaseOrderList: [],
    setting: {}, // 配置中心
  },
  effects: {
    // 检验是否可创建
    *sourceCreate({ payload }, { call }) {
      const { type } = payload;
      const obj = {
        purchaseOrder: checkCreatePo,
        sourcingResults: sourceCreate,
        purchaseNeed: purchaseNeedVerified,
      };
      if (!type) return 1;
      const res = getResponse(yield call(obj[type], payload));
      return res;
    },
    // 修改归档附件
    *updateArchiveAttachment({ payload }, { call }) {
      const response = getResponse(yield call(uploads, payload));
      return response;
    },
    // 获取同步列表Spa
    *queryPushExternalSystemData({ payload }, { call }) {
      const response = getResponse(yield call(queryPushExternalSystemData, payload));
      return response;
    },
    // 单个推送单位失败重新同步
    *againPushExternalSystemData({ payload }, { call }) {
      const response = getResponse(yield call(againPushExternalSystemData, payload));
      return response;
    },
    // 协议推送失败重新同步
    *contractPushExternalSystemData({ payload }, { call }) {
      const response = getResponse(yield call(contractPushExternalSystemData, payload));
      return response;
    },
    // 查询阶梯报价
    *fetchLadderOffer({ payload }, { call }) {
      const res = getResponse(yield call(fetchLadderOffer, payload));
      return res;
    },
    // -新建采购申请头
    *add({ payload }, { call }) {
      const response = getResponse(yield call(add, payload));
      return response;
    },
    // -配置中心
    *setting({ payload }, { put, call }) {
      const result = getResponse(yield call(setting, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            setting: result[0],
          },
        });
      }
    },
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
