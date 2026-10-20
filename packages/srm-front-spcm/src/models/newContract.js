/*
 * contractMaintain - 新model
 * @date: 2019-05-15
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { queryNewOrOldLink, handlePrint } from '@/services/newContractService';

export default {
  namespace: 'newContract',

  state: {
    newEnumMap: {}, // 详情值集
    _linkFlag: false,
  },

  effects: {
    // -查询详情值集
    *fetchDetailEnum(params, { put, call }) {
      const newEnumMap = getResponse(
        yield call(queryMapIdpValue, {
          batchMaintenance: 'SPCM.PC_SUBJECT_FIELD', // 批量维护下拉框
          acceptTypeListOld: 'SPCM.ACCEPT_TYPE', // 验收类型(老链路)
          acceptTypeListNew: 'SPCM.ACCEPT_TYPE_NEW', // 验收类型(新链路)
          purchaseOrSupplier: 'SPCM_PC_PARTNER_TYPE_ROLE', // 采购方or供应方下拉框
          contactMethod: 'SPCM.CONTACT_METHOD_CODE', // 联系信息取值方式
        })
      );
      const res = yield call(queryNewOrOldLink, {}); // 判断是新链路还是老链路(true为新链路 false为老链路)
      if (newEnumMap) {
        if (res) {
          newEnumMap.acceptTypeList = newEnumMap.acceptTypeListNew;
        } else {
          newEnumMap.acceptTypeList = newEnumMap.acceptTypeListOld;
        }
        yield put({
          type: 'updateState',
          payload: {
            newEnumMap,
            _linkFlag: res,
          },
        });
      }
    },
    // 打印-我发起的协议详情
    *handlePrint({ payload }, { call }) {
      const res = yield call(handlePrint, payload);
      return getResponse(res);
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
