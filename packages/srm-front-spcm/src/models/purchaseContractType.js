/**
 * index.js - 协议类型管理
 * @date: 2019-05-13
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import {
  queryList,
  add,
  update,
  fetchStage,
  fetchPartner,
  fetchAttachment,
  fetchTerms,
  fetchHeader,
  fetchCompany,
  fetchAddCompany,
  fetchLifeCycle,
  fetchCoverLifeStage,
  saveCompany,
  saveLifeCycle,
  copyContractType,
  deleteContractType,
  // fetchTermContentDefaultSelect,
} from '@/services/purchaseContractType';
import { queryMapIdpValue, queryUnifyIdpValue } from 'services/api';

// function dealDataState(data) {
//   // 处理行 处理字段为update
//   let config = [];
//   if (Array.isArray(data) && data.length > 0) {
//     config = data.map(item => {
//       return {
//         ...item,
//         _status: 'update',
//       };
//     });
//   }
//   return config;
// }

export default {
  namespace: 'purchaseContractType',
  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [], // 数据
    pagination: {},
    operationRecordPagination: {},
    operationRecordList: [],
    selectedRows: [],
    selectedRowKeys: [],
  },
  effects: {
    // -查询列表
    *queryList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content,
            pagination: createPagination(response),
          },
        });
      }
    },
    // -查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          flag: 'HPFM.FLAG',
          busTerFlag: 'SPCM.PC_TYPE.TERM.FORMAT',
          acceptTypeList: 'SPCM.ACCEPT_TYPE', // 查询验收类型值集
          electricSignFlagList: 'SPCM.TELE_SIGNATURE_IDENTIFICATION_OF_THE_PROTOCOL_TYPE', // 查询验收类型值集
          signOrder: 'SPCM.ELECTRIC_SIGN_ORDER',
          signStage: 'SPCM.SIGN_STAGE',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap: enumMap || {},
        },
      });
    },
    // -更新采购申请头
    *update({ payload }, { call }) {
      const response = getResponse(yield call(update, payload));
      return response;
    },
    // -查询头信息
    *fetchHeader({ pcTypeId }, { call }) {
      const res = yield call(fetchHeader, pcTypeId);
      return getResponse(res);
    },
    // -查询协议阶段列表
    *fetchStage({ payload }, { call }) {
      const res = yield call(fetchStage, payload);
      return getResponse(res);
    },
    // -查询合作伙伴列表
    *fetchPartner({ payload }, { call }) {
      const res = yield call(fetchPartner, payload);
      return getResponse(res);
    },
    // -查询业务条款
    *fetchTerms({ payload }, { call }) {
      const res = yield call(fetchTerms, payload);
      return getResponse(res);
    },
    // -查询附件类型
    *fetchAttachment({ payload }, { call }) {
      const res = yield call(fetchAttachment, payload);
      return getResponse(res);
    },
    // -新建采购申请头
    *add({ payload }, { call }) {
      const response = getResponse(yield call(add, payload));
      return response;
    },
    *fetchCompany({ payload }, { call }) {
      const response = getResponse(yield call(fetchCompany, payload));
      return response;
    },
    // 查新生命周期控制列表
    *fetchLifeCycle({ payload }, { call }) {
      const response = getResponse(yield call(fetchLifeCycle, payload));
      return response;
    },
    // 查询覆盖生命周期列表
    *fetchCoverLifeStage({ payload }, { call }) {
      const response = getResponse(yield call(fetchCoverLifeStage, payload));
      return response;
    },
    // 查询新建公司
    *fetchAddCompany({ payload }, { call }) {
      const response = getResponse(yield call(fetchAddCompany, payload));
      return response;
    },
    // -新建保存公司
    *saveCompany({ payload }, { call }) {
      const response = getResponse(yield call(saveCompany, payload));
      return response;
    },
    // -新建生命周期
    *saveLifeCycle({ payload }, { call }) {
      const response = getResponse(yield call(saveLifeCycle, payload));
      return response;
    },

    // 复制协议类型
    *copyContractType({ payload }, { call }) {
      const response = getResponse(yield call(copyContractType, payload));
      return response;
    },

    // 删除协议类型
    *deleteContractType({ payload }, { call }) {
      const response = getResponse(yield call(deleteContractType, payload));
      return response;
    },

    // 查询业务条款内容下拉框的值
    *fetchTermContentDefaultSelect({ payload }, { call }) {
      const response = getResponse(yield call(queryUnifyIdpValue, payload));
      return response;
    },

    // 批量查询业务条款内容下拉框的值
    *fetchBatchTermContentDefaultSelect({ payload }, { call }) {
      const response = getResponse(yield call(queryMapIdpValue, payload));
      return response;
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
